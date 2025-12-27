// Models

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn?: number;
    username: string;
    email: string;
    role: string;
}

export interface Client {
    id: number;
    nom: string;
    prenom: string;
    nomComplet: string;
    dateNaissance: string;
    sexe: 'MASCULIN' | 'FEMININ';
    adresse: string;
    telephone: string;
    courriel: string;
    nationalite: string;
    createdAt: string;
    nombreComptes: number;
    comptes?: Account[];
}

export interface ClientRequest {
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: 'MASCULIN' | 'FEMININ';
    adresse?: string;
    telephone?: string;
    courriel?: string;
    nationalite?: string;
}

export interface Account {
    id: number;
    numeroCompte: string;
    typeCompte: 'EPARGNE' | 'COURANT';
    typeCompteLibelle: string;
    dateCreation: string;
    solde: number;
    actif: boolean;
    clientId: number;
    clientNomComplet: string;
}

export interface AccountRequest {
    typeCompte: 'EPARGNE' | 'COURANT';
    clientId: number;
}

export interface Transaction {
    id: number;
    type: 'DEPOT' | 'RETRAIT' | 'VIREMENT_ENTRANT' | 'VIREMENT_SORTANT';
    typeLibelle: string;
    montant: number;
    dateTransaction: string;
    description: string;
    compteDestination: string;
    soldeAvant: number;
    soldeApres: number;
    numeroCompte: string;
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

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface MessageResponse {
    message: string;
    success: boolean;
}

export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path: string;
    validationErrors?: { [key: string]: string };
}
