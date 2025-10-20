import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProductAlert {
  id: string;
  product_id: string;
  user_id: string;
  alert_type: 'goal_reached' | 'goal_missed' | 'performance_spike' | 'performance_drop';
  metric: 'views' | 'clicks' | 'conversions' | 'revenue' | 'conversion_rate';
  threshold_value: number;
  current_value: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ProductGoal {
  id: string;
  product_id: string;
  user_id: string;
  goal_views: number | null;
  goal_revenue: number | null;
  goal_conversions: number | null;
  goal_conversion_rate: number | null;
  email_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductGoalsAlerts = (productId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<ProductGoal | null>(null);
  const [alerts, setAlerts] = useState<ProductAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch goals and alerts
  const fetchGoalsAlerts = async () => {
    if (!user || !productId) return;

    try {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('product_analytics_goals')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;

      if (goalsData) {
        setGoals(goalsData);
      }

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('product_analytics_alerts')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;

      setAlerts(alertsData || []);

    } catch (error: any) {
      console.error('Error fetching goals and alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save goals
  const saveGoals = async (goalsData: Partial<ProductGoal>) => {
    if (!user || !productId) return false;

    try {
      const { error } = await supabase
        .from('product_analytics_goals')
        .upsert({
          product_id: productId,
          user_id: user.id,
          ...goalsData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setGoals(prev => prev ? { ...prev, ...goalsData } : null);
      return true;
    } catch (error: any) {
      console.error('Error saving goals:', error);
      return false;
    }
  };

  // Check goals and create alerts
  const checkGoals = async (currentMetrics: {
    views: number;
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }) => {
    if (!goals || !user || !productId) return;

    const newAlerts: Omit<ProductAlert, 'id'>[] = [];

    // Check views goal
    if (goals.goal_views && currentMetrics.views >= goals.goal_views) {
      newAlerts.push({
        product_id: productId,
        user_id: user.id,
        alert_type: 'goal_reached',
        metric: 'views',
        threshold_value: goals.goal_views,
        current_value: currentMetrics.views,
        message: `Objectif de vues atteint ! ${currentMetrics.views}/${goals.goal_views}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Check revenue goal
    if (goals.goal_revenue && currentMetrics.revenue >= goals.goal_revenue) {
      newAlerts.push({
        product_id: productId,
        user_id: user.id,
        alert_type: 'goal_reached',
        metric: 'revenue',
        threshold_value: goals.goal_revenue,
        current_value: currentMetrics.revenue,
        message: `Objectif de revenus atteint ! ${currentMetrics.revenue.toFixed(2)} XOF/${goals.goal_revenue} XOF`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Check conversions goal
    if (goals.goal_conversions && currentMetrics.conversions >= goals.goal_conversions) {
      newAlerts.push({
        product_id: productId,
        user_id: user.id,
        alert_type: 'goal_reached',
        metric: 'conversions',
        threshold_value: goals.goal_conversions,
        current_value: currentMetrics.conversions,
        message: `Objectif de conversions atteint ! ${currentMetrics.conversions}/${goals.goal_conversions}`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Check conversion rate goal
    if (goals.goal_conversion_rate && currentMetrics.conversionRate >= goals.goal_conversion_rate) {
      newAlerts.push({
        product_id: productId,
        user_id: user.id,
        alert_type: 'goal_reached',
        metric: 'conversion_rate',
        threshold_value: goals.goal_conversion_rate,
        current_value: currentMetrics.conversionRate,
        message: `Objectif de taux de conversion atteint ! ${currentMetrics.conversionRate.toFixed(1)}%/${goals.goal_conversion_rate}%`,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Create alerts if any
    if (newAlerts.length > 0) {
      const { error } = await supabase
        .from('product_analytics_alerts')
        .insert(newAlerts);

      if (error) throw error;

      // Show toast notifications
      newAlerts.forEach(alert => {
        toast({
          title: 'Objectif atteint ! 🎉',
          description: alert.message,
        });
      });

      // Refresh alerts
      fetchGoalsAlerts();
    }
  };

  // Mark alert as read
  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('product_analytics_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error: any) {
      console.error('Error marking alert as read:', error);
    }
  };

  // Mark all alerts as read
  const markAllAlertsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('product_analytics_alerts')
        .update({ is_read: true })
        .eq('product_id', productId)
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
    } catch (error: any) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  // Delete alert
  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('product_analytics_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error: any) {
      console.error('Error deleting alert:', error);
    }
  };

  // Get goal progress
  const getGoalProgress = (metric: keyof ProductGoal) => {
    if (!goals || !goals[metric]) return { current: 0, target: 0, percentage: 0 };

    const target = goals[metric] as number;
    // This would be replaced with actual current values from analytics
    const current = 0; // Placeholder
    const percentage = target > 0 ? (current / target) * 100 : 0;

    return { current, target, percentage };
  };

  // Get unread alerts count
  const unreadAlertsCount = alerts.filter(alert => !alert.is_read).length;

  useEffect(() => {
    fetchGoalsAlerts();
  }, [user, productId]);

  return {
    goals,
    alerts,
    loading,
    saveGoals,
    checkGoals,
    markAlertAsRead,
    markAllAlertsAsRead,
    deleteAlert,
    getGoalProgress,
    unreadAlertsCount,
    refetch: fetchGoalsAlerts
  };
};
