import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, Client, PageResponse, Transaction } from '../models';

export interface DashboardStats {
    totalClients: number;
    totalAccounts: number;
    comptesEpargne: number;
    comptesCourants: number;
    soldeTotal: number;
    transactionsRecentes: Transaction[];
    comptesRecents: Account[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getStats(): Observable<DashboardStats> {
        return forkJoin({
            clients: this.http.get<PageResponse<Client>>(`${this.apiUrl}/clients?page=0&size=1`),
            accounts: this.http.get<PageResponse<Account>>(`${this.apiUrl}/accounts?page=0&size=100`)
        }).pipe(
            map(({ clients, accounts }) => {
                const epargne = accounts.content.filter(a => a.typeCompte === 'EPARGNE');
                const courant = accounts.content.filter(a => a.typeCompte === 'COURANT');
                const soldeTotal = accounts.content.reduce((sum, a) => sum + a.solde, 0);
                const comptesRecents = accounts.content
                    .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
                    .slice(0, 5);

                return {
                    totalClients: clients.totalElements,
                    totalAccounts: accounts.totalElements,
                    comptesEpargne: epargne.length,
                    comptesCourants: courant.length,
                    soldeTotal,
                    transactionsRecentes: [],
                    comptesRecents
                };
            })
        );
    }

    getRecentTransactions(numeroCompte: string): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/${numeroCompte}`);
    }
}
