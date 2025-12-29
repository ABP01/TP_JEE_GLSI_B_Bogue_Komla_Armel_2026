export interface ClientResponse {
  id: number;
  nom: string;
  prenom: string;
  nomComplet?: string;
  dateNaissance?: string; // ISO date
  sexe?: string;
  adresse?: string;
  telephone?: string;
  courriel?: string;
  nationalite?: string;
  createdAt?: string;
  nombreComptes?: number;
  comptes?: AccountResponse[];
}

export interface ClientRequest {
  nom: string;
  prenom: string;
  dateNaissance: string; // ISO date
  sexe: string;
  adresse?: string;
  telephone?: string;
  courriel?: string;
  nationalite?: string;
}

// forward-declare AccountResponse to avoid circular import file
export interface AccountResponse {
  id?: number;
  numeroCompte?: string;
  solde?: number;
  devise?: string;
  typeCompte?: string;
  status?: string;
}
