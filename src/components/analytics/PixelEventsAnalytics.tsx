import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Eye, MousePointer, BarChart3 } from 'lucide-react';

interface PixelEvent {
  id: string;
  pixel_id: string;
  user_id: string;
  event_type: 'pageview' | 'add_to_cart' | 'purchase' | 'lead';
  product_id: string | null;
  order_id: string | null;
  event_data: any;
  created_at: string;
}

interface PixelEventsAnalyticsProps {
  loading?: boolean;
}

export const PixelEventsAnalytics = ({ loading = false }: PixelEventsAnalyticsProps) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPixelEvents();
    }
  }, [user]);

  const fetchPixelEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pixel_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setEvents((data || []) as PixelEvent[]);
    } catch (error: any) {
      console.error('Error fetching pixel events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const isLoading = loading || eventsLoading;

  // Calculate stats
  const totalEvents = events.length;
  const pageviewEvents = events.filter(e => e.event_type === 'pageview').length;
  const internalEvents = events.filter(e => 
    e.event_data?.action && 
    ['edit_product', 'edit_faq', 'edit_seo', 'edit_promotions'].includes(e.event_data.action)
  ).length;

  // Group events by action for internal analytics
  const actionStats = events
    .filter(e => e.event_data?.action)
    .reduce((acc, event) => {
      const action = event.event_data.action;
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Tous types confondus
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PageViews</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{pageviewEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Vues de pages
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Internes</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{internalEvents}</div>
                <p className="text-xs text-muted-foreground">
                  Clics sur liens rapides
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits Trackés</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {new Set(events.filter(e => e.product_id).map(e => e.product_id)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produits uniques
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Breakdown */}
      {Object.keys(actionStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Actions</CardTitle>
            <CardDescription>Actions les plus fréquentes sur les produits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(actionStats)
                .sort(([,a], [,b]) => b - a)
                .map(([action, count]) => {
                  const labels: Record<string, string> = {
                    edit_product: 'Modification générale',
                    edit_faq: 'Édition FAQ',
                    edit_seo: 'Édition SEO',
                    edit_promotions: 'Édition Promotions',
                  };

                  const maxCount = Math.max(...Object.values(actionStats));
                  const percentage = (count / maxCount) * 100;

                  return (
                    <div key={action} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{labels[action] || action}</span>
                        <span className="text-muted-foreground">{count} clics</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Événements Récents</CardTitle>
          <CardDescription>Les 10 derniers événements trackés</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div>
                      <p className="text-sm font-medium">
                        {event.event_data?.action ? 
                          labels[event.event_data.action] || event.event_data.action :
                          event.event_type
                        }
                      </p>
                      {event.event_data?.product_name && (
                        <p className="text-xs text-muted-foreground">
                          Produit: {event.event_data.product_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mb-2" />
              <p>Aucun événement tracké</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
