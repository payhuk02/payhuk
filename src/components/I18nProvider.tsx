import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import i18n from '../../i18n';

interface I18nProviderProps {
  children: ReactNode;
}

// Composant de chargement pour i18n
const I18nLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-slate-300">Chargement des traductions...</p>
      </div>
    </div>
  );
};

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Attendre que i18n soit complètement initialisé
    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      const handleInitialized = () => {
        setIsReady(true);
      };
      
      i18n.on('initialized', handleInitialized);
      
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, []);

  // Afficher un loader pendant l'initialisation
  if (!isReady) {
    return <I18nLoader />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};
