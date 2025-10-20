import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface TimeoutErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
  errorType?: 'timeout' | 'network' | 'server';
}

export const TimeoutError = ({ 
  onRetry, 
  isRetrying = false, 
  errorType = 'timeout' 
}: TimeoutErrorProps) => {
  const getErrorInfo = () => {
    switch (errorType) {
      case 'timeout':
        return {
          title: "Délai d'attente dépassé",
          description: "La requête a pris trop de temps à répondre. Cela peut être temporaire.",
          icon: Clock,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200"
        };
      case 'network':
        return {
          title: "Problème de connexion",
          description: "Impossible de se connecter au serveur. Vérifiez votre connexion internet.",
          icon: WifiOff,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      case 'server':
        return {
          title: "Erreur serveur",
          description: "Le serveur rencontre des difficultés temporaires.",
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      default:
        return {
          title: "Erreur de chargement",
          description: "Une erreur s'est produite lors du chargement des données.",
          icon: AlertCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
    }
  };

  const errorInfo = getErrorInfo();
  const IconComponent = errorInfo.icon;

  return (
    <Card className={`${errorInfo.borderColor} ${errorInfo.bgColor}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${errorInfo.color}`}>
          <IconComponent className="h-5 w-5" />
          {errorInfo.title}
        </CardTitle>
        <CardDescription>
          {errorInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Les données peuvent être temporairement indisponibles. 
            Veuillez réessayer dans quelques instants.
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Délai: 10s
            </Badge>
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry: Auto
            </Badge>
          </div>
          
          {onRetry && (
            <Button 
              onClick={onRetry} 
              disabled={isRetrying}
              size="sm"
              variant="outline"
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
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>💡 <strong>Conseil:</strong> Si le problème persiste, vérifiez votre connexion internet ou contactez le support.</p>
        </div>
      </CardContent>
    </Card>
  );
};

interface ConnectionStatusProps {
  isOnline: boolean;
  isRealTimeActive: boolean;
  lastUpdate?: Date;
}

export const ConnectionStatus = ({ 
  isOnline, 
  isRealTimeActive, 
  lastUpdate 
}: ConnectionStatusProps) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      {isOnline ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-3 w-3" />
          <span>{isRealTimeActive ? 'En direct' : 'Connecté'}</span>
          {lastUpdate && (
            <span className="text-muted-foreground ml-1">
              • {lastUpdate.toLocaleTimeString('fr-FR')}
            </span>
          )}
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
