import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Store {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  default_currency?: string;
  custom_domain: string | null;
  domain_status: string | null;
  domain_verification_token: string | null;
  domain_verified_at: string | null;
  domain_error_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useStore = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Erreur lors de la récupération de la boutique:', error);
        setStore(null);
        return;
      }

      // Si aucune boutique trouvée, c'est normal
      if (!data || data.length === 0) {
        setStore(null);
        return;
      }

      setStore(data[0]);
    } catch (error: any) {
      console.error('Erreur dans useStore:', error);
      // Ne pas afficher de toast - c'est normal qu'il n'y ait pas de boutique
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, []);

  return { store, loading, refetch: fetchStore };
};
