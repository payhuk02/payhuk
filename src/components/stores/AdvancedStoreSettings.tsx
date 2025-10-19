import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  Settings, 
  Palette, 
  Mail, 
  Phone, 
  Globe,
  Shield,
  Bell,
  CreditCard,
  BarChart3,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { useMultiStores, Store as StoreType } from '@/hooks/useMultiStores';
import { useToast } from '@/hooks/use-toast';

/**
 * Composant de paramètres avancés pour les boutiques
 */
export const AdvancedStoreSettings: React.FC = () => {
  const { stores, loading, updateStore, toggleStoreStatus } = useMultiStores();
  const { toast } = useToast();
  
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<StoreType>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser avec la première boutique si disponible
  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
      setFormData(stores[0]);
    }
  }, [stores, selectedStore]);

  // Mettre à jour le formulaire quand la boutique change
  useEffect(() => {
    if (selectedStore) {
      setFormData(selectedStore);
      setErrors({});
    }
  }, [selectedStore]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Le nom de la boutique est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Format d\'email invalide';
    }

    if (formData.contact_phone && !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Format de téléphone invalide (minimum 8 chiffres)';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La description ne peut pas dépasser 500 caractères';
    }

    if (formData.about && formData.about.length > 1000) {
      newErrors.about = 'La section "À propos" ne peut pas dépasser 1000 caractères';
    }

    // Validation des URLs
    const urlFields = ['logo_url', 'banner_url', 'facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url'];
    urlFields.forEach(field => {
      const value = formData[field as keyof typeof formData] as string;
      if (value && !/^https?:\/\/.+/.test(value)) {
        newErrors[field] = 'L\'URL doit commencer par http:// ou https://';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!selectedStore || !validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs avant de sauvegarder.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const success = await updateStore(selectedStore.id, formData);
      if (success) {
        setIsEditing(false);
        setSelectedStore({ ...selectedStore, ...formData });
        toast({
          title: "Paramètres sauvegardés",
          description: "Les modifications ont été appliquées avec succès."
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (selectedStore) {
      setFormData(selectedStore);
      setErrors({});
      setIsEditing(false);
    }
  };

  const handleToggleStatus = async (store: StoreType) => {
    const success = await toggleStoreStatus(store.id);
    if (success) {
      // Mettre à jour la boutique sélectionnée si c'est celle qui a été modifiée
      if (selectedStore?.id === store.id) {
        setSelectedStore({ ...store, is_active: !store.is_active });
        setFormData(prev => ({ ...prev, is_active: !store.is_active }));
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Paramètres des boutiques</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Aucune boutique</h3>
        <p className="text-muted-foreground">
          Créez votre première boutique pour accéder aux paramètres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres des boutiques</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres avancés de toutes vos boutiques
          </p>
        </div>
        
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
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
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des boutiques */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Vos boutiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStore?.id === store.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: store.theme_color }}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{store.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {store.slug}.payhuk.com
                      </p>
                    </div>
                    <Badge variant={store.is_active ? "default" : "secondary"}>
                      {store.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Paramètres de la boutique sélectionnée */}
        <div className="lg:col-span-2">
          {selectedStore ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedStore.theme_color }}
                    >
                      {selectedStore.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle>{selectedStore.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedStore.slug}.payhuk.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedStore.is_active ? "default" : "secondary"}>
                      {selectedStore.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(selectedStore)}
                      className="gap-2"
                    >
                      {selectedStore.is_active ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          Activer
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? 'Annuler' : 'Modifier'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="appearance">Apparence</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="advanced">Avancé</TabsTrigger>
                  </TabsList>

                  {/* Onglet Général */}
                  <TabsContent value="general" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nom de la boutique *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="slug">URL de la boutique</Label>
                        <Input
                          id="slug"
                          value={formData.slug ? `${formData.slug}.payhuk.com` : ''}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          L'URL ne peut pas être modifiée
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Décrivez votre boutique..."
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.description?.length || 0}/500 caractères
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="about">À propos</Label>
                      <Textarea
                        id="about"
                        value={formData.about || ''}
                        onChange={(e) => handleInputChange('about', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Parlez de l'histoire de votre boutique..."
                        className={errors.about ? 'border-red-500' : ''}
                      />
                      {errors.about && (
                        <p className="text-sm text-red-500 mt-1">{errors.about}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.about?.length || 0}/1000 caractères
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="default_currency">Devise par défaut</Label>
                        <Select
                          value={formData.default_currency || 'XOF'}
                          onValueChange={(value) => handleInputChange('default_currency', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="XOF">XOF (Franc CFA)</SelectItem>
                            <SelectItem value="USD">USD (Dollar US)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (Livre Sterling)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={formData.is_active || false}
                          onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="is_active">Boutique active</Label>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Onglet Apparence */}
                  <TabsContent value="appearance" className="space-y-6 mt-6">
                    <div>
                      <Label>Couleur de thème</Label>
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {[
                          { name: 'Bleu', value: '#3b82f6' },
                          { name: 'Vert', value: '#10b981' },
                          { name: 'Violet', value: '#8b5cf6' },
                          { name: 'Rose', value: '#ec4899' },
                          { name: 'Orange', value: '#f59e0b' },
                          { name: 'Rouge', value: '#ef4444' },
                          { name: 'Indigo', value: '#6366f1' },
                          { name: 'Cyan', value: '#06b6d4' },
                          { name: 'Émeraude', value: '#059669' },
                          { name: 'Lime', value: '#84cc16' },
                          { name: 'Ambre', value: '#f59e0b' },
                          { name: 'Gris', value: '#6b7280' }
                        ].map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleInputChange('theme_color', color.value)}
                            disabled={!isEditing}
                            className={`w-10 h-10 rounded-lg border-2 transition-all ${
                              formData.theme_color === color.value 
                                ? 'border-gray-900 scale-110' 
                                : 'border-gray-200 hover:scale-105'
                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="logo_url">URL du logo</Label>
                        <Input
                          id="logo_url"
                          value={formData.logo_url || ''}
                          onChange={(e) => handleInputChange('logo_url', e.target.value)}
                          disabled={!isEditing}
                          placeholder="https://exemple.com/logo.png"
                          className={errors.logo_url ? 'border-red-500' : ''}
                        />
                        {errors.logo_url && (
                          <p className="text-sm text-red-500 mt-1">{errors.logo_url}</p>
                        )}
                        {formData.logo_url && !errors.logo_url && (
                          <div className="mt-2">
                            <img 
                              src={formData.logo_url} 
                              alt="Aperçu du logo" 
                              className="w-16 h-16 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="banner_url">URL de la bannière</Label>
                        <Input
                          id="banner_url"
                          value={formData.banner_url || ''}
                          onChange={(e) => handleInputChange('banner_url', e.target.value)}
                          disabled={!isEditing}
                          placeholder="https://exemple.com/banner.jpg"
                          className={errors.banner_url ? 'border-red-500' : ''}
                        />
                        {errors.banner_url && (
                          <p className="text-sm text-red-500 mt-1">{errors.banner_url}</p>
                        )}
                        {formData.banner_url && !errors.banner_url && (
                          <div className="mt-2">
                            <img 
                              src={formData.banner_url} 
                              alt="Aperçu de la bannière" 
                              className="w-full h-20 object-cover rounded border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Onglet Contact */}
                  <TabsContent value="contact" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_email">Email de contact</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email || ''}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          disabled={!isEditing}
                          className={errors.contact_email ? 'border-red-500' : ''}
                          placeholder="contact@votre-boutique.com"
                        />
                        {errors.contact_email && (
                          <p className="text-sm text-red-500 mt-1">{errors.contact_email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="contact_phone">Téléphone</Label>
                        <Input
                          id="contact_phone"
                          type="tel"
                          value={formData.contact_phone || ''}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          disabled={!isEditing}
                          className={errors.contact_phone ? 'border-red-500' : ''}
                          placeholder="+226 XX XX XX XX"
                        />
                        {errors.contact_phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.contact_phone}</p>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-4">Réseaux sociaux</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="facebook_url">Facebook</Label>
                          <Input
                            id="facebook_url"
                            value={formData.facebook_url || ''}
                            onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://facebook.com/votre-page"
                            className={errors.facebook_url ? 'border-red-500' : ''}
                          />
                          {errors.facebook_url && (
                            <p className="text-sm text-red-500 mt-1">{errors.facebook_url}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="instagram_url">Instagram</Label>
                          <Input
                            id="instagram_url"
                            value={formData.instagram_url || ''}
                            onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://instagram.com/votre-compte"
                            className={errors.instagram_url ? 'border-red-500' : ''}
                          />
                          {errors.instagram_url && (
                            <p className="text-sm text-red-500 mt-1">{errors.instagram_url}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="twitter_url">Twitter</Label>
                          <Input
                            id="twitter_url"
                            value={formData.twitter_url || ''}
                            onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://twitter.com/votre-compte"
                            className={errors.twitter_url ? 'border-red-500' : ''}
                          />
                          {errors.twitter_url && (
                            <p className="text-sm text-red-500 mt-1">{errors.twitter_url}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="linkedin_url">LinkedIn</Label>
                          <Input
                            id="linkedin_url"
                            value={formData.linkedin_url || ''}
                            onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://linkedin.com/company/votre-entreprise"
                            className={errors.linkedin_url ? 'border-red-500' : ''}
                          />
                          {errors.linkedin_url && (
                            <p className="text-sm text-red-500 mt-1">{errors.linkedin_url}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Onglet Avancé */}
                  <TabsContent value="advanced" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Domaine personnalisé</h4>
                          <p className="text-sm text-muted-foreground">
                            Utilisez votre propre domaine pour votre boutique
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          <Globe className="h-4 w-4 mr-2" />
                          Configurer
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Analytics avancées</h4>
                          <p className="text-sm text-muted-foreground">
                            Intégrez Google Analytics et autres outils
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Configurer
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Notifications</h4>
                          <p className="text-sm text-muted-foreground">
                            Configurez les notifications par email et SMS
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          <Bell className="h-4 w-4 mr-2" />
                          Configurer
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">Sécurité</h4>
                          <p className="text-sm text-muted-foreground">
                            Paramètres de sécurité et authentification
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          <Shield className="h-4 w-4 mr-2" />
                          Configurer
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-red-600">Zone dangereuse</h4>
                      
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div>
                          <h4 className="font-semibold text-red-800">Supprimer la boutique</h4>
                          <p className="text-sm text-red-600">
                            Cette action est irréversible. Toutes les données seront perdues.
                          </p>
                        </div>
                        <Button variant="destructive" disabled>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une boutique</h3>
                <p className="text-muted-foreground">
                  Choisissez une boutique dans la liste pour voir ses paramètres.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
