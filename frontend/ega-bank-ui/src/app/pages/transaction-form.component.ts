import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2">New Transaction</h1>
        <p class="text-gray-500">Perform a deposit, withdrawal, or transfer between accounts.</p>
      </div>

      <div class="card p-6" style="max-width: 700px;">
        <!-- Error Message -->
        <div *ngIf="errorMessage" class="alert alert-danger mb-4">
          <i class="ri-error-warning-line"></i> {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="alert alert-success mb-4">
          <i class="ri-checkbox-circle-line"></i> {{ successMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <!-- Transaction Type -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="ri-exchange-line text-primary"></i> Transaction Type *
            </label>
            <div class="grid gap-3" style="grid-template-columns: repeat(3, 1fr);">
              <label class="cursor-pointer">
                <input type="radio" formControlName="type" value="DEPOT" class="sr-only peer">
                <div class="p-4 border rounded hover:bg-gray-50 peer-checked:bg-success peer-checked:text-white peer-checked:border-success transition-all text-center">
                  <i class="ri-add-circle-line text-2xl"></i>
                  <div class="font-medium mt-1">Deposit</div>
                  <div class="text-xs opacity-70">Dépôt</div>
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" formControlName="type" value="RETRAIT" class="sr-only peer">
                <div class="p-4 border rounded hover:bg-gray-50 peer-checked:bg-danger peer-checked:text-white peer-checked:border-danger transition-all text-center">
                  <i class="ri-subtract-line text-2xl"></i>
                  <div class="font-medium mt-1">Withdraw</div>
                  <div class="text-xs opacity-70">Retrait</div>
                </div>
              </label>
              <label class="cursor-pointer">
                <input type="radio" formControlName="type" value="VIREMENT" class="sr-only peer">
                <div class="p-4 border rounded hover:bg-gray-50 peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all text-center">
                  <i class="ri-arrow-left-right-line text-2xl"></i>
                  <div class="font-medium mt-1">Transfer</div>
                  <div class="text-xs opacity-70">Virement</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Source Account -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="ri-bank-card-line text-primary"></i> 
              {{ form.value.type === 'VIREMENT' ? 'Source Account' : 'Account' }} *
            </label>
            
            <!-- Loading accounts -->
            <div *ngIf="isLoadingAccounts" class="skeleton" style="height: 44px; border-radius: 4px;"></div>
            
            <!-- No accounts available -->
            <div *ngIf="!isLoadingAccounts && accounts.length === 0" class="p-4 bg-gray-50 rounded border text-center">
              <i class="ri-bank-card-2-line text-2xl text-gray-400"></i>
              <p class="text-gray-500 mt-2">No accounts found.</p>
              <a routerLink="/accounts/new" class="btn btn-primary btn-sm mt-2">
                <i class="ri-add-line"></i> Create Account First
              </a>
            </div>

            <!-- Account dropdown -->
            <select *ngIf="!isLoadingAccounts && accounts.length > 0" 
                    formControlName="accountNumber" 
                    class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">-- Select an account --</option>
              <option *ngFor="let account of accounts" [value]="account.numeroCompte">
                {{ account.numeroCompte }} - {{ getTypeDisplay(account.typeCompte) }} 
                ({{ account.solde | currency:'XOF':'symbol':'1.0-0' }})
                {{ account.clientNomComplet ? ' - ' + account.clientNomComplet : '' }}
              </option>
            </select>
            
            <!-- Selected account info -->
            <div *ngIf="sourceAccount" class="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <i class="ri-bank-card-line text-primary"></i>
                  <div>
                    <div class="font-medium font-mono">{{ sourceAccount.numeroCompte }}</div>
                    <div class="text-sm text-gray-500">
                      {{ getTypeDisplay(sourceAccount.typeCompte) }}
                      <span *ngIf="sourceAccount.clientNomComplet"> • {{ sourceAccount.clientNomComplet }}</span>
                    </div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-500">Available Balance</div>
                  <div class="font-bold font-mono text-lg" [class.text-success]="sourceAccount.solde > 0" [class.text-danger]="sourceAccount.solde <= 0">
                    {{ sourceAccount.solde | currency:'XOF':'symbol':'1.0-0' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Target Account (only for transfers) -->
          <div *ngIf="form.value.type === 'VIREMENT'" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="ri-arrow-right-line text-primary"></i> Target Account *
            </label>
            <select formControlName="targetAccountNumber" 
                    class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">-- Select target account --</option>
              <option *ngFor="let account of getTargetAccounts()" [value]="account.numeroCompte">
                {{ account.numeroCompte }} - {{ getTypeDisplay(account.typeCompte) }} 
                {{ account.clientNomComplet ? ' - ' + account.clientNomComplet : '' }}
              </option>
            </select>
            
            <!-- Target account info -->
            <div *ngIf="targetAccount" class="mt-2 p-3 bg-green-50 rounded border border-green-200">
              <div class="flex items-center gap-2">
                <i class="ri-arrow-right-down-line text-success"></i>
                <div>
                  <div class="font-medium font-mono">{{ targetAccount.numeroCompte }}</div>
                  <div class="text-sm text-gray-500">
                    {{ getTypeDisplay(targetAccount.typeCompte) }}
                    <span *ngIf="targetAccount.clientNomComplet"> • {{ targetAccount.clientNomComplet }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Amount -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="ri-money-dollar-circle-line text-primary"></i> Amount (XOF) *
            </label>
            <div class="relative">
              <input type="number" 
                     formControlName="amount" 
                     class="w-full p-3 pl-12 border rounded text-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                     placeholder="0"
                     min="1"
                     step="1">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">XOF</span>
            </div>
            <div *ngIf="form.get('amount')?.value > 0 && sourceAccount" class="mt-2 text-sm">
              <span *ngIf="form.value.type !== 'DEPOT'" [class.text-success]="sourceAccount.solde >= form.get('amount')?.value" 
                    [class.text-danger]="sourceAccount.solde < form.get('amount')?.value">
                <i [class]="sourceAccount.solde >= form.get('amount')?.value ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'"></i>
                {{ sourceAccount.solde >= form.get('amount')?.value ? 'Sufficient balance' : 'Insufficient balance!' }}
              </span>
              <span *ngIf="form.value.type === 'DEPOT'" class="text-success">
                <i class="ri-arrow-up-line"></i> New balance will be: {{ (sourceAccount.solde + form.get('amount')?.value) | currency:'XOF':'symbol':'1.0-0' }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="ri-file-text-line text-primary"></i> Description (optional)
            </label>
            <input type="text" 
                   formControlName="description" 
                   class="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                   placeholder="Enter a description for this transaction">
          </div>

          <!-- Actions -->
          <div class="flex gap-4">
            <a routerLink="/transactions" class="btn btn-secondary flex-1" *ngIf="returnAccountId">
              <i class="ri-arrow-left-line"></i> Cancel
            </a>
            <a routerLink="/accounts" class="btn btn-secondary flex-1" *ngIf="!returnAccountId">
              <i class="ri-arrow-left-line"></i> Cancel
            </a>
            <button type="submit" 
                    [disabled]="form.invalid || isSubmitting || accounts.length === 0 || !isBalanceSufficient()" 
                    class="btn flex-1"
                    [class.btn-success]="form.value.type === 'DEPOT'"
                    [class.btn-danger]="form.value.type === 'RETRAIT'"
                    [class.btn-primary]="form.value.type === 'VIREMENT'">
              <span *ngIf="isSubmitting">
                <i class="ri-loader-4-line spinner-icon"></i> Processing...
              </span>
              <span *ngIf="!isSubmitting">
                <i [class]="getSubmitIcon()"></i> {{ getSubmitLabel() }}
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
    select:focus, input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary), transparent 80%);
    }
    .btn-success {
      background-color: var(--success);
      color: white;
    }
    .btn-success:hover {
      filter: brightness(0.95);
    }
    .btn-success:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    private store: AppStore
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
    this.accountService.getAll(0, 200).subscribe({
      next: (response) => {
        this.accounts = (response.content || []).filter(a => a.actif);
        this.isLoadingAccounts = false;

        // If pre-selected account
        if (this.returnAccountId) {
          this.sourceAccount = this.accounts.find(a => a.numeroCompte === this.returnAccountId) || null;
        }
      },
      error: (err) => {
        console.error('Failed to load accounts', err);
        this.errorMessage = 'Failed to load accounts. Please try again.';
        this.isLoadingAccounts = false;
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
