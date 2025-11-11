# ⚡ QUICK START: Enable Cron Job (5 minutes)

## What This Does
Automatically runs your groundwater function **every 4 minutes**, cycling through all 800 states/districts.

## Step-by-Step

### 1️⃣ Open Supabase Dashboard
```
https://supabase.com/dashboard/project/glcbkolaazmzzfbxfvxd
```

### 2️⃣ Go to SQL Editor
- Left sidebar → **SQL Editor**
- Click **New Query**

### 3️⃣ Copy This SQL
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule function every 4 minutes
SELECT cron.schedule(
  'groundwater-state-rotation',
  '*/4 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://glcbkolaazmzzfbxfvxd.supabase.co/functions/v1/get_groundwater',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsY2Jrb2xhYXptenpmYnhmdnhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY4ODUxNCwiZXhwIjoyMDc4MjY0NTE0fQ.P42cD0ptJM4wsNfu77VjPN9O62TlGd1IGGyB2w3rKIE'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Verify it's running
SELECT * FROM cron.job WHERE jobname = 'groundwater-state-rotation';
```

### 4️⃣ Run It
Press **Ctrl+Enter** or click **Run**

### 5️⃣ Verify Success
You should see a result row showing `active | t` (true)

---

## 🎉 That's It!

Your function is now **automatically running every 4 minutes** collecting groundwater data from across India!

---

## 📊 Monitor Progress

Check how many records have been collected:
```sql
SELECT COUNT(*) as total_records, COUNT(DISTINCT state) as states_covered
FROM groundwater_levels;
```

View what district is currently being processed:
```sql
SELECT * FROM groundwater_state_tracker;
```

---

## ⏹️ To Stop It (if needed)
```sql
SELECT cron.unschedule('groundwater-state-rotation');
```
