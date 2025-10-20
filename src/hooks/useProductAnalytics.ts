import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProductAnalyticsEvent {
  id: string;
  product_id: string;
  user_id: string;
  event_type: 'view' | 'click' | 'purchase' | 'custom';
  event_name?: string;
  event_data: any;
  timestamp: string;
  session_id?: string;
  user_agent?: string;
  referrer?: string;
}

export interface ProductAnalyticsData {
  views: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: Array<{ device: string; percentage: number }>;
  trafficSources: Array<{ source: string; percentage: number }>;
}

export interface ProductAnalyticsGoals {
  views: number | null;
  revenue: number | null;
  conversions: number | null;
  conversionRate: number | null;
}

export const useProductAnalytics = (productId: string) => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<ProductAnalyticsData>({
    views: 0,
    clicks: 0,
    conversions: 0,
    conversionRate: 0,
    revenue: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
    topPages: [],
    deviceBreakdown: [],
    trafficSources: []
  });
  const [goals, setGoals] = useState<ProductAnalyticsGoals>({
    views: null,
    revenue: null,
    conversions: null,
    conversionRate: null
  });
  const [loading, setLoading] = useState(true);
  const [realTimeEvents, setRealTimeEvents] = useState<ProductAnalyticsEvent[]>([]);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    if (!user || !productId) return;

    try {
      // Fetch events for this product
      const { data: events, error } = await supabase
        .from('product_analytics_events')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Calculate analytics metrics
      const eventsList = events || [];
      const views = eventsList.filter(e => e.event_type === 'view').length;
      const clicks = eventsList.filter(e => e.event_type === 'click').length;
      const conversions = eventsList.filter(e => e.event_type === 'purchase').length;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      
      // Calculate revenue from purchase events
      const revenue = eventsList
        .filter(e => e.event_type === 'purchase' && e.event_data?.amount)
        .reduce((sum, e) => sum + (e.event_data.amount || 0), 0);

      // Calculate average time on page
      const timeEvents = eventsList.filter(e => e.event_data?.timeSpent);
      const avgTimeOnPage = timeEvents.length > 0 
        ? timeEvents.reduce((sum, e) => sum + (e.event_data.timeSpent || 0), 0) / timeEvents.length
        : 0;

      // Calculate bounce rate (single page sessions)
      const sessions = new Set(eventsList.map(e => e.session_id));
      const bouncedSessions = Array.from(sessions).filter(sessionId => {
        const sessionEvents = eventsList.filter(e => e.session_id === sessionId);
        return sessionEvents.length === 1 && sessionEvents[0].event_type === 'view';
      });
      const bounceRate = sessions.size > 0 ? (bouncedSessions.length / sessions.size) * 100 : 0;

      // Top pages
      const pageViews = eventsList
        .filter(e => e.event_type === 'view' && e.event_data?.page)
        .reduce((acc, e) => {
          const page = e.event_data.page;
          acc[page] = (acc[page] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      const topPages = Object.entries(pageViews)
        .map(([page, views]) => ({ page, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      // Device breakdown
      const deviceData = eventsList
        .filter(e => e.event_data?.device)
        .reduce((acc, e) => {
          const device = e.event_data.device;
          acc[device] = (acc[device] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      const totalDeviceEvents = Object.values(deviceData).reduce((sum, count) => sum + count, 0);
      const deviceBreakdown = Object.entries(deviceData).map(([device, count]) => ({
        device,
        percentage: totalDeviceEvents > 0 ? (count / totalDeviceEvents) * 100 : 0
      }));

      // Traffic sources
      const sourceData = eventsList
        .filter(e => e.event_data?.referrer)
        .reduce((acc, e) => {
          const referrer = e.event_data.referrer;
          const source = referrer.includes('google') ? 'Google' :
                       referrer.includes('facebook') ? 'Facebook' :
                       referrer.includes('twitter') ? 'Twitter' :
                       referrer.includes('linkedin') ? 'LinkedIn' :
                       referrer === 'direct' ? 'Direct' : 'Other';
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      
      const totalSourceEvents = Object.values(sourceData).reduce((sum, count) => sum + count, 0);
      const trafficSources = Object.entries(sourceData).map(([source, count]) => ({
        source,
        percentage: totalSourceEvents > 0 ? (count / totalSourceEvents) * 100 : 0
      }));

      setAnalyticsData({
        views,
        clicks,
        conversions,
        conversionRate,
        revenue,
        avgTimeOnPage,
        bounceRate,
        topPages,
        deviceBreakdown,
        trafficSources
      });

      // Fetch goals
      const { data: goalsData } = await supabase
        .from('product_analytics_goals')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (goalsData) {
        setGoals({
          views: goalsData.goal_views,
          revenue: goalsData.goal_revenue,
          conversions: goalsData.goal_conversions,
          conversionRate: goalsData.goal_conversion_rate
        });
      }

    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, productId]);

  // Track event
  const trackEvent = useCallback(async (
    eventType: 'view' | 'click' | 'purchase' | 'custom',
    eventData: any = {},
    eventName?: string
  ) => {
    if (!user || !productId) return false;

    try {
      const event: Omit<ProductAnalyticsEvent, 'id'> = {
        product_id: productId,
        user_id: user.id,
        event_type: eventType,
        event_name: eventName,
        event_data: {
          ...eventData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct',
          sessionId: sessionStorage.getItem('sessionId') || generateSessionId()
        },
        timestamp: new Date().toISOString(),
        session_id: sessionStorage.getItem('sessionId') || generateSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || 'direct'
      };

      const { error } = await supabase
        .from('product_analytics_events')
        .insert([event]);

      if (error) throw error;

      // Add to real-time events
      setRealTimeEvents(prev => [event as ProductAnalyticsEvent, ...prev.slice(0, 9)]);

      return true;
    } catch (error: any) {
      console.error('Error tracking event:', error);
      return false;
    }
  }, [user, productId]);

  // Save goals
  const saveGoals = useCallback(async (newGoals: ProductAnalyticsGoals) => {
    if (!user || !productId) return false;

    try {
      const { error } = await supabase
        .from('product_analytics_goals')
        .upsert({
          product_id: productId,
          user_id: user.id,
          goal_views: newGoals.views,
          goal_revenue: newGoals.revenue,
          goal_conversions: newGoals.conversions,
          goal_conversion_rate: newGoals.conversionRate,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setGoals(newGoals);
      return true;
    } catch (error: any) {
      console.error('Error saving goals:', error);
      return false;
    }
  }, [user, productId]);

  // Generate reports
  const generateReport = useCallback(async (type: 'daily' | 'monthly' | 'csv') => {
    if (!user || !productId) return null;

    try {
      const { data: events, error } = await supabase
        .from('product_analytics_events')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (type === 'csv') {
        // Generate CSV data
        const csvData = events?.map(event => ({
          timestamp: event.timestamp,
          event_type: event.event_type,
          event_name: event.event_name,
          event_data: JSON.stringify(event.event_data),
          session_id: event.session_id,
          user_agent: event.user_agent,
          referrer: event.referrer
        })) || [];

        return csvData;
      }

      // Generate summary report
      const report = {
        period: type === 'daily' ? 'Daily' : 'Monthly',
        generated_at: new Date().toISOString(),
        product_id: productId,
        analytics: analyticsData,
        events_count: events?.length || 0
      };

      return report;
    } catch (error: any) {
      console.error('Error generating report:', error);
      return null;
    }
  }, [user, productId, analyticsData]);

  // Real-time updates
  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('product_analytics_events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'product_analytics_events',
        filter: `product_id=eq.${productId}`
      }, (payload) => {
        const newEvent = payload.new as ProductAnalyticsEvent;
        if (newEvent.user_id === user?.id) {
          setRealTimeEvents(prev => [newEvent, ...prev.slice(0, 9)]);
          fetchAnalyticsData(); // Refresh analytics data
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAnalyticsData, productId, user?.id]);

  return {
    analyticsData,
    goals,
    loading,
    realTimeEvents,
    trackEvent,
    saveGoals,
    generateReport,
    refetch: fetchAnalyticsData
  };
};

// Helper function to generate session ID
const generateSessionId = () => {
  const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessionStorage.setItem('sessionId', sessionId);
  return sessionId;
};
