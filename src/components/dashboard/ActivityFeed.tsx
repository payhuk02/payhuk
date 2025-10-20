import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShoppingCart, 
  UserPlus, 
  Package, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'product' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
  user?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'order',
    title: 'Nouvelle commande',
    description: 'Commande #1234 reçue',
    timestamp: new Date().toISOString(),
    status: 'success',
    amount: 25000,
    user: 'Jean Dupont'
  },
  {
    id: '2',
    type: 'customer',
    title: 'Nouveau client',
    description: 'Marie Martin s\'est inscrite',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'info',
    user: 'Marie Martin'
  },
  {
    id: '3',
    type: 'product',
    title: 'Produit ajouté',
    description: 'Nouveau produit "T-shirt Premium"',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'success'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Paiement reçu',
    description: 'Paiement de 15,000 FCFA confirmé',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: 'success',
    amount: 15000
  },
  {
    id: '5',
    type: 'order',
    title: 'Commande en attente',
    description: 'Commande #1233 en attente de paiement',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    status: 'warning',
    amount: 18000,
    user: 'Pierre Durand'
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-4 w-4" />;
    case 'customer':
      return <UserPlus className="h-4 w-4" />;
    case 'product':
      return <Package className="h-4 w-4" />;
    case 'payment':
      return <DollarSign className="h-4 w-4" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'warning':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'info':
      return <AlertCircle className="h-4 w-4 text-blue-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const ActivityFeed = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return format(time, 'dd/MM à HH:mm', { locale: fr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Flux d'activité
        </CardTitle>
        <CardDescription>
          Dernières activités de votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium truncate">
                    {activity.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {activity.amount && (
                      <span className="text-sm font-medium text-primary">
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                {activity.user && (
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.user}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(activity.status)}`}
                  >
                    {activity.status === 'success' && 'Succès'}
                    {activity.status === 'warning' && 'En attente'}
                    {activity.status === 'error' && 'Erreur'}
                    {activity.status === 'info' && 'Information'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
