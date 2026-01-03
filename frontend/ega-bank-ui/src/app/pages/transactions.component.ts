import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AccountResponse } from '../models/account.model';
import { TransactionResponse } from '../models/transaction.model';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { AppStore } from '../stores/app.store';

@Component({
  standalone: true,
  selector: 'app-transactions',
  imports: [CommonModule, RouterLink],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: TransactionResponse[] = [];
  selectedAccount: AccountResponse | null = null;
  accountId: string | null = null;
  isLoading = true;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private txService: TransactionService,
    private accountService: AccountService,
    private store: AppStore
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((map) => {
      this.accountId = map.get('accountId');
      if (this.accountId) {
        this.loadAccountAndTransactions(this.accountId);
      } else {
        this.isLoading = false;
      }
    });
    
    // S'abonner aux changements du store
    this.store.dataChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      console.log('[Transactions] Data change event:', event);
      if (event.type === 'transaction' || event.type === 'system') {
        if (this.accountId) {
          this.loadAccountAndTransactions(this.accountId);
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAccountAndTransactions(numeroCompte: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load account details
    this.accountService.getByNumber(numeroCompte).subscribe({
      next: (account) => {
        this.selectedAccount = account;
      },
      error: (err) => {
        console.error('Failed to load account', err);
        this.errorMessage = 'Failed to load account details.';
      },
    });

    // Load transactions
    this.txService.getAllByAccount(numeroCompte).subscribe({
      next: (transactions) => {
        this.transactions = transactions.sort(
          (a, b) => new Date(b.dateTransaction).getTime() - new Date(a.dateTransaction).getTime()
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.errorMessage = 'Failed to load transactions.';
        this.isLoading = false;
      },
    });
  }

  getTypeDisplay(type: string): string {
    const types: Record<string, string> = {
      DEPOT: 'Deposit',
      RETRAIT: 'Withdrawal',
      VIREMENT_ENTRANT: 'Transfer In',
      VIREMENT_SORTANT: 'Transfer Out',
    };
    return types[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      DEPOT: 'ri-add-circle-line',
      RETRAIT: 'ri-subtract-line',
      VIREMENT_ENTRANT: 'ri-arrow-down-line',
      VIREMENT_SORTANT: 'ri-arrow-up-line',
    };
    return icons[type] || 'ri-exchange-dollar-line';
  }

  getTxnAmountClass(type: string): string {
    if (type === 'DEPOT' || type === 'VIREMENT_ENTRANT') {
      return 'text-success';
    }
    return 'text-danger';
  }

  getTxnSign(type: string): string {
    if (type === 'DEPOT' || type === 'VIREMENT_ENTRANT') {
      return '+';
    }
    return '-';
  }

  getAccountTypeDisplay(typeCompte: string): string {
    const types: Record<string, string> = {
      EPARGNE: 'Savings',
      COURANT: 'Checking',
    };
    return types[typeCompte] || typeCompte;
  }
}
