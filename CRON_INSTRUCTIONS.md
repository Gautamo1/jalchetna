# 🕐 Setting Up Automatic Groundwater Function Scheduling

## How to Execute the Cron Job Setup

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/glcbkolaazmzzfbxfvxd**
2. Click on **SQL Editor** (left sidebar)
3. Click **New Query**

### Step 2: Copy and Paste the SQL
Copy the entire SQL from `CRON_SETUP.sql` and paste it into the SQL Editor.

### Step 3: Execute the SQL
Click the **Run** button (or press `Ctrl+Enter`)

### Step 4: Verify Success
You should see output like:
```
 jobid | schedule |      command      | nodename | nodeport | database | username | active
-------+----------+-------------------+----------+----------+----------+----------+--------
    1  | */4 * * * * | SELECT net.http... | localhost | 5432   | postgres | postgres | t
```

---

## 📊 What Happens Next

### Timeline
- **Every 4 minutes**: Function runs automatically
- **~53 hours**: Complete cycle through all 800 district pairs
- **24/7**: Continuous groundwater data collection

### Progress Tracking
- **State Tracker Table**: Stores which district was last processed
- **Function Logs**: Available in Edge Functions dashboard
- **Groundwater Levels Table**: Accumulates all measurements

---

## 🔍 Monitoring the Cron Job

### View Cron Job Status
Run this SQL to check if the job is active:
```sql
SELECT * FROM cron.job WHERE jobname = 'groundwater-state-rotation';
```

### View Recent Executions
Run this SQL to see the last 20 runs:
```sql
SELECT 
  jobid, 
  start_time, 
  end_time, 
  status, 
  return_message 
FROM cron.job_run_details 
WHERE jobname = 'groundwater-state-rotation'
ORDER BY start_time DESC 
LIMIT 20;
```

### Check Function Logs
1. Go to **Edge Functions** in Supabase Dashboard
2. Click **get_groundwater**
3. Scroll down to see execution logs with timestamps

---

## ⚠️ If Something Goes Wrong

### Stop the Cron Job
```sql
SELECT cron.unschedule('groundwater-state-rotation');
```

### Restart it
Re-run the CRON_SETUP.sql file

### Check Error Logs
```sql
SELECT * FROM cron.job_run_details 
WHERE status = 'failed' 
ORDER BY start_time DESC 
LIMIT 10;
```

---

## ✅ Success Indicators

After enabling the cron job:
1. ✅ `cron.job` table shows 1 active job
2. ✅ `cron.job_run_details` shows runs every 4 minutes
3. ✅ `groundwater_levels` table grows with new measurements
4. ✅ `groundwater_state_tracker` increments `last_state_index` after each run
5. ✅ Function logs show "Processing 1/800", "Processing 2/800", etc.

---

## 📝 Files Created

- `CRON_SETUP.sql` - Main SQL to execute in Supabase
- `CRON_MONITORING.sql` - Queries for monitoring (if created)

**Ready? Let's go!** 🚀
