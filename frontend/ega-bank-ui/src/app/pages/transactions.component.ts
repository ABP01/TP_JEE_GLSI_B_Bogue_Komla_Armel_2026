import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { mockAccounts, mockTransactions } from '../mock-data';
import { transactionAmountClass, transactionSign } from '../shared/status.util';

@Component({
  standalone: true,
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent {
  transactions = mockTransactions;
  accounts = mockAccounts;
  filteredTransactions = this.transactions;
  selectedAccount: any = null;
  accountId: string | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((map) => {
      this.accountId = map.get('accountId');
      this.filteredTransactions = this.accountId ? this.transactions.filter((t) => t.accountId === this.accountId) : this.transactions;
      this.selectedAccount = this.accountId ? this.accounts.find((a) => a.accountId === this.accountId) : null;
      // simple sort newest first
      this.filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }

  getTxnAmountClass(type: string) {
    return transactionAmountClass(type as any);
  }

  getTxnSign(type: string) {
    return transactionSign(type as any);
  }
}
