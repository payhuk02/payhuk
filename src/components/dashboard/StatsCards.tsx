import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      title: "Revenus totaux",
      value: `${stats.totalRevenue.toLocaleString()} FCFA`,
      description: "Ce mois",
      icon: DollarSign,
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toString(),
      description: "Ce mois",
      icon: ShoppingCart,
    },
    {
      title: "Clients",
      value: stats.totalCustomers.toString(),
      description: "Total",
      icon: Users,
    },
    {
      title: "Produits",
      value: stats.totalProducts.toString(),
      description: "En vente",
      icon: Package,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
