import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductTrackingConfig {
  id: string;
  product_id: string;
  user_id: string;
  analytics_enabled: boolean;
  track_views: boolean;
  track_clicks: boolean;
  track_purchases: boolean;
  track_time_spent: boolean;
  track_custom_events: boolean;
  google_analytics_id: string;
  facebook_pixel_id: string;
  google_tag_manager_id: string;
  tiktok_pixel_id: string;
  pinterest_pixel_id: string;
  custom_events: string[];
  advanced_tracking: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductTrackingConfig = (productId: string) => {
  const { user } = useAuth();
  const [config, setConfig] = useState<ProductTrackingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch tracking configuration
  const fetchConfig = async () => {
    if (!user || !productId) return;

    try {
      const { data, error } = await supabase
        .from('product_tracking_config')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setConfig(data);
      } else {
        // Create default config if none exists
        const defaultConfig = {
          product_id: productId,
          user_id: user.id,
          analytics_enabled: false,
          track_views: true,
          track_clicks: true,
          track_purchases: true,
          track_time_spent: false,
          track_custom_events: false,
          google_analytics_id: '',
          facebook_pixel_id: '',
          google_tag_manager_id: '',
          tiktok_pixel_id: '',
          pinterest_pixel_id: '',
          custom_events: [],
          advanced_tracking: false
        };

        const { data: newConfig, error: insertError } = await supabase
          .from('product_tracking_config')
          .insert([defaultConfig])
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig(newConfig);
      }
    } catch (error: any) {
      console.error('Error fetching tracking config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update tracking configuration
  const updateConfig = async (updates: Partial<ProductTrackingConfig>) => {
    if (!user || !productId || !config) return false;

    try {
      const { error } = await supabase
        .from('product_tracking_config')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error: any) {
      console.error('Error updating tracking config:', error);
      return false;
    }
  };

  // Validate external analytics IDs
  const validateAnalyticsId = (type: string, id: string): boolean => {
    const patterns = {
      google_analytics: /^(UA-\d{4,10}-\d{1,4}|G-[A-Z0-9]{10})$/,
      facebook_pixel: /^\d{15,16}$/,
      google_tag_manager: /^GTM-[A-Z0-9]{6,7}$/,
      tiktok_pixel: /^C[A-Z0-9]{15,16}$/,
      pinterest_pixel: /^\d{15,16}$/
    };

    return patterns[type as keyof typeof patterns]?.test(id) || id === '';
  };

  // Save external analytics configuration
  const saveExternalAnalytics = async (analyticsData: {
    google_analytics_id?: string;
    facebook_pixel_id?: string;
    google_tag_manager_id?: string;
    tiktok_pixel_id?: string;
    pinterest_pixel_id?: string;
  }) => {
    if (!config) return false;

    // Validate IDs
    const validationResults = Object.entries(analyticsData).map(([key, value]) => ({
      key,
      valid: validateAnalyticsId(key, value || '')
    }));

    const invalidIds = validationResults.filter(result => !result.valid);
    if (invalidIds.length > 0) {
      console.error('Invalid analytics IDs:', invalidIds);
      return false;
    }

    return updateConfig(analyticsData);
  };

  // Add custom event
  const addCustomEvent = async (eventName: string) => {
    if (!config || !eventName.trim()) return false;

    const customEvents = [...(config.custom_events || []), eventName.trim()];
    return updateConfig({ custom_events: customEvents });
  };

  // Remove custom event
  const removeCustomEvent = async (eventName: string) => {
    if (!config) return false;

    const customEvents = (config.custom_events || []).filter(event => event !== eventName);
    return updateConfig({ custom_events: customEvents });
  };

  // Toggle tracking feature
  const toggleTracking = async (feature: keyof ProductTrackingConfig, enabled: boolean) => {
    return updateConfig({ [feature]: enabled });
  };

  useEffect(() => {
    fetchConfig();
  }, [user, productId]);

  return {
    config,
    loading,
    updateConfig,
    saveExternalAnalytics,
    addCustomEvent,
    removeCustomEvent,
    toggleTracking,
    validateAnalyticsId,
    refetch: fetchConfig
  };
};
