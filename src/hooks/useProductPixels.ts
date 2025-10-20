import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProductPixelConfig {
  id: string;
  product_id: string;
  user_id: string;
  
  // Facebook Pixel
  facebook_pixel_id: string;
  facebook_pixel_enabled: boolean;
  facebook_viewcontent: boolean;
  facebook_addtocart: boolean;
  facebook_purchase: boolean;
  facebook_lead: boolean;
  
  // Google Analytics
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_enhanced_ecommerce: boolean;
  
  // TikTok Pixel
  tiktok_pixel_id: string;
  tiktok_pixel_enabled: boolean;
  tiktok_viewcontent: boolean;
  tiktok_addtocart: boolean;
  tiktok_completepayment: boolean;
  
  // Pinterest Pixel
  pinterest_pixel_id: string;
  pinterest_pixel_enabled: boolean;
  pinterest_pagevisit: boolean;
  pinterest_addtocart: boolean;
  pinterest_checkout: boolean;
  pinterest_purchase: boolean;
  
  // Advanced Configuration
  cross_domain_tracking: boolean;
  privacy_compliant: boolean;
  debug_mode: boolean;
  custom_events: string[];
  
  created_at: string;
  updated_at: string;
}

export interface PixelEvent {
  id: string;
  product_id: string;
  user_id: string;
  pixel_type: 'facebook' | 'google' | 'tiktok' | 'pinterest';
  event_type: string;
  event_data: any;
  timestamp: string;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  success: boolean;
  error_message?: string;
}

export const useProductPixels = (productId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<ProductPixelConfig | null>(null);
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  // Fetch pixel configuration
  const fetchConfig = useCallback(async () => {
    if (!user || !productId) return;

    try {
      const { data, error } = await supabase
        .from('product_pixels_config')
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
          facebook_pixel_id: '',
          facebook_pixel_enabled: false,
          facebook_viewcontent: false,
          facebook_addtocart: false,
          facebook_purchase: false,
          facebook_lead: false,
          google_analytics_id: '',
          google_tag_manager_id: '',
          google_enhanced_ecommerce: false,
          tiktok_pixel_id: '',
          tiktok_pixel_enabled: false,
          tiktok_viewcontent: false,
          tiktok_addtocart: false,
          tiktok_completepayment: false,
          pinterest_pixel_id: '',
          pinterest_pixel_enabled: false,
          pinterest_pagevisit: false,
          pinterest_addtocart: false,
          pinterest_checkout: false,
          pinterest_purchase: false,
          cross_domain_tracking: false,
          privacy_compliant: false,
          debug_mode: false,
          custom_events: []
        };

        const { data: newConfig, error: insertError } = await supabase
          .from('product_pixels_config')
          .insert([defaultConfig])
          .select()
          .single();

        if (insertError) throw insertError;
        setConfig(newConfig);
      }
    } catch (error: any) {
      console.error('Error fetching pixel config:', error);
    } finally {
      setLoading(false);
    }
  }, [user, productId]);

  // Update pixel configuration
  const updateConfig = useCallback(async (updates: Partial<ProductPixelConfig>) => {
    if (!user || !productId || !config) return false;

    try {
      const { error } = await supabase
        .from('product_pixels_config')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);

      if (error) throw error;

      setConfig(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error: any) {
      console.error('Error updating pixel config:', error);
      return false;
    }
  }, [user, productId, config]);

  // Track pixel event
  const trackEvent = useCallback(async (
    pixelType: 'facebook' | 'google' | 'tiktok' | 'pinterest',
    eventType: string,
    eventData: any = {}
  ) => {
    if (!user || !productId) return false;

    try {
      const event = {
        product_id: productId,
        user_id: user.id,
        pixel_type: pixelType,
        event_type: eventType,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          sessionId: sessionStorage.getItem('sessionId') || generateSessionId()
        },
        timestamp: new Date().toISOString(),
        session_id: sessionStorage.getItem('sessionId') || generateSessionId(),
        user_agent: navigator.userAgent,
        success: true
      };

      const { error } = await supabase
        .from('product_pixel_events')
        .insert([event]);

      if (error) throw error;

      // Add to events list
      setEvents(prev => [event as PixelEvent, ...prev.slice(0, 9)]);

      return true;
    } catch (error: any) {
      console.error('Error tracking pixel event:', error);
      return false;
    }
  }, [user, productId]);

  // Test pixel event
  const testEvent = useCallback(async (
    pixelType: 'facebook' | 'google' | 'tiktok' | 'pinterest',
    eventType: string
  ) => {
    setTesting(true);
    try {
      const success = await trackEvent(pixelType, eventType, {
        test: true,
        test_timestamp: new Date().toISOString()
      });

      if (success) {
        toast({
          title: 'Test réussi ! ✅',
          description: `Événement ${eventType} envoyé avec succès pour ${pixelType}`,
        });
      } else {
        toast({
          title: 'Test échoué ❌',
          description: `Impossible d'envoyer l'événement ${eventType} pour ${pixelType}`,
          variant: 'destructive',
        });
      }
    } finally {
      setTesting(false);
    }
  }, [trackEvent, toast]);

  // Validate pixel IDs
  const validatePixelId = (pixelType: string, id: string): boolean => {
    const patterns = {
      facebook: /^\d{15,16}$/,
      google_analytics: /^(UA-\d{4,10}-\d{1,4}|G-[A-Z0-9]{10})$/,
      google_tag_manager: /^GTM-[A-Z0-9]{6,7}$/,
      tiktok: /^C[A-Z0-9]{15,16}$/,
      pinterest: /^\d{15,16}$/
    };

    return patterns[pixelType as keyof typeof patterns]?.test(id) || id === '';
  };

  // Get pixel status
  const getPixelStatus = (pixelType: string) => {
    if (!config) return { enabled: false, hasId: false, valid: false };

    const pixelId = config[`${pixelType}_pixel_id` as keyof ProductPixelConfig] as string;
    const enabled = config[`${pixelType}_pixel_enabled` as keyof ProductPixelConfig] as boolean;
    
    return {
      enabled: enabled && !!pixelId,
      hasId: !!pixelId,
      valid: validatePixelId(pixelType, pixelId)
    };
  };

  // Get recent events
  const fetchRecentEvents = useCallback(async () => {
    if (!user || !productId) return;

    try {
      const { data, error } = await supabase
        .from('product_pixel_events')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching pixel events:', error);
    }
  }, [user, productId]);

  useEffect(() => {
    fetchConfig();
    fetchRecentEvents();
  }, [fetchConfig, fetchRecentEvents]);

  return {
    config,
    events,
    loading,
    testing,
    updateConfig,
    trackEvent,
    testEvent,
    validatePixelId,
    getPixelStatus,
    refetch: fetchConfig
  };
};

// Helper function to generate session ID
const generateSessionId = () => {
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};
