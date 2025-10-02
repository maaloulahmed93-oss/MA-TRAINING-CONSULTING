# 🚀 Système Commercial Nouveau - MATC

## Vue d'ensemble

Le nouveau système commercial MATC est un système complet de gestion des commerciaux avec **3 niveaux de progression** : Apprenti → Confirmé → Partenaire Officiel.

### 🎯 Objectifs
- Motiver les commerciaux avec un système de progression claire
- Automatiser la gestion des commissions et récompenses
- Fournir des outils avancés de suivi des ventes et clients
- Sécuriser la gestion des services via un panel admin

---

## 🏗️ Architecture du Système

### Backend (Node.js + Express + MongoDB)
- **Models**: `CommercialNew.js`, `CommercialService.js`
- **Routes**: `/api/commercial-new/*`
- **Sécurité**: Code secret admin (20388542)

### Frontend (React + TypeScript + Tailwind)
- **Pages**: `EspaceCommercialNewPage.tsx`
- **Components**: Dashboard avancé avec onglets
- **Services**: API service avec gestion des sessions

### Admin Panel (React + TypeScript)
- **Pages**: `CommercialServicesPage.tsx`
- **Fonctions**: Création et assignation de services

---

## 📊 Système des 3 Niveaux

### 🥉 Niveau 1 - Apprenti
- **Condition**: Nouveau commercial
- **Avantages**:
  - 5 points par vente confirmée
  - Commission standard selon le service
- **Objectif**: Atteindre 1000 points → Niveau 2

### 🥈 Niveau 2 - Confirmé  
- **Condition**: 1000 points accumulés
- **Avantages**:
  - Gestion complète des clients
  - Suivi du chiffre d'affaires
  - Possibilité de transfert
- **Objectif**: Transférer 500€ → Niveau 3

### 🥇 Niveau 3 - Partenaire Officiel
- **Condition**: Transfert de 500€ effectué
- **Avantages**:
  - 20% de commission directe sur chaque vente
  - 5€ de cadeau automatique chaque mois
  - Statut de partenaire officiel

---

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+
- MongoDB Atlas ou local
- npm ou yarn

### 1. Backend
```bash
cd backend
npm install
npm run dev  # Port 3001
```

### 2. Frontend
```bash
npm install
npm run dev  # Port 5173
```

### 3. Admin Panel
```bash
cd admin-panel
npm install
npm run dev  # Port 8536
```

### 4. Variables d'environnement
```env
MONGODB_URI=your_mongodb_connection_string
SECRET_CODE=20388542
PORT=3001
```

---

## 🔧 Utilisation du Système

### Pour l'Administrateur

#### 1. Créer un Service
```javascript
// Via Admin Panel ou API
POST /api/commercial-new/admin/service
{
  "titre": "Formation React Avancée",
  "categorie": "Développement Web",
  "prixPublic": 1500,
  "prixCommercial": 1200,
  "commission": 150,
  "duree": "3 mois",
  "secretCode": "20388542"
}
```

#### 2. Assigner un Service à un Commercial
```javascript
POST /api/commercial-new/admin/assign-service
{
  "serviceId": "service_id",
  "partnerId": "COMM-123456",
  "secretCode": "20388542"
}
```

### Pour le Commercial

#### 1. Connexion
- URL: `http://localhost:5173/espace-commercial-new`
- ID Commercial: Format `COMM-XXXXXX`

#### 2. Dashboard
- **Onglet Dashboard**: Vue d'ensemble, progression, niveau
- **Onglet Ventes**: Gestion des ventes, ajout de nouvelles ventes
- **Onglet Clients**: Gestion des clients, suivi des prospects

#### 3. Ajouter une Vente
```javascript
POST /api/commercial-new/{partnerId}/vente
{
  "serviceId": "service_id",
  "client": "Nom du client",
  "clientEmail": "email@client.com",
  "montant": 1200,
  "methodePaiement": "Virement bancaire"
}
```

---

## 📡 API Endpoints

### Commercial Endpoints
- `POST /api/commercial-new/{partnerId}/login` - Connexion
- `GET /api/commercial-new/{partnerId}` - Données commercial
- `GET /api/commercial-new/{partnerId}/services` - Services assignés
- `POST /api/commercial-new/{partnerId}/vente` - Ajouter vente
- `POST /api/commercial-new/{partnerId}/client` - Ajouter client
- `POST /api/commercial-new/{partnerId}/transfert` - Effectuer transfert
- `GET /api/commercial-new/{partnerId}/stats` - Statistiques

### Admin Endpoints (Sécurisés)
- `POST /api/commercial-new/admin/service` - Créer service
- `POST /api/commercial-new/admin/services` - Lister services
- `POST /api/commercial-new/admin/assign-service` - Assigner service
- `POST /api/commercial-new/admin/monthly-gifts` - Distribuer cadeaux
- `POST /api/commercial-new/admin/stats` - Statistiques globales

---

## 🔒 Sécurité

### Code Secret Admin
- **Code**: `20388542`
- **Usage**: Toutes les opérations admin
- **Stockage**: Variable d'environnement en production

### Sessions
- Gestion des sessions côté client (localStorage)
- Validation des données côté serveur
- Authentification par ID commercial

### Validation
- Validation des entrées utilisateur
- Vérification des permissions par niveau
- Logs des actions importantes

---

## 🧪 Tests

### Test Manuel
Ouvrir `test-commercial-complete-system.html` dans le navigateur pour:
- Tester toutes les fonctionnalités
- Vérifier la connectivité
- Simuler un parcours complet

### Test Automatique
```bash
# Lancer tous les services puis
# Ouvrir test-commercial-complete-system.html
# Cliquer sur "Test Complet Automatique"
```

### URLs de Test
- Frontend: http://localhost:5173
- Espace Commercial: http://localhost:5173/espace-commercial-new
- Admin Panel: http://localhost:8536/commercial-services
- API Health: http://localhost:3001/api/health

---

## 📈 Fonctionnalités Avancées

### Dashboard Interactif
- **Statistiques en temps réel**: Points, CA, commission, ventes
- **Progression visuelle**: Barres de progression vers niveau suivant
- **Navigation par onglets**: Dashboard, Ventes, Clients

### Gestion des Ventes
- Formulaire d'ajout de vente avec validation
- Liste des ventes avec filtres et statuts
- Calcul automatique des commissions
- Mise à jour automatique des points

### Gestion des Clients
- Ajout de prospects avec informations complètes
- Suivi du statut (nouveau, payé, annulé, en attente)
- Calcul du potentiel de ventes
- Historique des interactions

### Système de Transfert
- Disponible au niveau 2 avec 500€ de CA
- Transfert automatique vers niveau 3
- Historique des transferts
- Validation des conditions

### Cadeaux Automatiques
- Distribution automatique mensuelle (niveau 3)
- 5€ par mois pour les partenaires
- Historique des cadeaux reçus
- Système de notification

---

## 🔄 Workflow Typique

### 1. Setup Initial (Admin)
1. Créer des services via Admin Panel
2. Créer des comptes commerciaux
3. Assigner services aux commerciaux

### 2. Utilisation Quotidienne (Commercial)
1. Connexion au dashboard
2. Ajout de nouveaux clients/prospects
3. Enregistrement des ventes
4. Suivi de la progression

### 3. Progression Automatique
1. Accumulation de points (5 par vente)
2. Passage automatique niveau 1 → 2 (1000 points)
3. Transfert manuel niveau 2 → 3 (500€)
4. Réception automatique des cadeaux mensuels

---

## 🐛 Dépannage

### Problèmes Courants

#### Backend ne démarre pas
```bash
# Vérifier MongoDB
# Vérifier les variables d'environnement
# Vérifier le port 3001
```

#### Frontend ne se connecte pas
```bash
# Vérifier que le backend est démarré
# Vérifier l'URL de l'API dans le code
# Vérifier la console du navigateur
```

#### Admin Panel - Code secret invalide
- Vérifier que le code est exactement: `20388542`
- Pas d'espaces avant/après
- Respecter la casse

#### Commercial ne peut pas se connecter
- Vérifier que l'ID commercial existe dans la base
- Format correct: `COMM-XXXXXX`
- Vérifier les logs du backend

---

## 📞 Support

### Logs Utiles
- Backend: Console du serveur Node.js
- Frontend: Console du navigateur (F12)
- MongoDB: Logs de la base de données

### Fichiers de Test
- `test-commercial-complete-system.html` - Test complet
- `test-commercial-advanced.html` - Tests avancés
- `test-commercial-simple.html` - Tests basiques

### Contact
Pour toute question technique ou support, consulter la documentation ou les fichiers de test fournis.

---

## 🚀 Prochaines Améliorations

### Version Future
- [ ] Notifications push en temps réel
- [ ] Rapports PDF automatiques
- [ ] Intégration CRM externe
- [ ] Application mobile
- [ ] Système de gamification avancé
- [ ] Analytics avancées avec graphiques
- [ ] Export des données Excel/CSV
- [ ] Système de messagerie interne

### Optimisations
- [ ] Cache Redis pour les performances
- [ ] Compression des images
- [ ] Optimisation des requêtes MongoDB
- [ ] Tests unitaires automatisés
- [ ] CI/CD Pipeline
- [ ] Monitoring et alertes

---

**© 2025 MA Training & Consulting - Système Commercial Nouveau**
