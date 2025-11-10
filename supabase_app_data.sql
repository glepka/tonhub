CREATE TABLE IF NOT EXISTS app_data (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE app_data;

-- Row Level Security
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON app_data FOR ALL USING (true) WITH CHECK (true);


