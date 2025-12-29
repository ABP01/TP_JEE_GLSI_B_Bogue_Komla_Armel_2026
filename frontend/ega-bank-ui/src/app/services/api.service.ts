import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = '/api';

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach((k) => p = p.set(k, String(params[k])));
    }
    return this.http.get<T>(`${this.base}${path}`, { params: p });
  }

  post<T>(path: string, body: any, options?: { responseType?: 'json' | 'blob' }): Observable<T> {
    if (options && options.responseType === 'blob') {
      return this.http.post<any>(`${this.base}${path}`, body, { responseType: 'blob' as 'json' }) as unknown as Observable<T>;
    }
    return this.http.post<T>(`${this.base}${path}`, body);
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.base}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.base}${path}`);
  }
}
