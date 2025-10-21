import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useAppStore } from '../store/useAppStore';
import { useNotification } from '../components/ui/NotificationContainer';
import { useSmartCache } from './useSmartCache';

// Types pour les données du tableau de bord
export interface DashboardStats {
  // Métriques principales
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  
  // Croissance
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  
  // Données détaillées
  recentOrders: OrderSummary[];
  topProducts: ProductSummary[];
  revenueByMonth: RevenueData[];
  customerMetrics: CustomerMetrics;
  performanceMetrics: PerformanceMetrics;
  
  // Métadonnées
  lastUpdated: string;
  period: '7d' | '30d' | '90d' | '1y';
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  itemsCount: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  salesCount: number;
  revenue: number;
  category: string;
  rating: number;
  image?: string;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface CustomerMetrics {
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  retentionRate: number;
}

export interface PerformanceMetrics {
  conversionRate: number;
  averageOrderValue: number;
  cartAbandonmentRate: number;
  pageViews: number;
  bounceRate: number;
  sessionDuration: number;
}

// Hook principal pour le tableau de bord
export const useDashboardData = () => {
  const { user } = useAuth();
  const { currentStore } = useAppStore();
  const { showSuccess, showError } = useNotification();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Cache intelligent pour les données
  const { data: cachedStats, refetch: refetchCache } = useSmartCache(
    `dashboard-stats-${currentStore?.id}-${selectedPeriod}`,
    async () => {
      if (!currentStore?.id) {
        return getEmptyStats();
      }
      
      try {
        const response = await fetch(`/api/dashboard/stats?storeId=${currentStore.id}&period=${selectedPeriod}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return getEmptyStats();
      }
    },
    {
      enableCache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      dependencies: [currentStore?.id, selectedPeriod]
    }
  );

  // Fonction pour obtenir des statistiques vides (pour nouveaux utilisateurs)
  const getEmptyStats = useCallback((): DashboardStats => {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      activeProducts: 0,
      pendingOrders: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      customersGrowth: 0,
      productsGrowth: 0,
      recentOrders: [],
      topProducts: [],
      revenueByMonth: [],
      customerMetrics: {
        newCustomers: 0,
        returningCustomers: 0,
        averageOrderValue: 0,
        customerLifetimeValue: 0,
        retentionRate: 0
      },
      performanceMetrics: {
        conversionRate: 0,
        averageOrderValue: 0,
        cartAbandonmentRate: 0,
        pageViews: 0,
        bounceRate: 0,
        sessionDuration: 0
      },
      lastUpdated: new Date().toISOString(),
      period: selectedPeriod
    };
  }, [selectedPeriod]);

  // Charger les données
  const loadStats = useCallback(async () => {
    if (!currentStore?.id) {
      setStats(getEmptyStats());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await refetchCache();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
      setError(errorMessage);
      showError('Erreur', errorMessage);
      setStats(getEmptyStats());
    } finally {
      setIsLoading(false);
    }
  }, [currentStore?.id, refetchCache, getEmptyStats, showError]);

  // Charger les données au montage et quand les dépendances changent
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Fonction pour actualiser les données
  const refreshStats = useCallback(async () => {
    await loadStats();
    showSuccess('Actualisation', 'Données du tableau de bord mises à jour');
  }, [loadStats, showSuccess]);

  // Fonction pour changer la période
  const changePeriod = useCallback((period: '7d' | '30d' | '90d' | '1y') => {
    setSelectedPeriod(period);
  }, []);

  // Fonction pour exporter les données
  const exportData = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    if (!stats) return;

    try {
      const response = await fetch('/api/dashboard/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: currentStore?.id,
          period: selectedPeriod,
          format
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-data-${selectedPeriod}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Export réussi', `Données exportées en ${format.toUpperCase()}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'export';
      showError('Erreur d\'export', errorMessage);
    }
  }, [stats, currentStore?.id, selectedPeriod, showSuccess, showError]);

  // Fonction pour créer des données de démonstration (optionnel)
  const generateDemoData = useCallback(async () => {
    if (!currentStore?.id) return;

    try {
      const response = await fetch('/api/dashboard/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: currentStore.id,
          period: selectedPeriod
        })
      });

      if (!response.ok) {
        throw new Error('Demo data generation failed');
      }

      await refreshStats();
      showSuccess('Données de démonstration', 'Données de démonstration générées avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération des données de démonstration';
      showError('Erreur', errorMessage);
    }
  }, [currentStore?.id, selectedPeriod, refreshStats, showSuccess, showError]);

  // Fonction pour supprimer toutes les données (reset)
  const resetData = useCallback(async () => {
    if (!currentStore?.id) return;

    try {
      const response = await fetch('/api/dashboard/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: currentStore.id
        })
      });

      if (!response.ok) {
        throw new Error('Reset failed');
      }

      await refreshStats();
      showSuccess('Réinitialisation', 'Toutes les données ont été supprimées');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réinitialisation';
      showError('Erreur', errorMessage);
    }
  }, [currentStore?.id, refreshStats, showSuccess, showError]);

  // Valeurs calculées
  const isEmpty = useMemo(() => {
    if (!stats) return true;
    return stats.totalRevenue === 0 && 
           stats.totalOrders === 0 && 
           stats.totalCustomers === 0 && 
           stats.totalProducts === 0;
  }, [stats]);

  const hasData = useMemo(() => {
    return !isEmpty && stats !== null;
  }, [isEmpty, stats]);

  const formattedStats = useMemo(() => {
    if (!stats) return null;

    return {
      ...stats,
      formattedRevenue: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalRevenue),
      formattedOrders: new Intl.NumberFormat('fr-FR').format(stats.totalOrders),
      formattedCustomers: new Intl.NumberFormat('fr-FR').format(stats.totalCustomers),
      formattedProducts: new Intl.NumberFormat('fr-FR').format(stats.totalProducts),
    };
  }, [stats]);

  return {
    stats: formattedStats,
    isLoading,
    error,
    selectedPeriod,
    isEmpty,
    hasData,
    loadStats,
    refreshStats,
    changePeriod,
    exportData,
    generateDemoData,
    resetData
  };
};

// Hook pour les actions rapides du tableau de bord
export const useDashboardActions = () => {
  const { showSuccess, showError } = useNotification();
  const { currentStore } = useAppStore();

  const createProduct = useCallback(async (productData: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          storeId: currentStore?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      showSuccess('Produit créé', 'Le produit a été créé avec succès');
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du produit';
      showError('Erreur', errorMessage);
      throw error;
    }
  }, [currentStore?.id, showSuccess, showError]);

  const createOrder = useCallback(async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          storeId: currentStore?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      showSuccess('Commande créée', 'La commande a été créée avec succès');
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la commande';
      showError('Erreur', errorMessage);
      throw error;
    }
  }, [currentStore?.id, showSuccess, showError]);

  const updateStoreSettings = useCallback(async (settings: any) => {
    try {
      const response = await fetch('/api/stores/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          storeId: currentStore?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update store settings');
      }

      showSuccess('Paramètres mis à jour', 'Les paramètres de la boutique ont été mis à jour');
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour des paramètres';
      showError('Erreur', errorMessage);
      throw error;
    }
  }, [currentStore?.id, showSuccess, showError]);

  return {
    createProduct,
    createOrder,
    updateStoreSettings
  };
};
