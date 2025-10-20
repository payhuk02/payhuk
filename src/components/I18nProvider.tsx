import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';

// Composant de chargement pour i18n
const I18nLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Chargement des traductions...</p>
      </div>
    </div>
  );
};

// Composant pour vérifier que i18n est prêt
const I18nReady = ({ children }: { children: React.ReactNode }) => {
  const { ready } = useTranslation();
  
  if (!ready) {
    return <I18nLoader />;
  }
  
  return <>{children}</>;
};

// Wrapper principal pour i18n
export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<I18nLoader />}>
      <I18nReady>
        {children}
      </I18nReady>
    </Suspense>
  );
};
