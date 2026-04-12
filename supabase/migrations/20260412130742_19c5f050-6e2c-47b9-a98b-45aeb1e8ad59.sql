
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text) from 1 for 6),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session materials table
CREATE TABLE public.session_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'image', 'link', 'note')),
  file_url TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session assignments table
CREATE TABLE public.session_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignment submissions table
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.session_assignments(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session attendance table
CREATE TABLE public.session_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_name)
);

-- Create session grades table
CREATE TABLE public.session_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, student_name)
);

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, student_name)
);

-- Enable RLS on all tables (with permissive policies for now since no auth)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Permissive policies (full access for now, will be replaced with auth-based policies later)
CREATE POLICY "Allow all access to courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to session_materials" ON public.session_materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to session_assignments" ON public.session_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to assignment_submissions" ON public.assignment_submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to session_attendance" ON public.session_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to session_grades" ON public.session_grades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to course_enrollments" ON public.course_enrollments FOR ALL USING (true) WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_sessions_course_id ON public.sessions(course_id);
CREATE INDEX idx_session_materials_session_id ON public.session_materials(session_id);
CREATE INDEX idx_session_assignments_session_id ON public.session_assignments(session_id);
CREATE INDEX idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX idx_session_attendance_session_id ON public.session_attendance(session_id);
CREATE INDEX idx_session_grades_session_id ON public.session_grades(session_id);
CREATE INDEX idx_course_enrollments_course_id ON public.course_enrollments(course_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for materials
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true);

-- Storage policies
CREATE POLICY "Materials are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'materials');
CREATE POLICY "Anyone can upload materials" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'materials');
CREATE POLICY "Anyone can update materials" ON storage.objects FOR UPDATE USING (bucket_id = 'materials');
CREATE POLICY "Anyone can delete materials" ON storage.objects FOR DELETE USING (bucket_id = 'materials');
