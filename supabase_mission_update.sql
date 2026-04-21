-- Add task_completion column to daily_missions
ALTER TABLE daily_missions
ADD COLUMN IF NOT EXISTS task_completion 
  jsonb DEFAULT '{"learn": false, "build": false, "apply": false}'::jsonb;

-- Update existing rows
UPDATE daily_missions 
SET task_completion = '{"learn": false, "build": false, "apply": false}'::jsonb
WHERE task_completion IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_daily_missions_user_status 
ON daily_missions(user_id, status);

-- IMPORTANT: Enable realtime for daily_missions table
-- Run this in Supabase Dashboard:
-- Database → Replication → Tables
-- Enable daily_missions for realtime
