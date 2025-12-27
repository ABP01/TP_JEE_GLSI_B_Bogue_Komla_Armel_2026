import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Account, Transaction, TransferRequest } from '../../../core/models';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Transactions</h1>
          <p class="text-gray-600">Effectuez des virements entre comptes</p>
        </div>
        <button (click)="showTransferModal.set(true)" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
          </svg>
          Nouveau Virement
        </button>
      </div>

      <!-- Account Selection -->
      <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Sélectionner un compte</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (account of accounts(); track account.id) {
            <button (click)="selectAccount(account)"
              class="p-4 border rounded-lg text-left transition"
              [class]="selectedAccount()?.id === account.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'">
              <p class="font-mono text-sm text-gray-500">{{ account.numeroCompte }}</p>
              <p class="font-bold text-gray-900">{{ account.solde | number:'1.2-2' }} XOF</p>
              <p class="text-sm text-gray-600">{{ account.clientNomComplet }}</p>
            </button>
          }
        </div>
      </div>

      <!-- Transactions List -->
      @if (selectedAccount()) {
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="px-6 py-4 border-b bg-gray-50">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 class="font-bold text-gray-900">Transactions du compte {{ selectedAccount()!.numeroCompte }}</h3>
                <p class="text-sm text-gray-500">Solde actuel: <span class="font-bold text-gray-900">{{ selectedAccount()!.solde | number:'1.2-2' }} XOF</span></p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <input type="date" [(ngModel)]="dateDebut" (change)="filterByDate()"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <span class="text-gray-500">à</span>
                <input type="date" [(ngModel)]="dateFin" (change)="filterByDate()"
                  class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                <button (click)="resetDateFilter()" class="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  Réinit.
                </button>
                <button (click)="downloadStatement()" [disabled]="!selectedAccount() || !dateDebut || !dateFin"
                  class="px-3 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm disabled:opacity-50">
                  Télécharger relevé
                </button>
              </div>
            </div>
          </div>
          <div class="divide-y max-h-[500px] overflow-y-auto">
            @for (tx of transactions(); track tx.id) {
              <div class="p-4 flex justify-between items-center hover:bg-gray-50 transition">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center"
                    [class]="tx.type.includes('DEPOT') || tx.type.includes('ENTRANT') ? 'bg-green-100' : 'bg-red-100'">
                    @if (tx.type.includes('DEPOT') || tx.type.includes('ENTRANT')) {
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                      </svg>
                    } @else {
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                      </svg>
                    }
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ tx.typeLibelle }}</p>
                    <p class="text-sm text-gray-500">{{ tx.dateTransaction | date:'dd/MM/yyyy HH:mm' }}</p>
                    @if (tx.description) {
                      <p class="text-xs text-gray-400">{{ tx.description }}</p>
                    }
                    @if (tx.compteDestination) {
                      <p class="text-xs text-gray-400">
                        @if (tx.type.includes('SORTANT')) {
                          Vers: {{ tx.compteDestination }}
                        } @else if (tx.type.includes('ENTRANT')) {
                          De: {{ tx.compteDestination }}
                        } @else {
                          Compte: {{ tx.compteDestination }}
                        }
                      </p>
                    }
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-bold" [class]="tx.type.includes('DEPOT') || tx.type.includes('ENTRANT') ? 'text-green-600' : 'text-red-600'">
                    {{ tx.type.includes('DEPOT') || tx.type.includes('ENTRANT') ? '+' : '-' }}{{ tx.montant | number:'1.2-2' }} XOF
                  </p>
                  <p class="text-xs text-gray-500">Solde: {{ tx.soldeApres | number:'1.2-2' }} XOF</p>
                </div>
              </div>
            } @empty {
              <div class="p-12 text-center text-gray-500">
                <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <p>Aucune transaction pour cette période</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- Transfer Modal -->
      @if (showTransferModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold">Nouveau virement</h2>
            </div>
            <form [formGroup]="transferForm" (ngSubmit)="executeTransfer()" class="p-6">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compte source *</label>
                <select formControlName="compteSource" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionner un compte</option>
                  @for (account of accounts(); track account.id) {
                    <option [value]="account.numeroCompte">{{ account.numeroCompte }} - {{ account.solde | number:'1.2-2' }} XOF</option>
                  }
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Compte destination *</label>
                <select formControlName="compteDestination" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionner un compte</option>
                  @for (account of accounts(); track account.id) {
                    <option [value]="account.numeroCompte">{{ account.numeroCompte }} - {{ account.clientNomComplet }}</option>
                  }
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant (XOF) *</label>
                <input type="number" formControlName="montant" min="1"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" formControlName="description" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              </div>
              @if (transferError()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {{ transferError() }}
                </div>
              }
              @if (transferSuccess()) {
                <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  Virement effectué avec succès!
                </div>
              }
              <div class="flex justify-end gap-4">
                <button type="button" (click)="closeTransferModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">Fermer</button>
                <button type="submit" [disabled]="transferForm.invalid" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  Effectuer le virement
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class TransactionListComponent implements OnInit {
  accounts = signal<Account[]>([]);
  selectedAccount = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  showTransferModal = signal(false);
  transferError = signal<string | null>(null);
  transferSuccess = signal(false);
  transferForm: FormGroup;

  // Date filter
  dateDebut = '';
  dateFin = '';

  constructor(
    private accountService: AccountService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.transferForm = this.fb.group({
      compteSource: ['', Validators.required],
      compteDestination: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });

    // Initialize date filter to last month
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    this.dateFin = today.toISOString().split('T')[0];
    this.dateDebut = monthAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAll(0, 100).subscribe({
      next: (res) => this.accounts.set(res.content)
    });
  }

  selectAccount(account: Account): void {
    this.selectedAccount.set(account);
    this.loadTransactionsForAccount(account.numeroCompte);
  }

  loadTransactionsForAccount(numeroCompte: string): void {
    this.transactionService.getAllByAccount(numeroCompte).subscribe({
      next: (txs) => this.transactions.set(txs)
    });
  }

  filterByDate(): void {
    if (this.dateDebut && this.dateFin && this.selectedAccount()) {
      this.transactionService.getHistory(this.selectedAccount()!.numeroCompte, this.dateDebut, this.dateFin).subscribe({
        next: (txs) => this.transactions.set(txs),
        error: () => this.transactions.set([])
      });
    }
  }

  resetDateFilter(): void {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    this.dateFin = today.toISOString().split('T')[0];
    this.dateDebut = monthAgo.toISOString().split('T')[0];
    if (this.selectedAccount()) {
      this.loadTransactionsForAccount(this.selectedAccount()!.numeroCompte);
    }
  }

  downloadStatement(): void {
    if (!this.selectedAccount() || !this.dateDebut || !this.dateFin) return;
    const numero = this.selectedAccount()!.numeroCompte;
    this.transactionService.downloadStatement(numero, this.dateDebut, this.dateFin).subscribe({
      next: (blob) => {
        const fileName = `releve_${numero.substring(0,8)}_${this.dateDebut}_${this.dateFin}.pdf`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        // silent fail: no theme changes, show simple alert
        alert('Impossible de télécharger le relevé.');
      }
    });
  }

  closeTransferModal(): void {
    this.showTransferModal.set(false);
    this.transferError.set(null);
    this.transferSuccess.set(false);
    this.transferForm.reset();
  }

  executeTransfer(): void {
    if (this.transferForm.invalid) return;

    const request: TransferRequest = this.transferForm.value;
    this.transferError.set(null);
    this.transferSuccess.set(false);

    this.transactionService.transfer(request).subscribe({
      next: () => {
        this.transferSuccess.set(true);
        this.loadAccounts();
        if (this.selectedAccount()) {
          // Refresh the selected account to get updated balance
          this.accountService.getByNumber(this.selectedAccount()!.numeroCompte).subscribe({
            next: (acc) => {
              this.selectedAccount.set(acc);
              this.loadTransactionsForAccount(acc.numeroCompte);
            }
          });
        }
        setTimeout(() => this.closeTransferModal(), 1500);
      },
      error: (err) => {
        this.transferError.set(err.error?.message || 'Erreur lors du virement');
      }
    });
  }
}

