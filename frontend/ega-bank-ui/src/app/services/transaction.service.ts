import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationRequest, TransactionResponse, TransferRequest } from '../models/transaction.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private api: ApiService) {}

  deposit(numeroCompte: string, payload: OperationRequest): Observable<TransactionResponse> {
    return this.api.post<TransactionResponse>(`/transactions/${encodeURIComponent(numeroCompte)}/deposit`, payload);
  }

  withdraw(numeroCompte: string, payload: OperationRequest): Observable<TransactionResponse> {
    return this.api.post<TransactionResponse>(`/transactions/${encodeURIComponent(numeroCompte)}/withdraw`, payload);
  }

  transfer(payload: TransferRequest): Observable<TransactionResponse> {
    return this.api.post<TransactionResponse>(`/transactions/transfer`, payload);
  }

  getHistory(numeroCompte: string, debut: string, fin: string): Observable<TransactionResponse[]> {
    return this.api.get<TransactionResponse[]>(`/transactions/${encodeURIComponent(numeroCompte)}/history`, { debut, fin });
  }

  getAllByAccount(numeroCompte: string): Observable<TransactionResponse[]> {
    return this.api.get<TransactionResponse[]>(`/transactions/${encodeURIComponent(numeroCompte)}`);
  }
}
