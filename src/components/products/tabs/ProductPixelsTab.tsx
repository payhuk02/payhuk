import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin,
  Zap,
  Settings,
  Eye,
  MousePointer,
  ShoppingCart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
  Play,
  ExternalLink,
  Activity,
  Shield,
  Bug,
  Globe,
  BarChart3,
  Clock,
  Users,
  DollarSign,
  Search,
  Filter,
  Download,
  RefreshCw,
  TestTube,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  WifiOff
} from "lucide-react";
import { useProductPixels } from "@/hooks/useProductPixels";
import { useToast } from "@/hooks/use-toast";

interface ProductPixelsTabProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const ProductPixelsTab = ({ formData, updateFormData }: ProductPixelsTabProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Hooks - Only initialize if we have a product ID
  const { 
    config, 
    events, 
    loading, 
    testing, 
    updateConfig, 
    trackEvent, 
    testEvent, 
    validatePixelId, 
    getPixelStatus 
  } = useProductPixels(formData.id || 'temp');

  const pixelPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'blue',
      description: 'Suivi des conversions Facebook et Instagram',
      events: ['ViewContent', 'AddToCart', 'Purchase', 'Lead'],
      helperUrl: 'https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc'
    },
    {
      id: 'google',
      name: 'Google Analytics',
      icon: TrendingUp,
      color: 'green',
      description: 'Analyse du comportement et des conversions',
      events: ['page_view', 'add_to_cart', 'purchase', 'conversion'],
      helperUrl: 'https://chrome.google.com/webstore/detail/google-tag-assistant-legacy/kejbdjndbnbjgmefkgdddjlbokphdefk'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: Target,
      color: 'red',
      description: 'Optimisation des campagnes TikTok Ads',
      events: ['ViewContent', 'AddToCart', 'CompletePayment'],
      helperUrl: 'https://chrome.google.com/webstore/detail/tiktok-pixel-helper/ckjcdibdmbjmljbljbljbljbljbljbl'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: Target,
      color: 'pink',
      description: 'Suivi des conversions Pinterest',
      events: ['PageVisit', 'AddToCart', 'Checkout', 'Purchase'],
      helperUrl: 'https://chrome.google.com/webstore/detail/pinterest-tag-helper/ckjcdibdmbjmljbljbljbljbljbljbl'
    }
  ];

  // Show demo mode for new products without ID
  if (!formData.id || formData.id === 'temp') {
    return (
      <div className="saas-space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold saas-text-primary">Pixels de Tracking</h2>
            <p className="saas-text-secondary">Configurez et gérez vos pixels de conversion</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Mode démo
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="testing">Tests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="saas-space-y-6">
            {/* Statut des pixels */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-3 text-blue-800">
                  <Target className="h-6 w-6" />
                  Statut des pixels de tracking
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Surveillez l'état de vos pixels de conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {pixelPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div key={platform.id} className="text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 shadow-lg">
                          <Icon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{platform.name}</div>
                        <div className="text-xs text-gray-500 mb-2">Inactif</div>
                        <AlertCircle className="h-4 w-4 text-gray-400 mx-auto" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Message d'information */}
            <Alert className="border-orange-200 bg-orange-50">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Les pixels seront disponibles une fois le produit sauvegardé et publié. 
                Vous pouvez configurer les pixels ci-dessous.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="configuration" className="saas-space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pixelPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <Card key={platform.id} className={`border-2 border-${platform.color}-200 bg-gradient-to-br from-${platform.color}-50 to-${platform.color}-100`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
                        <Icon className={`h-5 w-5 text-${platform.color}-600`} />
                        {platform.name} Pixel
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {platform.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${platform.id}_pixel_id`} className="text-sm font-semibold text-gray-700">
                          {platform.name} Pixel ID
                        </Label>
                        <Input
                          id={`${platform.id}_pixel_id`}
                          value={formData[`${platform.id}_pixel_id`] || ""}
                          onChange={(e) => updateFormData(`${platform.id}_pixel_id`, e.target.value)}
                          placeholder={platform.id === 'google' ? 'GA-XXXXXXXXX' : 
                                     platform.id === 'tiktok' ? 'CXXXXXXXXXXXXXXX' : 
                                     '123456789012345'}
                          className="saas-input"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-semibold text-gray-700">Activer le pixel</Label>
                          <p className="text-xs text-gray-500">Tracking automatique</p>
                        </div>
                        <Switch
                          checked={formData[`${platform.id}_pixel_enabled`] || false}
                          onCheckedChange={(checked) => updateFormData(`${platform.id}_pixel_enabled`, checked)}
                          className="saas-switch"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Événements à tracker</Label>
                        <div className="space-y-2">
                          {platform.events.map((event) => (
                            <div key={event} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{event}</span>
                              <Switch
                                checked={formData[`${platform.id}_${event.toLowerCase()}`] || false}
                                onCheckedChange={(checked) => updateFormData(`${platform.id}_${event.toLowerCase()}`, checked)}
                                className="saas-switch"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Configuration avancée */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-3 text-purple-800">
                  <Settings className="h-5 w-5" />
                  Configuration avancée
                </CardTitle>
                <CardDescription className="text-purple-600">
                  Personnalisation avancée du tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-700">Tracking cross-domain</Label>
                      <p className="text-xs text-gray-500">Suivi entre différents domaines</p>
                    </div>
                    <Switch
                      checked={formData.cross_domain_tracking || false}
                      onCheckedChange={(checked) => updateFormData("cross_domain_tracking", checked)}
                      className="saas-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-700">Respect de la vie privée</Label>
                      <p className="text-xs text-gray-500">Conformité RGPD/GDPR</p>
                    </div>
                    <Switch
                      checked={formData.privacy_compliant || false}
                      onCheckedChange={(checked) => updateFormData("privacy_compliant", checked)}
                      className="saas-switch"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold text-gray-700">Mode debug</Label>
                      <p className="text-xs text-gray-500">Logs détaillés pour le développement</p>
                    </div>
                    <Switch
                      checked={formData.debug_mode || false}
                      onCheckedChange={(checked) => updateFormData("debug_mode", checked)}
                      className="saas-switch"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom_events" className="text-sm font-semibold text-gray-700">
                    Événements personnalisés
                  </Label>
                  <Input
                    id="custom_events"
                    value={formData.custom_events || ""}
                    onChange={(e) => updateFormData("custom_events", e.target.value)}
                    placeholder="event1,event2,event3"
                    className="saas-input"
                  />
                  <div className="text-xs text-gray-500">
                    Séparez les événements personnalisés par des virgules
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests */}
          <TabsContent value="testing" className="saas-space-y-6">
            <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
                  <TestTube className="h-5 w-5" />
                  Test des pixels
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Testez vos pixels pour vérifier qu'ils fonctionnent correctement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Événements de test</Label>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <Eye className="h-4 w-4 mr-2" />
                        Test ViewContent
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Test AddToCart
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <Target className="h-4 w-4 mr-2" />
                        Test Purchase
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Outils de vérification</Label>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Facebook Pixel Helper
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Google Tag Assistant
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        TikTok Pixel Helper
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert className="mt-4 border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Les tests seront disponibles une fois le produit publié et les pixels configurés.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="saas-space-y-6">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-3 text-green-800">
                  <BarChart3 className="h-5 w-5" />
                  Analytics des pixels
                </CardTitle>
                <CardDescription className="text-green-600">
                  Suivez les performances de vos pixels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Les analytics des pixels seront disponibles une fois le produit publié et que des événements auront été trackés.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="saas-space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold saas-text-primary">Pixels de Tracking</h2>
          <p className="saas-text-secondary">Configurez et gérez vos pixels de conversion</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {events.length} événements
          </Badge>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Tests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="saas-space-y-6">
          {/* Statut des pixels */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-3 text-blue-800">
                <Target className="h-6 w-6" />
                Statut des pixels de tracking
              </CardTitle>
              <CardDescription className="text-blue-600">
                Surveillez l'état de vos pixels de conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {pixelPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const status = getPixelStatus(platform.id);
                  
                  return (
                    <div key={platform.id} className="text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg ${
                        status.enabled ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-8 w-8 ${status.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-sm font-semibold text-gray-700">{platform.name}</div>
                      <div className={`text-xs mb-2 ${status.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                        {status.enabled ? 'Actif' : 'Inactif'}
                      </div>
                      {status.enabled ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400 mx-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Métriques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Événements totaux</p>
                    <p className="text-2xl font-bold text-green-600">{events.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Pixels actifs</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {pixelPlatforms.filter(p => getPixelStatus(p.id).enabled).length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Événements aujourd'hui</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {events.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800">Taux de succès</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {events.length > 0 ? Math.round((events.filter(e => e.success).length / events.length) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="configuration" className="saas-space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pixelPlatforms.map((platform) => {
              const Icon = platform.icon;
              const status = getPixelStatus(platform.id);
              
              return (
                <Card key={platform.id} className={`border-2 ${
                  status.enabled ? `border-${platform.color}-300` : 'border-gray-200'
                } bg-gradient-to-br ${
                  status.enabled ? `from-${platform.color}-50 to-${platform.color}-100` : 'from-gray-50 to-slate-50'
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
                      <Icon className={`h-5 w-5 ${status.enabled ? `text-${platform.color}-600` : 'text-gray-400'}`} />
                      {platform.name} Pixel
                      {status.enabled && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {platform.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`${platform.id}_pixel_id`} className="text-sm font-semibold text-gray-700">
                        {platform.name} Pixel ID
                      </Label>
                      <Input
                        id={`${platform.id}_pixel_id`}
                        value={config?.[`${platform.id}_pixel_id`] || ""}
                        onChange={(e) => updateConfig({ [`${platform.id}_pixel_id`]: e.target.value })}
                        placeholder={platform.id === 'google' ? 'GA-XXXXXXXXX' : 
                                   platform.id === 'tiktok' ? 'CXXXXXXXXXXXXXXX' : 
                                   '123456789012345'}
                        className="saas-input"
                      />
                      {config?.[`${platform.id}_pixel_id`] && !validatePixelId(platform.id, config[`${platform.id}_pixel_id`]) && (
                        <p className="text-xs text-red-500">Format d'ID invalide</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-semibold text-gray-700">Activer le pixel</Label>
                        <p className="text-xs text-gray-500">Tracking automatique</p>
                      </div>
                      <Switch
                        checked={config?.[`${platform.id}_pixel_enabled`] || false}
                        onCheckedChange={(checked) => updateConfig({ [`${platform.id}_pixel_enabled`]: checked })}
                        className="saas-switch"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Événements à tracker</Label>
                      <div className="space-y-2">
                        {platform.events.map((event) => (
                          <div key={event} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{event}</span>
                            <Switch
                              checked={config?.[`${platform.id}_${event.toLowerCase()}`] || false}
                              onCheckedChange={(checked) => updateConfig({ [`${platform.id}_${event.toLowerCase()}`]: checked })}
                              className="saas-switch"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Configuration avancée */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-purple-800">
                <Settings className="h-5 w-5" />
                Configuration avancée
              </CardTitle>
              <CardDescription className="text-purple-600">
                Personnalisation avancée du tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-gray-700">Tracking cross-domain</Label>
                    <p className="text-xs text-gray-500">Suivi entre différents domaines</p>
                  </div>
                  <Switch
                    checked={config?.cross_domain_tracking || false}
                    onCheckedChange={(checked) => updateConfig({ cross_domain_tracking: checked })}
                    className="saas-switch"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-gray-700">Respect de la vie privée</Label>
                    <p className="text-xs text-gray-500">Conformité RGPD/GDPR</p>
                  </div>
                  <Switch
                    checked={config?.privacy_compliant || false}
                    onCheckedChange={(checked) => updateConfig({ privacy_compliant: checked })}
                    className="saas-switch"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-gray-700">Mode debug</Label>
                    <p className="text-xs text-gray-500">Logs détaillés pour le développement</p>
                  </div>
                  <Switch
                    checked={config?.debug_mode || false}
                    onCheckedChange={(checked) => updateConfig({ debug_mode: checked })}
                    className="saas-switch"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_events" className="text-sm font-semibold text-gray-700">
                  Événements personnalisés
                </Label>
                <Input
                  id="custom_events"
                  value={config?.custom_events?.join(',') || ""}
                  onChange={(e) => updateConfig({ custom_events: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="event1,event2,event3"
                  className="saas-input"
                />
                <div className="text-xs text-gray-500">
                  Séparez les événements personnalisés par des virgules
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests */}
        <TabsContent value="testing" className="saas-space-y-6">
          <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-gray-800">
                <TestTube className="h-5 w-5" />
                Test des pixels
              </CardTitle>
              <CardDescription className="text-gray-600">
                Testez vos pixels pour vérifier qu'ils fonctionnent correctement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Événements de test</Label>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => testEvent('facebook', 'ViewContent')}
                      disabled={testing || !getPixelStatus('facebook').enabled}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Test ViewContent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => testEvent('facebook', 'AddToCart')}
                      disabled={testing || !getPixelStatus('facebook').enabled}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Test AddToCart
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => testEvent('facebook', 'Purchase')}
                      disabled={testing || !getPixelStatus('facebook').enabled}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Test Purchase
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">Outils de vérification</Label>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Facebook Pixel Helper
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://chrome.google.com/webstore/detail/google-tag-assistant-legacy/kejbdjndbnbjgmefkgdddjlbokphdefk', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google Tag Assistant
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open('https://chrome.google.com/webstore/detail/tiktok-pixel-helper/ckjcdibdmbjmljbljbljbljbljbljbl', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      TikTok Pixel Helper
                    </Button>
                  </div>
                </div>
              </div>

              {testing && (
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-800">
                    Test en cours...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="saas-space-y-6">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-3 text-green-800">
                <BarChart3 className="h-5 w-5" />
                Analytics des pixels
              </CardTitle>
              <CardDescription className="text-green-600">
                Suivez les performances de vos pixels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{events.length}</p>
                      <p className="text-sm text-gray-600">Événements totaux</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {new Set(events.map(e => e.pixel_type)).size}
                      </p>
                      <p className="text-sm text-gray-600">Pixels utilisés</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round((events.filter(e => e.success).length / events.length) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">Taux de succès</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Événements récents</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {events.slice(0, 10).map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${event.success ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {event.pixel_type} - {event.event_type}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(event.timestamp).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={event.success ? "default" : "destructive"}>
                            {event.success ? 'Succès' : 'Échec'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <Info className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Aucun événement tracké pour le moment. Les événements apparaîtront ici une fois que les pixels commenceront à collecter des données.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
