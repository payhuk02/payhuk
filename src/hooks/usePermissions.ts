import { useAuth } from './useAuth';

// Types de permissions
export type Permission = 
  // Produits
  | 'read:products'
  | 'write:products'
  | 'delete:products'
  | 'publish:products'
  
  // Commandes
  | 'read:orders'
  | 'write:orders'
  | 'delete:orders'
  | 'fulfill:orders'
  
  // Clients
  | 'read:customers'
  | 'write:customers'
  | 'delete:customers'
  
  // Boutiques
  | 'read:stores'
  | 'write:stores'
  | 'delete:stores'
  | 'manage:stores'
  
  // Administrateur
  | 'admin:users'
  | 'admin:platform'
  | 'admin:analytics'
  | 'admin:settings'
  
  // Paiements
  | 'read:payments'
  | 'write:payments'
  | 'refund:payments'
  
  // Analytics
  | 'read:analytics'
  | 'write:analytics'
  
  // Support
  | 'read:support'
  | 'write:support'
  | 'admin:support';

// Types de rôles
export type Role = 'admin' | 'vendor' | 'customer' | 'moderator';

// Configuration des permissions par rôle
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    // Admin a tous les droits
    'read:products', 'write:products', 'delete:products', 'publish:products',
    'read:orders', 'write:orders', 'delete:orders', 'fulfill:orders',
    'read:customers', 'write:customers', 'delete:customers',
    'read:stores', 'write:stores', 'delete:stores', 'manage:stores',
    'admin:users', 'admin:platform', 'admin:analytics', 'admin:settings',
    'read:payments', 'write:payments', 'refund:payments',
    'read:analytics', 'write:analytics',
    'read:support', 'write:support', 'admin:support'
  ],
  
  vendor: [
    // Vendeur peut gérer ses produits et commandes
    'read:products', 'write:products', 'delete:products', 'publish:products',
    'read:orders', 'write:orders', 'fulfill:orders',
    'read:customers',
    'read:stores', 'write:stores',
    'read:payments',
    'read:analytics',
    'read:support', 'write:support'
  ],
  
  moderator: [
    // Modérateur peut surveiller et modérer
    'read:products', 'write:products', 'publish:products',
    'read:orders', 'write:orders',
    'read:customers', 'write:customers',
    'read:stores', 'write:stores',
    'read:analytics',
    'read:support', 'write:support'
  ],
  
  customer: [
    // Client peut seulement lire et passer des commandes
    'read:products',
    'read:orders', 'write:orders',
    'read:payments',
    'read:support', 'write:support'
  ]
};

// Hook pour gérer les permissions
export const usePermissions = () => {
  const { user, hasPermission, hasRole } = useAuth();

  // Vérifier si l'utilisateur a une permission spécifique
  const can = (permission: Permission): boolean => {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Vérifier si l'utilisateur a plusieurs permissions (toutes requises)
  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every(permission => can(permission));
  };

  // Vérifier si l'utilisateur a au moins une des permissions
  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some(permission => can(permission));
  };

  // Vérifier si l'utilisateur peut accéder à une route
  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;

    const routePermissions: Record<string, Permission[]> = {
      '/dashboard': ['read:products'],
      '/dashboard/products': ['read:products'],
      '/dashboard/products/new': ['write:products'],
      '/dashboard/products/:id/edit': ['write:products'],
      '/dashboard/orders': ['read:orders'],
      '/dashboard/customers': ['read:customers'],
      '/dashboard/analytics': ['read:analytics'],
      '/dashboard/settings': ['write:stores'],
      '/admin': ['admin:platform'],
      '/admin/users': ['admin:users'],
      '/admin/stores': ['manage:stores'],
      '/admin/analytics': ['admin:analytics'],
      '/admin/settings': ['admin:settings']
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Route publique

    return canAny(requiredPermissions);
  };

  // Obtenir toutes les permissions de l'utilisateur
  const getUserPermissions = (): Permission[] => {
    if (!user) return [];
    return ROLE_PERMISSIONS[user.role] || [];
  };

  // Vérifier si l'utilisateur peut modifier une ressource
  const canModify = (resourceType: string, resourceOwnerId?: string): boolean => {
    if (!user) return false;

    // Admin peut tout modifier
    if (user.role === 'admin') return true;

    // Vérifier si l'utilisateur est le propriétaire de la ressource
    if (resourceOwnerId && user.id === resourceOwnerId) {
      return true;
    }

    // Permissions spécifiques par type de ressource
    switch (resourceType) {
      case 'product':
        return can('write:products');
      case 'order':
        return can('write:orders');
      case 'customer':
        return can('write:customers');
      case 'store':
        return can('write:stores');
      default:
        return false;
    }
  };

  // Vérifier si l'utilisateur peut supprimer une ressource
  const canDelete = (resourceType: string, resourceOwnerId?: string): boolean => {
    if (!user) return false;

    // Admin peut tout supprimer
    if (user.role === 'admin') return true;

    // Vérifier si l'utilisateur est le propriétaire de la ressource
    if (resourceOwnerId && user.id === resourceOwnerId) {
      return true;
    }

    // Permissions spécifiques par type de ressource
    switch (resourceType) {
      case 'product':
        return can('delete:products');
      case 'order':
        return can('delete:orders');
      case 'customer':
        return can('delete:customers');
      case 'store':
        return can('delete:stores');
      default:
        return false;
    }
  };

  return {
    can,
    canAll,
    canAny,
    canAccessRoute,
    canModify,
    canDelete,
    getUserPermissions,
    userRole: user?.role,
    isAdmin: hasRole('admin'),
    isVendor: hasRole('vendor'),
    isCustomer: hasRole('customer'),
    isModerator: hasRole('moderator')
  };
};

// Composant de protection par permission
interface PermissionGuardProps {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean; // Si true, toutes les permissions sont requises
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
  requireAll = false
}) => {
  const { can, canAll, canAny } = usePermissions();
  
  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasPermission = requireAll ? canAll(permissions) : canAny(permissions);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Hook pour les actions conditionnelles
export const useConditionalAction = () => {
  const { can, canModify, canDelete } = usePermissions();

  const getActionPermissions = (action: string, resourceType?: string, resourceOwnerId?: string) => {
    switch (action) {
      case 'create':
        return can(`write:${resourceType}s` as Permission);
      case 'read':
        return can(`read:${resourceType}s` as Permission);
      case 'update':
        return canModify(resourceType || '', resourceOwnerId);
      case 'delete':
        return canDelete(resourceType || '', resourceOwnerId);
      case 'publish':
        return can(`publish:${resourceType}s` as Permission);
      case 'fulfill':
        return can(`fulfill:${resourceType}s` as Permission);
      default:
        return false;
    }
  };

  return {
    getActionPermissions
  };
};
