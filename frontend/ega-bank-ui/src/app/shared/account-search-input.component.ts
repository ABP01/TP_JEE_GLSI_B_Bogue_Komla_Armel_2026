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
    <div class="relative w-full" [class.z-20]="showDropdown()">
      <!-- Input de recherche -->
      <div class="relative flex items-center">
        <i class="ri-bank-card-line absolute left-3 text-gray-400 pointer-events-none text-lg"></i>
        <input 
          type="text"
          [placeholder]="placeholder"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (keydown)="onKeyDown($event)"
          [disabled]="disabled"
          class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg font-mono text-base transition-all bg-white focus:border-primary focus:ring-4 focus:ring-primary-light disabled:bg-gray-50 disabled:cursor-not-allowed"
          autocomplete="off"
        />
        <span *ngIf="isLoading()" class="absolute right-10 text-primary animate-spin">
          <i class="ri-loader-4-line"></i>
        </span>
        <button 
          *ngIf="selectedAccount() && !disabled" 
          type="button"
          (click)="clearSelection($event)" 
          class="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          title="Effacer la sélection"
        >
          <i class="ri-close-line"></i>
        </button>
      </div>

      <!-- Compte sélectionné -->
      <div *ngIf="selectedAccount() && !showDropdown()" class="mt-2 p-3 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg animate-slide-in">
        <div class="w-10 h-10 rounded-full flex items-center justify-center border border-green-200 bg-white" 
             [class.text-success]="selectedAccount()!.typeCompte !== 'EPARGNE'"
             [class.text-green-600]="selectedAccount()!.typeCompte === 'EPARGNE'">
          <i [class]="selectedAccount()!.typeCompte === 'EPARGNE' ? 'ri-safe-2-line' : 'ri-bank-card-line'" class="text-xl"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-mono font-bold text-gray-900">{{ selectedAccount()!.numeroCompte }}</div>
          <div class="text-sm text-gray-500">
            {{ getTypeDisplay(selectedAccount()!.typeCompte) }}
            <span *ngIf="selectedAccount()!.clientNomComplet" class="mx-1">•</span>
            <span *ngIf="selectedAccount()!.clientNomComplet" class="font-medium">{{ selectedAccount()!.clientNomComplet }}</span>
          </div>
        </div>
        <div class="font-mono font-bold text-lg" [class.text-success]="selectedAccount()!.solde > 0">
          {{ selectedAccount()!.solde | currency:'XOF':'symbol':'1.0-0' }}
        </div>
      </div>

      <!-- Dropdown des résultats -->
      <div *ngIf="showDropdown()" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-slide-in">
        <!-- En cours de chargement -->
        <div *ngIf="isLoading()" class="p-4 text-center text-gray-500">
          <i class="ri-loader-4-line animate-spin inline-block mr-2"></i> Recherche...
        </div>

        <!-- Liste des comptes (tous si pas de recherche) -->
        <div *ngIf="!isLoading() && displayedAccounts().length > 0" class="py-1 max-h-80 overflow-y-auto">
          <div 
            *ngFor="let account of displayedAccounts(); let i = index"
            (click)="selectAccount(account)"
            (mouseenter)="highlightedIndex.set(i)"
            [class.bg-gray-50]="highlightedIndex() === i"
            [class.opacity-50]="isAccountDisabled(account)"
            [class.cursor-not-allowed]="isAccountDisabled(account)"
            class="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
          >
            <div class="w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 bg-white" 
                 [class.text-primary]="account.typeCompte !== 'EPARGNE'"
                 [class.text-success]="account.typeCompte === 'EPARGNE'">
              <i [class]="account.typeCompte === 'EPARGNE' ? 'ri-safe-2-line' : 'ri-bank-card-line'"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-mono font-medium text-gray-900">
                <span [innerHTML]="highlightMatch(account.numeroCompte)"></span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                {{ getTypeDisplay(account.typeCompte) }}
                <span *ngIf="account.clientNomComplet"> • {{ account.clientNomComplet }}</span>
              </div>
            </div>
            <div class="font-mono font-bold text-sm" [class.text-success]="account.solde > 0">
              {{ account.solde | currency:'XOF':'symbol':'1.0-0' }}
            </div>
          </div>
        </div>

        <!-- Pagination info -->
        <div *ngIf="!isLoading() && totalAccounts() > displayedAccounts().length" class="p-2 bg-gray-50 text-xs text-center text-gray-500 border-t border-gray-100">
          Affichage de {{ displayedAccounts().length }} sur {{ totalAccounts() }} comptes.
          <span class="block mt-0.5 text-gray-400">Tapez un numéro de compte pour filtrer.</span>
        </div>

        <!-- Aucun résultat -->
        <div *ngIf="!isLoading() && displayedAccounts().length === 0" class="p-6 text-center text-gray-500">
          <i class="ri-bank-card-2-line text-2xl mb-2 block opacity-30"></i>
          <p *ngIf="searchQuery.length > 0">Aucun compte trouvé pour "{{ searchQuery }}"</p>
          <p *ngIf="searchQuery.length === 0">Aucun compte actif disponible</p>
        </div>
      </div>

      <!-- Overlay pour fermer le dropdown -->
      <div *ngIf="showDropdown()" class="fixed inset-0 z-40" (click)="closeDropdown()"></div>
    </div>
  `,
  styles: [`
    /* Custom styles mostly replaced by utility classes */
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
  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private accountService: AccountService) { }

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
