import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  TrendingUp,
  Calendar,
  DollarSign,
  UserPlus,
  ShoppingCart,
  Award,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReferralHistory } from '@/hooks/useAdvancedReferral';

interface CommissionHistoryProps {
  history: ReferralHistory[];
  loading?: boolean;
}

/**
 * Composant d'historique des commissions avec filtres et détails
 */
export const CommissionHistory: React.FC<CommissionHistoryProps> = ({
  history,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Filtrer et trier l'historique
  const filteredHistory = history
    .filter(item => {
      const matchesSearch = 
        item.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;
        
        const itemDate = new Date(item.created_at);
        const now = new Date();
        
        switch (dateFilter) {
        case 'today': {
          return itemDate.toDateString() === now.toDateString();
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        }
        case 'month': {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return itemDate >= monthAgo;
        }
        case 'year': {
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return itemDate >= yearAgo;
        }
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'user_name':
          aValue = a.user_name;
          bValue = b.user_name;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Calculer les statistiques
  const stats = {
    total: filteredHistory.length,
    totalAmount: filteredHistory.reduce((sum, item) => sum + item.amount, 0),
    signups: filteredHistory.filter(item => item.type === 'signup').length,
    purchases: filteredHistory.filter(item => item.type === 'purchase').length,
    commissions: filteredHistory.filter(item => item.type === 'commission').length,
  };

  const getTypeInfo = (type: string) => {
    const types = {
      signup: {
        icon: UserPlus,
        label: 'Inscription',
        color: 'bg-blue-100 text-blue-800',
        description: 'Commission pour nouvelle inscription'
      },
      purchase: {
        icon: ShoppingCart,
        label: 'Achat',
        color: 'bg-green-100 text-green-800',
        description: 'Commission sur achat'
      },
      commission: {
        icon: Award,
        label: 'Commission',
        color: 'bg-purple-100 text-purple-800',
        description: 'Commission directe'
      }
    };
    
    return types[type as keyof typeof types] || types.commission;
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Type',
      'Utilisateur',
      'Email',
      'Montant',
      'Description'
    ];

    const csvData = filteredHistory.map(item => [
      format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: fr }),
      getTypeInfo(item.type).label,
      item.user_name,
      item.user_email,
      item.amount,
      item.description
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historique-commissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Montant total</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.totalAmount.toLocaleString()} XOF</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Inscriptions</span>
            </div>
            <p className="text-2xl font-bold">{stats.signups}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Achats</span>
            </div>
            <p className="text-2xl font-bold">{stats.purchases}</p>
          </CardContent>
        </Card>
      </div>

      {/* Historique principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des commissions ({filteredHistory.length})
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exporter CSV
              </Button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par utilisateur ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="signup">Inscriptions</SelectItem>
                <SelectItem value="purchase">Achats</SelectItem>
                <SelectItem value="commission">Commissions</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="amount">Montant</SelectItem>
                <SelectItem value="user_name">Utilisateur</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="gap-2"
            >
              <TrendingUp className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun historique trouvé</p>
              {searchTerm && (
                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => {
                const typeInfo = getTypeInfo(item.type);
                const isExpanded = expandedItems.has(item.id);
                
                return (
                  <Card key={item.id} className="transition-all hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${typeInfo.color}`}>
                            <typeInfo.icon className="h-4 w-4" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={typeInfo.color}>
                                {typeInfo.label}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                              </span>
                            </div>
                            
                            <p className="font-medium">{item.user_name}</p>
                            <p className="text-sm text-gray-500">{item.user_email}</p>
                            
                            {isExpanded && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{item.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +{item.amount.toLocaleString()} XOF
                            </p>
                            <p className="text-xs text-gray-500">{typeInfo.description}</p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(item.id)}
                            className="gap-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionHistory;
