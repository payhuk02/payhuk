-- Create product pixels configuration table
CREATE TABLE IF NOT EXISTS product_pixels_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Facebook Pixel
  facebook_pixel_id TEXT DEFAULT '',
  facebook_pixel_enabled BOOLEAN DEFAULT false,
  facebook_viewcontent BOOLEAN DEFAULT false,
  facebook_addtocart BOOLEAN DEFAULT false,
  facebook_purchase BOOLEAN DEFAULT false,
  facebook_lead BOOLEAN DEFAULT false,
  
  -- Google Analytics
  google_analytics_id TEXT DEFAULT '',
  google_tag_manager_id TEXT DEFAULT '',
  google_enhanced_ecommerce BOOLEAN DEFAULT false,
  
  -- TikTok Pixel
  tiktok_pixel_id TEXT DEFAULT '',
  tiktok_pixel_enabled BOOLEAN DEFAULT false,
  tiktok_viewcontent BOOLEAN DEFAULT false,
  tiktok_addtocart BOOLEAN DEFAULT false,
  tiktok_completepayment BOOLEAN DEFAULT false,
  
  -- Pinterest Pixel
  pinterest_pixel_id TEXT DEFAULT '',
  pinterest_pixel_enabled BOOLEAN DEFAULT false,
  pinterest_pagevisit BOOLEAN DEFAULT false,
  pinterest_addtocart BOOLEAN DEFAULT false,
  pinterest_checkout BOOLEAN DEFAULT false,
  pinterest_purchase BOOLEAN DEFAULT false,
  
  -- Advanced Configuration
  cross_domain_tracking BOOLEAN DEFAULT false,
  privacy_compliant BOOLEAN DEFAULT false,
  debug_mode BOOLEAN DEFAULT false,
  custom_events TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create product pixel events table for tracking
CREATE TABLE IF NOT EXISTS product_pixel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pixel_type TEXT NOT NULL CHECK (pixel_type IN ('facebook', 'google', 'tiktok', 'pinterest')),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_pixels_config_product_id ON product_pixels_config(product_id);
CREATE INDEX IF NOT EXISTS idx_product_pixels_config_user_id ON product_pixels_config(user_id);

CREATE INDEX IF NOT EXISTS idx_product_pixel_events_product_id ON product_pixel_events(product_id);
CREATE INDEX IF NOT EXISTS idx_product_pixel_events_user_id ON product_pixel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_product_pixel_events_timestamp ON product_pixel_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_product_pixel_events_pixel_type ON product_pixel_events(pixel_type);
CREATE INDEX IF NOT EXISTS idx_product_pixel_events_event_type ON product_pixel_events(event_type);

-- Enable RLS
ALTER TABLE product_pixels_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_pixel_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own product pixels config" ON product_pixels_config
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product pixels config" ON product_pixels_config
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own product pixels config" ON product_pixels_config
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own product pixel events" ON product_pixel_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own product pixel events" ON product_pixel_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_pixels_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_product_pixels_config_updated_at
  BEFORE UPDATE ON product_pixels_config
  FOR EACH ROW
  EXECUTE FUNCTION update_product_pixels_config_updated_at();
