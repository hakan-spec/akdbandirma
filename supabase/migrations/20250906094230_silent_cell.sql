/*
  # Create classes table

  1. New Tables
    - `classes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, class name)
      - `level` (text, language level)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `classes` table
    - Add policies for authenticated users to manage their own classes

  3. Changes
    - Add `class_id` column to `students` table to link students to classes
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  level text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own classes"
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own classes"
  ON public.classes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes"
  ON public.classes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes"
  ON public.classes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add class_id column to students table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students' AND column_name = 'class_id'
  ) THEN
    ALTER TABLE public.students ADD COLUMN class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_user_id ON public.classes(user_id);