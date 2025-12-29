import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private api: ApiService) {}

  register(payload: any): Observable<any> {
    return this.api.post('/auth/register', payload);
  }

  login(payload: any): Observable<any> {
    return this.api.post('/auth/login', payload);
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.api.post(`/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, null);
  }
}
