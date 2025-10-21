import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Calendar,
  Filter,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationContainer';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportDataProps {
  onClose: () => void;
}

const ExportData: React.FC<ExportDataProps> = ({ onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedData, setSelectedData] = useState<string[]>(['all']);

  const exportOptions = [
    { value: 'csv', label: 'CSV', description: 'Données tabulaires pour Excel', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: 'json', label: 'JSON', description: 'Données structurées pour développeurs', icon: <FileText className="h-4 w-4" /> },
    { value: 'pdf', label: 'PDF', description: 'Rapport formaté pour impression', icon: <FileImage className="h-4 w-4" /> }
  ];

  const dataTypes = [
    { value: 'all', label: 'Toutes les données' },
    { value: 'orders', label: 'Commandes' },
    { value: 'products', label: 'Produits' },
    { value: 'customers', label: 'Clients' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'revenue', label: 'Revenus' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulation de l'export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Créer un fichier de démonstration
      const data = {
        format: selectedFormat,
        period: selectedPeriod,
        dataTypes: selectedData,
        timestamp: new Date().toISOString(),
        message: 'Données exportées avec succès'
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      switch (selectedFormat) {
        case 'csv':
          content = 'Date,Revenus,Commandes,Clients\n2024-01-01,0,0,0\n2024-01-02,0,0,0';
          filename = `dashboard-data-${selectedPeriod}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(data, null, 2);
          filename = `dashboard-data-${selectedPeriod}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          content = 'PDF content would be generated here';
          filename = `dashboard-report-${selectedPeriod}.pdf`;
          mimeType = 'application/pdf';
          break;
        default:
          throw new Error('Format non supporté');
      }

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess('Export réussi', `Données exportées en ${selectedFormat.toUpperCase()}`);
      onClose();
    } catch (error) {
      showError('Erreur d\'export', 'Une erreur est survenue lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exporter les données
              </CardTitle>
              <CardDescription>
                Téléchargez vos données du tableau de bord dans différents formats
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Format d'export */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Format d'export</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {exportOptions.map((option) => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={selectedFormat === option.value ? 'default' : 'outline'}
                      className="w-full h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => setSelectedFormat(option.value as any)}
                    >
                      {option.icon}
                      <div className="text-center">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Période */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Période</label>
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                  <SelectItem value="90d">3 derniers mois</SelectItem>
                  <SelectItem value="1y">Dernière année</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Types de données */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Données à inclure</label>
              <div className="grid grid-cols-2 gap-2">
                {dataTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedData.includes(type.value) ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start"
                    onClick={() => {
                      if (type.value === 'all') {
                        setSelectedData(['all']);
                      } else {
                        setSelectedData(prev => 
                          prev.includes('all') 
                            ? [type.value]
                            : prev.includes(type.value)
                              ? prev.filter(d => d !== type.value)
                              : [...prev, type.value]
                        );
                      }
                    }}
                  >
                    {selectedData.includes(type.value) && (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Résumé de l'export */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                Résumé de l'export
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Format: {selectedFormat.toUpperCase()}</div>
                <div>• Période: {selectedPeriod}</div>
                <div>• Données: {selectedData.length === 1 && selectedData[0] === 'all' ? 'Toutes' : selectedData.join(', ')}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="min-w-[120px]"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Export...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ExportData;