-- Create product tracking configuration table
CREATE TABLE IF NOT EXISTS product_tracking_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analytics_enabled BOOLEAN DEFAULT false,
  track_views BOOLEAN DEFAULT true,
  track_clicks BOOLEAN DEFAULT true,
  track_purchases BOOLEAN DEFAULT true,
  track_time_spent BOOLEAN DEFAULT false,
  track_custom_events BOOLEAN DEFAULT false,
  google_analytics_id TEXT DEFAULT '',
  facebook_pixel_id TEXT DEFAULT '',
  google_tag_manager_id TEXT DEFAULT '',
  tiktok_pixel_id TEXT DEFAULT '',
  pinterest_pixel_id TEXT DEFAULT '',
  custom_events TEXT[] DEFAULT '{}',
  advanced_tracking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_tracking_config_product_id ON product_tracking_config(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tracking_config_user_id ON product_tracking_config(user_id);

-- Enable RLS
ALTER TABLE product_tracking_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product tracking config" ON product_tracking_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product tracking config" ON product_tracking_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product tracking config" ON product_tracking_config
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_tracking_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_product_tracking_config_updated_at
  BEFORE UPDATE ON product_tracking_config
  FOR EACH ROW
  EXECUTE FUNCTION update_product_tracking_config_updated_at();
