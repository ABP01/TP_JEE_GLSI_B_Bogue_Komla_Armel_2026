import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, takeUntil } from 'rxjs';
import { AccountResponse } from '../models/account.model';
import { AccountService } from '../services/account.service';

/**
 * Composant de recherche de compte avec autocomplete.
 * Conçu pour gérer des milliers de comptes efficacement.
 * 
 * Features:
 * - Recherche par numéro de compte avec debounce
 * - Affiche le solde et le propriétaire
 * - Support du clavier
 * - Intégration formulaires réactifs
 */
@Component({
  selector: 'account-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AccountSearchInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="account-search-container" [class.focused]="isFocused()">
      <!-- Input de recherche -->
      <div class="search-input-wrapper">
        <i class="ri-bank-card-line search-icon"></i>
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
          *ngIf="selectedAccount() && !disabled" 
          type="button"
          (click)="clearSelection($event)" 
          class="clear-btn"
          title="Effacer la sélection"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>

      <!-- Compte sélectionné -->
      <div *ngIf="selectedAccount() && !showDropdown()" class="selected-account">
        <div class="account-icon" [class.savings]="selectedAccount()!.typeCompte === 'EPARGNE'">
          <i [class]="selectedAccount()!.typeCompte === 'EPARGNE' ? 'ri-safe-2-line' : 'ri-bank-card-line'"></i>
        </div>
        <div class="account-info">
          <div class="account-number">{{ selectedAccount()!.numeroCompte }}</div>
          <div class="account-details">
            {{ getTypeDisplay(selectedAccount()!.typeCompte) }}
            <span *ngIf="selectedAccount()!.clientNomComplet" class="separator">•</span>
            <span *ngIf="selectedAccount()!.clientNomComplet">{{ selectedAccount()!.clientNomComplet }}</span>
          </div>
        </div>
        <div class="account-balance" [class.positive]="selectedAccount()!.solde > 0">
          {{ selectedAccount()!.solde | currency:'XOF':'symbol':'1.0-0' }}
        </div>
      </div>

      <!-- Dropdown des résultats -->
      <div *ngIf="showDropdown()" class="dropdown-results">
        <!-- En cours de chargement -->
        <div *ngIf="isLoading()" class="dropdown-loading">
          <i class="ri-loader-4-line spinner-icon"></i> Recherche...
        </div>

        <!-- Liste des comptes (tous si pas de recherche) -->
        <div *ngIf="!isLoading() && displayedAccounts().length > 0" class="results-list">
          <div 
            *ngFor="let account of displayedAccounts(); let i = index"
            (click)="selectAccount(account)"
            (mouseenter)="highlightedIndex.set(i)"
            [class.highlighted]="highlightedIndex() === i"
            [class.disabled]="isAccountDisabled(account)"
            class="result-item"
          >
            <div class="account-icon small" [class.savings]="account.typeCompte === 'EPARGNE'">
              <i [class]="account.typeCompte === 'EPARGNE' ? 'ri-safe-2-line' : 'ri-bank-card-line'"></i>
            </div>
            <div class="result-info">
              <div class="result-number">
                <span [innerHTML]="highlightMatch(account.numeroCompte)"></span>
              </div>
              <div class="result-details">
                {{ getTypeDisplay(account.typeCompte) }}
                <span *ngIf="account.clientNomComplet"> • {{ account.clientNomComplet }}</span>
              </div>
            </div>
            <div class="result-balance" [class.positive]="account.solde > 0">
              {{ account.solde | currency:'XOF':'symbol':'1.0-0' }}
            </div>
          </div>
        </div>

        <!-- Pagination info -->
        <div *ngIf="!isLoading() && totalAccounts() > displayedAccounts().length" class="pagination-info">
          Affichage de {{ displayedAccounts().length }} sur {{ totalAccounts() }} comptes.
          <span class="hint">Tapez un numéro de compte pour filtrer.</span>
        </div>

        <!-- Aucun résultat -->
        <div *ngIf="!isLoading() && displayedAccounts().length === 0" class="no-results">
          <i class="ri-bank-card-2-line"></i>
          <p *ngIf="searchQuery.length > 0">Aucun compte trouvé pour "{{ searchQuery }}"</p>
          <p *ngIf="searchQuery.length === 0">Aucun compte actif disponible</p>
        </div>
      </div>

      <!-- Overlay pour fermer le dropdown -->
      <div *ngIf="showDropdown()" class="dropdown-overlay" (click)="closeDropdown()"></div>
    </div>
  `,
  styles: [`
    .account-search-container {
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
      font-family: monospace;
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

    .selected-account {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      margin-top: 8px;
      background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
      border: 1px solid #bbf7d0;
      border-radius: 8px;
    }

    .account-icon {
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

    .account-icon.savings {
      color: #10b981;
      border-color: #a7f3d0;
    }

    .account-icon.small {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }

    .account-info {
      flex: 1;
      min-width: 0;
    }

    .account-number {
      font-weight: 600;
      font-family: monospace;
      color: #1f2937;
      margin-bottom: 2px;
    }

    .account-details {
      font-size: 0.85rem;
      color: #6b7280;
    }

    .account-details .separator {
      margin: 0 6px;
    }

    .account-balance {
      font-weight: 700;
      font-family: monospace;
      font-size: 1.1rem;
      color: #374151;
    }

    .account-balance.positive {
      color: #059669;
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
    .no-results {
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .no-results i {
      font-size: 1.5rem;
      display: block;
      margin-bottom: 8px;
      opacity: 0.5;
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

    .result-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .result-info {
      flex: 1;
      min-width: 0;
    }

    .result-number {
      font-weight: 500;
      font-family: monospace;
      color: #1f2937;
    }

    .result-number mark {
      background: #fef3c7;
      color: inherit;
      padding: 0 2px;
      border-radius: 2px;
    }

    .result-details {
      font-size: 0.8rem;
      color: #6b7280;
      margin-top: 2px;
    }

    .result-balance {
      font-size: 0.9rem;
      font-family: monospace;
      font-weight: 600;
      color: #374151;
    }

    .result-balance.positive {
      color: #059669;
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
export class AccountSearchInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() placeholder = 'Rechercher un compte...';
  @Input() maxResults = 15;
  @Input() onlyActive = true;
  @Input() excludeAccount: string | null = null; // Pour exclure un compte (ex: source dans un virement)
  @Input() disabled = false;
  
  @Output() accountSelected = new EventEmitter<AccountResponse>();
  
  // Signals
  selectedAccount = signal<AccountResponse | null>(null);
  allAccounts = signal<AccountResponse[]>([]);
  displayedAccounts = signal<AccountResponse[]>([]);
  totalAccounts = signal(0);
  isLoading = signal(false);
  showDropdown = signal(false);
  isFocused = signal(false);
  highlightedIndex = signal(-1);
  
  searchQuery = '';
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // ControlValueAccessor
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  
  constructor(private accountService: AccountService) {}
  
  ngOnInit() {
    // Charger tous les comptes au démarrage
    this.loadAccounts();
    
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.filterAccounts(query);
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadAccounts() {
    this.isLoading.set(true);
    this.accountService.getAll(0, 500).pipe(
      catchError(() => of({ content: [], totalElements: 0 })),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      let accounts = response.content || [];
      
      // Filtrer les comptes actifs si demandé
      if (this.onlyActive) {
        accounts = accounts.filter(a => a.actif);
      }
      
      this.allAccounts.set(accounts);
      this.totalAccounts.set(accounts.length);
      this.filterAccounts(this.searchQuery);
      this.isLoading.set(false);
    });
  }
  
  private filterAccounts(query: string) {
    let filtered = this.allAccounts();
    
    // Exclure le compte spécifié
    if (this.excludeAccount) {
      filtered = filtered.filter(a => a.numeroCompte !== this.excludeAccount);
    }
    
    // Filtrer par query
    if (query.length > 0) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(a => 
        a.numeroCompte.toLowerCase().includes(lowerQuery) ||
        (a.clientNomComplet && a.clientNomComplet.toLowerCase().includes(lowerQuery))
      );
    }
    
    // Limiter les résultats
    this.displayedAccounts.set(filtered.slice(0, this.maxResults));
    this.highlightedIndex.set(-1);
  }
  
  // ControlValueAccessor implementation
  writeValue(numeroCompte: string | null): void {
    if (numeroCompte) {
      const account = this.allAccounts().find(a => a.numeroCompte === numeroCompte);
      if (account) {
        this.selectedAccount.set(account);
        this.searchQuery = numeroCompte;
      } else {
        // Charger le compte depuis le backend
        this.accountService.getByNumber(numeroCompte).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: account => {
            this.selectedAccount.set(account);
            this.searchQuery = account.numeroCompte;
          },
          error: () => {
            this.selectedAccount.set(null);
            this.searchQuery = '';
          }
        });
      }
    } else {
      this.selectedAccount.set(null);
      this.searchQuery = '';
    }
  }
  
  registerOnChange(fn: (value: string | null) => void): void {
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
    this.showDropdown.set(true);
    
    // Si on modifie la recherche après avoir sélectionné, on désélectionne
    if (this.selectedAccount() && query !== this.selectedAccount()!.numeroCompte) {
      this.selectedAccount.set(null);
      this.onChange(null);
    }
  }
  
  onFocus() {
    this.isFocused.set(true);
    this.showDropdown.set(true);
    this.filterAccounts(this.searchQuery);
  }
  
  onBlur() {
    this.isFocused.set(false);
    this.onTouched();
    setTimeout(() => {
      if (!this.isFocused()) {
        this.showDropdown.set(false);
      }
    }, 200);
  }
  
  onKeyDown(event: KeyboardEvent) {
    const accounts = this.displayedAccounts();
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.min(i + 1, accounts.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (idx >= 0 && idx < accounts.length && !this.isAccountDisabled(accounts[idx])) {
          this.selectAccount(accounts[idx]);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }
  
  selectAccount(account: AccountResponse) {
    if (this.isAccountDisabled(account)) return;
    
    this.selectedAccount.set(account);
    this.searchQuery = account.numeroCompte;
    this.showDropdown.set(false);
    
    this.onChange(account.numeroCompte);
    this.accountSelected.emit(account);
  }
  
  clearSelection(event: Event) {
    event.stopPropagation();
    this.selectedAccount.set(null);
    this.searchQuery = '';
    this.onChange(null);
    this.filterAccounts('');
  }
  
  closeDropdown() {
    this.showDropdown.set(false);
  }
  
  isAccountDisabled(account: AccountResponse): boolean {
    return !account.actif || account.numeroCompte === this.excludeAccount;
  }
  
  getTypeDisplay(typeCompte: string): string {
    const types: Record<string, string> = {
      EPARGNE: 'Épargne',
      COURANT: 'Courant',
    };
    return types[typeCompte] || typeCompte;
  }
  
  highlightMatch(text: string): string {
    if (!this.searchQuery || this.searchQuery.length === 0) {
      return text;
    }
    const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
