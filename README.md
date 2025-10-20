# Payhuk - Plateforme E-commerce Moderne

**Payhuk** est une plateforme e-commerce complète et moderne, conçue pour offrir une expérience de vente en ligne professionnelle.

## 🚀 Fonctionnalités Principales

- **Tableau de bord avancé** avec analytics en temps réel
- **Gestion complète des produits** avec catégories et variantes
- **Système de commandes** avec suivi en temps réel
- **Gestion des clients** et historique des achats
- **Système de paiement** intégré
- **Promotions et codes de réduction**
- **Analytics et rapports** détaillés
- **Interface responsive** pour tous les appareils
- **API REST** complète pour intégrations

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Déploiement**: Vercel
- **Graphiques**: Recharts
- **Animations**: Framer Motion

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/payhuk02/payhuk.git
cd payhuk

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés Supabase

# Lancer le serveur de développement
npm run dev
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Configuration Supabase

1. Créez un projet sur [Supabase](https://supabase.com)
2. Exécutez les migrations SQL dans le dossier `supabase/migrations/`
3. Configurez les politiques RLS (Row Level Security)
4. Activez l'authentification et configurez les providers

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement sur Vercel
```

### Configuration Vercel

Le projet inclut une configuration `vercel.json` optimisée pour :
- Routage SPA (Single Page Application)
- Headers de sécurité
- Optimisation des fonctions serverless
- Gestion des assets statiques

## 📱 Fonctionnalités Mobile

- **Interface responsive** adaptée à tous les écrans
- **Menu hamburger** pour navigation mobile
- **PWA** (Progressive Web App) avec Service Worker
- **Optimisations de performance** pour mobile

## 🔒 Sécurité

- **Authentification** sécurisée avec Supabase Auth
- **RLS** (Row Level Security) pour la protection des données
- **Validation** des données côté client et serveur
- **Headers de sécurité** configurés
- **HTTPS** obligatoire en production

## 📊 Analytics et Monitoring

- **Métriques de performance** en temps réel
- **Analytics des ventes** avec graphiques interactifs
- **Suivi des conversions** et taux de rebond
- **Rapports d'export** PDF et Excel

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Supabase
- Vérifiez les logs Vercel pour le déploiement

## 🎯 Roadmap

- [ ] Système de notifications push
- [ ] Intégration avec d'autres plateformes de paiement
- [ ] API GraphQL
- [ ] Application mobile native
- [ ] Système de dropshipping
- [ ] Marketplace multi-vendeurs

---

**Payhuk** - Votre plateforme e-commerce moderne et professionnelle 🚀