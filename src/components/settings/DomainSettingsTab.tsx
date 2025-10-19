import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDomainManagement, DomainStatus } from '@/hooks/useDomainManagement';
import { 
  Loader2, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Link as LinkIcon, 
  Edit, 
  Copy, 
  ExternalLink,
  Shield,
  Clock,
  AlertTriangle,
  Info,
  Settings,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DomainSettingsTabProps {
  storeId?: string;
}

export const DomainSettingsTab: React.FC<DomainSettingsTabProps> = ({ storeId }) => {
  const { toast } = useToast();
  const {
    domain,
    status,
    dnsRecords,
    loading,
    error,
    connectDomain,
    disconnectDomain,
    checkDomainStatus,
    refreshDomain,
    getDomainUrl,
    getSSLInfo,
  } = useDomainManagement(storeId);

  const [inputDomain, setInputDomain] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (domain) {
      setInputDomain(domain.domain_name);
    }
  }, [domain]);

  const handleConnect = async () => {
    if (!inputDomain.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un nom de domaine.',
        variant: 'destructive',
      });
      return;
    }
    await connectDomain(inputDomain);
    setIsEditing(false);
  };

  const handleDisconnect = async () => {
    if (domain && window.confirm(`Êtes-vous sûr de vouloir déconnecter le domaine "${domain.domain_name}" ?`)) {
      await disconnectDomain(domain.id);
      setInputDomain('');
      setIsEditing(false);
    }
  };

  const handleCopyDNSRecord = (record: any) => {
    const recordText = `${record.type} ${record.name} ${record.value} ${record.ttl || 3600}`;
    navigator.clipboard.writeText(recordText);
    toast({
      title: 'Copié !',
      description: 'Enregistrement DNS copié dans le presse-papiers.',
    });
  };

  const renderStatusBadge = (currentStatus: DomainStatus) => {
    const statusConfig = {
      active: { 
        variant: 'default' as const, 
        className: 'bg-green-500 text-white', 
        icon: CheckCircle2, 
        text: 'Actif' 
      },
      pending_dns: { 
        variant: 'secondary' as const, 
        className: 'bg-yellow-500 text-white', 
        icon: Clock, 
        text: 'En attente DNS' 
      },
      pending_ssl: { 
        variant: 'secondary' as const, 
        className: 'bg-blue-500 text-white', 
        icon: Shield, 
        text: 'SSL en cours' 
      },
      error: { 
        variant: 'destructive' as const, 
        className: 'bg-red-500 text-white', 
        icon: XCircle, 
        text: 'Erreur' 
      },
      disconnected: { 
        variant: 'outline' as const, 
        className: 'bg-gray-500 text-white', 
        icon: XCircle, 
        text: 'Déconnecté' 
      },
      not_configured: { 
        variant: 'outline' as const, 
        className: 'bg-gray-400 text-white', 
        icon: AlertTriangle, 
        text: 'Non configuré' 
      },
    };

    const config = statusConfig[currentStatus] || statusConfig.not_configured;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const renderSSLInfo = () => {
    const sslInfo = getSSLInfo();
    if (!sslInfo) return null;

    const sslStatusConfig = {
      issued: { color: 'text-green-500', icon: CheckCircle2, text: 'Certificat SSL valide' },
      pending: { color: 'text-yellow-500', icon: Clock, text: 'Certificat SSL en cours' },
      error: { color: 'text-red-500', icon: XCircle, text: 'Erreur certificat SSL' },
      expired: { color: 'text-red-500', icon: XCircle, text: 'Certificat SSL expiré' },
    };

    const config = sslStatusConfig[sslInfo.status] || sslStatusConfig.pending;
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2 text-sm">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={config.color}>{config.text}</span>
        {sslInfo.expiresAt && (
          <span className="text-muted-foreground">
            (Expire le {format(new Date(sslInfo.expiresAt), 'dd MMM yyyy', { locale: fr })})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nom de domaine personnalisé
          </CardTitle>
          <CardDescription>
            Connectez votre propre domaine à votre boutique pour une image professionnelle et une meilleure crédibilité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Statut actuel */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-semibold">Statut actuel du domaine</h4>
              {domain && (
                <p className="text-sm text-muted-foreground">
                  {domain.domain_name}
                </p>
              )}
            </div>
            {renderStatusBadge(status)}
          </div>

          <Separator />

          {/* Configuration du domaine */}
          <div className="space-y-4">
            <Label htmlFor="domain-name">Nom de domaine</Label>
            <div className="flex gap-2">
              <Input
                id="domain-name"
                placeholder="ex: maboutique.com"
                value={inputDomain}
                onChange={(e) => setInputDomain(e.target.value)}
                disabled={loading || (!isEditing && domain?.status === 'active')}
                className="flex-grow"
              />
              {domain && domain.status === 'active' && !isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)} disabled={loading}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              ) : (
                <Button onClick={handleConnect} disabled={loading || !inputDomain.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <LinkIcon className="h-4 w-4 mr-2" />
                  )}
                  {domain ? 'Mettre à jour' : 'Connecter'}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Entrez votre nom de domaine (ex: maboutique.com ou boutique.monsite.com)
            </p>
          </div>

          {/* Informations SSL */}
          {domain && renderSSLInfo()}

          {/* Actions pour domaine actif */}
          {domain && domain.status === 'active' && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.open(getDomainUrl(), '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visiter le site
              </Button>
              <Button variant="outline" onClick={refreshDomain} disabled={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Déconnecter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onglets pour les fonctionnalités avancées */}
      {domain && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="dns">Configuration DNS</TabsTrigger>
            <TabsTrigger value="ssl">Sécurité SSL</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Informations du domaine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom de domaine</Label>
                    <p className="text-sm text-muted-foreground">{domain.domain_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Statut</Label>
                    <div className="mt-1">{renderStatusBadge(domain.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Méthode de vérification</Label>
                    <p className="text-sm text-muted-foreground capitalize">
                      {domain.verification_method || 'DNS'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dernière vérification</Label>
                    <p className="text-sm text-muted-foreground">
                      {domain.last_checked_at 
                        ? format(new Date(domain.last_checked_at), 'dd MMM yyyy HH:mm', { locale: fr })
                        : 'Jamais'
                      }
                    </p>
                  </div>
                </div>
                
                {domain.error_message && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Message d'erreur</AlertTitle>
                    <AlertDescription>{domain.error_message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration DNS */}
          <TabsContent value="dns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration DNS
                </CardTitle>
                <CardDescription>
                  Ajoutez ces enregistrements DNS chez votre registrar de domaine pour activer votre domaine.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dnsRecords.length > 0 ? (
                  <div className="space-y-3">
                    {dnsRecords.map((record, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{record.type}</Badge>
                            <span className="font-mono text-sm">{record.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyDNSRecord(record)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="font-mono text-sm bg-muted p-2 rounded">
                          {record.value}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>TTL: {record.ttl || 3600}</span>
                          {record.priority && <span>Priorité: {record.priority}</span>}
                        </div>
                      </div>
                    ))}
                    
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Instructions</AlertTitle>
                      <AlertDescription className="space-y-2">
                        <p>1. Connectez-vous à votre registrar de domaine (ex: GoDaddy, Namecheap, OVH)</p>
                        <p>2. Accédez à la section de gestion DNS</p>
                        <p>3. Ajoutez chaque enregistrement ci-dessus</p>
                        <p>4. Attendez la propagation DNS (peut prendre jusqu'à 24h)</p>
                        <p>5. Cliquez sur "Vérifier le statut" pour valider la configuration</p>
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button onClick={() => checkDomainStatus(domain.id)} disabled={loading}>
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Vérifier le statut DNS
                      </Button>
                      <Button variant="outline" onClick={refreshDomain} disabled={loading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualiser
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun enregistrement DNS disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité SSL */}
          <TabsContent value="ssl" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sécurité SSL
                </CardTitle>
                <CardDescription>
                  Gestion des certificats SSL pour sécuriser votre domaine.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Statut du certificat</Label>
                      <div className="mt-1">{renderSSLInfo()}</div>
                    </div>
                    <Button variant="outline" onClick={refreshDomain} disabled={loading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                  </div>

                  {domain.ssl_certificate_id && (
                    <div>
                      <Label className="text-sm font-medium">ID du certificat</Label>
                      <p className="text-sm text-muted-foreground font-mono">
                        {domain.ssl_certificate_id}
                      </p>
                    </div>
                  )}

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle>Certificat SSL automatique</AlertTitle>
                    <AlertDescription>
                      Votre certificat SSL est automatiquement généré et renouvelé par notre système. 
                      Aucune action de votre part n'est requise.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
