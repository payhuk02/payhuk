import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Database, User, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionTestProps {
  onClose?: () => void;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [tests, setTests] = useState<{
    supabaseConnection: 'pending' | 'success' | 'error';
    authSession: 'pending' | 'success' | 'error';
    profileAccess: 'pending' | 'success' | 'error';
    profileData: any;
    error: string | null;
  }>({
    supabaseConnection: 'pending',
    authSession: 'pending',
    profileAccess: 'pending',
    profileData: null,
    error: null
  });

  const runTests = async () => {
    setTests({
      supabaseConnection: 'pending',
      authSession: 'pending',
      profileAccess: 'pending',
      profileData: null,
      error: null
    });

    try {
      // Test 1: Connexion Supabase
      console.log('Test 1: Connexion Supabase...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setTests(prev => ({ ...prev, supabaseConnection: 'error', error: sessionError.message }));
        return;
      }

      setTests(prev => ({ ...prev, supabaseConnection: 'success' }));

      // Test 2: Session utilisateur
      if (session?.user) {
        console.log('Test 2: Session utilisateur...', session.user);
        setTests(prev => ({ ...prev, authSession: 'success' }));

        // Test 3: Accès au profil
        console.log('Test 3: Accès au profil...');
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Erreur profil:', profileError);
          
          // Si le profil n'existe pas, essayer de le créer
          if (profileError.code === 'PGRST116') {
            console.log('Profil non trouvé, création...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: session.user.id,
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
                email: session.user.email,
                avatar_url: session.user.user_metadata?.avatar_url,
                role: session.user.user_metadata?.role || 'customer'
              }])
              .select()
              .single();

            if (createError) {
              setTests(prev => ({ 
                ...prev, 
                profileAccess: 'error', 
                error: `Erreur création profil: ${createError.message}` 
              }));
            } else {
              setTests(prev => ({ 
                ...prev, 
                profileAccess: 'success', 
                profileData: newProfile 
              }));
            }
          } else {
            setTests(prev => ({ 
              ...prev, 
              profileAccess: 'error', 
              error: `Erreur accès profil: ${profileError.message}` 
            }));
          }
        } else {
          console.log('Profil trouvé:', profile);
          setTests(prev => ({ 
            ...prev, 
            profileAccess: 'success', 
            profileData: profile 
          }));
        }
      } else {
        setTests(prev => ({ 
          ...prev, 
          authSession: 'error', 
          error: 'Aucune session utilisateur' 
        }));
      }
    } catch (error) {
      console.error('Erreur générale:', error);
      setTests(prev => ({ 
        ...prev, 
        supabaseConnection: 'error', 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      }));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600 animate-spin" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Test de Connexion
        </CardTitle>
        <CardDescription>
          Diagnostic des problèmes de connexion et d'accès aux données
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tests */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Connexion Supabase</span>
            </div>
            <Badge className={getStatusColor(tests.supabaseConnection)}>
              {getStatusIcon(tests.supabaseConnection)}
              <span className="ml-1">
                {tests.supabaseConnection === 'success' ? 'OK' : 
                 tests.supabaseConnection === 'error' ? 'Erreur' : 'Test...'}
              </span>
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Session utilisateur</span>
            </div>
            <Badge className={getStatusColor(tests.authSession)}>
              {getStatusIcon(tests.authSession)}
              <span className="ml-1">
                {tests.authSession === 'success' ? 'OK' : 
                 tests.authSession === 'error' ? 'Erreur' : 'Test...'}
              </span>
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Accès au profil</span>
            </div>
            <Badge className={getStatusColor(tests.profileAccess)}>
              {getStatusIcon(tests.profileAccess)}
              <span className="ml-1">
                {tests.profileAccess === 'success' ? 'OK' : 
                 tests.profileAccess === 'error' ? 'Erreur' : 'Test...'}
              </span>
            </Badge>
          </div>
        </div>

        {/* Données du profil */}
        {tests.profileData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Profil utilisateur</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div><strong>Nom:</strong> {tests.profileData.name || 'Non défini'}</div>
              <div><strong>Email:</strong> {tests.profileData.email}</div>
              <div><strong>Rôle:</strong> {tests.profileData.role}</div>
              <div><strong>ID:</strong> {tests.profileData.id}</div>
            </div>
          </div>
        )}

        {/* Erreur */}
        {tests.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Erreur détectée</h4>
                <p className="text-sm text-red-700 mt-1">{tests.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={runTests} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Relancer les tests
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Fermer
            </Button>
          )}
        </div>

        {/* Instructions */}
        {tests.profileAccess === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Solution recommandée</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Exécutez le script SQL <code>fix-database-connection.sql</code> dans l'éditeur SQL de Supabase pour créer les tables et politiques manquantes.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
