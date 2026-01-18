import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AccountResponse } from '../models/account.model';
import { TransactionResponse } from '../models/transaction.model';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { StatementService } from '../services/statement.service';
import { AppStore } from '../stores/app.store';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-transactions',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: TransactionResponse[] = [];
  selectedAccount: AccountResponse | null = null;
  accountId: string | null = null;
  isLoading = true;
  errorMessage = '';

  // Statement download modal
  showStatementModal = false;
  statementStartDate = '';
  statementEndDate = '';
  isDownloading = false;
  downloadError = '';

  isAdmin = false;
  clientId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private txService: TransactionService,
    private accountService: AccountService,
    private statementService: StatementService,
    private store: AppStore,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    // Initialize default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.statementEndDate = today.toISOString().split('T')[0];
    this.statementStartDate = thirtyDaysAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'ROLE_ADMIN';
    this.clientId = this.authService.getClientId();

    this.route.queryParamMap.subscribe((map) => {
      this.accountId = map.get('accountId');
      if (this.accountId) {
        this.loadAccountAndTransactions(this.accountId);
      } else {
        // Charger toutes les transactions (filtrées par backend si client)
        this.loadAllTransactions();
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
        } else {
          this.loadAllTransactions();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les transactions
   * Le backend filtre automatiquement selon le rôle (Admin = tout, Client = ses comptes)
   */
  private loadAllTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedAccount = null;
    this.cdr.detectChanges();

    this.txService.getAll().subscribe({
      next: (transactions) => {
        this.processTransactions(transactions);
      },
      error: (err) => this.handleError(err)
    });
  }

  private processTransactions(transactions: TransactionResponse[]) {
    this.transactions = transactions.sort(
      (a, b) => new Date(b.dateTransaction).getTime() - new Date(a.dateTransaction).getTime()
    );
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private handleError(err: any) {
    console.error('Failed to load transactions', err);
    this.errorMessage = 'Échec du chargement des transactions.';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private loadAccountAndTransactions(numeroCompte: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    // Load account details
    this.accountService.getByNumber(numeroCompte).subscribe({
      next: (account) => {
        this.selectedAccount = account;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load account', err);
        this.errorMessage = 'Échec du chargement des détails du compte.';
        this.cdr.detectChanges();
      },
    });

    // Load transactions
    this.txService.getAllByAccount(numeroCompte).subscribe({
      next: (transactions) => {
        this.transactions = transactions.sort(
          (a, b) => new Date(b.dateTransaction).getTime() - new Date(a.dateTransaction).getTime()
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load transactions', err);
        this.errorMessage = 'Échec du chargement des transactions.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  getTypeDisplay(type: string): string {
    const types: Record<string, string> = {
      DEPOT: 'Dépôt',
      RETRAIT: 'Retrait',
      VIREMENT_ENTRANT: 'Virement reçu',
      VIREMENT_SORTANT: 'Virement émis',
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
      EPARGNE: 'Épargne',
      COURANT: 'Courant',
    };
    return types[typeCompte] || typeCompte;
  }

  // Statement download methods
  openStatementModal(): void {
    this.showStatementModal = true;
    this.downloadError = '';
  }

  closeStatementModal(): void {
    this.showStatementModal = false;
    this.downloadError = '';
  }

  downloadStatement(): void {
    if (!this.accountId || !this.statementStartDate || !this.statementEndDate) {
      this.downloadError = 'Veuillez sélectionner les dates.';
      return;
    }

    this.isDownloading = true;
    this.downloadError = '';
    this.cdr.detectChanges();

    this.statementService.downloadStatement(
      this.accountId,
      this.statementStartDate,
      this.statementEndDate
    ).subscribe({
      next: (blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `releve_${this.accountId}_${this.statementStartDate}_${this.statementEndDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Close modal after triggering download
        this.isDownloading = false;
        this.showStatementModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to download statement', err);
        this.downloadError = 'Échec du téléchargement. Veuillez réessayer.';
        this.isDownloading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
