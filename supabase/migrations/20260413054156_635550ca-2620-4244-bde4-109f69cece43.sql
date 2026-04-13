
-- Create invitation_codes table
CREATE TABLE public.invitation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  target_role app_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitation_codes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active codes (needed for validation)
CREATE POLICY "Authenticated users can read codes"
ON public.invitation_codes
FOR SELECT
TO authenticated
USING (true);

-- Only instructors can manage codes
CREATE POLICY "Instructors can manage codes"
ON public.invitation_codes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'instructor'))
WITH CHECK (has_role(auth.uid(), 'instructor'));

-- Allow users to update their own role via a secure function
CREATE OR REPLACE FUNCTION public.redeem_invitation_code(p_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target_role app_role;
  v_current_role app_role;
BEGIN
  -- Look up the code
  SELECT target_role INTO v_target_role
  FROM public.invitation_codes
  WHERE code = p_code AND is_active = true;

  IF v_target_role IS NULL THEN
    RETURN 'INVALID_CODE';
  END IF;

  -- Check current role
  SELECT role INTO v_current_role
  FROM public.user_roles
  WHERE user_id = auth.uid();

  IF v_current_role = v_target_role THEN
    RETURN 'ALREADY_HAS_ROLE';
  END IF;

  -- Prevent downgrade from instructor
  IF v_current_role = 'instructor' AND v_target_role = 'student' THEN
    RETURN 'CANNOT_DOWNGRADE';
  END IF;

  -- Update the role
  UPDATE public.user_roles
  SET role = v_target_role
  WHERE user_id = auth.uid();

  RETURN 'SUCCESS';
END;
$$;

-- Seed default codes
INSERT INTO public.invitation_codes (code, target_role) VALUES
  ('TEACHER2026', 'student'),
  ('ADMIN2026', 'instructor');
