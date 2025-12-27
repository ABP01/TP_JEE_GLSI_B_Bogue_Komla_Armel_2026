import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Account, AccountRequest, Client, PageResponse } from '../../../core/models';
import { AccountService } from '../../../core/services/account.service';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Comptes</h1>
          <p class="text-gray-600">Liste de tous les comptes bancaires</p>
        </div>
        <button (click)="openModal()" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nouveau Compte
        </button>
      </div>

      <!-- Accounts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (account of accounts(); track account.id) {
          <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
            <div class="p-1">
              <div class="h-2 rounded-t-lg" [class]="account.typeCompte === 'EPARGNE' ? 'bg-purple-500' : 'bg-orange-500'"></div>
            </div>
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded-full"
                  [class]="account.typeCompte === 'EPARGNE' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'">
                  {{ account.typeCompteLibelle }}
                </span>
                @if (!account.actif) {
                  <span class="px-3 py-1 text-sm font-semibold bg-red-100 text-red-800 rounded-full">Inactif</span>
                }
              </div>
              <p class="font-mono text-sm text-gray-500 mb-2">{{ account.numeroCompte }}</p>
              <p class="text-3xl font-bold text-gray-900 mb-4">{{ account.solde | number:'1.2-2' }} <span class="text-lg">XOF</span></p>
              
              <div class="border-t pt-4">
                <p class="text-sm text-gray-600 mb-1">
                  <span class="font-medium">Client:</span> {{ account.clientNomComplet }}
                </p>
                <p class="text-sm text-gray-500">
                  Créé le {{ account.dateCreation | date:'dd/MM/yyyy' }}
                </p>
              </div>
              
              <div class="mt-4 flex gap-2">
                <a [routerLink]="['/accounts', account.numeroCompte]" class="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Détails
                </a>
                @if (account.actif) {
                  <button (click)="deactivateAccount(account.id)" title="Désactiver" class="px-3 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                    </svg>
                  </button>
                }
                <button (click)="deleteAccount(account.id)" title="Supprimer" class="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-span-full text-center py-12">
            <svg class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
            </svg>
            <p class="text-gray-500 text-lg">Aucun compte trouvé</p>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (pageInfo()) {
        <div class="mt-8 flex justify-center gap-2">
          <button (click)="loadAccounts(pageInfo()!.pageNumber - 1)" [disabled]="pageInfo()!.first"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100">Précédent</button>
          <span class="px-4 py-2">Page {{ pageInfo()!.pageNumber + 1 }} / {{ pageInfo()!.totalPages }}</span>
          <button (click)="loadAccounts(pageInfo()!.pageNumber + 1)" [disabled]="pageInfo()!.last"
            class="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100">Suivant</button>
        </div>
      }

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div class="p-6 border-b">
              <h2 class="text-xl font-bold">Créer un nouveau compte</h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select formControlName="clientId" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="">Sélectionner un client</option>
                  @for (client of clients(); track client.id) {
                    <option [value]="client.id">{{ client.nomComplet }}</option>
                  }
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Type de compte *</label>
                <select formControlName="typeCompte" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="EPARGNE">Compte Épargne</option>
                  <option value="COURANT">Compte Courant</option>
                </select>
              </div>
              <div class="flex justify-end gap-4">
                <button type="button" (click)="closeModal()" class="px-6 py-2 border rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" [disabled]="form.invalid" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Créer</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AccountListComponent implements OnInit {
  accounts = signal<Account[]>([]);
  clients = signal<Client[]>([]);
  pageInfo = signal<PageResponse<Account> | null>(null);
  showModal = signal(false);
  form: FormGroup;

  constructor(
    private accountService: AccountService,
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      typeCompte: ['EPARGNE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAccounts(0);
    this.loadClients();
  }

  loadAccounts(page: number): void {
    this.accountService.getAll(page, 9).subscribe({
      next: (res) => {
        this.accounts.set(res.content);
        this.pageInfo.set(res);
      }
    });
  }

  loadClients(): void {
    this.clientService.getAll(0, 100).subscribe({
      next: (res) => this.clients.set(res.content)
    });
  }

  openModal(): void {
    this.form.reset({ typeCompte: 'EPARGNE' });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const request: AccountRequest = {
      clientId: Number(this.form.value.clientId),
      typeCompte: this.form.value.typeCompte
    };

    this.accountService.create(request).subscribe({
      next: () => {
        this.closeModal();
        this.loadAccounts(0);
      }
    });
  }

  deleteAccount(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      this.accountService.delete(id).subscribe({
        next: () => this.loadAccounts(0),
        error: (err) => alert(err.error?.message || 'Erreur lors de la suppression')
      });
    }
  }

  deactivateAccount(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir désactiver ce compte ? Les opérations ne seront plus possibles.')) {
      this.accountService.deactivate(id).subscribe({
        next: () => this.loadAccounts(0),
        error: (err) => alert(err.error?.message || 'Erreur lors de la désactivation')
      });
    }
  }
}

