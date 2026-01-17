import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';
import { ClientResponse } from '../models/client.model';
import { ClientService } from '../services/client.service';

/**
 * Composant de recherche de client avec autocomplete.
 * Conçu pour gérer des milliers de clients efficacement.
 * 
 * Features:
 * - Recherche avec debounce (300ms)
 * - Affichage des résultats paginés
 * - Support du clavier (flèches, Enter, Escape)
 * - Intégration avec les formulaires réactifs (ControlValueAccessor)
 * - Affichage du client sélectionné
 * - Possibilité de créer un nouveau client
 */
@Component({
  selector: 'client-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ClientSearchInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full" [class.z-20]="showDropdown()">
      <!-- Input de recherche -->
      <div class="relative flex items-center">
        <i class="ri-search-line absolute left-3 text-gray-400 pointer-events-none text-lg"></i>
        <input 
          type="text"
          [placeholder]="placeholder"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          [disabled]="disabled"
          class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg font-sans text-base transition-all bg-white focus:border-primary focus:ring-4 focus:ring-primary-light disabled:bg-gray-50 disabled:cursor-not-allowed"
          autocomplete="off"
        />
        <span *ngIf="isLoading()" class="absolute right-10 text-primary animate-spin">
          <i class="ri-loader-4-line"></i>
        </span>
        <button 
          *ngIf="selectedClient() && !disabled" 
          type="button"
          (click)="clearSelection($event)" 
          class="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          title="Effacer la sélection"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>

      <!-- Client sélectionné -->
      <div *ngIf="selectedClient() && !showDropdown()" class="mt-2 p-3 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg animate-slide-in">
        <div class="w-10 h-10 rounded-full flex items-center justify-center border border-blue-200 bg-white text-primary">
          <i class="ri-user-line text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-gray-900">{{ selectedClient()!.prenom }} {{ selectedClient()!.nom }}</div>
          <div class="text-sm text-gray-500 flex flex-wrap gap-2">
            <span *ngIf="selectedClient()!.courriel" class="flex items-center gap-1"><i class="ri-mail-line text-xs"></i> {{ selectedClient()!.courriel }}</span>
            <span *ngIf="selectedClient()!.telephone" class="flex items-center gap-1"><i class="ri-phone-line text-xs"></i> {{ selectedClient()!.telephone }}</span>
          </div>
          <div class="mt-1 text-xs text-blue-600 font-medium flex items-center gap-1" *ngIf="showAccountCount">
            <i class="ri-bank-card-line"></i> {{ selectedClient()!.nombreComptes || 0 }} compte(s)
          </div>
        </div>
      </div>

      <!-- Dropdown des résultats -->
      <div *ngIf="showDropdown()" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-in">
        <!-- En cours de chargement -->
        <div *ngIf="isLoading()" class="p-4 text-center text-gray-500">
          <i class="ri-loader-4-line animate-spin inline-block mr-2"></i> Recherche en cours...
        </div>

        <!-- Résultats -->
        <div *ngIf="!isLoading() && results().length > 0" class="py-1 max-h-80 overflow-y-auto">
          <div 
            *ngFor="let client of results(); let i = index"
            (click)="selectClient(client)"
            (mouseenter)="highlightedIndex.set(i)"
            [class.bg-gray-50]="highlightedIndex() === i"
            class="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 bg-white text-gray-500">
              <i class="ri-user-line"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900">
                <span [innerHTML]="highlightMatch(client.prenom + ' ' + client.nom)"></span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5 flex gap-2">
                <span *ngIf="client.courriel" class="truncate">{{ client.courriel }}</span>
                <span *ngIf="client.telephone">{{ client.telephone }}</span>
              </div>
            </div>
            <div class="text-xs font-medium text-gray-400 whitespace-nowrap" *ngIf="showAccountCount">
              {{ client.nombreComptes || 0 }} <i class="ri-bank-card-line"></i>
            </div>
          </div>
        </div>

        <!-- Pagination info -->
        <div *ngIf="!isLoading() && totalResults() > results().length" class="p-2 bg-gray-50 text-xs text-center text-gray-500 border-t border-gray-100">
          Affichage de {{ results().length }} sur {{ totalResults() }} résultats.
          <span class="block mt-0.5 text-gray-400">Affinez votre recherche pour voir plus.</span>
        </div>

        <!-- Aucun résultat -->
        <div *ngIf="!isLoading() && results().length === 0 && searchQuery.length >= minChars" class="p-6 text-center text-gray-500">
          <i class="ri-user-search-line text-2xl mb-2 block opacity-30"></i>
          <p class="mb-3">Aucun client trouvé pour "{{ searchQuery }}"</p>
          <button *ngIf="allowCreate" type="button" (click)="onCreateNew()" class="btn btn-sm btn-primary mx-auto">
            <i class="ri-add-line mr-1"></i> Créer un nouveau client
          </button>
        </div>

        <!-- Indication de recherche -->
        <div *ngIf="!isLoading() && searchQuery.length < minChars" class="p-6 text-center text-gray-500">
          <i class="ri-information-line text-2xl mb-2 block opacity-30"></i>
          Tapez au moins {{ minChars }} caractères pour rechercher
        </div>
      </div>

      <!-- Overlay pour fermer le dropdown -->
      <div *ngIf="showDropdown()" class="fixed inset-0 z-40" (click)="closeDropdown()"></div>
    </div>
  `,
  styles: [`
    :host {
        display: block;
        width: 100%;
    }
    .focus\:ring-primary-light:focus {
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent);
    }
    mark {
        background-color: #fef3c7;
        color: inherit;
        padding: 0 2px;
        border-radius: 2px;
    }
  `]
})
export class ClientSearchInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder = 'Rechercher un client...';
  @Input() minChars = 2;
  @Input() maxResults = 10;
  @Input() showAccountCount = true;
  @Input() allowCreate = false;
  @Input() disabled = false;

  @Output() clientSelected = new EventEmitter<ClientResponse>();
  @Output() createNewClient = new EventEmitter<void>();

  // Signals pour l'état réactif
  selectedClient = signal<ClientResponse | null>(null);
  results = signal<ClientResponse[]>([]);
  totalResults = signal(0);
  isLoading = signal(false);
  showDropdown = signal(false);
  isFocused = signal(false);
  highlightedIndex = signal(-1);

  searchQuery = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // ControlValueAccessor
  private onChange: (value: number | null) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private clientService: ClientService) { }

  ngOnInit() {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < this.minChars) {
          return of({ content: [], totalElements: 0 });
        }
        this.isLoading.set(true);
        return this.clientService.search(query, 0, this.maxResults).pipe(
          catchError(() => of({ content: [], totalElements: 0 }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.results.set(response.content || []);
      this.totalResults.set(response.totalElements || 0);
      this.isLoading.set(false);
      this.highlightedIndex.set(-1);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(clientId: number | null): void {
    if (clientId) {
      // Charger le client si on a un ID
      this.clientService.getById(clientId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: client => {
          this.selectedClient.set(client);
          this.searchQuery = `${client.prenom} ${client.nom}`;
        },
        error: () => {
          this.selectedClient.set(null);
          this.searchQuery = '';
        }
      });
    } else {
      this.selectedClient.set(null);
      this.searchQuery = '';
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Event handlers
  onSearchInput(query: string) {
    this.searchSubject.next(query);
    if (query.length >= this.minChars) {
      this.showDropdown.set(true);
    }
    // Si on modifie la recherche après avoir sélectionné, on désélectionne
    if (this.selectedClient() && query !== `${this.selectedClient()!.prenom} ${this.selectedClient()!.nom}`) {
      this.selectedClient.set(null);
      this.onChange(null);
    }
  }

  onFocus() {
    this.isFocused.set(true);
    if (this.searchQuery.length >= this.minChars || this.results().length > 0) {
      this.showDropdown.set(true);
    }
  }

  onBlur() {
    this.isFocused.set(false);
    this.onTouched();
    // Délai pour permettre le click sur un résultat
    setTimeout(() => {
      if (!this.isFocused()) {
        this.showDropdown.set(false);
      }
    }, 200);
  }

  onKeyDown(event: KeyboardEvent) {
    const results = this.results();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (idx >= 0 && idx < results.length) {
          this.selectClient(results[idx]);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  selectClient(client: ClientResponse) {
    this.selectedClient.set(client);
    this.searchQuery = `${client.prenom} ${client.nom}`;
    this.showDropdown.set(false);
    this.results.set([]);

    // Notify form
    this.onChange(client.id);
    this.clientSelected.emit(client);
  }

  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectedClient.set(null);
    this.searchQuery = '';
    this.onChange(null);
    this.results.set([]);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  onCreateNew() {
    this.createNewClient.emit();
    this.closeDropdown();
  }

  highlightMatch(text: string): string {
    if (!this.searchQuery || this.searchQuery.length < this.minChars) {
      return text;
    }
    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
