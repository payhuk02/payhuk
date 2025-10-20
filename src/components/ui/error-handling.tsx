import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorBoundaryProps {
  error?: string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  children: React.ReactNode;
}

export const ErrorBoundary = ({ 
  error, 
  onRetry, 
  isRetrying = false, 
  children 
}: ErrorBoundaryProps) => {
  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erreur de chargement
          </CardTitle>
          <CardDescription>
            Une erreur s'est produite lors du chargement des données
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          
          {onRetry && (
            <Button 
              onClick={onRetry} 
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Nouvelle tentative...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réessayer
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

interface ConnectionStatusProps {
  isOnline: boolean;
  isRealTimeActive: boolean;
}

export const ConnectionStatus = ({ isOnline, isRealTimeActive }: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          <span>{isRealTimeActive ? 'En direct' : 'Connecté'}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-500">
          <WifiOff className="h-3 w-3" />
          <span>Hors ligne</span>
        </div>
      )}
    </div>
  );
};

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

export const LoadingState = ({ 
  message = "Chargement en cours...", 
  showSpinner = true 
}: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        {showSpinner && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
