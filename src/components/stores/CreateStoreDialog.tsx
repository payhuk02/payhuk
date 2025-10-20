import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Palette, 
  Mail, 
  Phone, 
  Globe,
  Check,
  X
} from 'lucide-react';
import { useMultiStores } from '@/hooks/useMultiStores';
import { useToast } from '@/hooks/use-toast';

interface CreateStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const THEME_COLORS = [
  { name: 'Bleu', value: '#3b82f6', preview: 'bg-blue-500' },
  { name: 'Vert', value: '#10b981', preview: 'bg-green-500' },
  { name: 'Violet', value: '#8b5cf6', preview: 'bg-purple-500' },
  { name: 'Rose', value: '#ec4899', preview: 'bg-pink-500' },
  { name: 'Orange', value: '#f59e0b', preview: 'bg-orange-500' },
  { name: 'Rouge', value: '#ef4444', preview: 'bg-red-500' },
  { name: 'Indigo', value: '#6366f1', preview: 'bg-indigo-500' },
  { name: 'Cyan', value: '#06b6d4', preview: 'bg-cyan-500' },
  { name: 'Émeraude', value: '#059669', preview: 'bg-emerald-500' },
  { name: 'Lime', value: '#84cc16', preview: 'bg-lime-500' },
  { name: 'Ambre', value: '#f59e0b', preview: 'bg-amber-500' },
  { name: 'Gris', value: '#6b7280', preview: 'bg-gray-500' },
];

export const CreateStoreDialog: React.FC<CreateStoreDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createStore, canCreateStore } = useMultiStores();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme_color: '#3b82f6',
    contact_email: '',
    contact_phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la boutique est requis';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Format d\'email invalide';
    }

    if (formData.contact_phone && !/^[+]?[0-9\s\-()]{8,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Format de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!canCreateStore) {
      toast({
        title: "Limite atteinte",
        description: "Vous ne pouvez créer que 3 boutiques maximum.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await createStore(formData);
      
      if (result) {
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          description: '',
          theme_color: '#3b82f6',
          contact_email: '',
          contact_phone: ''
        });
        setErrors({});
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating store:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Créer une nouvelle boutique
          </DialogTitle>
          <DialogDescription>
            Créez votre boutique en ligne et commencez à vendre vos produits. 
            Vous pouvez créer jusqu'à 3 boutiques.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informations de base
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom de la boutique *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Ma Boutique Fashion"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    L'URL de votre boutique sera : {formData.name ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.payhuk.com` : 'votre-boutique.payhuk.com'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Décrivez votre boutique et vos produits..."
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/500 caractères
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personnalisation */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Personnalisation
              </h3>
              
              <div>
                <Label>Couleur de thème</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange('theme_color', color.value)}
                      className={`w-10 h-10 rounded-lg ${color.preview} border-2 transition-all ${
                        formData.theme_color === color.value 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-200 hover:scale-105'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Cette couleur sera utilisée pour les boutons et éléments de votre boutique
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Informations de contact (optionnel)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Email de contact</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      placeholder="contact@votre-boutique.com"
                      className={`pl-10 ${errors.contact_email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.contact_email && (
                    <p className="text-sm text-red-500 mt-1">{errors.contact_email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+226 XX XX XX XX"
                      className={`pl-10 ${errors.contact_phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.contact_phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.contact_phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu */}
          {formData.name && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                  Aperçu de votre boutique
                </h3>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: formData.theme_color }}
                    >
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold">{formData.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.payhuk.com
                      </p>
                    </div>
                  </div>
                  
                  {formData.description && (
                    <p className="text-sm text-gray-600 mb-3">{formData.description}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Badge 
                      style={{ backgroundColor: formData.theme_color, color: 'white' }}
                    >
                      Boutique active
                    </Badge>
                    {formData.contact_email && (
                      <Badge variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Contact
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !canCreateStore}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Créer la boutique
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
