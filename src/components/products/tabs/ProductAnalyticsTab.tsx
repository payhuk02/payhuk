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
  BarChart3, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target,
  Zap,
  Settings,
  Activity,
  PieChart,
  Calendar,
  Download,
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Smartphone,
  Monitor,
  Tablet
} from "lucide-react";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { useProductTrackingConfig } from "@/hooks/useProductTrackingConfig";
import { useProductGoalsAlerts } from "@/hooks/useProductGoalsAlerts";
import { useProductReports } from "@/hooks/useProductReports";
import { useExternalAnalytics } from "@/hooks/useExternalAnalytics";
import { useToast } from "@/hooks/use-toast";

interface ProductAnalyticsTabProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const ProductAnalyticsTab = ({ formData, updateFormData }: ProductAnalyticsTabProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Hooks - Only initialize if we have a product ID
  const { 
    analyticsData, 
    goals, 
    loading: analyticsLoading, 
    realTimeEvents, 
    trackEvent, 
    saveGoals 
  } = useProductAnalytics(formData.id || 'temp');
  
  const { 
    config: trackingConfig, 
    loading: configLoading, 
    updateConfig, 
    saveExternalAnalytics, 
    addCustomEvent, 
    removeCustomEvent, 
    toggleTracking 
  } = useProductTrackingConfig(formData.id || 'temp');
  
  const { 
    goals: goalsData, 
    alerts, 
    loading: goalsLoading, 
    saveGoals: saveGoalsData, 
    markAlertAsRead, 
    markAllAlertsAsRead, 
    deleteAlert, 
    unreadAlertsCount 
  } = useProductGoalsAlerts(formData.id || 'temp');
  
  const { 
    generating, 
    generateAndDownloadDailyReport, 
    generateAndDownloadMonthlyReport, 
    exportAndDownloadCSV 
  } = useProductReports(formData.id || 'temp');

  // External analytics
  const externalConfig = {
    googleAnalyticsId: trackingConfig?.google_analytics_id,
    facebookPixelId: trackingConfig?.facebook_pixel_id,
    googleTagManagerId: trackingConfig?.google_tag_manager_id,
    tiktokPixelId: trackingConfig?.tiktok_pixel_id,
    pinterestPixelId: trackingConfig?.pinterest_pixel_id
  };
  
  const { trackEvent: trackExternalEvent } = useExternalAnalytics(externalConfig);

  // Track page view on mount
  useEffect(() => {
    if (formData.id && formData.id !== 'temp' && trackingConfig?.analytics_enabled) {
      trackEvent('view', {
        page: 'product_analytics',
        product_name: formData.name,
        timestamp: new Date().toISOString()
      });
      
      trackExternalEvent('page_view', {
        page_title: `Analytics - ${formData.name}`,
        page_location: window.location.href
      });
    }
  }, [formData.id, trackingConfig?.analytics_enabled]);

  // Calculate goal progress
  const getGoalProgress = (metric: string) => {
    if (!goalsData) return { current: 0, target: 0, percentage: 0 };
    
    const target = goalsData[`goal_${metric}` as keyof typeof goalsData] as number;
    if (!target) return { current: 0, target: 0, percentage: 0 };
    
    const current = analyticsData[metric as keyof typeof analyticsData] as number;
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    
    return { current, target, percentage };
  };

  const viewsProgress = getGoalProgress('views');
  const revenueProgress = getGoalProgress('revenue');
  const conversionsProgress = getGoalProgress('conversions');
  const conversionRateProgress = getGoalProgress('conversion_rate');

  // Show demo mode for new products without ID
  if (!formData.id || formData.id === 'temp') {
    return (
      <div className="saas-space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold saas-text-primary">Analytics & Tracking</h2>
            <p className="saas-text-secondary">Surveillez les performances de votre produit</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Mode démo
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="tracking">Configuration</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
            <TabsTrigger value="realtime">Temps réel</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="saas-space-y-6">
            {/* Métriques principales */}
            <div className="saas-grid saas-grid-cols-4">
              <div className="saas-stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="saas-stats-label">Vues</p>
                    <p className="saas-stats-value">0</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="saas-stats-change text-gray-400">Aucune donnée</span>
                </div>
              </div>

              <div className="saas-stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="saas-stats-label">Clics</p>
                    <p className="saas-stats-value">0</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="saas-stats-change text-gray-400">Aucune donnée</span>
                </div>
              </div>

              <div className="saas-stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="saas-stats-label">Conversions</p>
                    <p className="saas-stats-value">0</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="saas-stats-change text-gray-400">Aucune donnée</span>
                </div>
              </div>

              <div className="saas-stats-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="saas-stats-label">Taux de conversion</p>
                    <p className="saas-stats-value">0%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="saas-stats-change text-gray-400">Aucune donnée</span>
                </div>
              </div>
            </div>

            {/* Message d'information */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Les analytics seront disponibles une fois le produit sauvegardé et publié. 
                Vous pouvez configurer le tracking ci-dessous.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Configuration du tracking */}
          <TabsContent value="tracking" className="saas-space-y-6">
            <div className="saas-section-card">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-5 w-5 text-gray-600" />
                <h3 className="saas-section-title">Configuration du tracking</h3>
              </div>
              <p className="saas-section-description">
                Surveillez les interactions des utilisateurs avec votre produit.
              </p>
              
              <div className="saas-grid saas-grid-cols-2">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <label className="saas-label">Tracking des événements</label>
                    <span className="saas-label-description">Enregistrer les événements personnalisés</span>
                  </div>
                  <Switch
                    checked={formData.analytics_enabled || false}
                    onCheckedChange={(checked) => updateFormData("analytics_enabled", checked)}
                    className="saas-switch"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <label className="saas-label">Tracking des vues</label>
                    <span className="saas-label-description">Enregistrer chaque vue de produit</span>
                  </div>
                  <Switch
                    checked={formData.track_views || true}
                    onCheckedChange={(checked) => updateFormData("track_views", checked)}
                    className="saas-switch"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <label className="saas-label">Tracking des clics</label>
                    <span className="saas-label-description">Enregistrer les clics sur les boutons et liens</span>
                  </div>
                  <Switch
                    checked={formData.track_clicks || true}
                    onCheckedChange={(checked) => updateFormData("track_clicks", checked)}
                    className="saas-switch"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <label className="saas-label">Tracking des achats</label>
                    <span className="saas-label-description">Enregistrer les conversions et revenus</span>
                  </div>
                  <Switch
                    checked={formData.track_purchases || true}
                    onCheckedChange={(checked) => updateFormData("track_purchases", checked)}
                    className="saas-switch"
                  />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <label className="saas-label">Tracking du temps passé</label>
                    <span className="saas-label-description">Mesurer l'engagement des utilisateurs</span>
                  </div>
                  <Switch
                    checked={formData.track_time_spent || false}
                    onCheckedChange={(checked) => updateFormData("track_time_spent", checked)}
                    className="saas-switch"
                  />
                </div>
              </div>
            </div>

            {/* Analytics externes */}
            <div className="saas-section-card">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <h3 className="saas-section-title">Analytics externes</h3>
              </div>
              <p className="saas-section-description">
                Intégrez votre produit avec des outils d'analyse tiers.
              </p>
              
              <div className="saas-grid saas-grid-cols-2">
                <div>
                  <label className="saas-label">Google Analytics ID</label>
                  <Input
                    value={formData.google_analytics_id || ''}
                    onChange={(e) => updateFormData("google_analytics_id", e.target.value)}
                    placeholder="UA-XXXXXXXXX-X ou G-XXXXXXXXXX"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">Facebook Pixel ID</label>
                  <Input
                    value={formData.facebook_pixel_id || ''}
                    onChange={(e) => updateFormData("facebook_pixel_id", e.target.value)}
                    placeholder="123456789012345"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">Google Tag Manager ID</label>
                  <Input
                    value={formData.google_tag_manager_id || ''}
                    onChange={(e) => updateFormData("google_tag_manager_id", e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">TikTok Pixel ID</label>
                  <Input
                    value={formData.tiktok_pixel_id || ''}
                    onChange={(e) => updateFormData("tiktok_pixel_id", e.target.value)}
                    placeholder="CXXXXXXXXXXXXXXX"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">Pinterest Pixel ID</label>
                  <Input
                    value={formData.pinterest_pixel_id || ''}
                    onChange={(e) => updateFormData("pinterest_pixel_id", e.target.value)}
                    placeholder="123456789012345"
                    className="saas-input"
                  />
                </div>
              </div>
              
              <div className="saas-separator" />
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Tracking avancé</label>
                  <span className="saas-label-description">Événements personnalisés et configurations spécifiques</span>
                </div>
                <Switch
                  checked={formData.advanced_tracking || false}
                  onCheckedChange={(checked) => updateFormData("advanced_tracking", checked)}
                  className="saas-switch"
                />
              </div>
              
              {formData.advanced_tracking && (
                <div>
                  <label className="saas-label">Événements personnalisés</label>
                  <Input
                    value={formData.custom_events?.join(',') || ''}
                    onChange={(e) => updateFormData("custom_events", e.target.value.split(',').map(s => s.trim()))}
                    placeholder="event1,event2,event3"
                    className="saas-input"
                  />
                  <p className="saas-label-description">Séparez les événements personnalisés par des virgules.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Objectifs */}
          <TabsContent value="goals" className="saas-space-y-6">
            <div className="saas-section-card">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-gray-600" />
                <h3 className="saas-section-title">Objectifs et alertes</h3>
              </div>
              <p className="saas-section-description">
                Définissez des objectifs de performance pour ce produit et recevez des alertes.
              </p>
              
              <div className="saas-grid saas-grid-cols-4">
                <div>
                  <label className="saas-label">Objectif vues (mensuel)</label>
                  <Input
                    type="number"
                    value={formData.goal_views || ''}
                    onChange={(e) => updateFormData("goal_views", parseInt(e.target.value) || null)}
                    placeholder="1000"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">Objectif revenus (mensuel)</label>
                  <Input
                    type="number"
                    value={formData.goal_revenue || ''}
                    onChange={(e) => updateFormData("goal_revenue", parseFloat(e.target.value) || null)}
                    placeholder="5000"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">Objectif conversions (mensuel)</label>
                  <Input
                    type="number"
                    value={formData.goal_conversions || ''}
                    onChange={(e) => updateFormData("goal_conversions", parseInt(e.target.value) || null)}
                    placeholder="50"
                    className="saas-input"
                  />
                </div>
                <div>
                  <label className="saas-label">Objectif taux de conversion (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.goal_conversion_rate || ''}
                    onChange={(e) => updateFormData("goal_conversion_rate", parseFloat(e.target.value) || null)}
                    placeholder="5.0"
                    className="saas-input"
                  />
                </div>
              </div>
              
              <div className="saas-separator" />
              
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Alertes par email</label>
                  <span className="saas-label-description">Recevez des notifications automatiques en cas de dépassement ou de non-atteinte des objectifs.</span>
                </div>
                <Switch
                  checked={formData.email_alerts || false}
                  onCheckedChange={(checked) => updateFormData("email_alerts", checked)}
                  className="saas-switch"
                />
              </div>
            </div>
          </TabsContent>

          {/* Rapports */}
          <TabsContent value="reports" className="saas-space-y-6">
            <div className="saas-section-card">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-gray-600" />
                <h3 className="saas-section-title">Rapports et export</h3>
              </div>
              <p className="saas-section-description">
                Générez des rapports détaillés et exportez vos données d'analytics.
              </p>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les rapports seront disponibles une fois le produit publié et que des données d'analytics auront été collectées.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          {/* Temps réel */}
          <TabsContent value="realtime" className="saas-space-y-6">
            <div className="saas-section-card">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-gray-600" />
                <h3 className="saas-section-title">Données en temps réel</h3>
              </div>
              <p className="saas-section-description">
                Activité actuelle sur ce produit.
              </p>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les données en temps réel seront disponibles une fois le produit publié et que des utilisateurs commenceront à interagir avec celui-ci.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (analyticsLoading || configLoading || goalsLoading) {
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
          <h2 className="text-2xl font-bold saas-text-primary">Analytics & Tracking</h2>
          <p className="saas-text-secondary">Surveillez les performances de votre produit</p>
        </div>
        {unreadAlertsCount > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {unreadAlertsCount} alerte{unreadAlertsCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="tracking">Configuration</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="realtime">Temps réel</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="saas-space-y-6">
          {/* Métriques principales */}
          <div className="saas-grid saas-grid-cols-4">
            <div className="saas-stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="saas-stats-label">Vues</p>
                  <p className="saas-stats-value">{analyticsData.views}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="saas-stats-change">+12%</span>
              </div>
            </div>

            <div className="saas-stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="saas-stats-label">Clics</p>
                  <p className="saas-stats-value">{analyticsData.clicks}</p>
                </div>
                <MousePointer className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="saas-stats-change">+8%</span>
              </div>
            </div>

            <div className="saas-stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="saas-stats-label">Conversions</p>
                  <p className="saas-stats-value">{analyticsData.conversions}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="saas-stats-change">+15%</span>
              </div>
            </div>

            <div className="saas-stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="saas-stats-label">Taux de conversion</p>
                  <p className="saas-stats-value">{analyticsData.conversionRate.toFixed(1)}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="saas-stats-change">+3%</span>
              </div>
            </div>
          </div>

          {/* Progression des objectifs */}
          {goalsData && (
            <div className="saas-section-card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-gray-600" />
                <h3 className="saas-section-title">Progression des objectifs</h3>
              </div>
              
              <div className="saas-grid saas-grid-cols-2">
                {viewsProgress.target > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vues</span>
                      <span>{viewsProgress.current}/{viewsProgress.target}</span>
                    </div>
                    <Progress value={viewsProgress.percentage} className="h-2" />
                  </div>
                )}
                
                {revenueProgress.target > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Revenus</span>
                      <span>{revenueProgress.current.toFixed(0)}/{revenueProgress.target} XOF</span>
                    </div>
                    <Progress value={revenueProgress.percentage} className="h-2" />
                  </div>
                )}
                
                {conversionsProgress.target > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Conversions</span>
                      <span>{conversionsProgress.current}/{conversionsProgress.target}</span>
                    </div>
                    <Progress value={conversionsProgress.percentage} className="h-2" />
                  </div>
                )}
                
                {conversionRateProgress.target > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de conversion</span>
                      <span>{conversionRateProgress.current.toFixed(1)}%/{conversionRateProgress.target}%</span>
                    </div>
                    <Progress value={conversionRateProgress.percentage} className="h-2" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alertes récentes */}
          {alerts.length > 0 && (
            <div className="saas-section-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <h3 className="saas-section-title">Alertes récentes</h3>
                </div>
                <Button variant="outline" size="sm" onClick={markAllAlertsAsRead}>
                  Tout marquer comme lu
                </Button>
              </div>
              
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <Alert key={alert.id} className={alert.is_read ? "opacity-60" : ""}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {alert.alert_type === 'goal_reached' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        )}
                        <AlertDescription>{alert.message}</AlertDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        {!alert.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAlertAsRead(alert.id)}
                          >
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Configuration du tracking */}
        <TabsContent value="tracking" className="saas-space-y-6">
          <div className="saas-section-card">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <h3 className="saas-section-title">Configuration du tracking</h3>
            </div>
            <p className="saas-section-description">
              Surveillez les interactions des utilisateurs avec votre produit.
            </p>
            
            <div className="saas-grid saas-grid-cols-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Tracking des événements</label>
                  <span className="saas-label-description">Enregistrer les événements personnalisés</span>
                </div>
                <Switch
                  checked={trackingConfig?.analytics_enabled || false}
                  onCheckedChange={(checked) => toggleTracking('analytics_enabled', checked)}
                  className="saas-switch"
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Tracking des vues</label>
                  <span className="saas-label-description">Enregistrer chaque vue de produit</span>
                </div>
                <Switch
                  checked={trackingConfig?.track_views || false}
                  onCheckedChange={(checked) => toggleTracking('track_views', checked)}
                  className="saas-switch"
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Tracking des clics</label>
                  <span className="saas-label-description">Enregistrer les clics sur les boutons et liens</span>
                </div>
                <Switch
                  checked={trackingConfig?.track_clicks || false}
                  onCheckedChange={(checked) => toggleTracking('track_clicks', checked)}
                  className="saas-switch"
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Tracking des achats</label>
                  <span className="saas-label-description">Enregistrer les conversions et revenus</span>
                </div>
                <Switch
                  checked={trackingConfig?.track_purchases || false}
                  onCheckedChange={(checked) => toggleTracking('track_purchases', checked)}
                  className="saas-switch"
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col">
                  <label className="saas-label">Tracking du temps passé</label>
                  <span className="saas-label-description">Mesurer l'engagement des utilisateurs</span>
                </div>
                <Switch
                  checked={trackingConfig?.track_time_spent || false}
                  onCheckedChange={(checked) => toggleTracking('track_time_spent', checked)}
                  className="saas-switch"
                />
              </div>
            </div>
          </div>

          {/* Analytics externes */}
          <div className="saas-section-card">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="saas-section-title">Analytics externes</h3>
            </div>
            <p className="saas-section-description">
              Intégrez votre produit avec des outils d'analyse tiers.
            </p>
            
            <div className="saas-grid saas-grid-cols-2">
              <div>
                <label className="saas-label">Google Analytics ID</label>
                <Input
                  value={trackingConfig?.google_analytics_id || ''}
                  onChange={(e) => updateConfig({ google_analytics_id: e.target.value })}
                  placeholder="UA-XXXXXXXXX-X ou G-XXXXXXXXXX"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">Facebook Pixel ID</label>
                <Input
                  value={trackingConfig?.facebook_pixel_id || ''}
                  onChange={(e) => updateConfig({ facebook_pixel_id: e.target.value })}
                  placeholder="123456789012345"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">Google Tag Manager ID</label>
                <Input
                  value={trackingConfig?.google_tag_manager_id || ''}
                  onChange={(e) => updateConfig({ google_tag_manager_id: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">TikTok Pixel ID</label>
                <Input
                  value={trackingConfig?.tiktok_pixel_id || ''}
                  onChange={(e) => updateConfig({ tiktok_pixel_id: e.target.value })}
                  placeholder="CXXXXXXXXXXXXXXX"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">Pinterest Pixel ID</label>
                <Input
                  value={trackingConfig?.pinterest_pixel_id || ''}
                  onChange={(e) => updateConfig({ pinterest_pixel_id: e.target.value })}
                  placeholder="123456789012345"
                  className="saas-input"
                />
              </div>
            </div>
            
            <div className="saas-separator" />
            
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col">
                <label className="saas-label">Tracking avancé</label>
                <span className="saas-label-description">Événements personnalisés et configurations spécifiques</span>
              </div>
              <Switch
                checked={trackingConfig?.advanced_tracking || false}
                onCheckedChange={(checked) => toggleTracking('advanced_tracking', checked)}
                className="saas-switch"
              />
            </div>
            
            {trackingConfig?.advanced_tracking && (
              <div>
                <label className="saas-label">Événements personnalisés</label>
                <Input
                  value={trackingConfig?.custom_events?.join(',') || ''}
                  onChange={(e) => updateConfig({ custom_events: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="event1,event2,event3"
                  className="saas-input"
                />
                <p className="saas-label-description">Séparez les événements personnalisés par des virgules.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Objectifs */}
        <TabsContent value="goals" className="saas-space-y-6">
          <div className="saas-section-card">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-gray-600" />
              <h3 className="saas-section-title">Objectifs et alertes</h3>
            </div>
            <p className="saas-section-description">
              Définissez des objectifs de performance pour ce produit et recevez des alertes.
            </p>
            
            <div className="saas-grid saas-grid-cols-4">
              <div>
                <label className="saas-label">Objectif vues (mensuel)</label>
                <Input
                  type="number"
                  value={goalsData?.goal_views || ''}
                  onChange={(e) => saveGoalsData({ goal_views: parseInt(e.target.value) || null })}
                  placeholder="1000"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">Objectif revenus (mensuel)</label>
                <Input
                  type="number"
                  value={goalsData?.goal_revenue || ''}
                  onChange={(e) => saveGoalsData({ goal_revenue: parseFloat(e.target.value) || null })}
                  placeholder="5000"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">Objectif conversions (mensuel)</label>
                <Input
                  type="number"
                  value={goalsData?.goal_conversions || ''}
                  onChange={(e) => saveGoalsData({ goal_conversions: parseInt(e.target.value) || null })}
                  placeholder="50"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="saas-label">Objectif taux de conversion (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={goalsData?.goal_conversion_rate || ''}
                  onChange={(e) => saveGoalsData({ goal_conversion_rate: parseFloat(e.target.value) || null })}
                  placeholder="5.0"
                  className="saas-input"
                />
              </div>
            </div>
            
            <div className="saas-separator" />
            
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col">
                <label className="saas-label">Alertes par email</label>
                <span className="saas-label-description">Recevez des notifications automatiques en cas de dépassement ou de non-atteinte des objectifs.</span>
              </div>
              <Switch
                checked={goalsData?.email_alerts || false}
                onCheckedChange={(checked) => saveGoalsData({ email_alerts: checked })}
                className="saas-switch"
              />
            </div>
          </div>
        </TabsContent>

        {/* Rapports */}
        <TabsContent value="reports" className="saas-space-y-6">
          <div className="saas-section-card">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-5 w-5 text-gray-600" />
              <h3 className="saas-section-title">Rapports et export</h3>
            </div>
            <p className="saas-section-description">
              Générez des rapports détaillés et exportez vos données d'analytics.
            </p>
            
            <div className="saas-grid saas-grid-cols-3">
              <div className="saas-section-card">
                <h4 className="saas-section-title mb-2">Rapport quotidien</h4>
                <p className="saas-label-description mb-4">Résumé des performances du jour.</p>
                <Button 
                  variant="outline" 
                  className="saas-button-outline w-full"
                  onClick={generateAndDownloadDailyReport}
                  disabled={generating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating ? 'Génération...' : 'Générer'}
                </Button>
              </div>
              <div className="saas-section-card">
                <h4 className="saas-section-title mb-2">Rapport mensuel</h4>
                <p className="saas-label-description mb-4">Analyse complète du mois.</p>
                <Button 
                  variant="outline" 
                  className="saas-button-outline w-full"
                  onClick={generateAndDownloadMonthlyReport}
                  disabled={generating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating ? 'Génération...' : 'Générer'}
                </Button>
              </div>
              <div className="saas-section-card">
                <h4 className="saas-section-title mb-2">Export CSV</h4>
                <p className="saas-label-description mb-4">Données brutes pour analyse approfondie.</p>
                <Button 
                  variant="outline" 
                  className="saas-button-outline w-full"
                  onClick={exportAndDownloadCSV}
                  disabled={generating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating ? 'Export...' : 'Exporter'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Temps réel */}
        <TabsContent value="realtime" className="saas-space-y-6">
          <div className="saas-section-card">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-gray-600" />
              <h3 className="saas-section-title">Données en temps réel</h3>
            </div>
            <p className="saas-section-description">
              Activité actuelle sur ce produit.
            </p>
            
            <div className="saas-grid saas-grid-cols-4 text-center">
              <div className="space-y-1">
                <p className="saas-stats-value">{analyticsData.views}</p>
                <p className="saas-label-description">Vues aujourd'hui</p>
              </div>
              <div className="space-y-1">
                <p className="saas-stats-value">{analyticsData.clicks}</p>
                <p className="saas-label-description">Clics aujourd'hui</p>
              </div>
              <div className="space-y-1">
                <p className="saas-stats-value">{analyticsData.conversions}</p>
                <p className="saas-label-description">Conversions aujourd'hui</p>
              </div>
              <div className="space-y-1">
                <p className="saas-stats-value">{analyticsData.conversionRate.toFixed(1)}%</p>
                <p className="saas-label-description">Taux de conversion</p>
              </div>
            </div>

            {/* Événements récents */}
            {realTimeEvents.length > 0 && (
              <div className="mt-6">
                <h4 className="saas-section-title mb-3">Événements récents</h4>
                <div className="space-y-2">
                  {realTimeEvents.slice(0, 10).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <p className="text-sm font-medium">
                            {event.event_type === 'view' ? 'Vue' :
                             event.event_type === 'click' ? 'Clic' :
                             event.event_type === 'purchase' ? 'Achat' : 'Événement'}
                          </p>
                          {event.event_data?.product_name && (
                            <p className="text-xs text-gray-500">
                              Produit: {event.event_data.product_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(event.timestamp).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};