
ALTER TABLE public.sessions ADD COLUMN description text;
ALTER TABLE public.sessions ADD COLUMN access_type text NOT NULL DEFAULT 'all';

CREATE TABLE public.session_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_name)
);

ALTER TABLE public.session_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to session_access"
ON public.session_access
FOR ALL
USING (true)
WITH CHECK (true);
