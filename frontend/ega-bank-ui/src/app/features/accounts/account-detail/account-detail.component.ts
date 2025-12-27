import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Account, OperationRequest, Transaction } from '../../../core/models';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <a routerLink="/accounts" class="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Retour aux comptes
      </a>

      <!-- Notification de succès -->
      @if (successMessage()) {
        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-3">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="font-medium">{{ successMessage() }}</span>
          <button (click)="successMessage.set(null)" class="ml-auto text-green-600 hover:text-green-800">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }

      @if (account()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Account Card -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="h-3" [class]="account()!.typeCompte === 'EPARGNE' ? 'bg-purple-500' : 'bg-orange-500'"></div>
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <span class="px-3 py-1 text-sm font-semibold rounded-full"
                    [class]="account()!.typeCompte === 'EPARGNE' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'">
                    {{ account()!.typeCompteLibelle }}
                  </span>
                  @if (!account()!.actif) {
                    <span class="px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full">Inactif</span>
                  } @else {
                    <span class="px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full">Actif</span>
                  }
                </div>
                <p class="font-mono text-sm text-gray-500 mb-2">{{ account()!.numeroCompte }}</p>
                <p class="text-4xl font-bold text-gray-900 mb-4">{{ account()!.solde | number:'1.2-2' }} <span class="text-xl">XOF</span></p>
                <p class="text-sm text-gray-600">Client: <a [routerLink]="['/clients', account()!.clientId]" class="font-medium text-blue-600 hover:text-blue-800">{{ account()!.clientNomComplet }}</a></p>
                <p class="text-sm text-gray-500">Créé le {{ account()!.dateCreation | date:'dd/MM/yyyy' }}</p>

                <!-- Operations -->
                @if (account()!.actif) {
                  <div class="mt-6 space-y-3">
                    <button (click)="openOperation('deposit')" class="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                      </svg>
                      Dépôt
                    </button>
                    <button (click)="openOperation('withdraw')" class="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                      </svg>
                      Retrait
                    </button>
                    <a routerLink="/transactions" class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                      </svg>
                      Virement
                    </a>
                  </div>
                } @else {
                  <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <p class="font-medium">Compte désactivé</p>
                    <p>Les opérations ne sont plus possibles sur ce compte.</p>
                  </div>
                }
              </div>
            </div>

            <!-- Actions supplémentaires -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div class="space-y-3">
                <button (click)="downloadStatement()" class="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Télécharger Relevé PDF
                </button>
                @if (account()!.actif) {
                  <button (click)="confirmDeactivate()" class="w-full py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 flex items-center justify-center gap-2 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                    </svg>
                    Désactiver le compte
                  </button>
                }
                <button (click)="confirmDelete()" class="w-full py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>

          <!-- Transactions -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-lg">
              <div class="px-6 py-4 border-b">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 class="text-xl font-bold text-gray-900">Historique des transactions</h3>
                  <div class="flex items-center gap-2">
                    <input type="date" [(ngModel)]="dateDebut" (change)="filterByDate()"
                      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <span class="text-gray-500">à</span>
                    <input type="date" [(ngModel)]="dateFin" (change)="filterByDate()"
                      class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                    <button (click)="resetDateFilter()" class="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
              <div class="divide-y max-h-[600px] overflow-y-auto">
                @for (tx of transactions(); track tx.id) {
                  <div class="p-4 hover:bg-gray-50 flex justify-between items-center transition">
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
                          <p class="text-sm text-gray-400">{{ tx.description }}</p>
                        }
                        @if (tx.compteDestination) {
                          <p class="text-xs text-gray-400">
                            @if (tx.type.includes('SORTANT')) {
                              Vers: {{ tx.compteDestination }}
                            } @else if (tx.type.includes('ENTRANT')) {
                              De: {{ tx.compteDestination }}
                            }
                          </p>
                        }
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="font-bold" [class]="tx.type.includes('DEPOT') || tx.type.includes('ENTRANT') ? 'text-green-600' : 'text-red-600'">
                        {{ tx.type.includes('DEPOT') || tx.type.includes('ENTRANT') ? '+' : '-' }}{{ tx.montant | number:'1.2-2' }} XOF
                      </p>
                      <p class="text-sm text-gray-500">Solde: {{ tx.soldeApres | number:'1.2-2' }} XOF</p>
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
          </div>
        </div>
      }

      <!-- Operation Modal -->
      @if (showOperationModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="p-6 border-b" [class]="operationType() === 'deposit' ? 'bg-green-50' : 'bg-red-50'">
              <h2 class="text-xl font-bold" [class]="operationType() === 'deposit' ? 'text-green-800' : 'text-red-800'">
                {{ operationType() === 'deposit' ? 'Effectuer un dépôt' : 'Effectuer un retrait' }}
              </h2>
              <p class="text-sm" [class]="operationType() === 'deposit' ? 'text-green-600' : 'text-red-600'">
                Compte: {{ account()!.numeroCompte }}
              </p>
            </div>
            <form [formGroup]="operationForm" (ngSubmit)="executeOperation()" class="p-6">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Montant (XOF) *</label>
                <input type="number" formControlName="montant" min="1" step="0.01"
                  class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="0.00">
                @if (operationType() === 'withdraw' && account()) {
                  <p class="mt-1 text-sm text-gray-500">Solde disponible: {{ account()!.solde | number:'1.2-2' }} XOF</p>
                }
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                <input type="text" formControlName="description" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Versement mensuel">
              </div>
              @if (operationError()) {
                <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ operationError() }}
                </div>
              }
              <div class="flex justify-end gap-4">
                <button type="button" (click)="closeOperationModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">Annuler</button>
                <button type="submit" [disabled]="operationForm.invalid || isProcessing()"
                  class="px-6 py-2 text-white rounded-lg disabled:opacity-50 transition flex items-center gap-2"
                  [class]="operationType() === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'">
                  @if (isProcessing()) {
                    <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement...
                  } @else {
                    Confirmer
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Confirmation Modal -->
      @if (showConfirmModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="p-6 border-b bg-orange-50">
              <h2 class="text-xl font-bold text-orange-800">Confirmation requise</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-700 mb-6">{{ confirmMessage() }}</p>
              <div class="flex justify-end gap-4">
                <button (click)="showConfirmModal.set(false)" class="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">Annuler</button>
                <button (click)="executeConfirmAction()" 
                  class="px-6 py-2 text-white rounded-lg transition"
                  [class]="confirmAction() === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AccountDetailComponent implements OnInit {
  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  showOperationModal = signal(false);
  operationType = signal<'deposit' | 'withdraw'>('deposit');
  operationError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isProcessing = signal(false);
  operationForm: FormGroup;

  // Date filter
  dateDebut = '';
  dateFin = '';

  // Confirmation modal
  showConfirmModal = signal(false);
  confirmMessage = signal('');
  confirmAction = signal<'delete' | 'deactivate'>('delete');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    this.operationForm = this.fb.group({
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
    const numero = this.route.snapshot.paramMap.get('numero')!;
    this.loadAccount(numero);
    this.loadTransactions(numero);
  }

  loadAccount(numero: string): void {
    this.accountService.getByNumber(numero).subscribe({
      next: (account) => this.account.set(account),
      error: (err) => {
        console.error('Error loading account', err);
        this.router.navigate(['/accounts']);
      }
    });
  }

  loadTransactions(numero: string): void {
    this.transactionService.getAllByAccount(numero).subscribe({
      next: (txs) => this.transactions.set(txs)
    });
  }

  filterByDate(): void {
    if (this.dateDebut && this.dateFin && this.account()) {
      this.transactionService.getHistory(this.account()!.numeroCompte, this.dateDebut, this.dateFin).subscribe({
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
    if (this.account()) {
      this.loadTransactions(this.account()!.numeroCompte);
    }
  }

  openOperation(type: 'deposit' | 'withdraw'): void {
    this.operationType.set(type);
    this.operationForm.reset();
    this.operationError.set(null);
    this.showOperationModal.set(true);
  }

  closeOperationModal(): void {
    this.showOperationModal.set(false);
    this.isProcessing.set(false);
  }

  executeOperation(): void {
    if (this.operationForm.invalid) return;

    this.isProcessing.set(true);
    this.operationError.set(null);

    const request: OperationRequest = {
      montant: this.operationForm.value.montant,
      description: this.operationForm.value.description
    };

    const numero = this.account()!.numeroCompte;
    const operation = this.operationType() === 'deposit'
      ? this.transactionService.deposit(numero, request)
      : this.transactionService.withdraw(numero, request);

    operation.subscribe({
      next: () => {
        this.closeOperationModal();
        this.loadAccount(numero);
        this.loadTransactions(numero);
        this.successMessage.set(
          this.operationType() === 'deposit'
            ? `Dépôt de ${request.montant} XOF effectué avec succès !`
            : `Retrait de ${request.montant} XOF effectué avec succès !`
        );
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.operationError.set(err.error?.message || 'Erreur lors de l\'opération');
      }
    });
  }

  confirmDeactivate(): void {
    this.confirmAction.set('deactivate');
    this.confirmMessage.set('Êtes-vous sûr de vouloir désactiver ce compte ? Les opérations ne seront plus possibles.');
    this.showConfirmModal.set(true);
  }

  confirmDelete(): void {
    this.confirmAction.set('delete');
    this.confirmMessage.set('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.');
    this.showConfirmModal.set(true);
  }

  executeConfirmAction(): void {
    this.showConfirmModal.set(false);

    if (this.confirmAction() === 'deactivate') {
      this.accountService.deactivate(this.account()!.id).subscribe({
        next: () => {
          this.successMessage.set('Compte désactivé avec succès !');
          this.loadAccount(this.account()!.numeroCompte);
          setTimeout(() => this.successMessage.set(null), 5000);
        },
        error: (err) => alert(err.error?.message || 'Erreur lors de la désactivation')
      });
    } else {
      this.accountService.delete(this.account()!.id).subscribe({
        next: () => {
          this.router.navigate(['/accounts']);
        },
        error: (err) => alert(err.error?.message || 'Erreur lors de la suppression')
      });
    }
  }

  downloadStatement(): void {
    const debut = this.dateDebut || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = this.dateFin || new Date().toISOString().split('T')[0];

    this.transactionService.downloadStatement(this.account()!.numeroCompte, debut, fin).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `releve_${this.account()!.numeroCompte.substring(0, 8)}_${debut}_${fin}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.successMessage.set('Relevé téléchargé avec succès !');
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: () => alert('Erreur lors du téléchargement du relevé')
    });
  }
}

