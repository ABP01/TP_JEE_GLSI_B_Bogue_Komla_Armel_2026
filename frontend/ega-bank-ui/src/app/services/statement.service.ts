import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class StatementService {
  constructor(private api: ApiService) {}

  downloadStatement(numeroCompte: string, debut: string, fin: string): Observable<Blob> {
    // The backend exposes GET /api/statements/{numeroCompte}?debut=...&fin=...
    // ApiService.post was used earlier; use get with responseType blob directly via HttpClient is better,
    // but reuse ApiService.post signature: call the endpoint via low-level fetch using HttpClient would be ideal.
    return this.api.post<Blob>(`/statements/${encodeURIComponent(numeroCompte)}?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`, null, { responseType: 'blob' });
  }
}
