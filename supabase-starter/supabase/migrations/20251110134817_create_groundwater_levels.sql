-- Create groundwater_levels table to store groundwater measurement data
CREATE TABLE IF NOT EXISTS groundwater_levels (
  id BIGSERIAL PRIMARY KEY,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  station_name TEXT,
  station_code TEXT NOT NULL,
  measurement_date DATE NOT NULL,
  water_level NUMERIC(10, 2),
  agency TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  station_type TEXT,
  major_basin TEXT,
  tributary TEXT,
  data_acquisition_mode TEXT,
  station_status TEXT,
  tehsil TEXT,
  datatype_code TEXT,
  description TEXT,
  unit TEXT,
  block TEXT,
  village TEXT,
  well_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Unique constraint for upsert: one measurement per station per date
  UNIQUE (station_code, measurement_date)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_groundwater_state ON groundwater_levels(state);
CREATE INDEX IF NOT EXISTS idx_groundwater_district ON groundwater_levels(district);
CREATE INDEX IF NOT EXISTS idx_groundwater_state_district ON groundwater_levels(state, district);
CREATE INDEX IF NOT EXISTS idx_groundwater_measurement_date ON groundwater_levels(measurement_date);
CREATE INDEX IF NOT EXISTS idx_groundwater_station_code ON groundwater_levels(station_code);

-- Enable RLS if needed
ALTER TABLE groundwater_levels ENABLE ROW LEVEL SECURITY;

-- Allow service_role to read/write
CREATE POLICY groundwater_service_role_policy ON groundwater_levels
  FOR ALL USING (true)
  WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY groundwater_auth_read ON groundwater_levels
  FOR SELECT USING (true);
