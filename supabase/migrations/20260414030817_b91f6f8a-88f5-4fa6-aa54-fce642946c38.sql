ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS color text DEFAULT 'bg-vibrant-coral',
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS course_type text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS price numeric(10,2) DEFAULT 0;