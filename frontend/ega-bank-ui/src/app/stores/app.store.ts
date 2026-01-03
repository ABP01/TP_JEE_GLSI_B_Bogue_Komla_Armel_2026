import { computed, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AccountResponse } from '../models/account.model';
import { ClientResponse } from '../models/client.model';
import { DashboardStats } from '../services/dashboard.service';

/**
 * Store centralisé pour la gestion de l'état de l'application.
 * Utilise les Signals Angular pour une réactivité optimale.
 * 
 * Ce store résout le problème de synchronisation entre les composants
 * en fournissant une source unique de vérité.
 */
@Injectable({ providedIn: 'root' })
export class AppStore {
  // ========== SIGNALS D'ÉTAT ==========
  
  // Dashboard Stats
  private _dashboardStats = signal<DashboardStats | null>(null);
  private _dashboardLoading = signal(false);
  private _dashboardError = signal<string | null>(null);
  
  // Clients
  private _clients = signal<ClientResponse[]>([]);
  private _clientsLoading = signal(false);
  private _clientsTotalCount = signal(0);
  
  // Accounts
  private _accounts = signal<AccountResponse[]>([]);
  private _accountsLoading = signal(false);
  private _accountsTotalCount = signal(0);
  
  // Recent items for dashboard
  private _recentClients = signal<ClientResponse[]>([]);
  private _recentAccounts = signal<AccountResponse[]>([]);
  
  // ========== EVENT BUS ==========
  // Pour notifier les composants des changements importants
  
  private _dataChanged = new Subject<DataChangeEvent>();
  public dataChanged$ = this._dataChanged.asObservable();
  
  // ========== COMPUTED (lecture seule) ==========
  
  readonly dashboardStats = this._dashboardStats.asReadonly();
  readonly dashboardLoading = this._dashboardLoading.asReadonly();
  readonly dashboardError = this._dashboardError.asReadonly();
  
  readonly clients = this._clients.asReadonly();
  readonly clientsLoading = this._clientsLoading.asReadonly();
  readonly clientsTotalCount = this._clientsTotalCount.asReadonly();
  
  readonly accounts = this._accounts.asReadonly();
  readonly accountsLoading = this._accountsLoading.asReadonly();
  readonly accountsTotalCount = this._accountsTotalCount.asReadonly();
  
  readonly recentClients = this._recentClients.asReadonly();
  readonly recentAccounts = this._recentAccounts.asReadonly();
  
  // Computed values
  readonly hasClients = computed(() => this._clients().length > 0);
  readonly hasAccounts = computed(() => this._accounts().length > 0);
  readonly activeAccountsCount = computed(() => 
    this._accounts().filter(a => a.actif).length
  );
  readonly totalBalance = computed(() =>
    this._accounts().reduce((sum, a) => sum + (a.solde || 0), 0)
  );
  
  // ========== ACTIONS (mutations) ==========
  
  // Dashboard
  setDashboardStats(stats: DashboardStats) {
    this._dashboardStats.set(stats);
    this._dashboardError.set(null);
  }
  
  setDashboardLoading(loading: boolean) {
    this._dashboardLoading.set(loading);
  }
  
  setDashboardError(error: string | null) {
    this._dashboardError.set(error);
  }
  
  // Clients
  setClients(clients: ClientResponse[], total?: number) {
    this._clients.set(clients);
    if (total !== undefined) {
      this._clientsTotalCount.set(total);
    }
  }
  
  setClientsLoading(loading: boolean) {
    this._clientsLoading.set(loading);
  }
  
  addClient(client: ClientResponse) {
    this._clients.update(clients => [client, ...clients]);
    this._clientsTotalCount.update(c => c + 1);
    this.notifyChange({ type: 'client', action: 'create', data: client });
  }
  
  updateClient(client: ClientResponse) {
    this._clients.update(clients => 
      clients.map(c => c.id === client.id ? client : c)
    );
    this.notifyChange({ type: 'client', action: 'update', data: client });
  }
  
  removeClient(clientId: number) {
    this._clients.update(clients => clients.filter(c => c.id !== clientId));
    this._clientsTotalCount.update(c => Math.max(0, c - 1));
    this.notifyChange({ type: 'client', action: 'delete', data: { id: clientId } });
  }
  
  // Accounts
  setAccounts(accounts: AccountResponse[], total?: number) {
    this._accounts.set(accounts);
    if (total !== undefined) {
      this._accountsTotalCount.set(total);
    }
  }
  
  setAccountsLoading(loading: boolean) {
    this._accountsLoading.set(loading);
  }
  
  addAccount(account: AccountResponse) {
    this._accounts.update(accounts => [account, ...accounts]);
    this._accountsTotalCount.update(c => c + 1);
    this.notifyChange({ type: 'account', action: 'create', data: account });
  }
  
  updateAccount(account: AccountResponse) {
    this._accounts.update(accounts =>
      accounts.map(a => a.id === account.id ? account : a)
    );
    this.notifyChange({ type: 'account', action: 'update', data: account });
  }
  
  updateAccountByNumber(numeroCompte: string, updates: Partial<AccountResponse>) {
    this._accounts.update(accounts =>
      accounts.map(a => a.numeroCompte === numeroCompte ? { ...a, ...updates } : a)
    );
    this.notifyChange({ type: 'account', action: 'update', data: { numeroCompte, ...updates } });
  }
  
  removeAccount(accountId: number) {
    this._accounts.update(accounts => accounts.filter(a => a.id !== accountId));
    this._accountsTotalCount.update(c => Math.max(0, c - 1));
    this.notifyChange({ type: 'account', action: 'delete', data: { id: accountId } });
  }
  
  // Recent items
  setRecentClients(clients: ClientResponse[]) {
    this._recentClients.set(clients);
  }
  
  setRecentAccounts(accounts: AccountResponse[]) {
    this._recentAccounts.set(accounts);
  }
  
  // ========== TRANSACTION ACTIONS ==========
  // Appelées après une transaction réussie pour mettre à jour les soldes
  
  /**
   * Met à jour le solde d'un compte après une transaction
   */
  updateAccountBalance(numeroCompte: string, newBalance: number) {
    this._accounts.update(accounts =>
      accounts.map(a => a.numeroCompte === numeroCompte 
        ? { ...a, solde: newBalance } 
        : a
      )
    );
    this._recentAccounts.update(accounts =>
      accounts.map(a => a.numeroCompte === numeroCompte 
        ? { ...a, solde: newBalance } 
        : a
      )
    );
    this.notifyChange({ 
      type: 'transaction', 
      action: 'balance_update', 
      data: { numeroCompte, newBalance } 
    });
  }
  
  /**
   * Déclenche un rafraîchissement complet des données
   * Utilisé après des opérations qui affectent plusieurs entités
   */
  triggerFullRefresh() {
    this.notifyChange({ type: 'system', action: 'refresh', data: null });
  }
  
  /**
   * Incrémente le compteur de transactions dans les stats
   */
  incrementTransactionCount() {
    const stats = this._dashboardStats();
    if (stats) {
      this._dashboardStats.set({
        ...stats,
        totalTransactions: stats.totalTransactions + 1
      });
    }
  }
  
  // ========== HELPERS ==========
  
  private notifyChange(event: DataChangeEvent) {
    this._dataChanged.next(event);
  }
  
  /**
   * Réinitialise le store (utile lors de la déconnexion)
   */
  reset() {
    this._dashboardStats.set(null);
    this._clients.set([]);
    this._accounts.set([]);
    this._recentClients.set([]);
    this._recentAccounts.set([]);
    this._clientsTotalCount.set(0);
    this._accountsTotalCount.set(0);
  }
  
  /**
   * Trouve un compte par son numéro
   */
  getAccountByNumber(numeroCompte: string): AccountResponse | undefined {
    return this._accounts().find(a => a.numeroCompte === numeroCompte);
  }
  
  /**
   * Trouve un client par son ID
   */
  getClientById(clientId: number): ClientResponse | undefined {
    return this._clients().find(c => c.id === clientId);
  }
}

export interface DataChangeEvent {
  type: 'client' | 'account' | 'transaction' | 'system';
  action: 'create' | 'update' | 'delete' | 'balance_update' | 'refresh';
  data: any;
}
