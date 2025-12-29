export interface AccountResponse {
  id: number;
  numeroCompte: string;
  solde: number;
  devise: string;
  typeCompte: string;
  status: 'active' | 'inactive' | 'closed' | 'suspended' | string;
  clientId?: number;
}

export interface AccountRequest {
  typeCompte: string;
  clientId: number;
}
