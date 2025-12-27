import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Account, Transaction } from '../../core/models';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { ClientService } from '../../core/services/client.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          Bienvenue, <span class="text-blue-600">{{ authService.currentUser()?.username }}</span> !
        </h1>
        <p class="text-gray-600 mt-1">Voici un aperçu de votre activité bancaire</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Clients -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Clients</p>
              <p class="text-3xl font-bold text-gray-900">{{ totalClients() }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z">
                </path>
              </svg>
            </div>
          </div>
          <a routerLink="/clients" class="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Voir tous les clients
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>

        <!-- Total Comptes -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Comptes</p>
              <p class="text-3xl font-bold text-gray-900">{{ totalAccounts() }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z">
                </path>
              </svg>
            </div>
          </div>
          <a routerLink="/accounts" class="mt-4 text-sm text-green-600 hover:text-green-800 flex items-center gap-1">
            Voir tous les comptes
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>

        <!-- Comptes Épargne -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Comptes Épargne</p>
              <p class="text-3xl font-bold text-gray-900">{{ comptesEpargne() }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                </path>
              </svg>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            {{ comptesEpargne() > 0 ? 'Comptes rémunérés' : 'Aucun compte épargne' }}
          </div>
        </div>

        <!-- Comptes Courants -->
        <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Comptes Courants</p>
              <p class="text-3xl font-bold text-gray-900">{{ comptesCourants() }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
                </path>
              </svg>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            {{ comptesCourants() > 0 ? 'Comptes courants actifs' : 'Aucun compte courant' }}
          </div>
        </div>
      </div>

      <!-- Solde Total -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-blue-200 text-sm font-medium">Solde Total de tous les comptes</p>
            <p class="text-4xl font-bold mt-2">{{ soldeTotal() | number:'1.2-2' }} <span class="text-2xl">XOF</span></p>
          </div>
          <div class="mt-4 md:mt-0 flex gap-3">
            <a routerLink="/transactions" 
              class="px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              Nouveau virement
            </a>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Actions Rapides</h2>
          <div class="grid grid-cols-2 gap-4">
            <a routerLink="/clients" class="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer group">
              <svg class="w-10 h-10 text-blue-600 mb-2 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">Nouveau Client</span>
            </a>
            <a routerLink="/accounts" class="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition cursor-pointer group">
              <svg class="w-10 h-10 text-green-600 mb-2 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">Nouveau Compte</span>
            </a>
            <a routerLink="/transactions" class="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition cursor-pointer group">
              <svg class="w-10 h-10 text-purple-600 mb-2 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">Virement</span>
            </a>
            <a routerLink="/transactions" class="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition cursor-pointer group">
              <svg class="w-10 h-10 text-orange-600 mb-2 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="text-sm font-medium text-gray-700">Historique</span>
            </a>
          </div>
        </div>

        <!-- Recent Accounts -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">Comptes récents</h2>
            <a routerLink="/accounts" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Voir tout</a>
          </div>
          <div class="space-y-3">
            @for (account of recentAccounts(); track account.id) {
              <a [routerLink]="['/accounts', account.numeroCompte]" 
                class="block p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="px-2 py-1 text-xs font-semibold rounded"
                      [class]="account.typeCompte === 'EPARGNE' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'">
                      {{ account.typeCompteLibelle }}
                    </span>
                    <p class="font-mono text-xs text-gray-500 mt-1">{{ account.numeroCompte }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-gray-900">{{ account.solde | number:'1.2-2' }} XOF</p>
                    <p class="text-xs text-gray-500">{{ account.clientNomComplet }}</p>
                  </div>
                </div>
              </a>
            } @empty {
              <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                <p>Aucun compte</p>
                <a routerLink="/accounts" class="text-blue-600 hover:text-blue-800">Créer un compte</a>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- System Info -->
      <div class="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg p-6 text-white">
        <h2 class="text-xl font-bold mb-4">Système EGA Bank</h2>
        <p class="text-gray-300 mb-4">
          Bienvenue dans le système de gestion bancaire EGA. 
          Gérez vos clients, leurs comptes et effectuez des opérations bancaires en toute sécurité.
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Gestion clients</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Comptes bancaires</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Transactions sécurisées</span>
          </div>
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Relevés PDF</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
    totalClients = signal(0);
    totalAccounts = signal(0);
    comptesEpargne = signal(0);
    comptesCourants = signal(0);
    soldeTotal = signal(0);
    recentAccounts = signal<Account[]>([]);
    recentTransactions = signal<Transaction[]>([]);

    constructor(
        private clientService: ClientService,
        private accountService: AccountService,
        private transactionService: TransactionService,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        // Load clients count
        this.clientService.getAll(0, 1).subscribe({
            next: (res) => this.totalClients.set(res.totalElements),
            error: () => this.totalClients.set(0)
        });

        // Load accounts and compute stats
        this.accountService.getAll(0, 100).subscribe({
            next: (res) => {
                this.totalAccounts.set(res.totalElements);

                const epargne = res.content.filter(a => a.typeCompte === 'EPARGNE');
                const courant = res.content.filter(a => a.typeCompte === 'COURANT');

                this.comptesEpargne.set(epargne.length);
                this.comptesCourants.set(courant.length);

                // Calculate total balance
                const total = res.content.reduce((sum, a) => sum + a.solde, 0);
                this.soldeTotal.set(total);

                // Get recent accounts (sorted by creation date)
                const sorted = [...res.content].sort((a, b) =>
                    new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
                );
                this.recentAccounts.set(sorted.slice(0, 5));

                // Load transactions for first account
                if (sorted.length > 0) {
                    this.loadRecentTransactions(sorted[0].numeroCompte);
                }
            },
            error: () => {
                this.totalAccounts.set(0);
                this.comptesEpargne.set(0);
                this.comptesCourants.set(0);
                this.soldeTotal.set(0);
            }
        });
    }

    loadRecentTransactions(numeroCompte: string): void {
        this.transactionService.getAllByAccount(numeroCompte).subscribe({
            next: (txs) => this.recentTransactions.set(txs.slice(0, 5)),
            error: () => this.recentTransactions.set([])
        });
    }
}
