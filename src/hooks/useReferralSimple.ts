import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalEarnings: number;
}

/**
 * Hook simplifié pour les données de parrainage
 * Gère les cas où il n'y a pas encore de données
 */
export const useReferralSimple = () => {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Récupérer ou créer le profil
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, total_referral_earnings')
        .eq('user_id', user.id)
        .single();

      // Si le profil n'existe pas, le créer
      if (profileError && profileError.code === 'PGRST116') {
        const referralCode = generateReferralCode();
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Utilisateur',
            referral_code: referralCode,
            total_referral_earnings: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      } else if (profileError) {
        throw profileError;
      }

      // Récupérer le nombre de filleuls
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('status', 'active');

      if (referralsError) {
        // Si la table referrals n'existe pas encore, utiliser des valeurs par défaut
        logger.warn('Referrals table not found, using default values');
      }

      const baseUrl = window.location.origin;
      const referralLink = `${baseUrl}/?ref=${profile.referral_code}`;

      setData({
        referralCode: profile.referral_code || '',
        referralLink,
        totalReferrals: referrals?.length || 0,
        totalEarnings: profile.total_referral_earnings || 0,
      });

    } catch (error: any) {
      logger.error('Error fetching referral data:', error);
      
      // En cas d'erreur, créer des données par défaut
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const baseUrl = window.location.origin;
        const referralCode = generateReferralCode();
        const referralLink = `${baseUrl}/?ref=${referralCode}`;
        
        setData({
          referralCode,
          referralLink,
          totalReferrals: 0,
          totalEarnings: 0,
        });
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de parrainage. Utilisation des valeurs par défaut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  return { data, loading, refetch: fetchReferralData };
};
