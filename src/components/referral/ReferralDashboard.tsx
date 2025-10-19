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
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReferralUser } from '@/hooks/useAdvancedReferral';

interface ReferralDashboardProps {
  referrals: ReferralUser[];
  loading?: boolean;
}

/**
 * Tableau de bord des filleuls avec filtres, recherche et statistiques
 */
export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({
  referrals,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtrer et trier les filleuls
  const filteredReferrals = referrals
    .filter(referral => {
      const matchesSearch = 
        referral.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        referral.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || referral.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'display_name':
          aValue = a.display_name;
          bValue = b.display_name;
          break;
        case 'total_orders':
          aValue = a.total_orders;
          bValue = b.total_orders;
          break;
        case 'total_spent':
          aValue = a.total_spent;
          bValue = b.total_spent;
          break;
        case 'commission_earned':
          aValue = a.commission_earned;
          bValue = b.commission_earned;
          break;
        case 'last_activity':
          aValue = new Date(a.last_activity);
          bValue = new Date(b.last_activity);
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
    total: referrals.length,
    active: referrals.filter(r => r.status === 'active').length,
    inactive: referrals.filter(r => r.status === 'inactive').length,
    pending: referrals.filter(r => r.status === 'pending').length,
    totalOrders: referrals.reduce((sum, r) => sum + r.total_orders, 0),
    totalSpent: referrals.reduce((sum, r) => sum + r.total_spent, 0),
    totalCommission: referrals.reduce((sum, r) => sum + r.commission_earned, 0),
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    
    const icons = {
      active: <UserCheck className="h-3 w-3" />,
      inactive: <UserX className="h-3 w-3" />,
      pending: <Clock className="h-3 w-3" />,
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || variants.inactive}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = [
      'Nom',
      'Email',
      'Date d\'inscription',
      'Dernière activité',
      'Statut',
      'Commandes',
      'Montant dépensé',
      'Commission gagnée'
    ];

    const csvData = filteredReferrals.map(referral => [
      referral.display_name,
      referral.email,
      format(new Date(referral.created_at), 'dd/MM/yyyy', { locale: fr }),
      format(new Date(referral.last_activity), 'dd/MM/yyyy', { locale: fr }),
      referral.status,
      referral.total_orders,
      referral.total_spent,
      referral.commission_earned
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `filleuls-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mes filleuls
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
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Actifs</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Commandes</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Commission</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.totalCommission.toLocaleString()} XOF</p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau de bord principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mes filleuls ({filteredReferrals.length})
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
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date d'inscription</SelectItem>
                <SelectItem value="display_name">Nom</SelectItem>
                <SelectItem value="total_orders">Commandes</SelectItem>
                <SelectItem value="total_spent">Montant dépensé</SelectItem>
                <SelectItem value="commission_earned">Commission</SelectItem>
                <SelectItem value="last_activity">Dernière activité</SelectItem>
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
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun filleul trouvé</p>
              {searchTerm && (
                <p className="text-sm">Essayez de modifier vos critères de recherche</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="text-right">Commandes</TableHead>
                    <TableHead className="text-right">Montant dépensé</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {referral.avatar_url ? (
                              <img
                                src={referral.avatar_url}
                                alt={referral.display_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium">
                                {referral.display_name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{referral.display_name}</p>
                            <p className="text-sm text-gray-500">{referral.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(referral.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(referral.created_at), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {format(new Date(referral.last_activity), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{referral.total_orders}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{referral.total_spent.toLocaleString()} XOF</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium text-green-600">
                          {referral.commission_earned.toLocaleString()} XOF
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralDashboard;
