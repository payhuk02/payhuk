import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, Users, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const actions = [
    {
      title: t("dashboard.actions.addProduct"),
      description: t("dashboard.actions.addProductDesc"),
      icon: Package,
      onClick: () => navigate("/dashboard/products"),
      variant: "default" as const,
    },
    {
      title: t("dashboard.actions.newOrder"),
      description: t("dashboard.actions.newOrderDesc"),
      icon: ShoppingCart,
      onClick: () => navigate("/dashboard/orders"),
      variant: "secondary" as const,
    },
    {
      title: t("dashboard.actions.addCustomer"),
      description: t("dashboard.actions.addCustomerDesc"),
      icon: Users,
      onClick: () => navigate("/dashboard/customers"),
      variant: "outline" as const,
    },
    {
      title: t("dashboard.actions.createPromotion"),
      description: t("dashboard.actions.createPromotionDesc"),
      icon: Tag,
      onClick: () => navigate("/dashboard/promotions"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>{t("dashboard.quickActions")}</CardTitle>
        <CardDescription>Accédez rapidement aux fonctions principales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto flex-col items-start p-4 gap-2 hover-scale"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-5 w-5" />
                <span className="font-semibold">{action.title}</span>
              </div>
              <span className="text-xs text-muted-foreground font-normal">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
