/*
  # Add teacher assignment to classes

  1. New Columns
    - `teacher_id` (uuid, nullable) - References teachers table
  
  2. Foreign Keys
    - Add foreign key constraint to teachers table
  
  3. Indexes
    - Add index for faster teacher lookups
*/

-- Add teacher_id column to classes table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE public.classes
    ADD COLUMN teacher_id UUID NULL;
  END IF;
END $$;

-- Add foreign key constraint to teachers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_classes_teacher'
  ) THEN
    ALTER TABLE public.classes
    ADD CONSTRAINT fk_classes_teacher
    FOREIGN KEY (teacher_id)
    REFERENCES public.teachers(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create an index for faster lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_classes_teacher_id'
  ) THEN
    CREATE INDEX idx_classes_teacher_id ON public.classes (teacher_id);
  END IF;
END $$;