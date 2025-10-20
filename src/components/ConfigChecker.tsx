import { ReactNode } from 'react';

interface ConfigCheckerProps {
  children: ReactNode;
}

// ConfigChecker simplifié - pas de vérifications complexes
export const ConfigChecker = ({ children }: ConfigCheckerProps) => {
  return <>{children}</>;
};
