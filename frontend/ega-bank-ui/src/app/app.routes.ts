import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AccountCreateComponent } from './pages/account-create.component';
import { AccountsComponent } from './pages/accounts.component';
import { ClientCreateComponent } from './pages/client-create.component';
import { ClientsComponent } from './pages/clients.component';
import { DashboardComponent } from './pages/dashboard.component';
import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';
import { SettingsComponent } from './pages/settings.component';
import { TransactionFormComponent } from './pages/transaction-form.component';
import { TransactionsComponent } from './pages/transactions.component';

export const routes: Routes = [
	{ path: '', component: DashboardComponent, canActivate: [AuthGuard] },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'clients', component: ClientsComponent, canActivate: [AuthGuard] },
	{ path: 'clients/new', component: ClientCreateComponent, canActivate: [AuthGuard] },
	{ path: 'accounts', component: AccountsComponent, canActivate: [AuthGuard] },
	{ path: 'accounts/new', component: AccountCreateComponent, canActivate: [AuthGuard] },
	{ path: 'transactions', component: TransactionsComponent, canActivate: [AuthGuard] },
	{ path: 'transactions/new', component: TransactionFormComponent, canActivate: [AuthGuard] },
	{ path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
	{ path: '**', redirectTo: 'clients' },
];
