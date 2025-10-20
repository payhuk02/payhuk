import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, Users, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Ajouter un produit",
      description: "Créer un nouveau produit",
      icon: Package,
      onClick: () => navigate("/dashboard/products"),
    },
    {
      title: "Nouvelle commande",
      description: "Enregistrer une commande",
      icon: ShoppingCart,
      onClick: () => navigate("/dashboard/orders"),
    },
    {
      title: "Ajouter un client",
      description: "Enregistrer un nouveau client",
      icon: Users,
      onClick: () => navigate("/dashboard/customers"),
    },
    {
      title: "Créer une promotion",
      description: "Nouvelle offre promotionnelle",
      icon: Tag,
      onClick: () => navigate("/dashboard/promotions"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
        <CardDescription>
          Accédez rapidement aux fonctions principales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start h-auto p-4"
            onClick={action.onClick}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};