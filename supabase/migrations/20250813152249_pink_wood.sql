/*
  # Create sticky_notes table

  1. New Tables
    - `sticky_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `sticky_notes` table
    - Add policies for authenticated users to read all sticky notes
    - Add policies for users to manage their own sticky notes
*/

CREATE TABLE IF NOT EXISTS public.sticky_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sticky_notes_pkey PRIMARY KEY (id),
    CONSTRAINT sticky_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" 
ON public.sticky_notes 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own sticky notes" 
ON public.sticky_notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sticky notes" 
ON public.sticky_notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sticky notes" 
ON public.sticky_notes 
FOR DELETE 
USING (auth.uid() = user_id);