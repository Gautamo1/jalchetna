-- ============================================
-- PostgreSQL pg_cron Setup for Groundwater Function
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- Go to: Dashboard → SQL Editor → New Query
-- ============================================

-- Step 1: Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Step 2: Enable net extension for HTTP calls
CREATE EXTENSION IF NOT EXISTS http;

-- Step 3: Schedule the function to run every 4 minutes
-- This will automatically rotate through all states/districts
SELECT cron.schedule(
  'groundwater-state-rotation',
  '*/4 * * * *',  -- Every 4 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://glcbkolaazmzzfbxfvxd.supabase.co/functions/v1/get_groundwater',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsY2Jrb2xhYXptenpmYnhmdnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY4ODUxNCwiZXhwIjoyMDc4MjY0NTE0fQ.P42cD0ptJM4wsNfu77VjPN9O62TlGd1IGGyB2w3rKIE'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Step 4: Verify the cron job was created
SELECT
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'groundwater-state-rotation';

-- ============================================
-- How to Monitor the Cron Job
-- ============================================

-- View all cron jobs:
-- SELECT * FROM cron.job;

-- View cron job execution log:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 50;

-- View recent job runs:
-- SELECT 
--   jobid, 
--   start_time, 
--   end_time, 
--   status, 
--   return_message 
-- FROM cron.job_run_details 
-- WHERE jobname = 'groundwater-state-rotation'
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- ============================================
-- To Stop the Cron Job (if needed):
-- ============================================
-- SELECT cron.unschedule('groundwater-state-rotation');

-- ============================================
-- Expected Behavior
-- ============================================
-- • Runs every 4 minutes automatically
-- • Each run processes ONE state/district pair
-- • Completes 800 districts in ~53 hours (3200 minutes)
-- • Full India coverage repeats every ~53 hours
-- • Function logs available in Edge Functions dashboard
