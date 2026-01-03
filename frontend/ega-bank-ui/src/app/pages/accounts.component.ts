import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountResponse } from '../models/account.model';
import { AccountService } from '../services/account.service';
import { ClientService } from '../services/client.service';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [CommonModule, RouterLink],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent implements OnInit {
  accounts: AccountResponse[] = [];
  clientId: number | null = null;
  isLoading = true;
  errorMessage = '';
  // Cache for client names
  private clientCache: Map<number, string> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private clientService: ClientService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((map) => {
      const clientIdParam = map.get('clientId');
      this.clientId = clientIdParam ? Number(clientIdParam) : null;
      this.loadAccounts();
    });
  }

  loadAccounts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.clientId) {
      // Load accounts for specific client
      this.accountService.getByClient(this.clientId).subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load accounts', err);
          this.errorMessage = 'Failed to load accounts.';
          this.isLoading = false;
        },
      });
    } else {
      // Load all accounts
      this.accountService.getAll(0, 100).subscribe({
        next: (response) => {
          this.accounts = response.content || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load accounts', err);
          this.errorMessage = 'Failed to load accounts.';
          this.isLoading = false;
        },
      });
    }
  }

  getStatusClass(actif: boolean) {
    return actif ? 'badge-success' : 'badge-danger';
  }

  getStatusDisplay(actif: boolean) {
    return actif ? 'Active' : 'Inactive';
  }

  getTypeDisplay(typeCompte: string) {
    const types: Record<string, string> = {
      EPARGNE: 'Savings',
      COURANT: 'Checking',
    };
    return types[typeCompte] || typeCompte;
  }

  viewTransactions(numeroCompte: string) {
    this.router.navigate(['/transactions'], { queryParams: { accountId: numeroCompte } });
  }
}
