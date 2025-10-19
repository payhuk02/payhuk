import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle2,
  XCircle,
  User,
  Store,
  Shield,
  MessageSquare,
  DollarSign,
  Calendar,
  Eye,
  Download
} from 'lucide-react';
import { useDisputes, Dispute, DisputeEvidence } from '@/hooks/useDisputes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DisputeManagementProps {
  orderId: string;
  conversationId: string;
  customerId: string;
  storeId: string;
  escrowPaymentId?: string;
  onDisputeCreated?: (dispute: Dispute) => void;
  onClose?: () => void;
}

/**
 * Composant pour créer et gérer les litiges
 */
export const DisputeManagement: React.FC<DisputeManagementProps> = ({
  orderId,
  conversationId,
  customerId,
  storeId,
  escrowPaymentId,
  onDisputeCreated,
  onClose
}) => {
  const { createDispute, addEvidence, loading } = useDisputes();
  const { toast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [disputeType, setDisputeType] = useState<'delivery' | 'quality' | 'service' | 'payment' | 'other'>('delivery');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  const handleCreateDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const dispute = await createDispute({
      orderId,
      conversationId,
      escrowPaymentId,
      customerId,
      storeId,
      disputeType,
      subject: subject.trim(),
      description: description.trim(),
      priority
    });

    if (dispute) {
      // Uploader les preuves si des fichiers sont sélectionnés
      if (evidenceFiles.length > 0) {
        for (const file of evidenceFiles) {
          await uploadEvidenceFile(dispute.id, file);
        }
      }

      onDisputeCreated?.(dispute);
      setShowCreateForm(false);
      resetForm();
    }
  };

  const uploadEvidenceFile = async (disputeId: string, file: File) => {
    try {
      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `disputes/${disputeId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('dispute-evidence')
        .upload(filePath, file);

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('dispute-evidence')
        .getPublicUrl(filePath);

      // Ajouter la preuve au litige
      await addEvidence({
        disputeId,
        evidenceType: file.type.startsWith('image/') ? 'image' : 
                     file.type.includes('pdf') ? 'document' :
                     file.type.startsWith('video/') ? 'video' :
                     file.type.startsWith('audio/') ? 'audio' : 'other',
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        description: `Preuve uploadée: ${file.name}`
      });

    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader la preuve",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Vérifier la taille des fichiers (max 10MB chacun)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Fichiers trop volumineux",
        description: "La taille maximale autorisée est de 10MB par fichier",
        variant: "destructive"
      });
      return;
    }

    setEvidenceFiles(files);
  };

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setPriority('medium');
    setEvidenceFiles([]);
  };

  const getDisputeTypeLabel = (type: string) => {
    const labels = {
      delivery: 'Livraison',
      quality: 'Qualité',
      service: 'Service',
      payment: 'Paiement',
      other: 'Autre'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  if (!showCreateForm) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Ouvrir un litige
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Si vous rencontrez un problème avec cette commande, vous pouvez ouvrir un litige
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations importantes */}
          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Avant d'ouvrir un litige
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Essayez d'abord de résoudre le problème avec le vendeur</li>
                  <li>• Rassemblez toutes les preuves nécessaires</li>
                  <li>• Soyez précis dans votre description du problème</li>
                  <li>• Notre équipe examinera votre cas sous 48h</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Types de litiges */}
          <div className="space-y-4">
            <h4 className="font-semibold">Types de litiges possibles</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Livraison</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Problème de livraison, délais, colis endommagé
                </p>
              </div>

              <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Qualité</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Produit non conforme, défectueux, différent de la description
                </p>
              </div>

              <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Service</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Problème avec le service client, communication
                </p>
              </div>

              <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Paiement</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Problème de paiement, remboursement, escrow
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex-1 gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Ouvrir un litige
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Créer un litige
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Décrivez le problème et fournissez des preuves si nécessaire
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleCreateDispute} className="space-y-6">
          {/* Type de litige */}
          <div className="space-y-2">
            <Label htmlFor="dispute-type">Type de litige *</Label>
            <select
              id="dispute-type"
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="delivery">Livraison</option>
              <option value="quality">Qualité</option>
              <option value="service">Service</option>
              <option value="payment">Paiement</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Priorité */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priorité</Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full p-2 border rounded-md"
            >
              <option value="low">Faible</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet du litige *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Résumé du problème en quelques mots"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              {subject.length}/255 caractères
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description détaillée *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail, incluez les dates, les tentatives de résolution..."
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Soyez aussi précis que possible pour aider notre équipe à comprendre le problème
            </p>
          </div>

          {/* Upload de preuves */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Preuves (optionnel)</Label>
            <Input
              id="evidence"
              type="file"
              multiple
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt,.mp4,.mp3"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
            />
            <p className="text-xs text-muted-foreground">
              Formats acceptés: Images, PDF, Documents, Vidéos, Audio (max 10MB par fichier)
            </p>
            
            {evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Fichiers sélectionnés:</p>
                {evidenceFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Résumé */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Résumé du litige
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Type:</span>
                <Badge className={getPriorityColor(priority)}>
                  {getDisputeTypeLabel(disputeType)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Priorité:</span>
                <Badge className={getPriorityColor(priority)}>
                  {priority}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Preuves:</span>
                <span className="text-blue-700 dark:text-blue-300">
                  {evidenceFiles.length} fichier{evidenceFiles.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              type="submit"
              disabled={loading || !subject.trim() || !description.trim()}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Créer le litige
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
