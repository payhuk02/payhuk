import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Dispute {
  id: string;
  order_id: string;
  conversation_id: string;
  escrow_payment_id?: string;
  customer_id: string;
  store_id: string;
  dispute_type: 'delivery' | 'quality' | 'service' | 'payment' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  customer_evidence?: any;
  store_evidence?: any;
  admin_notes?: string;
  resolution?: string;
  resolution_type?: 'refund' | 'partial_refund' | 'replacement' | 'service_credit' | 'no_action';
  refund_amount?: number;
  assigned_admin_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  // Relations
  order?: any;
  customer?: any;
  store?: any;
  conversation?: any;
  escrow_payment?: any;
  assigned_admin?: any;
  actions?: DisputeAction[];
  evidence?: DisputeEvidence[];
  decisions?: DisputeDecision[];
}

export interface DisputeAction {
  id: string;
  dispute_id: string;
  action_type: 'created' | 'updated' | 'evidence_added' | 'admin_assigned' | 'status_changed' | 'resolved' | 'closed';
  performed_by: string;
  performed_by_type: 'customer' | 'store' | 'admin';
  description: string;
  metadata?: any;
  created_at: string;
  // Relations
  performer?: any;
}

export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  uploaded_by: string;
  uploaded_by_type: 'customer' | 'store' | 'admin';
  evidence_type: 'image' | 'document' | 'video' | 'audio' | 'other';
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  description?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  // Relations
  uploader?: any;
  verifier?: any;
}

export interface DisputeDecision {
  id: string;
  dispute_id: string;
  admin_id: string;
  decision_type: 'customer_wins' | 'store_wins' | 'partial_customer' | 'partial_store' | 'no_fault';
  decision_reason: string;
  customer_penalty: number;
  store_penalty: number;
  refund_amount: number;
  additional_notes?: string;
  is_final: boolean;
  created_at: string;
  // Relations
  admin?: any;
}

/**
 * Hook pour gérer les litiges entre clients et vendeurs
 */
export const useDisputes = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Créer un litige
  const createDispute = async (data: {
    orderId: string;
    conversationId: string;
    escrowPaymentId?: string;
    customerId: string;
    storeId: string;
    disputeType: 'delivery' | 'quality' | 'service' | 'payment' | 'other';
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: dispute, error: createError } = await supabase
        .from('disputes')
        .insert({
          order_id: data.orderId,
          conversation_id: data.conversationId,
          escrow_payment_id: data.escrowPaymentId,
          customer_id: data.customerId,
          store_id: data.storeId,
          dispute_type: data.disputeType,
          subject: data.subject,
          description: data.description,
          priority: data.priority || 'medium'
        })
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          store:stores(*),
          conversation:conversations(*),
          escrow_payment:escrow_payments(*)
        `)
        .single();

      if (createError) throw createError;

      setDisputes(prev => [dispute, ...prev]);

      toast({
        title: "Litige créé",
        description: "Votre litige a été soumis et sera examiné par notre équipe."
      });

      return dispute;
    } catch (err: any) {
      logger.error('Error creating dispute:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer le litige",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ajouter des preuves
  const addEvidence = async (data: {
    disputeId: string;
    evidenceType: 'image' | 'document' | 'video' | 'audio' | 'other';
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    description?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Déterminer le type d'uploader
      let uploadedByType: 'customer' | 'store' | 'admin' = 'customer';
      
      // Vérifier si l'utilisateur est un vendeur
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (store) {
        uploadedByType = 'store';
      }

      const { data: evidence, error: addError } = await supabase
        .from('dispute_evidence')
        .insert({
          dispute_id: data.disputeId,
          uploaded_by: user.id,
          uploaded_by_type: uploadedByType,
          evidence_type: data.evidenceType,
          file_url: data.fileUrl,
          file_name: data.fileName,
          file_size: data.fileSize,
          file_type: data.fileType,
          description: data.description
        })
        .select()
        .single();

      if (addError) throw addError;

      // Créer une action
      await supabase
        .from('dispute_actions')
        .insert({
          dispute_id: data.disputeId,
          action_type: 'evidence_added',
          performed_by: user.id,
          performed_by_type: uploadedByType,
          description: `Preuve ajoutée: ${data.fileName}`,
          metadata: {
            evidence_type: data.evidenceType,
            file_name: data.fileName
          }
        });

      toast({
        title: "Preuve ajoutée",
        description: "Votre preuve a été ajoutée au litige."
      });

      return evidence;
    } catch (err: any) {
      logger.error('Error adding evidence:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la preuve",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut d'un litige
  const updateDisputeStatus = async (disputeId: string, status: Dispute['status'], adminNotes?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: dispute, error: updateError } = await supabase
        .from('disputes')
        .update({
          status,
          admin_notes: adminNotes,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
          closed_at: status === 'closed' ? new Date().toISOString() : null
        })
        .eq('id', disputeId)
        .select()
        .single();

      if (updateError) throw updateError;

      setDisputes(prev => prev.map(d => 
        d.id === disputeId ? dispute : d
      ));

      toast({
        title: "Statut mis à jour",
        description: `Le litige est maintenant ${status}.`
      });

      return dispute;
    } catch (err: any) {
      logger.error('Error updating dispute status:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Assigner un admin à un litige
  const assignAdmin = async (disputeId: string, adminId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: dispute, error: updateError } = await supabase
        .from('disputes')
        .update({
          assigned_admin_id: adminId,
          status: 'investigating'
        })
        .eq('id', disputeId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Créer une action
      await supabase
        .from('dispute_actions')
        .insert({
          dispute_id: disputeId,
          action_type: 'admin_assigned',
          performed_by: adminId,
          performed_by_type: 'admin',
          description: `Admin assigné au litige`,
          metadata: {
            admin_id: adminId
          }
        });

      setDisputes(prev => prev.map(d => 
        d.id === disputeId ? dispute : d
      ));

      toast({
        title: "Admin assigné",
        description: "Un administrateur a été assigné au litige."
      });

      return dispute;
    } catch (err: any) {
      logger.error('Error assigning admin:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'admin",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer une décision d'arbitrage
  const createDecision = async (data: {
    disputeId: string;
    decisionType: 'customer_wins' | 'store_wins' | 'partial_customer' | 'partial_store' | 'no_fault';
    decisionReason: string;
    customerPenalty?: number;
    storePenalty?: number;
    refundAmount?: number;
    additionalNotes?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: decision, error: createError } = await supabase
        .from('dispute_decisions')
        .insert({
          dispute_id: data.disputeId,
          admin_id: user.id,
          decision_type: data.decisionType,
          decision_reason: data.decisionReason,
          customer_penalty: data.customerPenalty || 0,
          store_penalty: data.storePenalty || 0,
          refund_amount: data.refundAmount || 0,
          additional_notes: data.additionalNotes
        })
        .select()
        .single();

      if (createError) throw createError;

      // Mettre à jour le statut du litige
      await updateDisputeStatus(data.disputeId, 'resolved');

      toast({
        title: "Décision créée",
        description: "Une décision d'arbitrage a été prise pour ce litige."
      });

      return decision;
    } catch (err: any) {
      logger.error('Error creating decision:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer la décision",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les litiges d'un utilisateur
  const fetchUserDisputes = async (userId: string, userType: 'customer' | 'store') => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('disputes')
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          store:stores(*),
          conversation:conversations(*),
          escrow_payment:escrow_payments(*),
          assigned_admin:auth.users(*),
          actions:dispute_actions(*),
          evidence:dispute_evidence(*),
          decisions:dispute_decisions(*)
        `);

      if (userType === 'customer') {
        query = query.eq('customer_id', userId);
      } else {
        query = query.eq('store_id', userId);
      }

      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDisputes(data || []);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching user disputes:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les litiges (pour les admins)
  const fetchAllDisputes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('disputes')
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          store:stores(*),
          conversation:conversations(*),
          escrow_payment:escrow_payments(*),
          assigned_admin:auth.users(*),
          actions:dispute_actions(*),
          evidence:dispute_evidence(*),
          decisions:dispute_decisions(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDisputes(data || []);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching all disputes:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un litige spécifique
  const fetchDispute = async (disputeId: string) => {
    try {
      const { data, error } = await supabase
        .from('disputes')
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          store:stores(*),
          conversation:conversations(*),
          escrow_payment:escrow_payments(*),
          assigned_admin:auth.users(*),
          actions:dispute_actions(*),
          evidence:dispute_evidence(*),
          decisions:dispute_decisions(*)
        `)
        .eq('id', disputeId)
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      logger.error('Error fetching dispute:', err);
      return null;
    }
  };

  // Calculer les statistiques des litiges
  const getDisputeStats = () => {
    const totalDisputes = disputes.length;
    const openDisputes = disputes.filter(d => d.status === 'open').length;
    const investigatingDisputes = disputes.filter(d => d.status === 'investigating').length;
    const resolvedDisputes = disputes.filter(d => d.status === 'resolved').length;
    const closedDisputes = disputes.filter(d => d.status === 'closed').length;
    
    const urgentDisputes = disputes.filter(d => d.priority === 'urgent').length;
    const highPriorityDisputes = disputes.filter(d => d.priority === 'high').length;

    return {
      totalDisputes,
      openDisputes,
      investigatingDisputes,
      resolvedDisputes,
      closedDisputes,
      urgentDisputes,
      highPriorityDisputes
    };
  };

  return {
    // État
    disputes,
    loading,
    error,
    
    // Actions
    createDispute,
    addEvidence,
    updateDisputeStatus,
    assignAdmin,
    createDecision,
    fetchUserDisputes,
    fetchAllDisputes,
    fetchDispute,
    getDisputeStats
  };
};
