import React from 'react';
import { ChevronRight, Home, Store, Settings } from 'lucide-react';
import { useSmartNavigation } from './SmartNavigation';
import { useMultiStores } from '@/hooks/useMultiStores';

interface StoreBreadcrumbProps {
  className?: string;
}

export const StoreBreadcrumb: React.FC<StoreBreadcrumbProps> = ({ className = "" }) => {
  const { 
    isOnStorePage, 
    isOnStoreSettings, 
    getSelectedStore, 
    goToStorePage, 
    goToStoreSettings 
  } = useSmartNavigation();
  const { stores } = useMultiStores();

  const selectedStore = getSelectedStore();

  if (!isOnStorePage && !isOnStoreSettings) {
    return null;
  }

  const breadcrumbItems = [
    {
      label: 'Tableau de bord',
      icon: Home,
      onClick: () => goToStorePage(),
      active: isOnStorePage && !isOnStoreSettings
    }
  ];

  if (isOnStorePage) {
    breadcrumbItems.push({
      label: 'Mes boutiques',
      icon: Store,
      onClick: () => goToStorePage(),
      active: true
    });
  }

  if (isOnStoreSettings) {
    breadcrumbItems.push(
      {
        label: 'Paramètres',
        icon: Settings,
        onClick: () => goToStoreSettings(),
        active: !selectedStore
      }
    );

    if (selectedStore) {
      breadcrumbItems.push({
        label: selectedStore.name,
        icon: Store,
        onClick: () => goToStoreSettings(selectedStore.id),
        active: true
      });
    }
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          <button
            onClick={item.onClick}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              item.active 
                ? 'text-foreground font-medium bg-accent' 
                : 'hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <item.icon className="h-3 w-3" />
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
