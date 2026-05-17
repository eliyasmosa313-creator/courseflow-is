
-- ============ COURSE DRAFTS ============
CREATE TABLE public.course_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  description text,
  color text DEFAULT 'bg-vibrant-coral',
  start_date date,
  course_type text DEFAULT 'free',
  price numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their drafts" ON public.course_drafts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Instructors can create their drafts" ON public.course_drafts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND has_role(auth.uid(), 'instructor'::app_role));
CREATE POLICY "Owners can update their drafts" ON public.course_drafts
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners can delete their drafts" ON public.course_drafts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_course_drafts_updated_at
  BEFORE UPDATE ON public.course_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL, -- 'session' | 'assignment' | 'material' | 'announcement'
  title text NOT NULL,
  message text,
  course_id uuid,
  session_id uuid,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());
-- Inserts are done by SECURITY DEFINER triggers/functions; no direct insert policy needed.

-- Helper: fan out notifications to all enrolled students of a course
CREATE OR REPLACE FUNCTION public.notify_course_students(
  _course_id uuid,
  _type text,
  _title text,
  _message text,
  _session_id uuid,
  _link text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, course_id, session_id, link)
  SELECT ce.user_id, _type, _title, _message, _course_id, _session_id, _link
  FROM public.course_enrollments ce
  WHERE ce.course_id = _course_id AND ce.user_id IS NOT NULL;
END;
$$;

-- Trigger: new session
CREATE OR REPLACE FUNCTION public.on_session_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_course_title text;
BEGIN
  SELECT title INTO v_course_title FROM public.courses WHERE id = NEW.course_id;
  PERFORM public.notify_course_students(
    NEW.course_id, 'session',
    'New session: ' || NEW.title,
    'A new session was added to ' || COALESCE(v_course_title, 'your course'),
    NEW.id,
    '/courses/' || NEW.course_id::text
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_session_created
  AFTER INSERT ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.on_session_created();

-- Trigger: new assignment
CREATE OR REPLACE FUNCTION public.on_assignment_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_course_id uuid;
BEGIN
  SELECT course_id INTO v_course_id FROM public.sessions WHERE id = NEW.session_id;
  IF v_course_id IS NOT NULL THEN
    PERFORM public.notify_course_students(
      v_course_id, 'assignment',
      'New assignment: ' || NEW.title,
      COALESCE(NEW.description, 'A new assignment was posted'),
      NEW.session_id,
      '/courses/' || v_course_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_assignment_created
  AFTER INSERT ON public.session_assignments
  FOR EACH ROW EXECUTE FUNCTION public.on_assignment_created();

-- Trigger: new material
CREATE OR REPLACE FUNCTION public.on_material_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_course_id uuid;
BEGIN
  SELECT course_id INTO v_course_id FROM public.sessions WHERE id = NEW.session_id;
  IF v_course_id IS NOT NULL THEN
    PERFORM public.notify_course_students(
      v_course_id, 'material',
      'New material: ' || NEW.title,
      'New course material was uploaded',
      NEW.session_id,
      '/courses/' || v_course_id::text
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_material_created
  AFTER INSERT ON public.session_materials
  FOR EACH ROW EXECUTE FUNCTION public.on_material_created();

-- Manual announcement function for instructors
CREATE OR REPLACE FUNCTION public.send_course_announcement(
  _course_id uuid,
  _title text,
  _message text
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.courses WHERE id = _course_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  INSERT INTO public.notifications (user_id, type, title, message, course_id, link)
  SELECT ce.user_id, 'announcement', _title, _message, _course_id, '/courses/' || _course_id::text
  FROM public.course_enrollments ce
  WHERE ce.course_id = _course_id AND ce.user_id IS NOT NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
