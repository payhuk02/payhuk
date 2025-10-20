import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "./useStore";
import { logger } from '@/lib/logger';

export interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customers: { name: string } | null;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    orderCount: number;
    sales_count?: number;
    category?: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
  }>;
}

const defaultStats: DashboardStats = {
  totalProducts: 0,
  activeProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalCustomers: 0,
  totalRevenue: 0,
  recentOrders: [],
  topProducts: [],
  revenueByMonth: [],
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { store } = useStore();

  const fetchStats = useCallback(async () => {
    if (!store?.id) {
      setStats(defaultStats);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Exécuter toutes les requêtes en parallèle pour améliorer les performances
      const [
        productsResult,
        ordersResult,
        customersResult,
        recentOrdersResult,
        orderItemsResult,
        revenueResult
      ] = await Promise.allSettled([
        // Products stats
        supabase
          .from("products")
          .select("id, is_active, name, price, image_url, category")
          .eq("store_id", store.id),
        
        // Orders stats
        supabase
          .from("orders")
          .select("id, status, total_amount, created_at")
          .eq("store_id", store.id),
        
        // Customers count
        supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .eq("store_id", store.id),
        
        // Recent orders
        supabase
          .from("orders")
          .select("id, order_number, total_amount, status, created_at, customers(name)")
          .eq("store_id", store.id)
          .order("created_at", { ascending: false })
          .limit(5),
        
        // Order items for top products
        supabase
          .from("order_items")
          .select(`
            product_id,
            product_name,
            order_id,
            orders!inner(store_id)
          `)
          .eq("orders.store_id", store.id),
        
        // Revenue data
        supabase
          .from("orders")
          .select("total_amount, created_at")
          .eq("store_id", store.id)
          .gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      // Traiter les résultats avec gestion d'erreurs robuste
      const products = productsResult.status === 'fulfilled' && !productsResult.value.error 
        ? productsResult.value.data || [] 
        : [];
      
      const orders = ordersResult.status === 'fulfilled' && !ordersResult.value.error 
        ? ordersResult.value.data || [] 
        : [];
      
      const customersCount = customersResult.status === 'fulfilled' && !customersResult.value.error 
        ? customersResult.value.count || 0 
        : 0;
      
      const recentOrders = recentOrdersResult.status === 'fulfilled' && !recentOrdersResult.value.error 
        ? recentOrdersResult.value.data || [] 
        : [];
      
      const orderItems = orderItemsResult.status === 'fulfilled' && !orderItemsResult.value.error 
        ? orderItemsResult.value.data || [] 
        : [];
      
      const revenueData = revenueResult.status === 'fulfilled' && !revenueResult.value.error 
        ? revenueResult.value.data || [] 
        : [];

      // Calculer les top products
      const productCounts = orderItems.reduce((acc: any, item: any) => {
        if (item.product_id) {
          acc[item.product_id] = (acc[item.product_id] || 0) + 1;
        }
        return acc;
      }, {});

      const topProducts = products
        .map((product: any) => ({
          ...product,
          orderCount: productCounts[product.id] || 0,
          sales_count: productCounts[product.id] || 0,
        }))
        .sort((a: any, b: any) => b.orderCount - a.orderCount)
        .slice(0, 5);

      // Calculer les revenus par mois
      const revenueByMonth = revenueData.reduce((acc: any, order: any) => {
        try {
          const month = new Date(order.created_at).toLocaleString("fr-FR", { 
            month: "short", 
            year: "numeric" 
          });
          acc[month] = (acc[month] || 0) + parseFloat(order.total_amount || 0);
        } catch (error) {
          logger.warn('Erreur de formatage de date pour les revenus:', error);
        }
        return acc;
      }, {});

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p: any) => p.is_active).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === "pending").length,
        totalCustomers: customersCount,
        totalRevenue: orders.reduce((sum: number, order: any) => 
          sum + parseFloat(order.total_amount?.toString() || '0'), 0),
        recentOrders: recentOrders,
        topProducts: topProducts,
        revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({
          month,
          revenue: revenue as number,
        })),
      });

    } catch (error: any) {
      logger.error('Erreur lors du chargement des statistiques:', error);
      setError(error.message);
      
      // Ne pas afficher de toast pour les erreurs de données manquantes
      if (!error.message.includes('No rows found') && !error.message.includes('relation')) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [store?.id, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { 
    stats, 
    loading, 
    error,
    refetch: fetchStats 
  };
};
