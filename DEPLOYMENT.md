# 🚀 Guide de Déploiement - Système de Paiements Avancé Payhuk

## 📋 Prérequis

- Node.js 18+ installé
- Compte Supabase configuré
- Compte Vercel pour le déploiement
- Accès à la base de données PostgreSQL

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS
ALLOWED_ORIGIN=https://payhuk.com

# Moneroo (si utilisé)
MONEROO_API_KEY=your_moneroo_api_key
MONEROO_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Configuration Supabase

#### A. Appliquer les migrations

```bash
# Appliquer toutes les migrations
supabase db push

# Ou appliquer individuellement
supabase db push --file supabase/migrations/20250120000003_create_payment_system.sql
supabase db push --file supabase/migrations/20250120000004_create_messaging_system.sql
supabase db push --file supabase/migrations/20250120000005_create_dispute_system.sql
```

#### B. Configurer le stockage

```sql
-- Créer les buckets pour les fichiers
INSERT INTO storage.buckets (id, name, public) VALUES 
('message-files', 'message-files', true),
('dispute-evidence', 'dispute-evidence', true);

-- Configurer les politiques RLS pour le stockage
CREATE POLICY "Users can upload message files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-files' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view message files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-files' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can upload dispute evidence" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'dispute-evidence' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "Users can view dispute evidence" ON storage.objects
FOR SELECT USING (
  bucket_id = 'dispute-evidence' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

#### C. Déployer les Edge Functions

```bash
# Déployer la fonction de paiement
supabase functions deploy payment-system

# Déployer la fonction Moneroo (si nécessaire)
supabase functions deploy moneroo
supabase functions deploy moneroo-webhook
```

### 3. Configuration Vercel

#### A. Variables d'environnement Vercel

Configurez les variables suivantes dans Vercel :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN`

#### B. Configuration du build

Le fichier `vite.config.ts` est déjà configuré pour la production.

## 🚀 Déploiement

### 1. Déploiement automatique

```bash
# Push vers GitHub (déploiement automatique via Vercel)
git add .
git commit -m "feat: Système de paiements avancé complet"
git push origin main
```

### 2. Déploiement manuel

```bash
# Build local
npm run build

# Déployer sur Vercel
vercel --prod
```

## ✅ Vérification du déploiement

### 1. Tests fonctionnels

- [ ] Page de paiement accessible
- [ ] Création de paiement partiel fonctionnelle
- [ ] Création de paiement escrow fonctionnelle
- [ ] Messagerie opérationnelle
- [ ] Système de litiges fonctionnel
- [ ] Notifications actives

### 2. Tests de sécurité

- [ ] RLS activé sur toutes les tables
- [ ] CORS configuré correctement
- [ ] Variables d'environnement sécurisées
- [ ] Authentification requise pour toutes les actions

### 3. Tests de performance

- [ ] Temps de chargement < 3s
- [ ] Images optimisées
- [ ] Bundle size < 1MB
- [ ] Requêtes optimisées

## 🔍 Monitoring

### 1. Logs Supabase

Surveillez les logs dans le dashboard Supabase :
- Edge Functions logs
- Database logs
- Auth logs

### 2. Métriques Vercel

Surveillez les métriques dans Vercel :
- Performance
- Erreurs
- Bandwidth

### 3. Alertes

Configurez des alertes pour :
- Erreurs de paiement
- Litiges ouverts
- Problèmes de performance

## 🛠️ Maintenance

### 1. Sauvegardes

```bash
# Sauvegarde de la base de données
supabase db dump --file backup_$(date +%Y%m%d).sql
```

### 2. Mises à jour

```bash
# Mettre à jour les dépendances
npm update

# Appliquer les nouvelles migrations
supabase db push
```

### 3. Nettoyage

```bash
# Nettoyer les anciennes notifications
# (Script à exécuter périodiquement)
```

## 🚨 Dépannage

### Problèmes courants

1. **Erreur CORS**
   - Vérifier `ALLOWED_ORIGIN`
   - Vérifier les headers CORS dans les Edge Functions

2. **Erreur RLS**
   - Vérifier les politiques RLS
   - Vérifier l'authentification utilisateur

3. **Erreur de stockage**
   - Vérifier les buckets créés
   - Vérifier les politiques de stockage

4. **Erreur de paiement**
   - Vérifier la configuration Moneroo
   - Vérifier les webhooks

### Logs utiles

```bash
# Logs Supabase
supabase functions logs payment-system

# Logs Vercel
vercel logs
```

## 📞 Support

En cas de problème :
1. Vérifier les logs
2. Consulter la documentation Supabase
3. Contacter l'équipe de développement

---

**🎉 Félicitations ! Votre système de paiements avancé est maintenant déployé et opérationnel !**
