import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
    totalClients: number;
    totalAccounts: number;
    activeAccounts: number;
    totalBalance: number;
    totalTransactions: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    constructor(private api: ApiService) { }

    getStats(): Observable<DashboardStats> {
        return this.api.get<DashboardStats>('/dashboard/stats');
    }
}
