import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Lock, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign
} from 'lucide-react';
import { usePaymentSystem } from '@/hooks/usePaymentSystem';
import { useToast } from '@/hooks/use-toast';

interface EscrowPaymentFormProps {
  orderId: string;
  customerId: string;
  storeId: string;
  amount: number;
  onPaymentCreated?: (payment: any) => void;
  onCancel?: () => void;
}

/**
 * Composant pour créer un paiement escrow (à la livraison)
 */
export const EscrowPaymentForm: React.FC<EscrowPaymentFormProps> = ({
  orderId,
  customerId,
  storeId,
  amount,
  onPaymentCreated,
  onCancel
}) => {
  const { createEscrowPayment, loading } = usePaymentSystem();
  const { toast } = useToast();
  
  const [releaseConditions, setReleaseConditions] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast({
        title: "Acceptation requise",
        description: "Vous devez accepter les conditions d'escrow pour continuer",
        variant: "destructive"
      });
      return;
    }

    const payment = await createEscrowPayment({
      orderId,
      customerId,
      storeId,
      amount,
      releaseConditions: releaseConditions || undefined
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

  const getDisputeDeadline = () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    return deadline.toLocaleDateString('fr-FR');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Paiement à la livraison (Escrow)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Votre paiement sera retenu en toute sécurité jusqu'à la confirmation de livraison
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Montant à payer */}
        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Montant total à payer</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(amount)}
            </span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Ce montant sera retenu par Payhuk jusqu'à la confirmation de livraison
          </p>
        </div>

        {/* Comment ça marche */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            Comment fonctionne l'escrow ?
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <h5 className="font-medium text-sm mb-1">Vous payez</h5>
              <p className="text-xs text-muted-foreground">
                Le montant est retenu par Payhuk
              </p>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <h5 className="font-medium text-sm mb-1">Livraison</h5>
              <p className="text-xs text-muted-foreground">
                Le vendeur livre le produit/service
              </p>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <h5 className="font-medium text-sm mb-1">Confirmation</h5>
              <p className="text-xs text-muted-foreground">
                Vous confirmez, le vendeur est payé
              </p>
            </div>
          </div>
        </div>

        {/* Conditions de libération */}
        <div className="space-y-2">
          <Label htmlFor="release-conditions">
            Conditions de libération du paiement (optionnel)
          </Label>
          <Textarea
            id="release-conditions"
            value={releaseConditions}
            onChange={(e) => setReleaseConditions(e.target.value)}
            placeholder="Ex: Livraison dans les 3 jours, produit conforme à la description, emballage intact..."
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Décrivez les conditions spécifiques pour la libération du paiement
          </p>
        </div>

        {/* Avantages de l'escrow */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Protection garantie
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-blue-700 dark:text-blue-300">
                Paiement sécurisé jusqu'à la livraison
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-blue-700 dark:text-blue-300">
                Support en cas de litige
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-blue-700 dark:text-blue-300">
                Remboursement si problème
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              <span className="text-blue-700 dark:text-blue-300">
                Traçabilité complète
              </span>
            </div>
          </div>
        </div>

        {/* Informations importantes */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Informations importantes
              </p>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Vous avez 7 jours pour ouvrir un litige après la livraison</li>
                <li>• Le vendeur sera notifié du paiement en attente</li>
                <li>• Vous recevrez des notifications pour confirmer la livraison</li>
                <li>• En cas de litige, l'équipe Payhuk interviendra</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Délai de litige */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Délai pour ouvrir un litige: jusqu'au {getDisputeDeadline()}
          </span>
        </div>

        {/* Acceptation des conditions */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <Label htmlFor="agree-terms" className="text-sm">
              J'accepte les conditions d'escrow et comprends que le paiement sera retenu 
              jusqu'à la confirmation de livraison. Je peux ouvrir un litige dans les 7 jours 
              suivant la livraison si nécessaire.
            </Label>
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
            disabled={loading || !agreedToTerms}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Payer avec escrow
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
