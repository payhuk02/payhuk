import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  TrendingUp,
  Settings,
  BarChart3,
  FileText,
  Zap,
  Target,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const primaryActions = [
    {
      title: "Ajouter un produit",
      description: "Créer un nouveau produit",
      icon: Package,
      onClick: () => navigate("/dashboard/products"),
      color: "bg-blue-500 hover:bg-blue-600",
      badge: "Populaire"
    },
    {
      title: "Nouvelle commande",
      description: "Enregistrer une commande",
      icon: ShoppingCart,
      onClick: () => navigate("/dashboard/orders"),
      color: "bg-green-500 hover:bg-green-600",
      badge: "Fréquent"
    },
    {
      title: "Analyses",
      description: "Consulter les statistiques",
      icon: BarChart3,
      onClick: () => navigate("/dashboard/analytics"),
      color: "bg-purple-500 hover:bg-purple-600",
      badge: "Pro"
    },
    {
      title: "Promotions",
      description: "Créer une offre",
      icon: Tag,
      onClick: () => navigate("/dashboard/promotions"),
      color: "bg-orange-500 hover:bg-orange-600",
      badge: "Boost"
    }
  ];

  const secondaryActions = [
    {
      title: "Clients",
      description: "Gérer les clients",
      icon: Users,
      onClick: () => navigate("/dashboard/customers"),
      variant: "outline" as const
    },
    {
      title: "Paramètres",
      description: "Configuration boutique",
      icon: Settings,
      onClick: () => navigate("/dashboard/settings"),
      variant: "outline" as const
    },
    {
      title: "Rapports",
      description: "Exporter les données",
      icon: FileText,
      onClick: () => navigate("/dashboard/analytics"),
      variant: "outline" as const
    },
    {
      title: "Optimisation",
      description: "Améliorer les performances",
      icon: Zap,
      onClick: () => navigate("/dashboard/analytics"),
      variant: "outline" as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Accédez rapidement aux fonctions principales de votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Actions principales */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Actions recommandées
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {primaryActions.map((action, index) => (
              <div key={index} className="relative">
                <Button
                  className={`w-full justify-start h-auto p-4 text-white ${action.color}`}
                  onClick={action.onClick}
                >
                  <div className="flex items-center space-x-3">
                    <action.icon className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm opacity-90">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
                {action.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions secondaires */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Autres actions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {secondaryActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={action.onClick}
              >
                <action.icon className="h-4 w-4" />
                <div className="text-center">
                  <div className="text-xs font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance rapide
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="text-lg font-bold text-green-600">+12%</div>
              <div className="text-xs text-green-700">Revenus</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-lg font-bold text-blue-600">+8%</div>
              <div className="text-xs text-blue-700">Commandes</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-lg font-bold text-purple-600">+15%</div>
              <div className="text-xs text-purple-700">Clients</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};