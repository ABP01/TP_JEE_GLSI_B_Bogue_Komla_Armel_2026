import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    // Public routes (login, register)
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard]
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard]
    },
    // Protected routes with MainLayout
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'clients',
                loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent)
            },
            {
                path: 'clients/:id',
                loadComponent: () => import('./features/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent)
            },
            {
                path: 'accounts',
                loadComponent: () => import('./features/accounts/account-list/account-list.component').then(m => m.AccountListComponent)
            },
            {
                path: 'accounts/:numero',
                loadComponent: () => import('./features/accounts/account-detail/account-detail.component').then(m => m.AccountDetailComponent)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./features/transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
            }
        ]
    },
    // Connection test (public for debugging)
    {
        path: 'connection-test',
        loadComponent: () => import('./features/connection-test/connection-test.component').then(m => m.ConnectionTestComponent)
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
