import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Percent, 
  Shield, 
  Clock,
  CheckCircle2,
  Info,
  AlertCircle,
  DollarSign,
  Calendar,
  Lock
} from 'lucide-react';
import { PartialPaymentForm } from '@/components/payments/PartialPaymentForm';
import { EscrowPaymentForm } from '@/components/payments/EscrowPaymentForm';

interface PaymentSelectionProps {
  orderId: string;
  customerId: string;
  storeId: string;
  totalAmount: number;
  productType: 'physical' | 'digital' | 'service';
  onPaymentMethodSelected?: (method: 'full' | 'partial' | 'escrow') => void;
  onPaymentCreated?: (payment: any) => void;
  onCancel?: () => void;
}

/**
 * Composant pour sélectionner le type de paiement
 */
export const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  orderId,
  customerId,
  storeId,
  totalAmount,
  productType,
  onPaymentMethodSelected,
  onPaymentCreated,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'full' | 'partial' | 'escrow' | null>(null);

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
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'digital':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case 'service':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMethodSelect = (method: 'full' | 'partial' | 'escrow') => {
    setSelectedMethod(method);
    onPaymentMethodSelected?.(method);
  };

  const handlePaymentCreated = (payment: any) => {
    onPaymentCreated?.(payment);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  // Si une méthode est sélectionnée, afficher le formulaire correspondant
  if (selectedMethod === 'partial') {
    return (
      <PartialPaymentForm
        orderId={orderId}
        customerId={customerId}
        storeId={storeId}
        totalAmount={totalAmount}
        onPaymentCreated={handlePaymentCreated}
        onCancel={handleBack}
      />
    );
  }

  if (selectedMethod === 'escrow') {
    return (
      <EscrowPaymentForm
        orderId={orderId}
        customerId={customerId}
        storeId={storeId}
        amount={totalAmount}
        onPaymentCreated={handlePaymentCreated}
        onCancel={handleBack}
      />
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Choisir le mode de paiement
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sélectionnez la méthode de paiement qui vous convient le mieux
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informations de la commande */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getProductTypeIcon(productType)}
              <span className="font-medium">{getProductTypeLabel(productType)}</span>
            </div>
            <Badge variant="outline">
              Commande #{orderId.slice(-8)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Montant total</span>
            <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Options de paiement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Paiement complet */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => handleMethodSelect('full')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Paiement complet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Payez la totalité du montant maintenant
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Paiement immédiat</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Livraison rapide</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Processus simple</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paiement partiel */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => handleMethodSelect('partial')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Paiement partiel</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Payez un pourcentage maintenant, le reste plus tard
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Flexibilité financière</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Rappels automatiques</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Date d'échéance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paiement escrow */}
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
            onClick={() => handleMethodSelect('escrow')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Paiement à la livraison</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paiement sécurisé retenu jusqu'à confirmation
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-orange-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Protection garantie</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Support litiges</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Remboursement possible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommandations selon le type de produit */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Recommandations pour {getProductTypeLabel(productType).toLowerCase()}
                  </p>
                  
                  {productType === 'physical' && (
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>Escrow recommandé</strong> : Protection maximale pour les produits physiques</li>
                      <li>• <strong>Paiement partiel</strong> : Possible pour les gros montants</li>
                      <li>• <strong>Paiement complet</strong> : Pour les petits montants et vendeurs de confiance</li>
                    </ul>
                  )}
                  
                  {productType === 'digital' && (
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>Paiement complet</strong> : Recommandé pour les produits digitaux</li>
                      <li>• <strong>Escrow</strong> : Pour les produits digitaux de valeur élevée</li>
                      <li>• <strong>Paiement partiel</strong> : Moins adapté aux produits digitaux</li>
                    </ul>
                  )}
                  
                  {productType === 'service' && (
                    <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• <strong>Escrow recommandé</strong> : Protection idéale pour les services</li>
                      <li>• <strong>Paiement partiel</strong> : Pour les services longs ou complexes</li>
                      <li>• <strong>Paiement complet</strong> : Pour les services simples et rapides</li>
                    </ul>
                  )}
                </div>
              </div>
        </div>

        {/* Informations de sécurité */}
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Lock className="h-4 w-4 text-green-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                Sécurité garantie
              </p>
              <p className="text-green-700 dark:text-green-300">
                Tous les paiements sont sécurisés et traçables. Payhuk protège vos transactions 
                et vous accompagne en cas de problème.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Annuler
          </Button>
          <div className="flex-1 text-center text-sm text-muted-foreground flex items-center justify-center">
            Sélectionnez une méthode de paiement pour continuer
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
