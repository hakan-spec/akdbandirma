/*
  # Create teachers table

  1. New Tables
    - `teachers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to users)

  2. Security
    - Enable RLS on `teachers` table
    - Add policies for authenticated users to manage their own teachers
*/

CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all teachers
CREATE POLICY "All authenticated users can read teachers"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own teachers
CREATE POLICY "Users can insert their own teachers"
  ON teachers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own teachers
CREATE POLICY "Users can update their own teachers"
  ON teachers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own teachers
CREATE POLICY "Users can delete their own teachers"
  ON teachers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON teachers (user_id);
CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON teachers (is_active);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers (name);