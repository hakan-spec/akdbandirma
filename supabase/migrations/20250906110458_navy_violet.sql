/*
  # Add foreign key constraint between classes and teachers

  1. Foreign Key Constraint
    - Add foreign key constraint from `classes.teacher_id` to `teachers.id`
    - Use `ON DELETE SET NULL` to handle teacher deletion gracefully
    - This enables Supabase to perform joins between classes and teachers tables

  2. Purpose
    - Fixes the 400 error when fetching classes with teacher information
    - Ensures data integrity between classes and teachers
    - Allows PostgREST to perform implicit joins via `select('*, teachers(name)')`
*/

-- Add foreign key constraint from classes.teacher_id to teachers.id
ALTER TABLE classes 
ADD CONSTRAINT classes_teacher_id_fkey 
FOREIGN KEY (teacher_id) 
REFERENCES teachers(id) 
ON DELETE SET NULL;