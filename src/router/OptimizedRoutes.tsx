import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy loading des pages principales avec code splitting
const Landing = lazy(() => import('@/pages/Landing'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Products = lazy(() => import('@/pages/Products'));
const Store = lazy(() => import('@/pages/Store'));
const Orders = lazy(() => import('@/pages/Orders'));
const Customers = lazy(() => import('@/pages/Customers'));
const Promotions = lazy(() => import('@/pages/Promotions'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Payments = lazy(() => import('@/pages/Payments'));
const Settings = lazy(() => import('@/pages/Settings'));
const CreateProduct = lazy(() => import('@/pages/CreateProduct'));
const EditProduct = lazy(() => import('@/pages/EditProduct'));
const Storefront = lazy(() => import('@/pages/Storefront'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const KYC = lazy(() => import('@/pages/KYC'));
const AdminKYC = lazy(() => import('@/pages/AdminKYC'));
const PlatformRevenue = lazy(() => import('@/pages/PlatformRevenue'));
const Referrals = lazy(() => import('@/pages/Referrals'));
const SEOAnalyzer = lazy(() => import('@/pages/SEOAnalyzer'));
const Pixels = lazy(() => import('@/pages/Pixels'));

// Lazy loading des pages Admin (chargées séparément)
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminStores = lazy(() => import('@/pages/admin/AdminStores'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminSales = lazy(() => import('@/pages/admin/AdminSales'));
const AdminReferrals = lazy(() => import('@/pages/admin/AdminReferrals'));
const AdminActivity = lazy(() => import('@/pages/admin/AdminActivity'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));

// Lazy loading des pages Moneroo (chargées séparément)
const PaymentSuccess = lazy(() => import('@/pages/payments/PaymentSuccess'));
const PaymentCancel = lazy(() => import('@/pages/payments/PaymentCancel'));

// Composant de chargement optimisé
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <LoadingSpinner size="lg" />
  </div>
);

// Wrapper pour les routes avec lazy loading
const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Composant principal des routes optimisées
export const OptimizedRoutes: React.FC = () => {
  return (
    <Routes>
      {/* --- Routes publiques --- */}
      <Route 
        path="/" 
        element={
          <LazyRoute>
            <Landing />
          </LazyRoute>
        } 
      />
      <Route 
        path="/auth" 
        element={
          <LazyRoute>
            <Auth />
          </LazyRoute>
        } 
      />
      <Route 
        path="/marketplace" 
        element={
          <LazyRoute>
            <Marketplace />
          </LazyRoute>
        } 
      />
      <Route 
        path="/stores/:slug" 
        element={
          <LazyRoute>
            <Storefront />
          </LazyRoute>
        } 
      />
      <Route 
        path="/stores/:slug/products/:productSlug" 
        element={
          <LazyRoute>
            <ProductDetail />
          </LazyRoute>
        } 
      />

      {/* --- Routes Moneroo --- */}
      <Route 
        path="/payment/success" 
        element={
          <LazyRoute>
            <PaymentSuccess />
          </LazyRoute>
        } 
      />
      <Route 
        path="/payment/cancel" 
        element={
          <LazyRoute>
            <PaymentCancel />
          </LazyRoute>
        } 
      />

      {/* --- Routes protégées utilisateur --- */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Dashboard />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/products" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Products />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/products/create" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <CreateProduct />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/products/:id/edit" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <EditProduct />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/store" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Store />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/orders" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Orders />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/customers" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Customers />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/promotions" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Promotions />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/analytics" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Analytics />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/payments" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Payments />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Settings />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/kyc" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <KYC />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/referrals" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Referrals />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/seo" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <SEOAnalyzer />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/pixels" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <Pixels />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/revenue" 
        element={
          <ProtectedRoute>
            <LazyRoute>
              <PlatformRevenue />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />

      {/* --- Routes Admin (chargées séparément) --- */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminDashboard />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminUsers />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/stores" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminStores />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminProducts />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/sales" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminSales />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/referrals" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminReferrals />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/activity" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminActivity />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminSettings />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/notifications" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminNotifications />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/kyc" 
        element={
          <ProtectedRoute requiredRole="admin">
            <LazyRoute>
              <AdminKYC />
            </LazyRoute>
          </ProtectedRoute>
        } 
      />

      {/* --- Route 404 --- */}
      <Route 
        path="*" 
        element={
          <LazyRoute>
            <NotFound />
          </LazyRoute>
        } 
      />
    </Routes>
  );
};
