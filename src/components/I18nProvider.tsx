import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';

interface I18nProviderProps {
  children: ReactNode;
}

// Provider simplifié sans vérifications complexes
export const I18nProvider = ({ children }: I18nProviderProps) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};
