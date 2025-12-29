import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { mockAccounts, mockClients } from '../mock-data';

@Component({
  standalone: true,
  selector: 'app-clients',
  imports: [CommonModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent {
  clients = mockClients;
  accounts = mockAccounts;

  constructor(private router: Router) { }

  getTotalBalance(client: any) {
    const clientAccounts = this.accounts.filter((a) => client.accountIds.includes(a.accountId));
    return clientAccounts.reduce((s, a) => s + a.balance, 0);
  }

  viewAccounts(clientId: string) {
    this.router.navigate(['/accounts'], { queryParams: { clientId } });
  }
}
