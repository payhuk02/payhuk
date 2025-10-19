import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Palette, 
  Mail, 
  Phone, 
  Globe,
  Settings,
  BarChart3,
  Save,
  ExternalLink,
  Eye
} from 'lucide-react';
import { useMultiStores, Store as StoreType } from '@/hooks/useMultiStores';
import { useToast } from '@/hooks/use-toast';

interface EditStoreDialogProps {
  store: StoreType;
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

export const EditStoreDialog: React.FC<EditStoreDialogProps> = ({
  store,
  open,
  onOpenChange
}) => {
  const { updateStore } = useMultiStores();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description || '',
    theme_color: store.theme_color,
    contact_email: store.contact_email || '',
    contact_phone: store.contact_phone || '',
    facebook_url: store.facebook_url || '',
    instagram_url: store.instagram_url || '',
    twitter_url: store.twitter_url || '',
    linkedin_url: store.linkedin_url || '',
    about: store.about || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mettre à jour le formulaire quand la boutique change
  useEffect(() => {
    setFormData({
      name: store.name,
      description: store.description || '',
      theme_color: store.theme_color,
      contact_email: store.contact_email || '',
      contact_phone: store.contact_phone || '',
      facebook_url: store.facebook_url || '',
      instagram_url: store.instagram_url || '',
      twitter_url: store.twitter_url || '',
      linkedin_url: store.linkedin_url || '',
      about: store.about || ''
    });
  }, [store]);

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

    if (formData.contact_phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Format de téléphone invalide';
    }

    // Validation des URLs
    const urlFields = ['facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url'];
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData];
      if (value && !/^https?:\/\/.+/.test(value)) {
        newErrors[field] = 'L\'URL doit commencer par http:// ou https://';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await updateStore(store.id, formData);
      
      if (result) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating store:', error);
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

  const openStorefront = () => {
    window.open(`/stores/${store.slug}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Modifier la boutique
          </DialogTitle>
          <DialogDescription>
            Personnalisez votre boutique et gérez ses paramètres.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="general" className="space-y-6">
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
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
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

                    <div>
                      <Label htmlFor="about">À propos</Label>
                      <Textarea
                        id="about"
                        value={formData.about}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        rows={4}
                        placeholder="Décrivez l'histoire de votre boutique, vos valeurs, etc."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.about.length}/1000 caractères
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
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
                  </div>

                  {/* Aperçu */}
                  <div className="mt-4">
                    <Label>Aperçu</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 mt-2">
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
                            {store.slug}.payhuk.com
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Informations de contact
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
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Réseaux sociaux
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="facebook_url">Facebook</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="facebook_url"
                          type="url"
                          value={formData.facebook_url}
                          onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                          placeholder="https://facebook.com/votre-page"
                          className={`pl-10 ${errors.facebook_url ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.facebook_url && (
                        <p className="text-sm text-red-500 mt-1">{errors.facebook_url}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="instagram_url">Instagram</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="instagram_url"
                          type="url"
                          value={formData.instagram_url}
                          onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                          placeholder="https://instagram.com/votre-compte"
                          className={`pl-10 ${errors.instagram_url ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.instagram_url && (
                        <p className="text-sm text-red-500 mt-1">{errors.instagram_url}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="twitter_url">Twitter</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="twitter_url"
                          type="url"
                          value={formData.twitter_url}
                          onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                          placeholder="https://twitter.com/votre-compte"
                          className={`pl-10 ${errors.twitter_url ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.twitter_url && (
                        <p className="text-sm text-red-500 mt-1">{errors.twitter_url}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="linkedin_url">LinkedIn</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="linkedin_url"
                          type="url"
                          value={formData.linkedin_url}
                          onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                          placeholder="https://linkedin.com/company/votre-entreprise"
                          className={`pl-10 ${errors.linkedin_url ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.linkedin_url && (
                        <p className="text-sm text-red-500 mt-1">{errors.linkedin_url}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={openStorefront}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Voir la boutique
              </Button>

              <div className="flex gap-3">
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
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
