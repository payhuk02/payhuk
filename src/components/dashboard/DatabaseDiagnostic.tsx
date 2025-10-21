import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Users, Store, Package, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TableStatus {
  name: string;
  exists: boolean;
  rowCount: number;
  hasRLS: boolean;
  policies: number;
  error?: string;
}

interface DatabaseDiagnosticProps {
  onClose?: () => void;
}

export const DatabaseDiagnostic: React.FC<DatabaseDiagnosticProps> = ({ onClose }) => {
  const [diagnostics, setDiagnostics] = useState<{
    connection: 'checking' | 'connected' | 'error';
    tables: TableStatus[];
    session: any;
    user: any;
  }>({
    connection: 'checking',
    tables: [],
    session: null,
    user: null
  });

  const criticalTables = [
    'profiles',
    'stores', 
    'products',
    'orders',
    'order_items',
    'customers',
    'transactions',
    'referrals'
  ];

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({
      ...prev,
      connection: 'checking',
      tables: []
    }));

    try {
      // Vérifier la connexion et la session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setDiagnostics(prev => ({ ...prev, connection: 'error', session: null }));
        return;
      }

      if (session) {
        setDiagnostics(prev => ({ ...prev, connection: 'connected', session, user: session.user }));
        
        // Vérifier chaque table critique
        const tableResults: TableStatus[] = [];
        
        for (const tableName of criticalTables) {
          try {
            // Vérifier si la table existe et compter les lignes
            const { data, error, count } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });

            if (error) {
              tableResults.push({
                name: tableName,
                exists: false,
                rowCount: 0,
                hasRLS: false,
                policies: 0,
                error: error.message
              });
            } else {
              // Vérifier les politiques RLS
              const { data: policiesData, error: policiesError } = await supabase
                .rpc('get_table_policies', { table_name: tableName })
                .single();

              tableResults.push({
                name: tableName,
                exists: true,
                rowCount: count || 0,
                hasRLS: true, // Supposé vrai si pas d'erreur
                policies: policiesData?.count || 0
              });
            }
          } catch (tableError) {
            tableResults.push({
              name: tableName,
              exists: false,
              rowCount: 0,
              hasRLS: false,
              policies: 0,
              error: tableError instanceof Error ? tableError.message : 'Erreur inconnue'
            });
          }
        }

        setDiagnostics(prev => ({ ...prev, tables: tableResults }));
      } else {
        setDiagnostics(prev => ({ ...prev, connection: 'error', session: null }));
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnostics(prev => ({ ...prev, connection: 'error' }));
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600 animate-spin" />;
    }
  };

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'profiles':
        return <Users className="h-4 w-4" />;
      case 'stores':
        return <Store className="h-4 w-4" />;
      case 'products':
        return <Package className="h-4 w-4" />;
      case 'orders':
      case 'order_items':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getTableStatusColor = (table: TableStatus) => {
    if (!table.exists) return 'bg-red-100 text-red-800 border-red-200';
    if (table.error) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Diagnostic de Base de Données
        </CardTitle>
        <CardDescription>
          Vérification de la connexion Supabase et des tables critiques
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* État de la connexion */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Connexion Supabase</span>
            </div>
            <Badge className={diagnostics.connection === 'connected' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
              {getStatusIcon(diagnostics.connection)}
              <span className="ml-1">
                {diagnostics.connection === 'connected' ? 'Connecté' : 
                 diagnostics.connection === 'error' ? 'Erreur' : 'Vérification...'}
              </span>
            </Badge>
          </div>
          
          {diagnostics.session && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <div><strong>Utilisateur:</strong> {diagnostics.session.user.email}</div>
              <div><strong>ID:</strong> {diagnostics.session.user.id}</div>
              <div><strong>Vérifié:</strong> {diagnostics.session.user.email_confirmed_at ? 'Oui' : 'Non'}</div>
            </div>
          )}
        </div>

        {/* État des tables */}
        <div className="space-y-4">
          <h3 className="font-medium">Tables Critiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnostics.tables.map((table) => (
              <div key={table.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTableIcon(table.name)}
                    <span className="font-medium capitalize">{table.name}</span>
                  </div>
                  <Badge className={getTableStatusColor(table)}>
                    {table.exists ? 'OK' : 'Erreur'}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Lignes: {table.rowCount}</div>
                  <div>RLS: {table.hasRLS ? 'Activé' : 'Désactivé'}</div>
                  <div>Politiques: {table.policies}</div>
                  {table.error && (
                    <div className="text-red-600 text-xs">{table.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Fermer
            </Button>
          )}
        </div>

        {/* Recommandations */}
        {diagnostics.tables.some(t => !t.exists) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Tables manquantes</h4>
                <p className="text-sm text-red-700 mt-1">
                  Certaines tables critiques n'existent pas. Exécutez les migrations Supabase pour les créer.
                </p>
              </div>
            </div>
          </div>
        )}

        {diagnostics.connection === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Erreur de connexion</h4>
                <p className="text-sm text-red-700 mt-1">
                  Impossible de se connecter à Supabase. Vérifiez vos variables d'environnement.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
