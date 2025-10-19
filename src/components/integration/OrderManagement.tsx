import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  MessageSquare, 
  AlertTriangle,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle2,
  User,
  Store,
  Shield,
  DollarSign
} from 'lucide-react';
import { PaymentSelection } from '@/components/payments/PaymentSelection';
import { PaymentDashboard } from '@/components/payments/PaymentDashboard';
import { MessagingInterface } from '@/components/messaging/MessagingInterface';
import { DisputeManagement } from '@/components/disputes/DisputeManagement';

interface OrderManagementProps {
  orderId: string;
  customerId: string;
  storeId: string;
  productId: string;
  productType: 'physical' | 'digital' | 'service';
  totalAmount: number;
  orderStatus: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  conversationId?: string;
  escrowPaymentId?: string;
}

/**
 * Page principale d'intégration des fonctionnalités de paiement, messagerie et litiges
 */
export const OrderManagement: React.FC<OrderManagementProps> = ({
  orderId,
  customerId,
  storeId,
  productId,
  productType,
  totalAmount,
  orderStatus,
  conversationId,
  escrowPaymentId
}) => {
  const [activeTab, setActiveTab] = useState('payment');
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [disputeCreated, setDisputeCreated] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProductTypeLabel = (type: string) => {
    const labels = {
      physical: 'Produit physique',
      digital: 'Produit digital',
      service: 'Service'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getProductTypeIcon = (type: string) => {
    switch (type) {
      case 'physical':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'digital':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'service':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      processing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getOrderStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      paid: 'Payé',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handlePaymentCreated = (payment: any) => {
    setPaymentCreated(true);
    setActiveTab('messages');
  };

  const handleDisputeCreated = (dispute: any) => {
    setDisputeCreated(true);
    setActiveTab('messages');
  };

  const handleConversationCreated = (conversation: any) => {
    setCurrentConversationId(conversation.id);
  };

  return (
    <div className="space-y-6">
      {/* Header de la commande */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getProductTypeIcon(productType)}
              <div>
                <CardTitle className="flex items-center gap-2">
                  Commande #{orderId.slice(-8)}
                  <Badge className={getOrderStatusColor(orderStatus)}>
                    {getOrderStatusLabel(orderStatus)}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getProductTypeLabel(productType)} • {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Paiement
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="disputes" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Litiges
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <Shield className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Onglet Paiement */}
        <TabsContent value="payment" className="space-y-6">
          {!paymentCreated ? (
            <PaymentSelection
              orderId={orderId}
              customerId={customerId}
              storeId={storeId}
              totalAmount={totalAmount}
              productType={productType}
              onPaymentCreated={handlePaymentCreated}
              onCancel={() => setActiveTab('messages')}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">Paiement créé avec succès</h3>
                <p className="text-muted-foreground mb-4">
                  Votre paiement a été traité. Vous pouvez maintenant communiquer avec le vendeur.
                </p>
                <Button onClick={() => setActiveTab('messages')}>
                  Voir les messages
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Messages */}
        <TabsContent value="messages" className="space-y-6">
          {currentConversationId ? (
            <MessagingInterface
              conversationId={currentConversationId}
              currentUserId={customerId}
              onClose={() => setActiveTab('payment')}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Créez une conversation pour communiquer avec le vendeur.
                </p>
                <Button onClick={() => handleConversationCreated({ id: 'new-conversation' })}>
                  Créer une conversation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Litiges */}
        <TabsContent value="disputes" className="space-y-6">
          {!disputeCreated ? (
            <DisputeManagement
              orderId={orderId}
              conversationId={currentConversationId || 'default'}
              customerId={customerId}
              storeId={storeId}
              escrowPaymentId={escrowPaymentId}
              onDisputeCreated={handleDisputeCreated}
              onClose={() => setActiveTab('messages')}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                <h3 className="text-lg font-semibold mb-2">Litige créé</h3>
                <p className="text-muted-foreground mb-4">
                  Votre litige a été soumis. Notre équipe l'examinera sous 48h.
                </p>
                <Button onClick={() => setActiveTab('messages')}>
                  Voir les messages
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <PaymentDashboard
            userId={customerId}
            userType="customer"
          />
        </TabsContent>
      </Tabs>

      {/* Informations contextuelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informations importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-green-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Paiements sécurisés</p>
                <p className="text-muted-foreground">
                  Tous les paiements sont protégés et traçables
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Communication directe</p>
                <p className="text-muted-foreground">
                  Échangez directement avec le vendeur
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Support litiges</p>
                <p className="text-muted-foreground">
                  Notre équipe intervient en cas de problème
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
