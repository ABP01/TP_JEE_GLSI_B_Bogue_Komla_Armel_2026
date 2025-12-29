import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Account, mockAccounts, mockClients } from '../mock-data';
import { statusClassObject, statusDisplay } from '../shared/status.util';

@Component({
  standalone: true,
  selector: 'app-accounts',
  imports: [CommonModule],
  templateUrl: './accounts.component.html',
})
export class AccountsComponent {
  accounts = mockAccounts;
  clients = mockClients;
  filteredAccounts = this.accounts;

  constructor(private route: ActivatedRoute) {
    this.route.queryParamMap.subscribe((map) => {
      const clientId = map.get('clientId');
      this.filteredAccounts = clientId ? this.accounts.filter((a) => a.clientId === clientId) : this.accounts;
    });
  }

  getClientName(clientId: string) {
    const c = this.clients.find((x) => x.clientId === clientId);
    return c ? `${c.firstName} ${c.lastName}` : clientId;
  }

  getStatusClass(status: Account['status']) {
    return statusClassObject(status);
  }

  getStatusDisplay(status: Account['status']) {
    return statusDisplay(status);
  }
}
