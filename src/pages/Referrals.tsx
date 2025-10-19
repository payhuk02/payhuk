import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UserPlus, 
  Copy, 
  Check, 
  ArrowLeft, 
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Target,
  Share2,
  QrCode,
  BarChart3,
  History,
  Settings,
  RefreshCw
} from "lucide-react";
import { useAdvancedReferral } from "@/hooks/useAdvancedReferral";
import { useReferralSimple } from "@/hooks/useReferralSimple";
import { useReferralUltraSimple } from "@/hooks/useReferralUltraSimple";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/ui/LoadingStates";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import QRCodeGenerator from "@/components/referral/QRCodeGenerator";
import SocialShare from "@/components/referral/SocialShare";
import ReferralDashboard from "@/components/referral/ReferralDashboard";
import CommissionHistory from "@/components/referral/CommissionHistory";

/**
 * Page de parrainage complètement fonctionnelle avec fonctionnalités avancées
 * Inclut : statistiques, partage, QR codes, tableau de bord des filleuls, historique
 */
const Referrals = () => {
  // Utiliser le hook ultra-simple qui évite toutes les erreurs de base de données
  const { 
    data: ultraData, 
    loading: ultraLoading,
    refetch,
    referrals,
    history,
    levels
  } = useReferralUltraSimple();
  
  // Hook de fallback en cas d'erreur
  const { data: simpleData, loading: simpleLoading } = useReferralSimple();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const copyToClipboard = async () => {
    if (!currentStats?.referralLink) return;

    try {
      await navigator.clipboard.writeText(currentStats.referralLink);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien de parrainage a été copié dans votre presse-papier.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien.",
        variant: "destructive",
      });
    }
  };

  const getCurrentLevel = () => {
    return levels.find(level => level.name === currentStats?.level) || levels[0];
  };

  const getNextLevel = () => {
    const currentIndex = levels.findIndex(level => level.name === currentStats?.level);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  // Utiliser les données ultra-simples en priorité
  const currentStats = ultraData || (simpleData ? {
    referralCode: simpleData.referralCode,
    referralLink: simpleData.referralLink,
    totalReferrals: simpleData.totalReferrals,
    activeReferrals: simpleData.totalReferrals,
    totalEarnings: simpleData.totalEarnings,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    conversionRate: 0,
    rank: 1,
    level: 'Débutant',
    nextLevelReferrals: 5,
    nextLevelEarnings: 50000,
  } : null);

  const currentReferrals = referrals || [];
  const currentHistory = history || [];
  const currentLoading = ultraLoading || simpleLoading;

  if (currentLoading) {
    return (
      <div className="container mx-auto p-6">
        <LoadingState state="loading" message="Chargement de vos données de parrainage..." />
      </div>
    );
  }

  if (!currentStats) {
    return (
      <div className="container mx-auto p-6">
        <LoadingState 
          state="empty" 
          message="Aucune donnée de parrainage disponible" 
        />
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();

  return (
    <ErrorBoundary>
    <div className="container mx-auto p-6 space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-primary" />
            <div>
          <h1 className="text-3xl font-bold">Programme de parrainage</h1>
              <p className="text-muted-foreground">Gagnez des commissions en parrainant vos amis</p>
            </div>
        </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Filleuls actifs</p>
                  <p className="text-2xl font-bold">{currentStats.activeReferrals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gains totaux</p>
                  <p className="text-2xl font-bold text-green-600">{currentStats.totalEarnings.toLocaleString()} XOF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux de conversion</p>
                  <p className="text-2xl font-bold text-blue-600">{currentStats.conversionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau actuel</p>
                  <p className="text-2xl font-bold text-purple-600">{currentStats.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets principaux */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Users className="h-4 w-4" />
              Mes filleuls
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="share" className="gap-2">
              <Share2 className="h-4 w-4" />
              Partager
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
      {/* Lien de parrainage */}
      <Card className="border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Votre lien de parrainage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
                  Partagez ce lien unique et gagnez {currentLevel.commissionRate}% de commission sur chaque vente réalisée par vos filleuls.
          </p>
          
                <div className="flex gap-2">
                  <div className="flex-1">
              <input
                type="text"
                      value={currentStats.referralLink}
                readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
            </div>
                  <Button onClick={copyToClipboard} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copié !' : 'Copier le lien'}
            </Button>
                  <QRCodeGenerator 
                    referralLink={currentStats.referralLink}
                    referralCode={currentStats.referralCode}
                  />
          </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{currentStats.totalReferrals}</p>
                    <p className="text-sm text-muted-foreground">Filleuls totaux</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{currentStats.activeReferrals}</p>
              <p className="text-sm text-muted-foreground">Filleuls actifs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentStats.monthlyEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Gains ce mois</p>
            </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">#{currentStats.rank}</p>
                    <p className="text-sm text-muted-foreground">Votre rang</p>
            </div>
          </div>
        </CardContent>
      </Card>

            {/* Niveau et progression */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Votre niveau de parrainage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{currentLevel.name}</h3>
                    <p className="text-muted-foreground">
                      Commission: {currentLevel.commissionRate}% • Rang #{currentStats.rank}
                    </p>
                  </div>
                  <Badge className={`${currentLevel.color} px-3 py-1`}>
                    {currentLevel.name}
                  </Badge>
                </div>

                {nextLevel && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression vers {nextLevel.name}</span>
                      <span>
                        {currentStats.totalReferrals}/{nextLevel.minReferrals} filleuls • 
                        {currentStats.totalEarnings.toLocaleString()}/{nextLevel.minEarnings.toLocaleString()} XOF
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(
                            (currentStats.totalReferrals / nextLevel.minReferrals) * 100, 
                            100
                          )}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Il vous reste {currentStats.nextLevelReferrals} filleuls et {currentStats.nextLevelEarnings.toLocaleString()} XOF pour atteindre le niveau {nextLevel.name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-semibold mb-2">Avantages actuels</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {currentLevel.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {nextLevel && (
                    <div>
                      <h4 className="font-semibold mb-2">Avantages du niveau suivant</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {nextLevel.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comment ça marche */}
      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Partagez votre lien</h3>
                <p className="text-sm text-muted-foreground">
                  Envoyez votre lien de parrainage à vos amis, sur les réseaux sociaux ou par email.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Vos filleuls s'inscrivent</h3>
                <p className="text-sm text-muted-foreground">
                  Chaque personne qui s'inscrit via votre lien devient automatiquement votre filleul.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div>
                      <h3 className="font-semibold">Gagnez {currentLevel.commissionRate}% de commission</h3>
                <p className="text-sm text-muted-foreground">
                        À chaque vente réalisée par vos filleuls, vous recevez automatiquement {currentLevel.commissionRate}% du montant.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
          </TabsContent>

          {/* Mes filleuls */}
          <TabsContent value="referrals">
            <ReferralDashboard referrals={currentReferrals} loading={currentLoading} />
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history">
            <CommissionHistory history={currentHistory} loading={currentLoading} />
          </TabsContent>

          {/* Partager */}
          <TabsContent value="share">
            <div className="space-y-6">
              <SocialShare 
                referralLink={currentStats.referralLink}
                referralCode={currentStats.referralCode}
                onShare={(platform) => {
                  console.log(`Shared on ${platform}`);
                }}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code de parrainage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Générez un QR code personnalisé pour faciliter le partage de votre lien de parrainage.
                  </p>
                  <QRCodeGenerator 
                    referralLink={currentStats.referralLink}
                    referralCode={currentStats.referralCode}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
    </ErrorBoundary>
  );
};

export default Referrals;