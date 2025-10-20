-- Create product analytics alerts table
CREATE TABLE IF NOT EXISTS product_analytics_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('goal_reached', 'goal_missed', 'performance_spike', 'performance_drop')),
  metric TEXT NOT NULL CHECK (metric IN ('views', 'clicks', 'conversions', 'revenue', 'conversion_rate')),
  threshold_value DECIMAL(10,2) NOT NULL,
  current_value DECIMAL(10,2) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_analytics_alerts_product_id ON product_analytics_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_alerts_user_id ON product_analytics_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_alerts_created_at ON product_analytics_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_product_analytics_alerts_is_read ON product_analytics_alerts(is_read);

-- Enable RLS
ALTER TABLE product_analytics_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product analytics alerts" ON product_analytics_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product analytics alerts" ON product_analytics_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product analytics alerts" ON product_analytics_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own product analytics alerts" ON product_analytics_alerts
  FOR DELETE USING (auth.uid() = user_id);
