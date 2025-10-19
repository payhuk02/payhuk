import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Shield,
  Percent
} from 'lucide-react';
import { usePaymentSystem, PartialPayment, EscrowPayment } from '@/hooks/usePaymentSystem';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PaymentDashboardProps {
  userId: string;
  userType: 'customer' | 'store';
}

/**
 * Dashboard de gestion des paiements pour clients et vendeurs
 */
export const PaymentDashboard: React.FC<PaymentDashboardProps> = ({
  userId,
  userType
}) => {
  const { 
    partialPayments, 
    escrowPayments, 
    loading, 
    fetchUserPayments,
    releaseEscrowPayment,
    openDispute,
    completePartialPayment,
    getPaymentStats
  } = usePaymentSystem();
  
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'disputed'>('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserPayments(userId, userType);
  }, [userId, userType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      held: 'bg-orange-100 text-orange-800',
      released: 'bg-green-100 text-green-800',
      disputed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      partial: 'Partiel',
      completed: 'Complété',
      failed: 'Échoué',
      refunded: 'Remboursé',
      held: 'Retenu',
      released: 'Libéré',
      disputed: 'En litige'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir libérer ce paiement ? Cette action est irréversible.')) {
      await releaseEscrowPayment(escrowId, 'Paiement libéré par le client');
    }
  };

  const handleOpenDispute = async (escrowId: string) => {
    const reason = window.prompt('Raison du litige:');
    if (reason) {
      await openDispute(escrowId, reason);
    }
  };

  const handleCompletePartial = async (partialId: string) => {
    const amount = window.prompt('Montant à ajouter (XOF):');
    if (amount && !isNaN(parseFloat(amount))) {
      await completePartialPayment(partialId, parseFloat(amount));
    }
  };

  const exportPayments = () => {
    const csvData = [
      ['Type', 'Montant', 'Statut', 'Date', 'ID'],
      ...partialPayments.map(p => [
        'Paiement partiel',
        p.paid_amount.toString(),
        p.payment_status,
        p.created_at,
        p.id
      ]),
      ...escrowPayments.map(e => [
        'Paiement escrow',
        e.amount.toString(),
        e.escrow_status,
        e.created_at,
        e.id
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paiements-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = getPaymentStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestion des paiements</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des paiements</h2>
          <p className="text-muted-foreground">
            Gérez vos paiements {userType === 'customer' ? 'en tant que client' : 'en tant que vendeur'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUserPayments(userId, userType)}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportPayments}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Paiements partiels</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalPartialPayments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Paiements escrow</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalEscrowPayments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Montant retenu</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalHeldAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">En attente</span>
            </div>
            <p className="text-2xl font-bold">{stats.pendingPayments}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="partial">Paiements partiels</TabsTrigger>
          <TabsTrigger value="escrow">Paiements escrow</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Paiements partiels récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Paiements partiels récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {partialPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.paid_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_percentage}% payé
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(payment.payment_status)}>
                          {getStatusLabel(payment.payment_status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {partialPayments.length === 0 && (
                    <div className="text-center py-8">
                      <Percent className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">Aucun paiement partiel</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paiements escrow récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paiements escrow récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {escrowPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.escrow_status === 'held' ? 'Retenu' : 'Libéré'}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(payment.escrow_status)}>
                          {getStatusLabel(payment.escrow_status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(payment.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {escrowPayments.length === 0 && (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">Aucun paiement escrow</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Paiements partiels */}
        <TabsContent value="partial" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Paiements partiels</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {partialPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Percent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.total_amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_percentage}% payé ({formatCurrency(payment.paid_amount)})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Restant: {formatCurrency(payment.remaining_amount)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(payment.payment_status)}>
                        {getStatusLabel(payment.payment_status)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(payment.created_at)}
                      </p>
                      
                      {payment.payment_status === 'partial' && userType === 'customer' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompletePartial(payment.id)}
                          className="mt-2"
                        >
                          Compléter
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {partialPayments.length === 0 && (
                  <div className="text-center py-12">
                    <Percent className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Aucun paiement partiel</h3>
                    <p className="text-muted-foreground">
                      Vous n'avez pas encore de paiements partiels.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paiements escrow */}
        <TabsContent value="escrow" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Paiements escrow</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {escrowPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.escrow_status === 'held' ? 'Retenu en escrow' : 'Libéré'}
                        </p>
                        {payment.release_conditions && (
                          <p className="text-sm text-muted-foreground">
                            Conditions: {payment.release_conditions}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getStatusColor(payment.escrow_status)}>
                        {getStatusLabel(payment.escrow_status)}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(payment.created_at)}
                      </p>
                      
                      {payment.escrow_status === 'held' && userType === 'customer' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => handleReleaseEscrow(payment.id)}
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Libérer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDispute(payment.id)}
                            className="gap-1"
                          >
                            <AlertTriangle className="h-3 w-3" />
                            Litige
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {escrowPayments.length === 0 && (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Aucun paiement escrow</h3>
                    <p className="text-muted-foreground">
                      Vous n'avez pas encore de paiements escrow.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
