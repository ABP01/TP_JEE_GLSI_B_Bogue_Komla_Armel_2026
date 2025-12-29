export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee' | string;

export interface TransactionResponse {
  id: number;
  type: TransactionType;
  typeLibelle?: string;
  montant: number;
  dateTransaction: string; // ISO datetime
  description?: string;
  compteDestination?: string;
  soldeAvant?: number;
  soldeApres?: number;
  numeroCompte?: string;
}

export interface OperationRequest {
  montant: number;
  description?: string;
}

export interface TransferRequest {
  compteSource: string;
  compteDestination: string;
  montant: number;
  description?: string;
}
