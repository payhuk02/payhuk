import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface PartialPayment {
  id: string;
  order_id: string;
  customer_id: string;
  store_id: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_percentage: number;
  payment_method: string;
  payment_status: 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  payment_data?: any;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  due_date?: string;
}

export interface EscrowPayment {
  id: string;
  order_id: string;
  customer_id: string;
  store_id: string;
  amount: number;
  payment_method: string;
  escrow_status: 'held' | 'released' | 'disputed' | 'refunded';
  transaction_id: string;
  payment_data?: any;
  release_conditions?: string;
  created_at: string;
  updated_at: string;
  paid_at: string;
  released_at?: string;
  dispute_deadline: string;
}

export interface PaymentHistory {
  id: string;
  order_id: string;
  payment_type: 'partial' | 'escrow' | 'full';
  amount: number;
  action: 'payment' | 'release' | 'refund' | 'dispute';
  status: string;
  transaction_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface PaymentStats {
  totalPartialPayments: number;
  totalEscrowPayments: number;
  totalHeldAmount: number;
  totalReleasedAmount: number;
  pendingPayments: number;
  disputedPayments: number;
}

/**
 * Hook pour gérer les paiements partiels et escrow
 */
export const usePaymentSystem = () => {
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [escrowPayments, setEscrowPayments] = useState<EscrowPayment[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Créer un paiement partiel
  const createPartialPayment = async (data: {
    orderId: string;
    customerId: string;
    storeId: string;
    totalAmount: number;
    paymentPercentage: number;
    paymentMethod?: string;
    dueDate?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const paidAmount = (data.totalAmount * data.paymentPercentage) / 100;
      const remainingAmount = data.totalAmount - paidAmount;

      const { data: payment, error: createError } = await supabase
        .from('partial_payments')
        .insert({
          order_id: data.orderId,
          customer_id: data.customerId,
          store_id: data.storeId,
          total_amount: data.totalAmount,
          paid_amount: paidAmount,
          remaining_amount: remainingAmount,
          payment_percentage: data.paymentPercentage,
          payment_method: data.paymentMethod || 'moneroo',
          payment_status: 'pending',
          due_date: data.dueDate
        })
        .select()
        .single();

      if (createError) throw createError;

      setPartialPayments(prev => [payment, ...prev]);

      toast({
        title: "Paiement partiel créé",
        description: `Paiement de ${data.paymentPercentage}% (${paidAmount.toLocaleString()} XOF) créé avec succès.`
      });

      return payment;
    } catch (err: any) {
      logger.error('Error creating partial payment:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer le paiement partiel",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un paiement escrow
  const createEscrowPayment = async (data: {
    orderId: string;
    customerId: string;
    storeId: string;
    amount: number;
    paymentMethod?: string;
    releaseConditions?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: payment, error: createError } = await supabase
        .from('escrow_payments')
        .insert({
          order_id: data.orderId,
          customer_id: data.customerId,
          store_id: data.storeId,
          amount: data.amount,
          payment_method: data.paymentMethod || 'moneroo',
          escrow_status: 'held',
          transaction_id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          release_conditions: data.releaseConditions,
          paid_at: new Date().toISOString(),
          dispute_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      setEscrowPayments(prev => [payment, ...prev]);

      toast({
        title: "Paiement escrow créé",
        description: `Paiement de ${data.amount.toLocaleString()} XOF retenu en escrow.`
      });

      return payment;
    } catch (err: any) {
      logger.error('Error creating escrow payment:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer le paiement escrow",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Libérer un paiement escrow
  const releaseEscrowPayment = async (escrowId: string, notes?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: payment, error: updateError } = await supabase
        .from('escrow_payments')
        .update({
          escrow_status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', escrowId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setEscrowPayments(prev => prev.map(p => 
        p.id === escrowId ? payment : p
      ));

      // Créer un historique
      await createPaymentHistory({
        orderId: payment.order_id,
        paymentType: 'escrow',
        amount: payment.amount,
        action: 'release',
        status: 'released',
        transactionId: payment.transaction_id,
        notes: notes || 'Paiement libéré par le client'
      });

      toast({
        title: "Paiement libéré",
        description: `Le paiement de ${payment.amount.toLocaleString()} XOF a été libéré au vendeur.`
      });

      return payment;
    } catch (err: any) {
      logger.error('Error releasing escrow payment:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de libérer le paiement",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir un litige
  const openDispute = async (escrowId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: payment, error: updateError } = await supabase
        .from('escrow_payments')
        .update({
          escrow_status: 'disputed'
        })
        .eq('id', escrowId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setEscrowPayments(prev => prev.map(p => 
        p.id === escrowId ? payment : p
      ));

      // Créer un historique
      await createPaymentHistory({
        orderId: payment.order_id,
        paymentType: 'escrow',
        amount: payment.amount,
        action: 'dispute',
        status: 'disputed',
        transactionId: payment.transaction_id,
        notes: `Litige ouvert: ${reason}`
      });

      toast({
        title: "Litige ouvert",
        description: "Un litige a été ouvert pour ce paiement. L'équipe Payhuk va examiner le cas."
      });

      return payment;
    } catch (err: any) {
      logger.error('Error opening dispute:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir le litige",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Compléter un paiement partiel
  const completePartialPayment = async (partialId: string, additionalAmount: number) => {
    try {
      setLoading(true);
      setError(null);

      const partialPayment = partialPayments.find(p => p.id === partialId);
      if (!partialPayment) {
        throw new Error('Paiement partiel non trouvé');
      }

      const newPaidAmount = partialPayment.paid_amount + additionalAmount;
      const newRemainingAmount = partialPayment.total_amount - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? 'completed' : 'partial';

      const { data: payment, error: updateError } = await supabase
        .from('partial_payments')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          payment_status: newStatus,
          paid_at: new Date().toISOString()
        })
        .eq('id', partialId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Mettre à jour l'état local
      setPartialPayments(prev => prev.map(p => 
        p.id === partialId ? payment : p
      ));

      // Créer un historique
      await createPaymentHistory({
        orderId: payment.order_id,
        paymentType: 'partial',
        amount: additionalAmount,
        action: 'payment',
        status: newStatus,
        transactionId: payment.transaction_id,
        notes: `Paiement complémentaire de ${additionalAmount.toLocaleString()} XOF`
      });

      toast({
        title: "Paiement mis à jour",
        description: `Paiement complété. Montant restant: ${newRemainingAmount.toLocaleString()} XOF`
      });

      return payment;
    } catch (err: any) {
      logger.error('Error completing partial payment:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de compléter le paiement",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Créer un historique de paiement
  const createPaymentHistory = async (data: {
    orderId: string;
    paymentType: 'partial' | 'escrow' | 'full';
    amount: number;
    action: 'payment' | 'release' | 'refund' | 'dispute';
    status: string;
    transactionId?: string;
    notes?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('payment_history')
        .insert({
          order_id: data.orderId,
          payment_type: data.paymentType,
          amount: data.amount,
          action: data.action,
          status: data.status,
          transaction_id: data.transactionId,
          notes: data.notes,
          created_by: user?.id
        });

      if (error) throw error;
    } catch (err: any) {
      logger.error('Error creating payment history:', err);
    }
  };

  // Récupérer les paiements d'un utilisateur
  const fetchUserPayments = async (userId: string, userType: 'customer' | 'store') => {
    try {
      setLoading(true);
      setError(null);

      if (userType === 'customer') {
        // Récupérer les paiements du client
        const [partialResult, escrowResult] = await Promise.all([
          supabase
            .from('partial_payments')
            .select('*')
            .eq('customer_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('escrow_payments')
            .select('*')
            .eq('customer_id', userId)
            .order('created_at', { ascending: false })
        ]);

        if (partialResult.error) throw partialResult.error;
        if (escrowResult.error) throw escrowResult.error;

        setPartialPayments(partialResult.data || []);
        setEscrowPayments(escrowResult.data || []);
      } else {
        // Récupérer les paiements du vendeur
        const [partialResult, escrowResult] = await Promise.all([
          supabase
            .from('partial_payments')
            .select('*')
            .eq('store_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('escrow_payments')
            .select('*')
            .eq('store_id', userId)
            .order('created_at', { ascending: false })
        ]);

        if (partialResult.error) throw partialResult.error;
        if (escrowResult.error) throw escrowResult.error;

        setPartialPayments(partialResult.data || []);
        setEscrowPayments(escrowResult.data || []);
      }
    } catch (err: any) {
      logger.error('Error fetching user payments:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paiements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'historique des paiements
  const fetchPaymentHistory = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPaymentHistory(data || []);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching payment history:', err);
      return [];
    }
  };

  // Calculer les statistiques
  const getPaymentStats = (): PaymentStats => {
    const totalPartialPayments = partialPayments.length;
    const totalEscrowPayments = escrowPayments.length;
    
    const totalHeldAmount = escrowPayments
      .filter(p => p.escrow_status === 'held')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalReleasedAmount = escrowPayments
      .filter(p => p.escrow_status === 'released')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingPayments = partialPayments.filter(p => p.payment_status === 'pending').length +
                          escrowPayments.filter(p => p.escrow_status === 'held').length;
    
    const disputedPayments = escrowPayments.filter(p => p.escrow_status === 'disputed').length;

    return {
      totalPartialPayments,
      totalEscrowPayments,
      totalHeldAmount,
      totalReleasedAmount,
      pendingPayments,
      disputedPayments
    };
  };

  return {
    // État
    partialPayments,
    escrowPayments,
    paymentHistory,
    loading,
    error,
    
    // Actions
    createPartialPayment,
    createEscrowPayment,
    releaseEscrowPayment,
    openDispute,
    completePartialPayment,
    createPaymentHistory,
    fetchUserPayments,
    fetchPaymentHistory,
    getPaymentStats
  };
};
