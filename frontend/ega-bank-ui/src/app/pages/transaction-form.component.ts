import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { AccountResponse } from '../models/account.model';
import { TransactionResponse } from '../models/transaction.model';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { AppStore } from '../stores/app.store';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="p-6">
      <div class="mb-6 animate-slide-in">
        <h1 class="text-3xl font-bold mb-2 tracking-tight">New Transaction</h1>
        <p class="text-gray-500 text-lg">Perform a secure deposit, withdrawal, or transfer between accounts.</p>
      </div>

      <div class="card p-8 animate-slide-in mx-auto max-w-3xl">
        <!-- Error Message -->
        <div *ngIf="errorMessage" class="alert alert-danger mb-6 shadow-sm">
          <i class="ri-error-warning-line text-lg"></i> 
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="alert alert-success mb-6 shadow-sm">
          <i class="ri-checkbox-circle-line text-lg"></i> 
          <span>{{ successMessage }}</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <!-- Transaction Type -->
          <div class="mb-8">
            <label class="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Transaction Type
            </label>
            <div class="grid gap-4 grid-cols-3">
              <label class="cursor-pointer group">
                <input type="radio" formControlName="type" value="DEPOT" class="sr-only peer">
                <div class="p-4 border-2 border-gray-100 rounded-lg peer-checked:bg-green-50 peer-checked:border-success peer-checked:text-success hover:border-success/50 transition-all text-center h-full flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-green-100 text-success flex items-center justify-center mb-2 text-2xl group-hover:scale-110 transition-transform">
                      <i class="ri-add-line"></i>
                  </div>
                  <div class="font-bold text-lg">Deposit</div>
                </div>
              </label>
              <label class="cursor-pointer group">
                <input type="radio" formControlName="type" value="RETRAIT" class="sr-only peer">
                <div class="p-4 border-2 border-gray-100 rounded-lg peer-checked:bg-red-50 peer-checked:border-danger peer-checked:text-danger hover:border-danger/50 transition-all text-center h-full flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-red-100 text-danger flex items-center justify-center mb-2 text-2xl group-hover:scale-110 transition-transform">
                      <i class="ri-subtract-line"></i>
                  </div>
                  <div class="font-bold text-lg">Withdraw</div>
                </div>
              </label>
              <label class="cursor-pointer group">
                <input type="radio" formControlName="type" value="VIREMENT" class="sr-only peer">
                <div class="p-4 border-2 border-gray-100 rounded-lg peer-checked:bg-blue-50 peer-checked:border-primary peer-checked:text-primary hover:border-primary/50 transition-all text-center h-full flex flex-col items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-2 text-2xl group-hover:scale-110 transition-transform">
                      <i class="ri-arrow-left-right-line"></i>
                  </div>
                  <div class="font-bold text-lg">Transfer</div>
                </div>
              </label>
            </div>
          </div>

          <div class="grid gap-6 mb-6">
              <!-- Source Account -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  {{ form.value.type === 'VIREMENT' ? 'Source Account' : 'Account' }} *
                </label>
                
                <!-- Loading accounts -->
                <div *ngIf="isLoadingAccounts" class="skeleton h-12 rounded-lg"></div>
                
                <!-- No accounts available -->
                <div *ngIf="!isLoadingAccounts && accounts.length === 0" class="p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                  <div class="text-3xl text-gray-300 mb-2"><i class="ri-bank-card-2-line"></i></div>
                  <p class="text-gray-500 mb-4 font-medium">No accounts found.</p>
                  <a routerLink="/accounts/new" class="btn btn-primary btn-sm">
                    Create Account First
                  </a>
                </div>
    
                <!-- Account dropdown -->
                <div *ngIf="!isLoadingAccounts && accounts.length > 0" class="relative">
                    <i class="ri-bank-card-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
                    <select formControlName="accountNumber" 
                            class="w-full p-3 pl-10 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-shadow cursor-pointer">
                      <option value="">Select an account...</option>
                      <option *ngFor="let account of accounts" [value]="account.numeroCompte">
                        {{ account.numeroCompte }} ({{ getTypeDisplay(account.typeCompte) }})
                      </option>
                    </select>
                    <i class="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
                
                <!-- Selected account info -->
                <div *ngIf="sourceAccount" class="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center animate-slide-in">
                    <div>
                        <div class="text-xs text-blue-800 uppercase font-bold tracking-wide mb-1">Current Balance</div>
                        <div class="font-mono font-bold text-2xl" [class.text-success]="sourceAccount.solde > 0" [class.text-danger]="sourceAccount.solde <= 0">
                            {{ sourceAccount.solde | currency:'XOF':'symbol':'1.0-0' }}
                        </div>
                    </div>
                    <div class="text-right">
                         <div class="text-sm font-medium text-blue-900">{{ sourceAccount.clientNomComplet }}</div>
                         <div class="text-xs text-blue-700">{{ getTypeDisplay(sourceAccount.typeCompte) }}</div>
                    </div>
                </div>
              </div>
    
              <!-- Target Account (only for transfers) -->
              <div *ngIf="form.value.type === 'VIREMENT'" class="animate-slide-in">
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                   Target Account *
                </label>
                <div class="relative">
                    <i class="ri-arrow-right-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
                    <select formControlName="targetAccountNumber" 
                            class="w-full p-3 pl-10 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-shadow cursor-pointer">
                      <option value="">Select target account...</option>
                      <option *ngFor="let account of getTargetAccounts()" [value]="account.numeroCompte">
                         {{ account.numeroCompte }} ({{ getTypeDisplay(account.typeCompte) }}) - {{ account.clientNomComplet }}
                      </option>
                    </select>
                     <i class="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
    
              <!-- Amount -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                   Amount (XOF) *
                </label>
                <div class="relative">
                  <input type="number" 
                         formControlName="amount" 
                         class="w-full p-4 pl-4 pr-16 border rounded-lg text-2xl font-mono font-bold focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                         placeholder="0"
                         min="1"
                         step="1">
                  <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded text-sm">XOF</span>
                </div>
                
                <!-- Feedback messages -->
                <div *ngIf="form.get('amount')?.value > 0 && sourceAccount" class="mt-3 flex items-center gap-2 text-sm font-medium animate-slide-in">
                   <ng-container *ngIf="form.value.type !== 'DEPOT'">
                        <i [class]="sourceAccount.solde >= form.get('amount')?.value ? 'ri-checkbox-circle-fill text-success' : 'ri-close-circle-fill text-danger'"></i>
                        <span [class.text-success]="sourceAccount.solde >= form.get('amount')?.value" 
                             [class.text-danger]="sourceAccount.solde < form.get('amount')?.value">
                         {{ sourceAccount.solde >= form.get('amount')?.value ? 'Sufficient balance available' : 'Insufficient funds for this transaction' }}
                        </span>
                   </ng-container>
                  <span *ngIf="form.value.type === 'DEPOT'" class="text-success flex items-center gap-2">
                    <i class="ri-arrow-up-circle-fill"></i> 
                    <span>New balance: {{ (sourceAccount.solde + form.get('amount')?.value) | currency:'XOF':'symbol':'1.0-0' }}</span>
                  </span>
                </div>
              </div>
    
              <!-- Description -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                   Description <span class="text-gray-400 font-normal normal-case">(Optional)</span>
                </label>
                <input type="text" 
                       formControlName="description" 
                       class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                       placeholder="e.g., Monthly Rent Payment">
              </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4 border-t border-gray-100">
            <a routerLink="/transactions" class="btn btn-secondary flex-1 py-3 text-base" *ngIf="returnAccountId">
              Cancel
            </a>
            <a routerLink="/accounts" class="btn btn-secondary flex-1 py-3 text-base" *ngIf="!returnAccountId">
              Cancel
            </a>
            <button type="submit" 
                    [disabled]="form.invalid || isSubmitting || accounts.length === 0 || !isBalanceSufficient()" 
                    class="btn flex-[2] py-3 text-base shadow-lg transition-transform active:scale-95"
                    [class.btn-success]="form.value.type === 'DEPOT'"
                    [class.btn-danger]="form.value.type === 'RETRAIT'"
                    [class.btn-primary]="form.value.type === 'VIREMENT'">
              <span *ngIf="isSubmitting" class="flex items-center gap-2">
                <i class="ri-loader-4-line spinner-icon text-xl"></i> Processing...
              </span>
              <span *ngIf="!isSubmitting" class="flex items-center gap-2">
                <i [class]="getSubmitIcon() + ' text-xl'"></i> 
                {{ getSubmitLabel() }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }
    .skeleton {
        background: linear-gradient(110deg, #f1f5f9 8%, #f8fafc 18%, #f1f5f9 33%);
        background-size: 200% 100%;
        animation: 1.5s shiny linear infinite;
    }
  `]
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  form: FormGroup;
  accounts: AccountResponse[] = [];
  sourceAccount: AccountResponse | null = null;
  targetAccount: AccountResponse | null = null;
  isLoadingAccounts = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  returnAccountId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private txService: TransactionService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private store: AppStore,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      type: ['DEPOT', Validators.required],
      accountNumber: ['', Validators.required],
      targetAccountNumber: [''],
      amount: [null, [Validators.required, Validators.min(1)]],
      description: [''],
    });

    // Watch for account selection changes
    this.form.get('accountNumber')?.valueChanges.subscribe(accountNumber => {
      this.sourceAccount = this.accounts.find(a => a.numeroCompte === accountNumber) || null;
    });

    this.form.get('targetAccountNumber')?.valueChanges.subscribe(accountNumber => {
      this.targetAccount = this.accounts.find(a => a.numeroCompte === accountNumber) || null;
    });

    // Reset target when type changes
    this.form.get('type')?.valueChanges.subscribe(type => {
      if (type !== 'VIREMENT') {
        this.form.patchValue({ targetAccountNumber: '' });
        this.targetAccount = null;
      }
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.returnAccountId = params.get('accountId');
      if (this.returnAccountId) {
        // Pre-select account if coming from transactions page
        this.form.patchValue({ accountNumber: this.returnAccountId });
      }
    });
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoadingAccounts = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.accountService.getAll(0, 200).subscribe({
      next: (response) => {
        this.accounts = (response.content || []).filter(a => a.actif);
        this.isLoadingAccounts = false;

        // If pre-selected account
        if (this.returnAccountId) {
          this.sourceAccount = this.accounts.find(a => a.numeroCompte === this.returnAccountId) || null;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
        this.errorMessage = 'Failed to load accounts. Please try again.';
        this.isLoadingAccounts = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTargetAccounts(): AccountResponse[] {
    const sourceNum = this.form.value.accountNumber;
    return this.accounts.filter(a => a.numeroCompte !== sourceNum);
  }

  getTypeDisplay(typeCompte: string): string {
    const types: Record<string, string> = {
      EPARGNE: 'Savings',
      COURANT: 'Checking',
    };
    return types[typeCompte] || typeCompte;
  }

  isBalanceSufficient(): boolean {
    if (this.form.value.type === 'DEPOT') return true;
    if (!this.sourceAccount) return false;
    return this.sourceAccount.solde >= (this.form.value.amount || 0);
  }

  getSubmitIcon(): string {
    switch (this.form.value.type) {
      case 'DEPOT': return 'ri-add-circle-line';
      case 'RETRAIT': return 'ri-subtract-line';
      case 'VIREMENT': return 'ri-arrow-left-right-line';
      default: return 'ri-check-line';
    }
  }

  getSubmitLabel(): string {
    switch (this.form.value.type) {
      case 'DEPOT': return 'Deposit';
      case 'RETRAIT': return 'Withdraw';
      case 'VIREMENT': return 'Transfer';
      default: return 'Submit';
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    const v = this.form.value;

    // Validate transfer target
    if (v.type === 'VIREMENT' && !v.targetAccountNumber) {
      this.errorMessage = 'Please select a target account for the transfer.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (v.type === 'VIREMENT') {
      this.txService.transfer({
        compteSource: String(v.accountNumber),
        compteDestination: String(v.targetAccountNumber),
        montant: Number(v.amount),
        description: v.description || undefined
      }).subscribe({
        next: (tx) => this.handleSuccess('Transfer completed successfully!', tx),
        error: (e) => this.handleError(e)
      });
    } else if (v.type === 'DEPOT') {
      this.txService.deposit(String(v.accountNumber), {
        montant: Number(v.amount),
        description: v.description || undefined
      }).subscribe({
        next: (tx) => this.handleSuccess('Deposit completed successfully!', tx),
        error: (e) => this.handleError(e)
      });
    } else {
      this.txService.withdraw(String(v.accountNumber), {
        montant: Number(v.amount),
        description: v.description || undefined
      }).subscribe({
        next: (tx) => this.handleSuccess('Withdrawal completed successfully!', tx),
        error: (e) => this.handleError(e)
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleSuccess(message: string, transaction?: TransactionResponse): void {
    this.successMessage = message;
    this.isSubmitting = false;

    // Mettre à jour le store avec les nouveaux soldes
    if (transaction && transaction.soldeApres !== undefined) {
      const accountNumber = this.form.value.accountNumber;
      this.store.updateAccountBalance(accountNumber, transaction.soldeApres);

      // Pour les virements, mettre à jour aussi le compte destination
      if (this.form.value.type === 'VIREMENT' && this.targetAccount) {
        // Le backend retourne soldeApres du compte source
        // On déclenche un refresh complet pour les virements
        this.store.triggerFullRefresh();
      }
    } else {
      // Si pas de transaction response, déclencher un refresh complet
      this.store.triggerFullRefresh();
    }

    // Incrémenter le compteur de transactions
    this.store.incrementTransactionCount();

    // Navigate after showing success
    setTimeout(() => {
      if (this.returnAccountId) {
        this.router.navigate(['/transactions'], { queryParams: { accountId: this.returnAccountId } });
      } else {
        this.router.navigateByUrl('/accounts');
      }
    }, 1500);
  }

  private handleError(err: any): void {
    console.error('Transaction failed', err);
    this.isSubmitting = false;
    this.errorMessage = err.error?.message || 'Transaction failed. Please try again.';
  }
}
