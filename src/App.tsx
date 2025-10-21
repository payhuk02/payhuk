import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/navigation/ScrollToTop";
import { LoadingBar } from "@/components/navigation/LoadingBar";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useDarkMode } from "@/hooks/useDarkMode";
import { PerformanceOptimizer } from "@/components/optimization/PerformanceOptimizer";
import { NotificationContainer } from "@/components/ui/NotificationContainer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useThemeManager } from "@/hooks/useThemeManager";
import { checkEnvironmentVariables, checkSupabaseConnection } from "@/lib/env-checker";
import { EnvironmentDiagnostic } from "@/components/dashboard/EnvironmentDiagnostic";
import { OptimizedRoutes } from "@/router/OptimizedRoutes";
import { SupabaseErrorAlert } from "@/components/SupabaseErrorAlert";

const AppContent = () => {
  useScrollRestoration();
  useDarkMode(); // Active le mode sombre globalement
  useThemeManager(); // Initialise le gestionnaire de thème

  // Vérification des variables d'environnement (temporaire pour debug)
  React.useEffect(() => {
    console.log('🚀 Démarrage de l\'application Payhuk');
    checkEnvironmentVariables();
    
    // Test de connexion Supabase après un délai
    setTimeout(() => {
      checkSupabaseConnection();
    }, 2000);
  }, []);

  return (
    <ErrorBoundary>
      <PerformanceOptimizer />
      <LoadingBar />
      <ScrollToTop />
      <NotificationContainer />
      <EnvironmentDiagnostic />
      <SupabaseErrorAlert />
      {/* <EnvironmentInfo /> */}
      <OptimizedRoutes />
    </ErrorBoundary>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
