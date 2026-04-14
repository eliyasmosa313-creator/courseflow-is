
-- ============================================================
-- 1. COURSES: replace permissive policy, increase join code entropy
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to courses" ON public.courses;

CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Instructors can create courses"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'instructor') AND user_id = auth.uid());

CREATE POLICY "Instructors can update their own courses"
  ON public.courses FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'instructor'));

CREATE POLICY "Instructors can delete their own courses"
  ON public.courses FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'instructor'));

-- Increase join code entropy to 16 alphanumeric chars
ALTER TABLE public.courses
  ALTER COLUMN join_code SET DEFAULT encode(gen_random_bytes(12), 'base64');

-- ============================================================
-- 2. COURSE_ENROLLMENTS
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to course_enrollments" ON public.course_enrollments;

CREATE POLICY "Users can view enrollments they belong to or own"
  ON public.course_enrollments FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage enrollments for their courses"
  ON public.course_enrollments FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update enrollments for their courses"
  ON public.course_enrollments FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete enrollments for their courses"
  ON public.course_enrollments FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. SESSIONS
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to sessions" ON public.sessions;

CREATE POLICY "Authenticated users can view sessions"
  ON public.sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = sessions.course_id AND ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can create sessions for their courses"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update sessions for their courses"
  ON public.sessions FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete sessions for their courses"
  ON public.sessions FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. SESSION_ACCESS
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to session_access" ON public.session_access;

CREATE POLICY "Users can view session access for their courses"
  ON public.session_access FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Instructors can manage session access"
  ON public.session_access FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete session access"
  ON public.session_access FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. SESSION_ASSIGNMENTS
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to session_assignments" ON public.session_assignments;

CREATE POLICY "Users can view assignments for their courses"
  ON public.session_assignments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Instructors can create assignments"
  ON public.session_assignments FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update assignments"
  ON public.session_assignments FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete assignments"
  ON public.session_assignments FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. SESSION_GRADES
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to session_grades" ON public.session_grades;

CREATE POLICY "Users can view grades for their courses"
  ON public.session_grades FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Instructors can manage grades"
  ON public.session_grades FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update grades"
  ON public.session_grades FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete grades"
  ON public.session_grades FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. SESSION_ATTENDANCE
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to session_attendance" ON public.session_attendance;

CREATE POLICY "Users can view attendance for their courses"
  ON public.session_attendance FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Instructors can manage attendance"
  ON public.session_attendance FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update attendance"
  ON public.session_attendance FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete attendance"
  ON public.session_attendance FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. SESSION_MATERIALS
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to session_materials" ON public.session_materials;

CREATE POLICY "Users can view materials for their courses"
  ON public.session_materials FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Instructors can create materials"
  ON public.session_materials FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can update materials"
  ON public.session_materials FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete materials"
  ON public.session_materials FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.sessions s
      JOIN public.courses c ON c.id = s.course_id
      WHERE s.id = session_id AND c.user_id = auth.uid()
    )
  );

-- ============================================================
-- 9. ASSIGNMENT_SUBMISSIONS
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to assignment_submissions" ON public.assignment_submissions;

CREATE POLICY "Users can view submissions for their courses"
  ON public.assignment_submissions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.session_assignments sa
      JOIN public.sessions s ON s.id = sa.session_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE sa.id = assignment_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Authenticated users can submit assignments"
  ON public.assignment_submissions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.session_assignments sa
      JOIN public.sessions s ON s.id = sa.session_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE sa.id = assignment_id AND (c.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.course_enrollments ce WHERE ce.course_id = c.id AND ce.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Instructors can update submissions"
  ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.session_assignments sa
      JOIN public.sessions s ON s.id = sa.session_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE sa.id = assignment_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can delete submissions"
  ON public.assignment_submissions FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'instructor')
    AND EXISTS (
      SELECT 1 FROM public.session_assignments sa
      JOIN public.sessions s ON s.id = sa.session_id
      JOIN public.courses c ON c.id = s.course_id
      WHERE sa.id = assignment_id AND c.user_id = auth.uid()
    )
  );
