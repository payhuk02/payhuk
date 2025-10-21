import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAppStore } from '../store/useAppStore';
import { useNotification } from '../components/ui/NotificationContainer';
import { envConfig } from '@/lib/env-validator';

const supabase = createClient(
  envConfig.VITE_SUPABASE_URL,
  envConfig.VITE_SUPABASE_PUBLISHABLE_KEY
);

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'admin' | 'vendor' | 'customer';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: {
    user: {
      id: string;
      email: string;
      user_metadata: Record<string, unknown>;
      email_confirmed_at: string | null;
      created_at: string;
    };
    access_token: string;
    refresh_token: string;
  } | null;
}

export const useAuth = () => {
  const { showSuccess, showError } = useNotification();
  const setUser = useAppStore(state => state.setUser);
  const setLoading = useAppStore(state => state.setLoading);
  const logout = useAppStore(state => state.logout);

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    session: null
  });

  // Écouter les changements d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session?.user) {
          try {
            // Créer l'utilisateur avec les données de base de Supabase Auth
            const user: AuthUser = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
              avatar: session.user.user_metadata?.avatar_url,
              role: session.user.user_metadata?.role || 'customer',
              isVerified: session.user.email_confirmed_at ? true : false,
              createdAt: session.user.created_at,
              updatedAt: new Date().toISOString()
            };

            // Essayer de récupérer le profil depuis la base de données (optionnel)
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (!error && profile) {
                // Mettre à jour avec les données du profil si disponible
                user.name = profile.name || user.name;
                user.avatar = profile.avatar_url || user.avatar;
                user.role = profile.role || user.role;
                user.createdAt = profile.created_at || user.createdAt;
                user.updatedAt = profile.updated_at || user.updatedAt;
              } else if (error && error.code === 'PGRST116') {
                // Profil n'existe pas, essayer de le créer
                console.log('Profile not found, creating new profile...');
                try {
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                      id: session.user.id,
                      name: user.name,
                      email: user.email,
                      avatar_url: user.avatar,
                      role: user.role,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                  if (!createError && newProfile) {
                    console.log('Profile created successfully:', newProfile);
                    user.createdAt = newProfile.created_at;
                    user.updatedAt = newProfile.updated_at;
                  } else {
                    console.warn('Failed to create profile:', createError);
                  }
                } catch (createError) {
                  console.warn('Profile creation failed:', createError);
                }
              } else {
                console.warn('Profile fetch error:', error.message);
              }
            } catch (profileError) {
              console.warn('Profile fetch failed, using auth data:', profileError);
            }

            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true,
              session
            });

            setUser(user);
            showSuccess('Connexion réussie', `Bienvenue ${user.name}!`);
          } catch (error) {
            console.error('Error processing auth state:', error);
            showError('Erreur d\'authentification', 'Une erreur est survenue lors de la connexion');
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            session: null
          });
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, showSuccess, showError]);

  // Connexion avec email et mot de passe
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de se connecter';
      showError('Erreur de connexion', errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Inscription avec email et mot de passe
  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user && !data.user.email_confirmed_at) {
        showSuccess('Inscription réussie', 'Vérifiez votre email pour confirmer votre compte');
      }

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de créer le compte';
      showError('Erreur d\'inscription', errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de se connecter avec Google';
      showError('Erreur Google', errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec GitHub
  const signInWithGitHub = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error: unknown) {
      console.error('GitHub sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de se connecter avec GitHub';
      showError('Erreur GitHub', errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      logout();
      showSuccess('Déconnexion réussie', 'Vous avez été déconnecté avec succès');
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de se déconnecter';
      showError('Erreur de déconnexion', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation de mot de passe
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        throw error;
      }

      showSuccess('Email envoyé', 'Vérifiez votre email pour réinitialiser votre mot de passe');
      return { data, error: null };
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible d\'envoyer l\'email';
      showError('Erreur de réinitialisation', errorMessage);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du profil
  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      if (!authState.user) {
        throw new Error('Utilisateur non connecté');
      }

      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      const updatedUser = { ...authState.user, ...updates };
      setAuthState(prev => ({ ...prev, user: updatedUser }));
      setUser(updatedUser);

      showSuccess('Profil mis à jour', 'Votre profil a été modifié avec succès');
      return { error: null };
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Impossible de mettre à jour le profil';
      showError('Erreur de mise à jour', errorMessage);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    
    const rolePermissions = {
      admin: ['*'], // Admin a tous les droits
      vendor: ['read:products', 'write:products', 'read:orders', 'write:orders', 'read:customers'],
      customer: ['read:products', 'read:orders']
    };

    const userPermissions = rolePermissions[authState.user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  // Vérifier le rôle
  const hasRole = (role: string | string[]): boolean => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(authState.user.role);
  };

  return {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    resetPassword,
    updateProfile,
    hasPermission,
    hasRole
  };
};
