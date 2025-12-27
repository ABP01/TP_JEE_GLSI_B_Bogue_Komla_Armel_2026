# 🔗 Guide de Connexion Backend-Frontend EGA Bank

## 📋 Vue d'ensemble
Ce document décrit comment le frontend Angular se connecte au backend Spring Boot.

## 🏗️ Architecture
- **Backend**: Spring Boot sur `http://localhost:8080`
- **Frontend**: Angular sur `http://localhost:4200`
- **API Base URL**: `http://localhost:8080/api`

## ✅ Configuration complétée

### 1. Backend (Spring Boot)
✅ **CORS configuré** dans `SecurityConfig.java`:
- Origine autorisée: `http://localhost:4200`
- Méthodes: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type, X-Requested-With

✅ **Controllers REST** disponibles:
- `/api/auth` - Authentification (login, register, refresh)
- `/api/clients` - Gestion des clients
- `/api/accounts` - Gestion des comptes bancaires
- `/api/transactions` - Opérations bancaires (dépôt, retrait, virement)
- `/api/statements` - Génération de relevés

### 2. Frontend (Angular)

✅ **Environnement configuré** (`environment.ts`):
```typescript
export const environment = {
  apiUrl: 'http://localhost:8080/api',
  production: false
};
```

✅ **Services Angular** créés:
- `AuthService` - Authentification et gestion des tokens
- `ClientService` - CRUD des clients
- `AccountService` - Gestion des comptes
- `TransactionService` - Opérations bancaires

✅ **Intercepteur JWT** (`auth.interceptor.ts`):
- Ajoute automatiquement le token Bearer dans les headers
- Exclut les endpoints `/auth/` (login, register)

✅ **Proxy de développement** (`proxy.conf.json`):
- Redirige les requêtes `/api` vers `http://localhost:8080`
- Évite les problèmes CORS en développement

## 🚀 Démarrage

### 1. Démarrer le Backend
```bash
cd backend/ega-bank
./mvnw spring-boot:run
```
Le backend sera accessible sur `http://localhost:8080`

### 2. Démarrer le Frontend

#### Option A: Avec proxy (recommandé)
```bash
cd frontend/ega-bank-ui
npm start -- --proxy-config proxy.conf.json
```

#### Option B: Sans proxy
```bash
cd frontend/ega-bank-ui
npm start
```

Le frontend sera accessible sur `http://localhost:4200`

## 🔐 Flux d'authentification

### 1. Inscription/Connexion
```typescript
// Dans un composant Angular
constructor(private authService: AuthService) {}

login() {
  this.authService.login({
    email: 'user@example.com',
    password: 'password123'
  }).subscribe({
    next: (response) => {
      // Token automatiquement stocké dans localStorage
      console.log('Connexion réussie', response);
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      console.error('Erreur de connexion', error);
    }
  });
}
```

### 2. Appels API protégés
```typescript
// L'intercepteur ajoute automatiquement le token
this.clientService.getAll().subscribe({
  next: (clients) => {
    console.log('Clients récupérés', clients);
  },
  error: (error) => {
    console.error('Erreur', error);
  }
});
```

## 📡 Exemples d'appels API

### Authentification
```typescript
// Inscription
authService.register({
  nom: 'Doe',
  prenom: 'John',
  email: 'john@example.com',
  password: 'password123',
  telephone: '+33612345678'
});

// Connexion
authService.login({
  email: 'john@example.com',
  password: 'password123'
});

// Rafraîchir le token
authService.refreshToken();

// Déconnexion
authService.logout();
```

### Clients
```typescript
// Liste paginée
clientService.getAll(0, 10); // page 0, 10 éléments

// Recherche
clientService.search('John', 0, 10);

// Détails d'un client
clientService.getById(1);

// Client avec ses comptes
clientService.getWithAccounts(1);

// Créer un client
clientService.create({
  nom: 'Doe',
  prenom: 'Jane',
  email: 'jane@example.com',
  telephone: '+33612345679',
  adresse: '123 Rue de la Paix'
});

// Modifier un client
clientService.update(1, {...});

// Supprimer un client
clientService.delete(1);
```

### Comptes
```typescript
// Liste paginée
accountService.getAll(0, 10);

// Compte par numéro IBAN
accountService.getByNumber('FR7630006000011234567890189');

// Comptes d'un client
accountService.getByClient(1);

// Créer un compte
accountService.create({
  clientId: 1,
  typeCompte: 'COURANT', // ou 'EPARGNE'
  soldeInitial: 1000.0
});

// Supprimer un compte
accountService.delete(1);

// Désactiver un compte
accountService.deactivate(1);
```

### Transactions
```typescript
// Dépôt
transactionService.deposit('FR7630006000011234567890189', {
  montant: 500.0,
  description: 'Dépôt en espèces'
});

// Retrait
transactionService.withdraw('FR7630006000011234567890189', {
  montant: 200.0,
  description: 'Retrait DAB'
});

// Virement
transactionService.transfer({
  numeroCompteSource: 'FR7630006000011234567890189',
  numeroCompteDestination: 'FR7630006000019876543210987',
  montant: 300.0,
  description: 'Virement mensuel'
});

// Historique des transactions
transactionService.getHistory(
  'FR7630006000011234567890189',
  '2025-01-01',
  '2025-12-31'
);

// Toutes les transactions d'un compte
transactionService.getAllByAccount('FR7630006000011234567890189');

// Télécharger un relevé PDF
transactionService.downloadStatement(
  'FR7630006000011234567890189',
  '2025-01-01',
  '2025-12-31'
).subscribe(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'releve.pdf';
  a.click();
});
```

## 🛡️ Sécurité

### Tokens JWT
- **Access Token**: Expire après 24h (86400000ms)
- **Refresh Token**: Expire après 7 jours (604800000ms)
- Stockés dans `localStorage`:
  - `ega_access_token`
  - `ega_refresh_token`
  - `ega_user`

### Headers HTTP
L'intercepteur ajoute automatiquement:
```
Authorization: Bearer <access_token>
```

### Endpoints publics (sans authentification)
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh`

### Endpoints protégés (authentification requise)
- Tous les autres endpoints `/api/*`

## 🐛 Dépannage

### Erreur CORS
**Problème**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solutions**:
1. Vérifier que le backend est démarré sur `http://localhost:8080`
2. Utiliser le proxy: `npm start -- --proxy-config proxy.conf.json`
3. Vérifier la configuration CORS dans `SecurityConfig.java`

### Erreur 401 Unauthorized
**Problème**: Token invalide ou expiré

**Solutions**:
1. Vérifier que le token est bien stocké dans `localStorage`
2. Utiliser `authService.refreshToken()` pour renouveler le token
3. Se reconnecter si le refresh token a expiré

### Erreur 403 Forbidden
**Problème**: Token valide mais permissions insuffisantes

**Solutions**:
1. Vérifier les rôles de l'utilisateur
2. Vérifier la configuration de sécurité côté backend

### Backend non accessible
**Problème**: `net::ERR_CONNECTION_REFUSED`

**Solutions**:
1. Vérifier que le backend est démarré: `./mvnw spring-boot:run`
2. Vérifier le port: `http://localhost:8080`
3. Vérifier la base de données PostgreSQL (port 5432)

## 📊 Modèles de données

### AuthResponse
```typescript
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  email: string;
  nom: string;
  prenom: string;
}
```

### Client
```typescript
interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  dateCreation: string;
  accounts?: Account[];
}
```

### Account
```typescript
interface Account {
  id: number;
  numeroCompte: string; // IBAN
  typeCompte: 'COURANT' | 'EPARGNE';
  solde: number;
  actif: boolean;
  dateCreation: string;
  clientId: number;
}
```

### Transaction
```typescript
interface Transaction {
  id: number;
  type: 'DEPOT' | 'RETRAIT' | 'VIREMENT';
  montant: number;
  description?: string;
  dateTransaction: string;
  numeroCompteSource?: string;
  numeroCompteDestination?: string;
  soldeApres: number;
}
```

### PageResponse
```typescript
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
```

## 🎯 Prochaines étapes

1. ✅ Configuration de base terminée
2. 🔄 Tester les endpoints avec le frontend
3. 🎨 Finaliser les composants UI
4. 🧪 Ajouter des tests d'intégration
5. 🚀 Déploiement en production

## 📞 Support

Pour toute question ou problème:
1. Vérifier ce guide
2. Consulter la documentation Swagger: `http://localhost:8080/swagger-ui.html`
3. Vérifier les logs du backend dans la console
4. Vérifier la console du navigateur pour les erreurs frontend
