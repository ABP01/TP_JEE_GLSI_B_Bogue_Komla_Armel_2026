import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Client, ClientRequest, PageResponse } from '../../../core/models';
import { ClientService } from '../../../core/services/client.service';

@Component({
    selector: 'app-client-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
          <p class="text-gray-600">Liste de tous les clients de la banque</p>
        </div>
        <button (click)="openModal()" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Nouveau Client
        </button>
      </div>

      <!-- Search -->
      <div class="mb-6">
        <input type="text" [(ngModel)]="searchQuery" (input)="onSearch()"
          class="w-full md:w-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Rechercher par nom, prénom ou email...">
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nationalité</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Comptes</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @for (client of clients(); track client.id) {
              <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
                      {{ client.prenom.charAt(0) }}{{ client.nom.charAt(0) }}
                    </div>
                    <div class="ml-4">
                      <div class="font-medium text-gray-900">{{ client.nomComplet }}</div>
                      <div class="text-sm text-gray-500">{{ client.sexe === 'MASCULIN' ? 'Homme' : 'Femme' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900">{{ client.courriel || '-' }}</div>
                  <div class="text-sm text-gray-500">{{ client.telephone || '-' }}</div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ client.nationalite || '-' }}</td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ client.nombreComptes }} compte(s)
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <a [routerLink]="['/clients', client.id]" class="text-blue-600 hover:text-blue-800 mr-4">Détails</a>
                  <button (click)="openModal(client)" class="text-green-600 hover:text-green-800 mr-4">Modifier</button>
                  <button (click)="deleteClient(client.id)" class="text-red-600 hover:text-red-800">Supprimer</button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                  Aucun client trouvé
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Pagination -->
        @if (pageInfo()) {
          <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <div class="text-sm text-gray-600">
              Affichage de {{ (pageInfo()!.pageNumber * pageInfo()!.pageSize) + 1 }} à 
              {{ Math.min((pageInfo()!.pageNumber + 1) * pageInfo()!.pageSize, pageInfo()!.totalElements) }}
              sur {{ pageInfo()!.totalElements }} résultats
            </div>
            <div class="flex gap-2">
              <button (click)="loadClients(pageInfo()!.pageNumber - 1)" [disabled]="pageInfo()!.first"
                class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                Précédent
              </button>
              <button (click)="loadClients(pageInfo()!.pageNumber + 1)" [disabled]="pageInfo()!.last"
                class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100">
                Suivant
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b">
              <h2 class="text-2xl font-bold text-gray-900">
                {{ editingClient() ? 'Modifier le client' : 'Nouveau client' }}
              </h2>
            </div>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input type="text" formControlName="nom" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input type="text" formControlName="prenom" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                  <input type="date" formControlName="dateNaissance" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sexe *</label>
                  <select formControlName="sexe" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="MASCULIN">Masculin</option>
                    <option value="FEMININ">Féminin</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" formControlName="telephone" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" formControlName="courriel" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input type="text" formControlName="adresse" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                  <input type="text" formControlName="nationalite" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div class="flex justify-end gap-4 mt-6">
                <button type="button" (click)="closeModal()" class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" [disabled]="form.invalid" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {{ editingClient() ? 'Modifier' : 'Créer' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ClientListComponent implements OnInit {
    clients = signal<Client[]>([]);
    pageInfo = signal<PageResponse<Client> | null>(null);
    showModal = signal(false);
    editingClient = signal<Client | null>(null);
    searchQuery = '';
    form: FormGroup;
    Math = Math;

    constructor(private clientService: ClientService, private fb: FormBuilder) {
        this.form = this.fb.group({
          nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
          prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
          dateNaissance: ['', Validators.required],
          sexe: ['MASCULIN', Validators.required],
          telephone: ['', [Validators.pattern(/^\+?[0-9]{8,15}$/)]],
          courriel: ['', [Validators.email]],
          adresse: ['', [Validators.maxLength(200)]],
          nationalite: ['', [Validators.maxLength(50)]]
        });
    }

    ngOnInit(): void {
        this.loadClients(0);
    }

    loadClients(page: number): void {
        this.clientService.getAll(page, 10).subscribe({
            next: (res) => {
                this.clients.set(res.content);
                this.pageInfo.set(res);
            }
        });
    }

    onSearch(): void {
        if (this.searchQuery.length > 2) {
            this.clientService.search(this.searchQuery, 0, 10).subscribe({
                next: (res) => {
                    this.clients.set(res.content);
                    this.pageInfo.set(res);
                }
            });
        } else if (this.searchQuery.length === 0) {
            this.loadClients(0);
        }
    }

    openModal(client?: Client): void {
        this.editingClient.set(client || null);
        if (client) {
            this.form.patchValue({
                nom: client.nom,
                prenom: client.prenom,
                dateNaissance: client.dateNaissance,
                sexe: client.sexe,
                telephone: client.telephone,
                courriel: client.courriel,
                adresse: client.adresse,
                nationalite: client.nationalite
            });
        } else {
            this.form.reset({ sexe: 'MASCULIN' });
        }
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.editingClient.set(null);
        this.form.reset();
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const request: ClientRequest = this.form.value;

        if (this.editingClient()) {
            this.clientService.update(this.editingClient()!.id, request).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadClients(0);
                }
            });
        } else {
            this.clientService.create(request).subscribe({
                next: () => {
                    this.closeModal();
                    this.loadClients(0);
                }
            });
        }
    }

    deleteClient(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            this.clientService.delete(id).subscribe({
                next: () => this.loadClients(0)
            });
        }
    }
}
