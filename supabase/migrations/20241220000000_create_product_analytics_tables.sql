-- Create product analytics events table
CREATE TABLE IF NOT EXISTS product_analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'purchase', 'custom')),
  event_name TEXT,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product analytics goals table
CREATE TABLE IF NOT EXISTS product_analytics_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_views INTEGER,
  goal_revenue DECIMAL(10,2),
  goal_conversions INTEGER,
  goal_conversion_rate DECIMAL(5,2),
  email_alerts BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_product_id ON product_analytics_events(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_user_id ON product_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_timestamp ON product_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_event_type ON product_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_events_session_id ON product_analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_product_analytics_goals_product_id ON product_analytics_goals(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_goals_user_id ON product_analytics_goals(user_id);

-- Enable RLS
ALTER TABLE product_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product analytics events" ON product_analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product analytics events" ON product_analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own product analytics goals" ON product_analytics_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product analytics goals" ON product_analytics_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product analytics goals" ON product_analytics_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_analytics_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_product_analytics_goals_updated_at
  BEFORE UPDATE ON product_analytics_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_product_analytics_goals_updated_at();
