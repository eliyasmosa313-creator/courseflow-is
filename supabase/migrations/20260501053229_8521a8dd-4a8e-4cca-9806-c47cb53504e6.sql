-- 1. Make materials bucket private and lock down policies
UPDATE storage.buckets SET public = false WHERE id = 'materials';

DROP POLICY IF EXISTS "Anyone can upload materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete materials" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view materials" ON storage.objects;
DROP POLICY IF EXISTS "Public can view materials" ON storage.objects;
DROP POLICY IF EXISTS "Materials are publicly accessible" ON storage.objects;

CREATE POLICY "Course participants can view materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'materials'
  AND EXISTS (
    SELECT 1 FROM public.session_materials sm
    JOIN public.sessions s ON s.id = sm.session_id
    JOIN public.courses c ON c.id = s.course_id
    WHERE sm.file_url LIKE '%' || storage.objects.name
      AND (
        c.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.course_enrollments ce
          WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
        )
      )
  )
);

CREATE POLICY "Instructors can upload materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials'
  AND public.has_role(auth.uid(), 'instructor'::app_role)
);

CREATE POLICY "Instructors can update materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materials'
  AND public.has_role(auth.uid(), 'instructor'::app_role)
);

CREATE POLICY "Instructors can delete materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials'
  AND public.has_role(auth.uid(), 'instructor'::app_role)
);

-- 2. Restrict invitation_codes SELECT to instructors only
DROP POLICY IF EXISTS "Authenticated users can read codes" ON public.invitation_codes;

CREATE POLICY "Instructors can view codes"
ON public.invitation_codes FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'instructor'::app_role));

-- 3. Rotate hardcoded invitation codes
UPDATE public.invitation_codes SET is_active = false
WHERE code IN ('TEACHER2026', 'ADMIN2026');

INSERT INTO public.invitation_codes (code, target_role, is_active)
VALUES (
  upper(encode(gen_random_bytes(8), 'hex')),
  'instructor',
  true
);

-- 4. Restrict user_roles INSERT/DELETE so instructors cannot grant the instructor role
DROP POLICY IF EXISTS "Instructors can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Instructors can delete roles" ON public.user_roles;

CREATE POLICY "Instructors can assign non-instructor roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'instructor'::app_role)
  AND role <> 'instructor'::app_role
  AND user_id <> auth.uid()
);

CREATE POLICY "Instructors can remove non-instructor roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'instructor'::app_role)
  AND role <> 'instructor'::app_role
);

-- 5. Fix assignment_submissions cross-student visibility
DROP POLICY IF EXISTS "Users can view submissions for their courses" ON public.assignment_submissions;

CREATE POLICY "Students see their own submissions, instructors see all"
ON public.assignment_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.session_assignments sa
    JOIN public.sessions s ON s.id = sa.session_id
    JOIN public.courses c ON c.id = s.course_id
    WHERE sa.id = assignment_submissions.assignment_id
      AND c.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.display_name = assignment_submissions.student_name
  )
);
