import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Percent, 
  DollarSign, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';
import { usePaymentSystem } from '@/hooks/usePaymentSystem';
import { useToast } from '@/hooks/use-toast';

interface PartialPaymentFormProps {
  orderId: string;
  customerId: string;
  storeId: string;
  totalAmount: number;
  onPaymentCreated?: (payment: any) => void;
  onCancel?: () => void;
}

/**
 * Composant pour créer un paiement partiel
 */
export const PartialPaymentForm: React.FC<PartialPaymentFormProps> = ({
  orderId,
  customerId,
  storeId,
  totalAmount,
  onPaymentCreated,
  onCancel
}) => {
  const { createPartialPayment, loading } = usePaymentSystem();
  const { toast } = useToast();
  
  const [paymentPercentage, setPaymentPercentage] = useState(50);
  const [dueDate, setDueDate] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);

  const paidAmount = useCustomAmount 
    ? parseFloat(customAmount) || 0
    : (totalAmount * paymentPercentage) / 100;
  
  const remainingAmount = totalAmount - paidAmount;
  const calculatedPercentage = useCustomAmount 
    ? Math.round((paidAmount / totalAmount) * 100)
    : paymentPercentage;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paidAmount <= 0 || paidAmount >= totalAmount) {
      toast({
        title: "Montant invalide",
        description: "Le montant payé doit être entre 0 et le montant total",
        variant: "destructive"
      });
      return;
    }

    if (useCustomAmount && paidAmount > totalAmount) {
      toast({
        title: "Montant trop élevé",
        description: "Le montant payé ne peut pas dépasser le montant total",
        variant: "destructive"
      });
      return;
    }

    const payment = await createPartialPayment({
      orderId,
      customerId,
      storeId,
      totalAmount,
      paymentPercentage: calculatedPercentage,
      dueDate: dueDate || undefined
    });

    if (payment) {
      onPaymentCreated?.(payment);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDueDateMin = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5 text-blue-500" />
          Paiement partiel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Payez un pourcentage du montant total maintenant, le reste plus tard
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Montant total */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Montant total de la commande</span>
            <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Options de paiement */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="percentage"
              name="paymentType"
              checked={!useCustomAmount}
              onChange={() => setUseCustomAmount(false)}
              className="h-4 w-4"
            />
            <Label htmlFor="percentage" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Paiement par pourcentage
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="custom"
              name="paymentType"
              checked={useCustomAmount}
              onChange={() => setUseCustomAmount(true)}
              className="h-4 w-4"
            />
            <Label htmlFor="custom" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Montant personnalisé
            </Label>
          </div>
        </div>

        {/* Sélection du pourcentage */}
        {!useCustomAmount && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="percentage-slider">
                Pourcentage à payer maintenant: {paymentPercentage}%
              </Label>
              <Slider
                id="percentage-slider"
                value={[paymentPercentage]}
                onValueChange={(value) => setPaymentPercentage(value[0])}
                min={1}
                max={99}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1%</span>
                <span>99%</span>
              </div>
            </div>
          </div>
        )}

        {/* Montant personnalisé */}
        {useCustomAmount && (
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Montant à payer maintenant</Label>
            <Input
              id="custom-amount"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0"
              min="1"
              max={totalAmount}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">
              Maximum: {formatCurrency(totalAmount)}
            </p>
          </div>
        )}

        {/* Résumé du paiement */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-700 dark:text-blue-300">
              Résumé du paiement
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Montant payé maintenant:</span>
              <p className="font-semibold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Montant restant:</span>
              <p className="font-semibold text-orange-600">
                {formatCurrency(remainingAmount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {calculatedPercentage}% payé maintenant
            </Badge>
            <Badge variant="outline" className="text-xs">
              {100 - calculatedPercentage}% restant
            </Badge>
          </div>
        </div>

        {/* Date d'échéance */}
        <div className="space-y-2">
          <Label htmlFor="due-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date d'échéance pour le solde restant (optionnel)
          </Label>
          <Input
            id="due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={getDueDateMin()}
            placeholder="Sélectionnez une date"
          />
          <p className="text-xs text-muted-foreground">
            Si aucune date n'est sélectionnée, le solde peut être payé à tout moment
          </p>
        </div>

        {/* Informations importantes */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Informations importantes
              </p>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Le paiement partiel sera traité immédiatement</li>
                <li>• Le solde restant devra être payé avant la livraison</li>
                <li>• Vous recevrez des rappels pour le solde restant</li>
                <li>• Le vendeur sera notifié du paiement partiel</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || paidAmount <= 0 || paidAmount >= totalAmount}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmer le paiement partiel
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
