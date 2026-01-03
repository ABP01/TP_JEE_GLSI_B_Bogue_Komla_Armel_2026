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
    <div class="client-search-container" [class.focused]="isFocused()">
      <!-- Input de recherche -->
      <div class="search-input-wrapper">
        <i class="ri-search-line search-icon"></i>
        <input 
          type="text"
          [placeholder]="placeholder"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          [disabled]="disabled"
          class="search-input"
          autocomplete="off"
        />
        <span *ngIf="isLoading()" class="loading-indicator">
          <i class="ri-loader-4-line spinner-icon"></i>
        </span>
        <button 
          *ngIf="selectedClient() && !disabled" 
          type="button"
          (click)="clearSelection($event)" 
          class="clear-btn"
          title="Effacer la sélection"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>

      <!-- Client sélectionné -->
      <div *ngIf="selectedClient() && !showDropdown()" class="selected-client">
        <div class="client-avatar">
          <i class="ri-user-line"></i>
        </div>
        <div class="client-info">
          <div class="client-name">{{ selectedClient()!.prenom }} {{ selectedClient()!.nom }}</div>
          <div class="client-details">
            <span *ngIf="selectedClient()!.courriel">{{ selectedClient()!.courriel }}</span>
            <span *ngIf="selectedClient()!.telephone" class="separator">•</span>
            <span *ngIf="selectedClient()!.telephone">{{ selectedClient()!.telephone }}</span>
          </div>
          <div class="client-accounts" *ngIf="showAccountCount">
            <i class="ri-bank-card-line"></i> {{ selectedClient()!.nombreComptes || 0 }} compte(s)
          </div>
        </div>
      </div>

      <!-- Dropdown des résultats -->
      <div *ngIf="showDropdown()" class="dropdown-results">
        <!-- En cours de chargement -->
        <div *ngIf="isLoading()" class="dropdown-loading">
          <i class="ri-loader-4-line spinner-icon"></i> Recherche en cours...
        </div>

        <!-- Résultats -->
        <div *ngIf="!isLoading() && results().length > 0" class="results-list">
          <div 
            *ngFor="let client of results(); let i = index"
            (click)="selectClient(client)"
            (mouseenter)="highlightedIndex.set(i)"
            [class.highlighted]="highlightedIndex() === i"
            class="result-item"
          >
            <div class="client-avatar small">
              <i class="ri-user-line"></i>
            </div>
            <div class="result-info">
              <div class="result-name">
                <span [innerHTML]="highlightMatch(client.prenom + ' ' + client.nom)"></span>
              </div>
              <div class="result-details">
                <span *ngIf="client.courriel" class="result-email">{{ client.courriel }}</span>
                <span *ngIf="client.telephone" class="result-phone">{{ client.telephone }}</span>
              </div>
            </div>
            <div class="result-accounts" *ngIf="showAccountCount">
              {{ client.nombreComptes || 0 }} <i class="ri-bank-card-line"></i>
            </div>
          </div>
        </div>

        <!-- Pagination info -->
        <div *ngIf="!isLoading() && totalResults() > results().length" class="pagination-info">
          Affichage de {{ results().length }} sur {{ totalResults() }} résultats.
          <span class="hint">Affinez votre recherche pour voir plus.</span>
        </div>

        <!-- Aucun résultat -->
        <div *ngIf="!isLoading() && results().length === 0 && searchQuery.length >= minChars" class="no-results">
          <i class="ri-user-search-line"></i>
          <p>Aucun client trouvé pour "{{ searchQuery }}"</p>
          <button *ngIf="allowCreate" type="button" (click)="onCreateNew()" class="create-btn">
            <i class="ri-add-line"></i> Créer un nouveau client
          </button>
        </div>

        <!-- Indication de recherche -->
        <div *ngIf="!isLoading() && searchQuery.length < minChars" class="search-hint">
          <i class="ri-information-line"></i>
          Tapez au moins {{ minChars }} caractères pour rechercher
        </div>
      </div>

      <!-- Overlay pour fermer le dropdown -->
      <div *ngIf="showDropdown()" class="dropdown-overlay" (click)="closeDropdown()"></div>
    </div>
  `,
  styles: [`
    .client-search-container {
      position: relative;
      width: 100%;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 1.1rem;
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 12px 40px 12px 40px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
      background: white;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--primary, #3b82f6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-input:disabled {
      background: #f9fafb;
      cursor: not-allowed;
    }

    .loading-indicator {
      position: absolute;
      right: 40px;
      color: var(--primary, #3b82f6);
    }

    .clear-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      color: #9ca3af;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .clear-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .selected-client {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      margin-top: 8px;
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
      border: 1px solid #bfdbfe;
      border-radius: 8px;
    }

    .client-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary, #3b82f6);
      font-size: 1.25rem;
      border: 1px solid #e5e7eb;
      flex-shrink: 0;
    }

    .client-avatar.small {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }

    .client-info {
      flex: 1;
      min-width: 0;
    }

    .client-name {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 2px;
    }

    .client-details {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .client-details .separator {
      margin: 0 6px;
    }

    .client-accounts {
      margin-top: 4px;
      font-size: 0.8rem;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .dropdown-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 100;
      max-height: 320px;
      overflow-y: auto;
    }

    .dropdown-loading,
    .no-results,
    .search-hint {
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .no-results i,
    .search-hint i {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .create-btn {
      margin-top: 12px;
      padding: 8px 16px;
      background: var(--primary, #3b82f6);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: filter 0.2s;
    }

    .create-btn:hover {
      filter: brightness(0.95);
    }

    .results-list {
      padding: 4px 0;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .result-item:hover,
    .result-item.highlighted {
      background: #f9fafb;
    }

    .result-info {
      flex: 1;
      min-width: 0;
    }

    .result-name {
      font-weight: 500;
      color: #1f2937;
    }

    .result-name mark {
      background: #fef3c7;
      color: inherit;
      padding: 0 2px;
      border-radius: 2px;
    }

    .result-details {
      font-size: 0.8rem;
      color: #6b7280;
      display: flex;
      gap: 8px;
      margin-top: 2px;
    }

    .result-accounts {
      font-size: 0.75rem;
      color: #9ca3af;
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .pagination-info {
      padding: 10px 12px;
      background: #f9fafb;
      font-size: 0.8rem;
      color: #6b7280;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }

    .pagination-info .hint {
      display: block;
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 2px;
    }

    .dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
    }

    .spinner-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
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
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  
  constructor(private clientService: ClientService) {}
  
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
