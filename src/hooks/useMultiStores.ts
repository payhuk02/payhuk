import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  custom_domain: string | null;
  logo_url: string | null;
  banner_url: string | null;
  theme_color: string;
  about: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  default_currency: string;
  is_active: boolean;
  active_clients: number;
  created_at: string;
  updated_at: string;
}

export interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  totalViews: number;
  monthlyViews: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export interface StoreAnalytics {
  views: number;
  orders: number;
  revenue: number;
  products: number;
  customers: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
  }>;
}

/**
 * Hook pour gérer plusieurs boutiques (maximum 3 par utilisateur)
 */
export const useMultiStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MAX_STORES = 3;

  // Récupérer toutes les boutiques de l'utilisateur
  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStores([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setStores(data || []);
    } catch (err: any) {
      logger.error('Error fetching stores:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos boutiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle boutique
  const createStore = async (storeData: {
    name: string;
    description?: string;
    theme_color?: string;
    contact_email?: string;
    contact_phone?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Vérifier la limite de boutiques
      if (stores.length >= MAX_STORES) {
        toast({
          title: "Limite atteinte",
          description: `Vous ne pouvez créer que ${MAX_STORES} boutiques maximum.`,
          variant: "destructive"
        });
        return null;
      }

      // Générer un slug unique
      const slug = await generateUniqueSlug(storeData.name);

      const { data, error: createError } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          name: storeData.name,
          slug,
          description: storeData.description || null,
          theme_color: storeData.theme_color || '#1a202c',
          contact_email: storeData.contact_email || null,
          contact_phone: storeData.contact_phone || null,
          is_active: true,
          default_currency: 'XOF'
        })
        .select()
        .single();

      if (createError) throw createError;

      setStores(prev => [data, ...prev]);
      
      toast({
        title: "Boutique créée !",
        description: `Votre boutique "${storeData.name}" est maintenant en ligne.`
      });

      return data;
    } catch (err: any) {
      logger.error('Error creating store:', err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer la boutique",
        variant: "destructive"
      });
      return null;
    }
  };

  // Mettre à jour une boutique
  const updateStore = async (storeId: string, updates: Partial<Store>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('stores')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId)
        .select()
        .single();

      if (updateError) throw updateError;

      setStores(prev => prev.map(store => 
        store.id === storeId ? data : store
      ));

      toast({
        title: "Boutique mise à jour",
        description: "Les modifications ont été sauvegardées."
      });

      return data;
    } catch (err: any) {
      logger.error('Error updating store:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la boutique",
        variant: "destructive"
      });
      return null;
    }
  };

  // Supprimer une boutique
  const deleteStore = async (storeId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (deleteError) throw deleteError;

      setStores(prev => prev.filter(store => store.id !== storeId));

      toast({
        title: "Boutique supprimée",
        description: "La boutique a été supprimée avec succès."
      });

      return true;
    } catch (err: any) {
      logger.error('Error deleting store:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la boutique",
        variant: "destructive"
      });
      return false;
    }
  };

  // Basculer l'état actif d'une boutique
  const toggleStoreStatus = async (storeId: string) => {
    try {
      const store = stores.find(s => s.id === storeId);
      if (!store) {
        toast({
          title: "Erreur",
          description: "Boutique non trouvée",
          variant: "destructive"
        });
        return false;
      }

      // Mettre à jour l'état local immédiatement pour un feedback instantané
      const newStatus = !store.is_active;
      setStores(prev => prev.map(s => 
        s.id === storeId ? { ...s, is_active: newStatus } : s
      ));

      const { data, error: updateError } = await supabase
        .from('stores')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id) // Sécurité supplémentaire
        .select()
        .single();

      if (updateError) {
        // Revenir à l'état précédent en cas d'erreur
        setStores(prev => prev.map(s => 
          s.id === storeId ? { ...s, is_active: store.is_active } : s
        ));
        throw updateError;
      }

      // Mettre à jour avec les données du serveur
      setStores(prev => prev.map(s => 
        s.id === storeId ? data : s
      ));

      toast({
        title: newStatus ? "Boutique activée" : "Boutique désactivée",
        description: `Votre boutique "${store.name}" est maintenant ${newStatus ? 'active' : 'inactive'}.`,
      });

      return true;
    } catch (err: any) {
      logger.error('Error toggling store status:', err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de modifier l'état de la boutique",
        variant: "destructive"
      });
      return false;
    }
  };

  // Générer un slug unique
  const generateUniqueSlug = async (name: string): Promise<string> => {
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existingStore) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  };

  // Récupérer les statistiques d'une boutique
  const getStoreStats = async (storeId: string): Promise<StoreStats | null> => {
    try {
      // Récupérer les produits
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('store_id', storeId);

      // Récupérer les commandes
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, created_at')
        .eq('store_id', storeId)
        .eq('status', 'completed');

      // Récupérer les vues (simulation)
      const totalViews = Math.floor(Math.random() * 1000) + 100;
      const monthlyViews = Math.floor(totalViews * 0.3);

      const totalProducts = products?.length || 0;
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      // Calculer les revenus mensuels et hebdomadaires
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const monthlyOrders = orders?.filter(order => 
        new Date(order.created_at) >= oneMonthAgo
      ) || [];
      const weeklyOrders = orders?.filter(order => 
        new Date(order.created_at) >= oneWeekAgo
      ) || [];

      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const conversionRate = totalViews > 0 ? (totalOrders / totalViews) * 100 : 0;

      // Top produits (simulation)
      const topProducts = products?.slice(0, 5).map(product => ({
        id: product.id,
        name: product.name,
        sales: Math.floor(Math.random() * 50) + 1,
        revenue: Math.floor(Math.random() * 100000) + 10000
      })) || [];

      return {
        totalProducts,
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        averageOrderValue,
        conversionRate,
        totalViews,
        monthlyViews,
        topProducts
      };
    } catch (err: any) {
      logger.error('Error fetching store stats:', err);
      return null;
    }
  };

  // Récupérer les analytics détaillées
  const getStoreAnalytics = async (storeId: string): Promise<StoreAnalytics | null> => {
    try {
      const stats = await getStoreStats(storeId);
      if (!stats) return null;

      // Récupérer les commandes récentes
      const { data: recentOrders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          customer:customers(display_name)
        `)
        .eq('store_id', storeId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        views: stats.totalViews,
        orders: stats.totalOrders,
        revenue: stats.totalRevenue,
        products: stats.totalProducts,
        customers: Math.floor(stats.totalOrders * 0.8), // Estimation
        conversionRate: stats.conversionRate,
        averageOrderValue: stats.averageOrderValue,
        topProducts: stats.topProducts,
        recentOrders: recentOrders?.map(order => ({
          id: order.id,
          customer_name: order.customer?.display_name || 'Client anonyme',
          total_amount: order.total_amount,
          created_at: order.created_at
        })) || []
      };
    } catch (err: any) {
      logger.error('Error fetching store analytics:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return {
    stores,
    loading,
    error,
    canCreateStore: stores.length < MAX_STORES,
    maxStores: MAX_STORES,
    fetchStores,
    createStore,
    updateStore,
    deleteStore,
    toggleStoreStatus,
    getStoreStats,
    getStoreAnalytics
  };
};
