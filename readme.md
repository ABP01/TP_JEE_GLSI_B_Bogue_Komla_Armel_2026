# 🚀 Guide de Démarrage EGA Bank

## 📋 Prérequis

Avant de démarrer l'application, assurez-vous d'avoir installé:

- ✅ **Java 17+** (pour le backend Spring Boot)
- ✅ **Node.js 18+** et **npm** (pour le frontend Angular)
- ✅ **PostgreSQL 14+** (base de données)
- ✅ **Maven** (inclus dans le projet via Maven Wrapper)

## 🗄️ Configuration de la base de données

### 1. Créer la base de données PostgreSQL

```sql
-- Se connecter à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE egabank;

-- Créer un utilisateur (optionnel)
CREATE USER egabank_user WITH PASSWORD 'votremotdepasse';

-- Donner les privilèges
GRANT ALL PRIVILEGES ON DATABASE egabank TO egabank_user;
```

### 2. Configuration du backend

Si vous utilisez des identifiants différents, modifiez `backend/ega-bank/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/egabank
spring.datasource.username=postgres
spring.datasource.password=root  # Changez selon vos paramètres
```

## 🔧 Installation

### Backend (Spring Boot)

```bash
cd backend/ega-bank

# Les dépendances seront téléchargées automatiquement au démarrage
# Ou pour les télécharger manuellement:
./mvnw clean install
```

### Frontend (Angular)

```bash
cd frontend/ega-bank-ui

# Installer les dépendances
npm install
```

## ▶️ Démarrage de l'application

### Option 1: Démarrage séparé (Recommandé pour le développement)

#### Terminal 1 - Backend
```bash
cd backend/ega-bank
./mvnw spring-boot:run
```

Le backend sera accessible sur: **http://localhost:8080**

Documentation Swagger: **http://localhost:8080/swagger-ui.html**

#### Terminal 2 - Frontend
```bash
cd frontend/ega-bank-ui

# Option A: Avec proxy (recommandé)
npm start -- --proxy-config proxy.conf.json

# Option B: Sans proxy
npm start
```

Le frontend sera accessible sur: **http://localhost:4200**

### Option 2: Démarrage avec scripts (Windows)

Créez deux fichiers batch:

**start-backend.bat**
```batch
@echo off
cd backend\ega-bank
call mvnw.cmd spring-boot:run
```

**start-frontend.bat**
```batch
@echo off
cd frontend\ega-bank-ui
call npm start -- --proxy-config proxy.conf.json
```

Exécutez les deux fichiers dans des terminaux séparés.

## ✅ Vérification de la connexion

### 1. Vérifier le backend

Ouvrez votre navigateur et accédez à:
- API Health: http://localhost:8080/actuator/health (si actuator est activé)
- Swagger UI: http://localhost:8080/swagger-ui.html

### 2. Tester la connexion Backend-Frontend

Accédez à la page de test:
**http://localhost:4200/connection-test**

Cette page vous permet de:
- ✅ Vérifier l'état de la connexion au backend
- ✅ Tester l'inscription et la connexion
- ✅ Tester les appels API (clients, comptes, transactions)
- 📋 Voir les logs détaillés en temps réel

### 3. Vérification manuelle avec Swagger

1. Accédez à http://localhost:8080/swagger-ui.html
2. Testez l'endpoint `/api/auth/register` pour créer un utilisateur
3. Testez l'endpoint `/api/auth/login` pour vous connecter
4. Copiez le token JWT retourné
5. Cliquez sur "Authorize" dans Swagger
6. Entrez `Bearer <votre-token>`
7. Testez les autres endpoints protégés

## 🔐 Créer un utilisateur de test

### Via Swagger UI
1. Accédez à http://localhost:8080/swagger-ui.html
2. Allez dans la section "Authentification"
3. Utilisez l'endpoint POST `/api/auth/register`:

```json
{
  "username": "admin",
  "email": "admin@egabank.com",
  "password": "admin123"
}
```

### Via cURL
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@egabank.com",
    "password": "admin123"
  }'
```

### Via l'interface Angular
1. Accédez à http://localhost:4200/register
2. Remplissez le formulaire
3. Cliquez sur "S'inscrire"

## 📁 Structure du projet

```
TP_JEE_GLSI_B_Bogue_Komla_Armel_2026/
├── backend/
│   └── ega-bank/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/ega/egabank/
│       │   │   │   ├── config/          # Configuration (Security, CORS)
│       │   │   │   ├── controller/      # REST Controllers
│       │   │   │   ├── dto/             # Data Transfer Objects
│       │   │   │   ├── entity/          # Entités JPA
│       │   │   │   ├── repository/      # Repositories JPA
│       │   │   │   ├── security/        # JWT & Security
│       │   │   │   └── service/         # Services métier
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       └── pom.xml
│
├── frontend/
│   └── ega-bank-ui/
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/
│       │   │   │   ├── guards/          # Route Guards
│       │   │   │   ├── interceptors/    # HTTP Interceptors
│       │   │   │   ├── models/          # TypeScript Interfaces
│       │   │   │   └── services/        # Services Angular
│       │   │   ├── features/
│       │   │   │   ├── auth/            # Login, Register
│       │   │   │   ├── clients/         # Gestion clients
│       │   │   │   ├── accounts/        # Gestion comptes
│       │   │   │   ├── transactions/    # Transactions
│       │   │   │   ├── dashboard/       # Dashboard
│       │   │   │   └── connection-test/ # Test de connexion
│       │   │   └── app.routes.ts
│       │   └── environments/
│       │       ├── environment.ts       # Config dev
│       │       └── environment.prod.ts  # Config prod
│       ├── proxy.conf.json              # Configuration proxy
│       └── package.json
│
└── docs/
    └── BACKEND_FRONTEND_CONNECTION.md   # Documentation détaillée
```

## 🛠️ Commandes utiles

### Backend

```bash
# Démarrer l'application
./mvnw spring-boot:run

# Compiler sans exécuter les tests
./mvnw clean install -DskipTests

# Exécuter les tests
./mvnw test

# Nettoyer les builds
./mvnw clean

# Générer le JAR de production
./mvnw package
```

### Frontend

```bash
# Démarrer en mode développement
npm start

# Démarrer avec proxy
npm start -- --proxy-config proxy.conf.json

# Builder pour la production
npm run build

# Exécuter les tests
npm test

# Linter le code
npm run lint
```

## 🐛 Résolution des problèmes courants

### Problème: Backend ne démarre pas

**Erreur**: `Cannot create PoolableConnectionFactory`

**Solution**:
1. Vérifiez que PostgreSQL est démarré
2. Vérifiez les identifiants dans `application.properties`
3. Vérifiez que la base de données `egabank` existe

### Problème: Frontend ne trouve pas le backend (CORS)

**Erreur**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
1. Vérifiez que le backend est démarré sur http://localhost:8080
2. Utilisez le proxy: `npm start -- --proxy-config proxy.conf.json`
3. Vérifiez la configuration CORS dans `SecurityConfig.java`

### Problème: Erreur 401 Unauthorized

**Solution**:
1. Assurez-vous d'être connecté
2. Vérifiez que le token est bien stocké dans localStorage
3. Vérifiez que l'intercepteur JWT est configuré (`app.config.ts`)

### Problème: Port déjà utilisé

**Backend (8080)**:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

**Frontend (4200)**:
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4200 | xargs kill -9
```

## 📚 Documentation complémentaire

- 📖 [Guide de connexion Backend-Frontend](docs/BACKEND_FRONTEND_CONNECTION.md)
- 📖 [Swagger UI](http://localhost:8080/swagger-ui.html) - Documentation API interactive
- 📖 [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- 📖 [Angular Documentation](https://angular.dev/)

## 🎯 Endpoints API disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Clients (authentification requise)
- `GET /api/clients` - Liste des clients (pagination)
- `GET /api/clients/search?q=terme` - Recherche
- `GET /api/clients/{id}` - Détails d'un client
- `GET /api/clients/{id}/details` - Client avec comptes
- `POST /api/clients` - Créer un client
- `PUT /api/clients/{id}` - Modifier un client
- `DELETE /api/clients/{id}` - Supprimer un client

### Comptes (authentification requise)
- `GET /api/accounts` - Liste des comptes (pagination)
- `GET /api/accounts/{numeroCompte}` - Détails d'un compte
- `GET /api/accounts/client/{clientId}` - Comptes d'un client
- `POST /api/accounts` - Créer un compte
- `DELETE /api/accounts/{id}` - Supprimer un compte
- `PUT /api/accounts/{id}/deactivate` - Désactiver un compte

### Transactions (authentification requise)
- `POST /api/transactions/{numeroCompte}/deposit` - Dépôt
- `POST /api/transactions/{numeroCompte}/withdraw` - Retrait
- `POST /api/transactions/transfer` - Virement
- `GET /api/transactions/{numeroCompte}/history` - Historique
- `GET /api/transactions/{numeroCompte}` - Toutes les transactions

## 🚀 Prochaines étapes

1. ✅ Configuration de base terminée
2. 🔄 Test de la connexion via http://localhost:4200/connection-test
3. 👤 Création d'un utilisateur de test
4. 🎨 Finalisation de l'interface utilisateur
5. 🧪 Tests d'intégration
6. 📦 Déploiement en production

## 📞 Support

Pour toute question ou problème:
1. Consultez la documentation dans `/docs`
2. Vérifiez les logs du backend dans la console
3. Vérifiez la console du navigateur (F12)
4. Utilisez la page de test: http://localhost:4200/connection-test
