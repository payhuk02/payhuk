import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "./useStore";
import { logger } from '@/lib/logger';
import { useOptimizedLoading } from './useOptimizedLoading';

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
  const { loading, error, startLoading, stopLoading, setError: setErrorState } = useOptimizedLoading({
    initialLoading: true,
    debounceMs: 150,
    minLoadingTime: 500
  });
  const { toast } = useToast();
  const { store } = useStore();
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchStats = useCallback(async () => {
    if (!store?.id) {
      setStats(defaultStats);
      stopLoading();
      return;
    }

    try {
      startLoading();
      retryCountRef.current = 0;

      // Exécuter les requêtes essentielles d'abord avec timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000) // 10 secondes timeout
      );

      const [
        productsResult,
        ordersResult,
        customersResult
      ] = await Promise.allSettled([
        // Products stats (requête simple)
        Promise.race([
          supabase
            .from("products")
            .select("id, is_active, name, price, image_url, category")
            .eq("store_id", store.id)
            .limit(100), // Limiter les résultats
          timeoutPromise
        ]),
        
        // Orders stats (requête simple)
        Promise.race([
          supabase
            .from("orders")
            .select("id, status, total_amount, created_at")
            .eq("store_id", store.id)
            .limit(100), // Limiter les résultats
          timeoutPromise
        ]),
        
        // Customers count (requête rapide)
        Promise.race([
          supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("store_id", store.id),
          timeoutPromise
        ])
      ]);

      // Requêtes secondaires avec timeout plus court
      const [
        recentOrdersResult,
        orderItemsResult,
        revenueResult
      ] = await Promise.allSettled([
        // Recent orders (limité à 5)
        Promise.race([
          supabase
            .from("orders")
            .select("id, order_number, total_amount, status, created_at, customers(name)")
            .eq("store_id", store.id)
            .order("created_at", { ascending: false })
            .limit(5),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Recent orders timeout')), 5000))
        ]),
        
        // Order items (limité)
        Promise.race([
          supabase
            .from("order_items")
            .select(`
              product_id,
              product_name,
              order_id,
              orders!inner(store_id)
            `)
            .eq("orders.store_id", store.id)
            .limit(50), // Limiter les résultats
          new Promise((_, reject) => setTimeout(() => reject(new Error('Order items timeout')), 5000))
        ]),
        
        // Revenue data (limité à 3 mois)
        Promise.race([
          supabase
            .from("orders")
            .select("total_amount, created_at")
            .eq("store_id", store.id)
            .gte("created_at", new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString()) // 3 mois au lieu de 6
            .limit(100), // Limiter les résultats
          new Promise((_, reject) => setTimeout(() => reject(new Error('Revenue timeout')), 5000))
        ])
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

      // Générer des données de démonstration si aucune donnée réelle
      const hasRealData = products.length > 0 || orders.length > 0 || customersCount > 0;
      
      if (!hasRealData) {
        // Données de démonstration pour le tableau de bord
        const demoStats: DashboardStats = {
          totalProducts: 12,
          activeProducts: 10,
          totalOrders: 45,
          pendingOrders: 3,
          totalCustomers: 28,
          totalRevenue: 1250000,
          recentOrders: [
            {
              id: '1',
              order_number: 'CMD-001',
              total_amount: 25000,
              status: 'completed',
              created_at: new Date().toISOString(),
              customers: { name: 'Jean Dupont' }
            },
            {
              id: '2',
              order_number: 'CMD-002',
              total_amount: 18000,
              status: 'pending',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              customers: { name: 'Marie Martin' }
            },
            {
              id: '3',
              order_number: 'CMD-003',
              total_amount: 32000,
              status: 'completed',
              created_at: new Date(Date.now() - 7200000).toISOString(),
              customers: { name: 'Pierre Durand' }
            }
          ],
          topProducts: [
            {
              id: '1',
              name: 'T-shirt Premium',
              price: 15000,
              image_url: null,
              orderCount: 15,
              sales_count: 15,
              category: 'Vêtements'
            },
            {
              id: '2',
              name: 'Casquette Sport',
              price: 8000,
              image_url: null,
              orderCount: 12,
              sales_count: 12,
              category: 'Accessoires'
            },
            {
              id: '3',
              name: 'Sac à dos',
              price: 25000,
              image_url: null,
              orderCount: 8,
              sales_count: 8,
              category: 'Accessoires'
            }
          ],
          revenueByMonth: [
            { month: 'Jan 2024', revenue: 180000 },
            { month: 'Fév 2024', revenue: 220000 },
            { month: 'Mar 2024', revenue: 195000 },
            { month: 'Avr 2024', revenue: 280000 },
            { month: 'Mai 2024', revenue: 320000 },
            { month: 'Juin 2024', revenue: 250000 }
          ]
        };
        
        setStats(demoStats);
      } else {
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
      }

    } catch (error: any) {
      logger.error('Erreur lors du chargement des statistiques:', error);
      
      // Retry logic pour les erreurs temporaires
      if (retryCountRef.current < maxRetries && 
          (error.message.includes('network') || error.message.includes('timeout'))) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchStats();
        }, 1000 * retryCountRef.current); // Retry avec délai croissant
        return;
      }
      
      setErrorState(error.message);
      
      // Ne pas afficher de toast pour les erreurs de données manquantes
      if (!error.message.includes('No rows found') && !error.message.includes('relation')) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive",
        });
      }
    } finally {
      stopLoading();
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
