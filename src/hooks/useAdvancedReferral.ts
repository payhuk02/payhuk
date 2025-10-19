import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  conversionRate: number;
  rank: number;
  level: string;
  nextLevelReferrals: number;
  nextLevelEarnings: number;
}

export interface ReferralUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  last_activity: string;
  total_orders: number;
  total_spent: number;
  status: 'active' | 'inactive' | 'pending';
  commission_earned: number;
}

export interface ReferralHistory {
  id: string;
  type: 'signup' | 'purchase' | 'commission';
  amount: number;
  description: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

export interface ReferralLevel {
  name: string;
  minReferrals: number;
  minEarnings: number;
  commissionRate: number;
  benefits: string[];
  color: string;
}

const REFERRAL_LEVELS: ReferralLevel[] = [
  {
    name: 'Débutant',
    minReferrals: 0,
    minEarnings: 0,
    commissionRate: 2.0,
    benefits: ['2% de commission', 'Support de base'],
    color: 'text-gray-500'
  },
  {
    name: 'Bronze',
    minReferrals: 5,
    minEarnings: 50000,
    commissionRate: 2.5,
    benefits: ['2.5% de commission', 'Support prioritaire', 'Badge Bronze'],
    color: 'text-orange-500'
  },
  {
    name: 'Argent',
    minReferrals: 15,
    minEarnings: 150000,
    commissionRate: 3.0,
    benefits: ['3% de commission', 'Support VIP', 'Badge Argent', 'Bonus mensuel'],
    color: 'text-gray-400'
  },
  {
    name: 'Or',
    minReferrals: 30,
    minEarnings: 300000,
    commissionRate: 3.5,
    benefits: ['3.5% de commission', 'Support dédié', 'Badge Or', 'Bonus trimestriel'],
    color: 'text-yellow-500'
  },
  {
    name: 'Platine',
    minReferrals: 50,
    minEarnings: 500000,
    commissionRate: 4.0,
    benefits: ['4% de commission', 'Support 24/7', 'Badge Platine', 'Bonus annuel'],
    color: 'text-purple-500'
  },
  {
    name: 'Diamant',
    minReferrals: 100,
    minEarnings: 1000000,
    commissionRate: 5.0,
    benefits: ['5% de commission', 'Support personnel', 'Badge Diamant', 'Revenus passifs'],
    color: 'text-blue-500'
  }
];

export const useAdvancedReferral = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [history, setHistory] = useState<ReferralHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCurrentLevel = (totalReferrals: number, totalEarnings: number): ReferralLevel => {
    for (let i = REFERRAL_LEVELS.length - 1; i >= 0; i--) {
      const level = REFERRAL_LEVELS[i];
      if (totalReferrals >= level.minReferrals && totalEarnings >= level.minEarnings) {
        return level;
      }
    }
    return REFERRAL_LEVELS[0];
  };

  const getNextLevel = (currentLevel: ReferralLevel): ReferralLevel | null => {
    const currentIndex = REFERRAL_LEVELS.findIndex(level => level.name === currentLevel.name);
    return currentIndex < REFERRAL_LEVELS.length - 1 ? REFERRAL_LEVELS[currentIndex + 1] : null;
  };

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Récupérer le profil avec les données de parrainage
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          referral_code,
          total_referral_earnings,
          created_at
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        // Si le profil n'existe pas, créer un profil par défaut
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: user.id,
              display_name: user.email?.split('@')[0] || 'Utilisateur',
              referral_code: generateReferralCode(),
            })
            .select()
            .single();
          
          if (createError) throw createError;
          
          // Utiliser le nouveau profil
          const baseUrl = window.location.origin;
          const referralLink = `${baseUrl}/?ref=${newProfile.referral_code}`;
          
          setStats({
            referralCode: newProfile.referral_code || '',
            referralLink,
            totalReferrals: 0,
            activeReferrals: 0,
            totalEarnings: 0,
            monthlyEarnings: 0,
            weeklyEarnings: 0,
            conversionRate: 0,
            rank: 1,
            level: 'Débutant',
            nextLevelReferrals: 5,
            nextLevelEarnings: 50000,
          });
          
          setLoading(false);
          return;
        }
        throw profileError;
      }

      // Récupérer les statistiques des filleuls
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          status,
          created_at,
          commission_earned
        `)
        .eq('referrer_id', user.id);

      if (referralError) throw referralError;

      // Calculer les statistiques
      const totalReferrals = referralData?.length || 0;
      const activeReferrals = referralData?.filter(r => r.status === 'active').length || 0;
      const totalEarnings = profile.total_referral_earnings || 0;

      // Calculer les gains mensuels et hebdomadaires
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const monthlyEarnings = referralData
        ?.filter(r => new Date(r.created_at) >= oneMonthAgo)
        .reduce((sum, r) => sum + (r.commission_earned || 0), 0) || 0;

      const weeklyEarnings = referralData
        ?.filter(r => new Date(r.created_at) >= oneWeekAgo)
        .reduce((sum, r) => sum + (r.commission_earned || 0), 0) || 0;

      // Calculer le taux de conversion (filleuls actifs / total filleuls)
      const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

      // Déterminer le niveau actuel
      const currentLevel = getCurrentLevel(totalReferrals, totalEarnings);
      const nextLevel = getNextLevel(currentLevel);

      // Calculer le rang (approximation basée sur les gains)
      const { data: rankData } = await supabase
        .from('profiles')
        .select('total_referral_earnings')
        .order('total_referral_earnings', { ascending: false });

      const rank = rankData ? rankData.findIndex(p => p.total_referral_earnings <= totalEarnings) + 1 : 1;

      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}/?ref=${profile.referral_code}`;

      setStats({
        referralCode: profile.referral_code || '',
        referralLink,
        totalReferrals,
        activeReferrals,
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        conversionRate,
        rank,
        level: currentLevel.name,
        nextLevelReferrals: nextLevel ? nextLevel.minReferrals - totalReferrals : 0,
        nextLevelEarnings: nextLevel ? nextLevel.minEarnings - totalEarnings : 0,
      });

      logger.info('Referral stats fetched successfully', {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        level: currentLevel.name
      });

    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      logger.error('Failed to fetch referral stats', { error: errorMessage });
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: referralData, error } = await supabase
        .from('referrals')
        .select(`
          id,
          referred_id,
          status,
          created_at,
          commission_earned
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les données d'activité des filleuls
      const referralUsers: ReferralUser[] = await Promise.all(
        (referralData || []).map(async (ref) => {
          // Récupérer le profil du filleul
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, display_name, avatar_url, created_at')
            .eq('user_id', ref.referred_id)
            .single();

          if (!profile) return null;

          // Récupérer les commandes du filleul
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, created_at')
            .eq('customer_id', ref.referred_id)
            .eq('status', 'completed');

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
          const lastOrder = orders?.[0]?.created_at;

          return {
            id: ref.referred_id,
            email: profile.email,
            display_name: profile.display_name || 'Utilisateur',
            avatar_url: profile.avatar_url,
            created_at: ref.created_at,
            last_activity: lastOrder || ref.created_at,
            total_orders: totalOrders,
            total_spent: totalSpent,
            status: ref.status as 'active' | 'inactive' | 'pending',
            commission_earned: ref.commission_earned || 0,
          };
        })
      );

      setReferrals(referralUsers.filter(Boolean) as ReferralUser[]);

    } catch (error: any) {
      logger.error('Failed to fetch referral users', { error: error.message });
    }
  };

  const fetchReferralHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: historyData, error } = await supabase
        .from('referral_history')
        .select(`
          id,
          type,
          amount,
          description,
          created_at,
          referred_user_id
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Récupérer les profils des utilisateurs parrainés
      const referralHistory: ReferralHistory[] = await Promise.all(
        (historyData || []).map(async (item) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('user_id', item.referred_user_id)
            .single();

          return {
            id: item.id,
            type: item.type as 'signup' | 'purchase' | 'commission',
            amount: item.amount,
            description: item.description,
            created_at: item.created_at,
            user_name: profile?.display_name || 'Utilisateur',
            user_email: profile?.email || '',
          };
        })
      );

      setHistory(referralHistory);

    } catch (error: any) {
      logger.error('Failed to fetch referral history', { error: error.message });
    }
  };

  const generateReferralCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Générer un nouveau code de parrainage
      const { data, error } = await supabase.rpc('generate_referral_code');
      
      if (error) throw error;

      // Mettre à jour le profil avec le nouveau code
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referral_code: data })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Rafraîchir les données
      await fetchReferralStats();

      toast({
        title: "Code généré !",
        description: "Un nouveau code de parrainage a été généré.",
      });

    } catch (error: any) {
      logger.error('Failed to generate referral code', { error: error.message });
      toast({
        title: "Erreur",
        description: "Impossible de générer un nouveau code.",
        variant: "destructive",
      });
    }
  };

  const shareReferralLink = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'email') => {
    if (!stats?.referralLink) return;

    const message = `Rejoignez Payhuk, la plateforme e-commerce africaine ! Utilisez mon lien de parrainage pour obtenir des avantages exclusifs : ${stats.referralLink}`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stats.referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(stats.referralLink)}&text=${encodeURIComponent(message)}`,
      email: `mailto:?subject=Rejoignez Payhuk&body=${encodeURIComponent(message)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
    
    logger.userAction('referral_shared', { platform, referralCode: stats.referralCode });
  };

  useEffect(() => {
    fetchReferralStats();
    fetchReferralUsers();
    fetchReferralHistory();
  }, []);

  return {
    stats,
    referrals,
    history,
    loading,
    error,
    levels: REFERRAL_LEVELS,
    refetch: fetchReferralStats,
    generateReferralCode,
    shareReferralLink,
  };
};
