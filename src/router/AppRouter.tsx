import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsAuthenticated, useAppStore } from '../store/useAppStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Lazy loading des pages pour optimiser les performances
const Landing = lazy(() => import('../pages/Landing'));
const Auth = lazy(() => import('../pages/Auth'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Products = lazy(() => import('../pages/Products'));
const Storefront = lazy(() => import('../pages/Storefront'));
const Marketplace = lazy(() => import('../pages/Marketplace'));
const Settings = lazy(() => import('../pages/Settings'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Inventory = lazy(() => import('../pages/Inventory'));
const Customers = lazy(() => import('../pages/Customers'));
const Reports = lazy(() => import('../pages/Reports'));
const Integrations = lazy(() => import('../pages/Integrations'));
const Billing = lazy(() => import('../pages/Billing'));
const Support = lazy(() => import('../pages/Support'));
const Admin = lazy(() => import('../pages/admin/Admin'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminStores = lazy(() => import('../pages/admin/AdminStores'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminIntegrations = lazy(() => import('../pages/admin/AdminIntegrations'));
const AdminBilling = lazy(() => import('../pages/admin/AdminBilling'));
const AdminSupport = lazy(() => import('../pages/admin/AdminSupport'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'));
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'));
const AdminInventory = lazy(() => import('../pages/admin/AdminInventory'));
const AdminReports2 = lazy(() => import('../pages/admin/AdminReports2'));
const AdminIntegrations2 = lazy(() => import('../pages/admin/AdminIntegrations2'));
const AdminBilling2 = lazy(() => import('../pages/admin/AdminBilling2'));
const AdminSupport2 = lazy(() => import('../pages/admin/AdminSupport2'));
const AdminDashboard2 = lazy(() => import('../pages/admin/AdminDashboard2'));
const AdminProducts2 = lazy(() => import('../pages/admin/AdminProducts2'));
const AdminOrders2 = lazy(() => import('../pages/admin/AdminOrders2'));
const AdminCustomers2 = lazy(() => import('../pages/admin/AdminCustomers2'));
const AdminInventory2 = lazy(() => import('../pages/admin/AdminInventory2'));

// Composant de transition pour les pages
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

// Composant de chargement
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Guard pour les routes protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({ 
  children, 
  requiredRole 
}) => {
  const isAuthenticated = useIsAuthenticated();
  const user = useAppStore(state => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <PageTransition>{children}</PageTransition>;
};

// Guard pour les routes publiques (redirige si connecté)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <PageTransition>{children}</PageTransition>;
};

// Composant principal de routage
export const AppRouter: React.FC = () => {
  const location = useLocation();
  const setLoading = useAppStore(state => state.setLoading);

  // Gérer l'état de chargement global
  useEffect(() => {
    setLoading(false);
  }, [location, setLoading]);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Routes publiques */}
          <Route 
            path="/" 
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <Landing />
                </Suspense>
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <Auth />
                </Suspense>
              </PublicRoute>
            } 
          />

          {/* Routes protégées - Utilisateurs */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Products />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/storefront" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Storefront />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Marketplace />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Orders />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Analytics />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/inventory" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Inventory />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Customers />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Reports />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/integrations" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Integrations />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Billing />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Support />
                </Suspense>
              </ProtectedRoute>
            } 
          />

          {/* Routes protégées - Administrateurs */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminUsers />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/stores" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminStores />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminProducts />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminOrders />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/customers" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminCustomers />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/inventory" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminInventory />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminAnalytics />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminReports />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/integrations" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminIntegrations />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/billing" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminBilling />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/support" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminSupport />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminSettings />
                </Suspense>
              </ProtectedRoute>
            } 
          />

          {/* Route de fallback */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    404
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Page non trouvée
                  </p>
                  <Navigate to="/dashboard" replace />
                </div>
              </div>
            } 
          />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
};
