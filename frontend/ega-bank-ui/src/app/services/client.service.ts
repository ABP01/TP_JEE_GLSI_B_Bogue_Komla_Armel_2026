import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientRequest, ClientResponse } from '../models/client.model';
import { PageResponse } from '../models/page.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ClientService {
  constructor(private api: ApiService) {}

  getAll(page = 0, size = 10): Observable<PageResponse<ClientResponse>> {
    return this.api.get<PageResponse<ClientResponse>>(`/clients`, { page, size });
  }

  search(q: string, page = 0, size = 10): Observable<PageResponse<ClientResponse>> {
    return this.api.get<PageResponse<ClientResponse>>(`/clients/search`, { q, page, size });
  }

  getById(id: number): Observable<ClientResponse> {
    return this.api.get<ClientResponse>(`/clients/${id}`);
  }

  getWithAccounts(id: number): Observable<ClientResponse> {
    return this.api.get<ClientResponse>(`/clients/${id}/details`);
  }

  create(payload: ClientRequest): Observable<ClientResponse> {
    return this.api.post<ClientResponse>(`/clients`, payload);
  }

  update(id: number, payload: ClientRequest): Observable<ClientResponse> {
    return this.api.put<ClientResponse>(`/clients/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.api.delete(`/clients/${id}`);
  }
}
