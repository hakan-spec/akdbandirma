/*
  # Add start and end dates to classes table

  1. New Columns
    - `start_date` (timestamp with time zone, nullable)
    - `end_date` (timestamp with time zone, nullable)
  
  2. Changes
    - Added start_date column to track when class begins
    - Added end_date column to track when class ends
    - Both columns are optional to maintain backward compatibility
*/

ALTER TABLE public.classes
ADD COLUMN start_date timestamp with time zone,
ADD COLUMN end_date timestamp with time zone;