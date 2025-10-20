import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  CreditCard,
  BarChart3,
  Tag,
  LogOut,
  Store,
  Shield,
  ShieldCheck,
  DollarSign,
  UserPlus,
  History,
  Bell,
  Target,
  Search,
} from "lucide-react";
import payhukLogo from "@/assets/payhuk-logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

export const AppSidebar = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  const menuItems = [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Boutique",
      url: "/dashboard/store",
      icon: Store,
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: ShoppingCart,
    },
    {
      title: "Produits",
      url: "/dashboard/products",
      icon: Package,
    },
    {
      title: "Commandes",
      url: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      title: "Clients",
      url: "/dashboard/customers",
      icon: Users,
    },
    {
      title: "Promotions",
      url: "/dashboard/promotions",
      icon: Tag,
    },
    {
      title: "Statistiques",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Paiements",
      url: "/dashboard/payments",
      icon: CreditCard,
    },
    {
      title: "KYC",
      url: "/dashboard/kyc",
      icon: Shield,
    },
    {
      title: "Parrainage",
      url: "/dashboard/referrals",
      icon: UserPlus,
    },
    {
      title: "Mes Pixels",
      url: "/dashboard/pixels",
      icon: Target,
    },
    {
      title: "Mon SEO",
      url: "/dashboard/seo",
      icon: Search,
    },
    {
      title: "Paramètres",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const adminMenuItems = [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Utilisateurs Admin",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Boutiques Admin",
      url: "/admin/stores",
      icon: Store,
    },
    {
      title: "Produits Admin",
      url: "/admin/products",
      icon: Package,
    },
    {
      title: "Ventes Admin",
      url: "/admin/sales",
      icon: DollarSign,
    },
    {
      title: "Parrainages Admin",
      url: "/admin/referrals",
      icon: UserPlus,
    },
    {
      title: "Activité Admin",
      url: "/admin/activity",
      icon: History,
    },
    {
      title: "Paramètres Admin",
      url: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Notifications Admin",
      url: "/admin/notifications",
      icon: Bell,
    },
    {
      title: "Revenus Plateforme",
      url: "/admin/revenue",
      icon: DollarSign,
    },
    {
      title: "KYC Admin",
      url: "/admin/kyc",
      icon: ShieldCheck,
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-2">
          <img src={payhukLogo} alt="Payhuk" className="h-8 w-8" />
          <span className="font-bold text-lg">Payhuk</span>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};