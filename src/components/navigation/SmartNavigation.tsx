import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMultiStores } from '@/hooks/useMultiStores';

/**
 * Hook pour la navigation intelligente entre les pages Boutique et Paramètres
 */
export const useSmartNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { stores } = useMultiStores();

  // Navigation vers la page Boutique
  const goToStorePage = (tab?: string) => {
    const baseUrl = '/dashboard/store';
    if (tab) {
      navigate(`${baseUrl}?tab=${tab}`);
    } else {
      navigate(baseUrl);
    }
  };

  // Navigation vers les paramètres de boutique
  const goToStoreSettings = (storeId?: string, subTab?: string) => {
    const baseUrl = '/dashboard/settings?tab=store';
    if (storeId) {
      navigate(`${baseUrl}&store=${storeId}`);
    } else if (subTab) {
      navigate(`${baseUrl}&subtab=${subTab}`);
    } else {
      navigate(baseUrl);
    }
  };

  // Navigation contextuelle basée sur la page actuelle
  const navigateToStore = (action: 'manage' | 'settings' | 'create', storeId?: string) => {
    switch (action) {
      case 'manage':
        goToStorePage('dashboard');
        break;
      case 'settings':
        goToStoreSettings(storeId);
        break;
      case 'create':
        goToStorePage('dashboard');
        break;
    }
  };

  // Vérifier si on est sur une page de boutique
  const isOnStorePage = location.pathname.includes('/dashboard/store');
  const isOnStoreSettings = location.pathname.includes('/dashboard/settings') && 
    new URLSearchParams(location.search).get('tab') === 'store';

  // Obtenir la boutique sélectionnée depuis l'URL
  const getSelectedStoreId = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('store');
  };

  // Obtenir la boutique sélectionnée
  const getSelectedStore = () => {
    const storeId = getSelectedStoreId();
    if (storeId && stores.length > 0) {
      return stores.find(store => store.id === storeId);
    }
    return null;
  };

  return {
    goToStorePage,
    goToStoreSettings,
    navigateToStore,
    isOnStorePage,
    isOnStoreSettings,
    getSelectedStoreId,
    getSelectedStore,
    stores
  };
};

/**
 * Composant pour les liens de navigation intelligents
 */
interface SmartLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SmartLink: React.FC<SmartLinkProps> = ({ 
  to, 
  children, 
  className = "",
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <a 
      href={to} 
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};

/**
 * Composant pour les boutons de navigation contextuels
 */
interface NavigationButtonProps {
  action: 'manage' | 'settings' | 'create';
  storeId?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  action,
  storeId,
  children,
  className = "",
  variant = "default"
}) => {
  const { navigateToStore } = useSmartNavigation();

  const handleClick = () => {
    navigateToStore(action, storeId);
  };

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-2 rounded-md transition-colors ${
        variant === 'default' 
          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
          : variant === 'outline'
          ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      } ${className}`}
    >
      {children}
    </button>
  );
};
