import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  Table, 
  BarChart3,
  Calendar,
  Filter,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStore } from "@/hooks/useStore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ExportDataProps {
  onClose?: () => void;
}

export const ExportData = ({ onClose }: ExportDataProps) => {
  const { stats } = useDashboardStats();
  const { store } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportFormat('pdf');
    
    try {
      // Import dynamique pour éviter les erreurs SSR
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      const doc = new jsPDF();
      
      // Titre
      doc.setFontSize(20);
      doc.text(`Rapport de Performance - ${store?.name || 'Boutique'}`, 20, 20);
      
      // Date
      doc.setFontSize(12);
      doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 30);
      
      // Statistiques principales
      doc.setFontSize(16);
      doc.text('Statistiques Principales', 20, 50);
      
      doc.setFontSize(12);
      doc.text(`Revenus totaux: ${formatCurrency(stats.totalRevenue)}`, 20, 65);
      doc.text(`Commandes totales: ${formatNumber(stats.totalOrders)}`, 20, 75);
      doc.text(`Clients: ${formatNumber(stats.totalCustomers)}`, 20, 85);
      doc.text(`Produits: ${formatNumber(stats.totalProducts)}`, 20, 95);
      
      // Métriques de performance
      doc.setFontSize(16);
      doc.text('Métriques de Performance', 20, 115);
      
      const conversionRate = stats.totalCustomers > 0 ? (stats.totalOrders / stats.totalCustomers) * 100 : 0;
      const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
      
      doc.setFontSize(12);
      doc.text(`Taux de conversion: ${conversionRate.toFixed(1)}%`, 20, 130);
      doc.text(`Panier moyen: ${formatCurrency(averageOrderValue)}`, 20, 140);
      doc.text(`Produits actifs: ${stats.activeProducts}/${stats.totalProducts}`, 20, 150);
      
      // Sauvegarder le PDF
      doc.save(`rapport-performance-${store?.name || 'boutique'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    setExportFormat('excel');
    
    try {
      // Import dynamique
      const XLSX = await import('xlsx');
      
      // Préparer les données
      const workbook = XLSX.utils.book_new();
      
      // Feuille des statistiques principales
      const statsData = [
        ['Métrique', 'Valeur'],
        ['Revenus totaux', stats.totalRevenue],
        ['Commandes totales', stats.totalOrders],
        ['Clients', stats.totalCustomers],
        ['Produits', stats.totalProducts],
        ['Produits actifs', stats.activeProducts],
        ['Commandes en attente', stats.pendingOrders],
      ];
      
      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
      
      // Feuille des revenus par mois
      const revenueData = [
        ['Mois', 'Revenus'],
        ...stats.revenueByMonth.map(item => [item.month, item.revenue])
      ];
      
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenus par mois');
      
      // Feuille des commandes récentes
      const ordersData = [
        ['ID', 'Date', 'Montant', 'Statut'],
        ...stats.recentOrders.map(order => [
          order.id,
          format(new Date(order.created_at), 'dd/MM/yyyy', { locale: fr }),
          order.total_amount,
          order.status
        ])
      ];
      
      const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Commandes récentes');
      
      // Feuille des produits populaires
      const productsData = [
        ['Nom', 'Prix', 'Ventes', 'Catégorie'],
        ...stats.topProducts.map(product => [
          product.name,
          product.price,
          product.sales_count || 0,
          product.category || 'Non catégorisé'
        ])
      ];
      
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Produits populaires');
      
      // Sauvegarder le fichier Excel
      XLSX.writeFile(workbook, `rapport-performance-${store?.name || 'boutique'}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const exportOptions = [
    {
      title: "Rapport PDF",
      description: "Rapport complet avec graphiques et métriques",
      icon: FileText,
      format: 'pdf' as const,
      color: "bg-red-500 hover:bg-red-600",
      onClick: exportToPDF
    },
    {
      title: "Données Excel",
      description: "Feuilles de calcul avec toutes les données",
      icon: Table,
      format: 'excel' as const,
      color: "bg-green-500 hover:bg-green-600",
      onClick: exportToExcel
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exporter les données
        </CardTitle>
        <CardDescription>
          Téléchargez vos données de performance dans différents formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Options d'export */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map((option, index) => (
            <Button
              key={index}
              className={`w-full justify-start h-auto p-4 text-white ${option.color}`}
              onClick={option.onClick}
              disabled={isExporting}
            >
              <div className="flex items-center space-x-3">
                {isExporting && exportFormat === option.format ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <option.icon className="h-5 w-5" />
                )}
                <div className="text-left">
                  <div className="font-medium">{option.title}</div>
                  <div className="text-sm opacity-90">
                    {option.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Informations sur les données */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Données incluses
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Statistiques principales</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Revenus par mois</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Commandes récentes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Produits populaires</span>
            </div>
          </div>
        </div>

        {/* Période de données */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Période:</span>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Dernières données
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
