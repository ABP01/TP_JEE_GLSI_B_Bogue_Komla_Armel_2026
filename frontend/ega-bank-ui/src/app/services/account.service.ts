import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountRequest, AccountResponse } from '../models/account.model';
import { PageResponse } from '../models/page.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private api: ApiService) {}

  getAll(page = 0, size = 10): Observable<PageResponse<AccountResponse>> {
    return this.api.get<PageResponse<AccountResponse>>(`/accounts`, { page, size });
  }

  getByNumber(numeroCompte: string): Observable<AccountResponse> {
    return this.api.get<AccountResponse>(`/accounts/${encodeURIComponent(numeroCompte)}`);
  }

  getByClient(clientId: number): Observable<AccountResponse[]> {
    return this.api.get<AccountResponse[]>(`/accounts/client/${clientId}`);
  }

  create(payload: AccountRequest): Observable<AccountResponse> {
    return this.api.post<AccountResponse>(`/accounts`, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`/accounts/${id}`);
  }

  deactivate(id: number): Observable<any> {
    return this.api.put(`/accounts/${id}/deactivate`, {});
  }
}
