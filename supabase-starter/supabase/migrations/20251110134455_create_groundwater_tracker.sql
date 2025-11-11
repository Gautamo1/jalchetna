-- Create groundwater_state_tracker table for tracking which district is being processed
CREATE TABLE IF NOT EXISTS groundwater_state_tracker (
  id INT PRIMARY KEY DEFAULT 1,
  last_state_index INT DEFAULT 0,
  last_run DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial record
INSERT INTO groundwater_state_tracker (id, last_state_index, last_run) 
VALUES (1, 0, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;
