# MATC Admin Panel

Panneau d'administration pour la plateforme MATC développé avec React + TypeScript + Tailwind CSS.

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Le serveur de développement sera accessible sur `http://localhost:8536`

### Build de Production

```bash
npm run build
```

## 🔐 Authentification

**Identifiants de démonstration :**
- Email: `admin@matc.com`
- Mot de passe: `admin123`

## 📁 Structure du Projet

```
src/
├── components/
│   ├── common/          # Composants réutilisables
│   └── layout/          # Composants de mise en page
├── config/
│   └── routes.ts        # Configuration des routes
├── context/
│   └── AuthContext.tsx  # Contexte d'authentification
├── pages/               # Pages de l'application
├── types/               # Types TypeScript
└── App.tsx              # Composant principal
```

## 🎯 Fonctionnalités

### ✅ Implémentées
- **Authentification** : Système de connexion sécurisé
- **Dashboard** : Vue d'ensemble avec statistiques
- **Gestion des Programmes** : CRUD complet avec filtres
- **Gestion des Packs** : Interface de gestion des packs
- **Gestion des Témoignages** : Modération des témoignages
- **Gestion des Sessions** : Planification des sessions
- **Gestion des Utilisateurs** : Administration des utilisateurs
- **Pages Statiques** : Édition du contenu statique
- **Paramètres** : Configuration du site

### 🔄 Architecture Backend Ready
- Types TypeScript complets pour l'API
- Services d'authentification modulaires
- Structure prête pour intégration REST/GraphQL
- Gestion d'état centralisée

## 🛠️ Technologies

- **React 18** - Framework frontend
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **React Router** - Routing
- **Heroicons** - Icônes
- **Vite** - Build tool

## 📚 Pages Disponibles

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Vue d'ensemble |
| `/programs` | Programmes | Gestion des formations |
| `/packs` | Packs | Gestion des packs |
| `/testimonials` | Témoignages | Modération |
| `/sessions` | Sessions | Planification |
| `/users` | Utilisateurs | Administration |
| `/static-pages` | Pages Statiques | Gestion contenu |
| `/settings` | Paramètres | Configuration |

## 🔧 Configuration

### Port de Développement
Le projet est configuré pour démarrer sur le port `8536` pour éviter les conflits avec le site principal.

### Variables d'Environnement
Créez un fichier `.env` pour vos variables d'environnement :

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MATC Admin Panel
```

## 🚀 Déploiement

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## 🔮 Prochaines Étapes

### Intégration Backend
1. Remplacer les données mock par des appels API
2. Implémenter l'authentification JWT
3. Ajouter la gestion des erreurs
4. Intégrer les uploads de fichiers

### Fonctionnalités Avancées
1. Notifications en temps réel
2. Système de permissions granulaires
3. Audit logs
4. Export/Import de données
5. Thème sombre/clair

## 📝 Notes de Développement

- Toutes les pages utilisent des données mock pour la démonstration
- L'authentification est simulée avec localStorage
- Les formulaires incluent la validation côté client
- Le design est responsive et accessible

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.
