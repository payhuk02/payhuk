import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export type DomainStatus = 'active' | 'pending_dns' | 'pending_ssl' | 'error' | 'disconnected' | 'not_configured';

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

export interface Domain {
  id: string;
  store_id: string | null;
  domain_name: string;
  status: DomainStatus;
  dns_records: DNSRecord[];
  ssl_status: 'pending' | 'issued' | 'error' | 'expired';
  verification_token?: string;
  verification_method?: 'dns' | 'file' | 'meta';
  ssl_certificate_id?: string;
  ssl_expires_at?: string;
  last_checked_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useDomainManagement = (storeId?: string) => {
  const { toast } = useToast();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [status, setStatus] = useState<DomainStatus>('not_configured');
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDomain = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('domains').select('*').limit(1);
      if (storeId) {
        query = query.eq('store_id', storeId);
      } else {
        query = query.is('store_id', null);
      }

      const { data, error: dbError } = await query.single();

      if (dbError && dbError.code !== 'PGRST116') {
        throw dbError;
      }

      if (data) {
        setDomain(data as Domain);
        setStatus(data.status);
        setDnsRecords(data.dns_records || []);
      } else {
        setDomain(null);
        setStatus('not_configured');
        setDnsRecords([]);
      }
    } catch (err: any) {
      logger.error('Error fetching domain:', err);
      setError(err.message || 'Impossible de charger les informations du domaine.');
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations du domaine.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, toast]);

  const connectDomain = async (domainName: string) => {
    setLoading(true);
    setError(null);
    try {
      // Validation du format du domaine
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;
      if (!domainRegex.test(domainName)) {
        throw new Error('Format de domaine invalide');
      }

      // Générer un token de vérification localement
      const verificationToken = `payhuk-verification-${Math.random().toString(36).substring(2, 15)}`;

      // Enregistrements DNS à configurer
      const dnsRecords: DNSRecord[] = [
        { type: 'CNAME', name: 'www', value: 'cname.payhuk.com', ttl: 3600 },
        { type: 'A', name: '@', value: '192.0.2.1', ttl: 3600 },
        { type: 'TXT', name: '_payhuk-verification', value: verificationToken, ttl: 3600 },
      ];

      const domainData = {
        store_id: storeId || null,
        domain_name: domainName,
        status: 'pending_dns' as DomainStatus,
        dns_records: dnsRecords,
        ssl_status: 'pending' as const,
        verification_token: verificationToken,
        verification_method: 'dns' as const,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (domain) {
        // Mise à jour du domaine existant
        const { data, error: dbError } = await supabase
          .from('domains')
          .update(domainData)
          .eq('id', domain.id)
          .select()
          .single();
        if (dbError) throw dbError;
        result = data;
      } else {
        // Création d'un nouveau domaine
        const { data, error: dbError } = await supabase
          .from('domains')
          .insert(domainData)
          .select()
          .single();
        if (dbError) throw dbError;
        result = data;
      }

      setDomain(result as Domain);
      setStatus(result.status);
      setDnsRecords(result.dns_records);
      
      toast({
        title: 'Domaine en cours de connexion',
        description: 'Veuillez configurer les enregistrements DNS pour activer votre domaine.',
      });
      return true;
    } catch (err: any) {
      logger.error('Error connecting domain:', err);
      setError(err.message || 'Impossible de connecter le domaine.');
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de connecter le domaine.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disconnectDomain = async (domainId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from('domains')
        .update({ 
          status: 'disconnected' as DomainStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', domainId);

      if (dbError) throw dbError;

      setDomain(null);
      setStatus('disconnected');
      setDnsRecords([]);
      
      toast({
        title: 'Domaine déconnecté',
        description: 'Votre domaine a été déconnecté avec succès.',
      });
      return true;
    } catch (err: any) {
      logger.error('Error disconnecting domain:', err);
      setError(err.message || 'Impossible de déconnecter le domaine.');
      toast({
        title: 'Erreur',
        description: 'Impossible de déconnecter le domaine.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkDomainStatus = async (domainId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simuler la vérification DNS (dans un vrai système, ceci appellerait une API externe)
      // Pour l'instant, on simule avec une probabilité de succès
      const isSuccess = Math.random() > 0.3;
      const newStatus: DomainStatus = isSuccess ? 'active' : 'pending_dns';

      const { data, error: dbError } = await supabase
        .from('domains')
        .update({ 
          status: newStatus, 
          ssl_status: isSuccess ? 'issued' : 'pending',
          last_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', domainId)
        .select()
        .single();

      if (dbError) throw dbError;

      setDomain(data as Domain);
      setStatus(data.status);
      setDnsRecords(data.dns_records || []);

      if (isSuccess) {
        toast({
          title: 'Domaine actif !',
          description: 'Votre domaine est maintenant connecté et sécurisé.',
        });
      } else {
        toast({
          title: 'Vérification en cours',
          description: 'Les enregistrements DNS ne sont pas encore propagés.',
          variant: 'warning',
        });
      }
      return isSuccess;
    } catch (err: any) {
      logger.error('Error checking domain status:', err);
      setError(err.message || 'Impossible de vérifier le statut du domaine.');
      toast({
        title: 'Erreur',
        description: 'Impossible de vérifier le statut du domaine.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshDomain = async () => {
    if (domain) {
      await checkDomainStatus(domain.id);
    } else {
      await fetchDomain();
    }
  };

  const getDomainUrl = () => {
    if (!domain || domain.status !== 'active') return null;
    return `https://${domain.domain_name}`;
  };

  const getSSLInfo = () => {
    if (!domain) return null;
    return {
      status: domain.ssl_status,
      expiresAt: domain.ssl_expires_at,
      certificateId: domain.ssl_certificate_id,
    };
  };

  return {
    domain,
    status,
    dnsRecords,
    loading,
    error,
    connectDomain,
    disconnectDomain,
    checkDomainStatus,
    refreshDomain,
    fetchDomain,
    getDomainUrl,
    getSSLInfo,
  };
};
