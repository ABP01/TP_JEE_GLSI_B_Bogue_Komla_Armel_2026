import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, timeout } from 'rxjs';
import { AccountResponse } from '../models/account.model';
import { ClientResponse } from '../models/client.model';
import { PageResponse } from '../models/page.model';
import { AccountService } from '../services/account.service';
import { ClientService } from '../services/client.service';
import { DashboardService } from '../services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    isLoading = true;
    hasError = false;
    errorMessage = '';

    stats = {
        totalClients: 0,
        totalAccounts: 0,
        totalBalance: 0,
        activeAccounts: 0,
        totalTransactions: 0
    };
    recentClients: ClientResponse[] = [];
    recentAccounts: AccountResponse[] = [];

    constructor(
        private clientService: ClientService,
        private accountService: AccountService,
        private dashboardService: DashboardService
    ) { }

    ngOnInit() {
        this.loadData();
    }

    retry() {
        this.loadData();
    }

    private loadData() {
        this.isLoading = true;
        this.hasError = false;
        this.errorMessage = '';

        console.log('[Dashboard] Starting data load...');

        // Execute requests in parallel using forkJoin
        forkJoin({
            // Récupérer les vraies statistiques depuis le backend
            dashboardStats: this.dashboardService.getStats().pipe(
                timeout(10000),
                catchError(err => {
                    console.error('[Dashboard] Error loading stats:', err);
                    return of(null);
                })
            ),
            recentClients: this.clientService.getAll(0, 5).pipe(
                timeout(10000),
                catchError(err => {
                    console.error('[Dashboard] Error loading recentClients:', err);
                    return of({ content: [], totalElements: 0, pageNumber: 0, pageSize: 5, totalPages: 0, first: true, last: true } as PageResponse<ClientResponse>);
                })
            ),
            recentAccounts: this.accountService.getAll(0, 5).pipe(
                timeout(10000),
                catchError(err => {
                    console.error('[Dashboard] Error loading recentAccounts:', err);
                    return of({ content: [], totalElements: 0, pageNumber: 0, pageSize: 5, totalPages: 0, first: true, last: true } as PageResponse<AccountResponse>);
                })
            )
        }).subscribe({
            next: (results) => {
                console.log('[Dashboard] Received results:', results);

                const { dashboardStats, recentClients, recentAccounts } = results;

                // Utiliser les statistiques du backend si disponibles
                if (dashboardStats) {
                    this.stats.totalClients = dashboardStats.totalClients;
                    this.stats.totalAccounts = dashboardStats.totalAccounts;
                    this.stats.activeAccounts = dashboardStats.activeAccounts;
                    this.stats.totalBalance = dashboardStats.totalBalance;
                    this.stats.totalTransactions = dashboardStats.totalTransactions;
                } else {
                    // Fallback: calculer depuis les listes récentes
                    this.stats.totalClients = recentClients?.totalElements || 0;
                    this.stats.totalAccounts = recentAccounts?.totalElements || 0;
                    const sampleAccounts = recentAccounts?.content || [];
                    this.stats.totalBalance = sampleAccounts.reduce((sum, acc) => sum + (acc?.solde || 0), 0);
                    this.stats.activeAccounts = sampleAccounts.filter(a => a?.actif).length;
                }

                // Lists
                this.recentClients = recentClients?.content || [];
                this.recentAccounts = recentAccounts?.content || [];

                console.log('[Dashboard] Data loaded successfully:', {
                    totalClients: this.stats.totalClients,
                    totalAccounts: this.stats.totalAccounts,
                    activeAccounts: this.stats.activeAccounts,
                    totalBalance: this.stats.totalBalance,
                    recentClientsCount: this.recentClients.length,
                    recentAccountsCount: this.recentAccounts.length
                });

                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('[Dashboard] Fatal error loading data:', err);
                this.isLoading = false;
                this.hasError = true;
                this.errorMessage = 'Failed to load dashboard data. Please check if the backend is running.';
            }
        });
    }
}
