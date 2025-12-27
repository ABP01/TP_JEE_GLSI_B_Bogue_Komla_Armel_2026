import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';
import { TransactionService } from '../../core/services/transaction.service';

/**
 * Composant de test pour vérifier la connexion Backend-Frontend
 */
@Component({
    selector: 'app-connection-test',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="connection-test-container">
      <h1>🔗 Test de Connexion Backend-Frontend</h1>
      
      <!-- Test Backend Status -->
      <section class="test-section">
        <h2>1. État du Backend</h2>
        <div class="status-indicator" [class.success]="backendStatus === 'connected'" 
             [class.error]="backendStatus === 'disconnected'">
          {{ backendStatus === 'connected' ? '✅ Backend connecté' : '❌ Backend déconnecté' }}
        </div>
        <button (click)="testBackendConnection()">Tester la connexion</button>
      </section>

      <!-- Test Authentication -->
      <section class="test-section">
        <h2>2. Test d'Authentification</h2>
        
        <div class="form-group">
          <h3>Inscription</h3>
          <input [(ngModel)]="registerData.username" placeholder="Nom d'utilisateur" />
          <input [(ngModel)]="registerData.email" type="email" placeholder="Email" />
          <input [(ngModel)]="registerData.password" type="password" placeholder="Mot de passe" />
          <button (click)="testRegister()">S'inscrire</button>
        </div>

        <div class="form-group">
          <h3>Connexion</h3>
          <input [(ngModel)]="loginData.username" placeholder="Nom d'utilisateur" />
          <input [(ngModel)]="loginData.password" type="password" placeholder="Mot de passe" />
          <button (click)="testLogin()">Se connecter</button>
        </div>

        <div class="auth-status" *ngIf="authService.isAuthenticated()">
          <p>✅ Authentifié en tant que: {{ authService.currentUser()?.username }}</p>
          <button (click)="testLogout()">Se déconnecter</button>
        </div>
      </section>

      <!-- Test Clients -->
      <section class="test-section" *ngIf="authService.isAuthenticated()">
        <h2>3. Test API Clients</h2>
        <button (click)="testGetClients()">Récupérer les clients</button>
        <div class="results" *ngIf="clients.length > 0">
          <h4>Clients ({{ clients.length }})</h4>
          <ul>
            <li *ngFor="let client of clients">
              {{ client.nom }} {{ client.prenom }} - {{ client.courriel }}
            </li>
          </ul>
        </div>
      </section>

      <!-- Test Accounts -->
      <section class="test-section" *ngIf="authService.isAuthenticated()">
        <h2>4. Test API Comptes</h2>
        <button (click)="testGetAccounts()">Récupérer les comptes</button>
        <div class="results" *ngIf="accounts.length > 0">
          <h4>Comptes ({{ accounts.length }})</h4>
          <ul>
            <li *ngFor="let account of accounts">
              {{ account.numeroCompte }} - {{ account.typeCompte }} - Solde: {{ account.solde }}€
            </li>
          </ul>
        </div>
      </section>

      <!-- Test Transactions -->
      <section class="test-section" *ngIf="authService.isAuthenticated() && accounts.length > 0">
        <h2>5. Test API Transactions</h2>
        <div class="form-group">
          <select [(ngModel)]="selectedAccountNumber">
            <option value="">Sélectionner un compte</option>
            <option *ngFor="let account of accounts" [value]="account.numeroCompte">
              {{ account.numeroCompte }}
            </option>
          </select>
          <button (click)="testGetTransactions()" [disabled]="!selectedAccountNumber">
            Récupérer les transactions
          </button>
        </div>
        <div class="results" *ngIf="transactions.length > 0">
          <h4>Transactions ({{ transactions.length }})</h4>
          <ul>
            <li *ngFor="let transaction of transactions">
              {{ transaction.dateTransaction }} - {{ transaction.type }} - {{ transaction.montant }}€
            </li>
          </ul>
        </div>
      </section>

      <!-- Logs -->
      <section class="test-section">
        <h2>📋 Logs</h2>
        <div class="logs">
          <div *ngFor="let log of logs" [class]="'log-' + log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
        <button (click)="clearLogs()">Effacer les logs</button>
      </section>
    </div>
  `,
    styles: [`
    .connection-test-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 0.5rem;
    }

    .test-section {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      color: #34495e;
      margin-top: 0;
    }

    .status-indicator {
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      font-weight: bold;
    }

    .status-indicator.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .status-indicator.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .form-group {
      margin: 1rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    h3 {
      margin-top: 0;
      color: #495057;
    }

    input, select {
      display: block;
      width: 100%;
      padding: 0.5rem;
      margin: 0.5rem 0;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    button {
      background: #3498db;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem 0.5rem 0.5rem 0;
      transition: background 0.3s;
    }

    button:hover:not(:disabled) {
      background: #2980b9;
    }

    button:disabled {
      background: #95a5a6;
      cursor: not-allowed;
    }

    .auth-status {
      background: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
      padding: 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .results {
      margin-top: 1rem;
      padding: 1rem;
      background: #e9ecef;
      border-radius: 4px;
    }

    .results h4 {
      margin-top: 0;
      color: #495057;
    }

    .results ul {
      list-style: none;
      padding: 0;
    }

    .results li {
      padding: 0.5rem;
      background: white;
      margin: 0.5rem 0;
      border-radius: 4px;
      border-left: 3px solid #3498db;
    }

    .logs {
      background: #212529;
      color: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .logs > div {
      padding: 0.25rem;
      border-bottom: 1px solid #495057;
    }

    .log-time {
      color: #6c757d;
      margin-right: 0.5rem;
    }

    .log-info .log-message {
      color: #17a2b8;
    }

    .log-success .log-message {
      color: #28a745;
    }

    .log-error .log-message {
      color: #dc3545;
    }

    .log-warning .log-message {
      color: #ffc107;
    }
  `]
})
export class ConnectionTestComponent implements OnInit {
    backendStatus: 'checking' | 'connected' | 'disconnected' = 'checking';

    registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    loginData = {
        username: 'testuser',
        password: 'password123'
    };

    clients: any[] = [];
    accounts: any[] = [];
    transactions: any[] = [];
    selectedAccountNumber = '';

    logs: Array<{ time: string; message: string; type: 'info' | 'success' | 'error' | 'warning' }> = [];

    constructor(
        public authService: AuthService,
        private clientService: ClientService,
        private accountService: AccountService,
        private transactionService: TransactionService
    ) { }

    ngOnInit() {
        this.testBackendConnection();
    }

    testBackendConnection() {
        this.addLog('Connexion au backend...', 'info');

        // Test simple: essayer de fetcher les clients (même si non authentifié, on devrait avoir une erreur 401, pas une erreur réseau)
        this.clientService.getAll(0, 1).subscribe({
            next: () => {
                this.backendStatus = 'connected';
                this.addLog('✅ Backend connecté et accessible', 'success');
            },
            error: (error) => {
                if (error.status === 401 || error.status === 403) {
                    this.backendStatus = 'connected';
                    this.addLog('✅ Backend connecté (authentification requise)', 'success');
                } else {
                    this.backendStatus = 'disconnected';
                    this.addLog(`❌ Erreur de connexion au backend: ${error.message}`, 'error');
                }
            }
        });
    }

    testRegister() {
        this.addLog(`Tentative d'inscription pour: ${this.registerData.username}`, 'info');

        this.authService.register(this.registerData).subscribe({
            next: (response) => {
                this.addLog(`✅ Inscription réussie pour: ${response.username}`, 'success');
            },
            error: (error) => {
                this.addLog(`❌ Erreur d'inscription: ${error.error?.message || error.message}`, 'error');
            }
        });
    }

    testLogin() {
        this.addLog(`Tentative de connexion pour: ${this.loginData.username}`, 'info');

        this.authService.login(this.loginData).subscribe({
            next: (response) => {
                this.addLog(`✅ Connexion réussie pour: ${response.username}`, 'success');
                this.addLog(`Token: ${response.accessToken.substring(0, 20)}...`, 'info');
            },
            error: (error) => {
                this.addLog(`❌ Erreur de connexion: ${error.error?.message || error.message}`, 'error');
            }
        });
    }

    testLogout() {
        this.addLog('Déconnexion...', 'info');
        this.authService.logout();
        this.clients = [];
        this.accounts = [];
        this.transactions = [];
        this.addLog('✅ Déconnexion réussie', 'success');
    }

    testGetClients() {
        this.addLog('Récupération des clients...', 'info');

        this.clientService.getAll(0, 10).subscribe({
            next: (response) => {
                this.clients = response.content;
                this.addLog(`✅ ${this.clients.length} client(s) récupéré(s)`, 'success');
            },
            error: (error) => {
                this.addLog(`❌ Erreur lors de la récupération des clients: ${error.error?.message || error.message}`, 'error');
            }
        });
    }

    testGetAccounts() {
        this.addLog('Récupération des comptes...', 'info');

        this.accountService.getAll(0, 10).subscribe({
            next: (response) => {
                this.accounts = response.content;
                this.addLog(`✅ ${this.accounts.length} compte(s) récupéré(s)`, 'success');
            },
            error: (error) => {
                this.addLog(`❌ Erreur lors de la récupération des comptes: ${error.error?.message || error.message}`, 'error');
            }
        });
    }

    testGetTransactions() {
        if (!this.selectedAccountNumber) return;

        this.addLog(`Récupération des transactions pour: ${this.selectedAccountNumber}`, 'info');

        this.transactionService.getAllByAccount(this.selectedAccountNumber).subscribe({
            next: (transactions) => {
                this.transactions = transactions;
                this.addLog(`✅ ${this.transactions.length} transaction(s) récupérée(s)`, 'success');
            },
            error: (error) => {
                this.addLog(`❌ Erreur lors de la récupération des transactions: ${error.error?.message || error.message}`, 'error');
            }
        });
    }

    addLog(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
        const time = new Date().toLocaleTimeString();
        this.logs.unshift({ time, message, type });
    }

    clearLogs() {
        this.logs = [];
        this.addLog('Logs effacés', 'info');
    }
}
