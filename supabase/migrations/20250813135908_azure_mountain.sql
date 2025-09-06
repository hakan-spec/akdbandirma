/*
  # Fix Row-Level Security Policies

  1. Security Changes
    - Update RLS policies to allow anonymous access for demo purposes
    - Allow all operations (SELECT, INSERT, UPDATE, DELETE) for anon role
    - This enables the app to work without authentication

  Note: In production, you should implement proper authentication
  and restrict policies to authenticated users only.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage all students" ON students;
DROP POLICY IF EXISTS "Users can manage all interviews" ON interviews;
DROP POLICY IF EXISTS "Users can manage all price quotes" ON price_quotes;

-- Create new policies that allow anonymous access
CREATE POLICY "Allow anonymous access to students"
  ON students
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to interviews"
  ON interviews
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous access to price quotes"
  ON price_quotes
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);