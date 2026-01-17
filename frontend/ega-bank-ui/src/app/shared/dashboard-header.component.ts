import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { ClientService } from '../services/client.service';

@Component({
  standalone: true,
  selector: 'dashboard-header',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <header class="app-header">
      <!-- Search Bar -->
      <div class="header-search-wrapper">
        <div class="header-search">
          <i class="ri-search-line search-icon"></i>
          <input 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearch()"
            (focus)="showSearch = true"
            placeholder="Rechercher clients ou comptes..." 
            class="search-input"
          />
        </div>

        <!-- Search Results Dropdown -->
        <div *ngIf="showSearch && searchQuery.length > 1" class="search-results">
            <div *ngIf="isSearching" class="search-loading">
                <i class="ri-loader-4-line spinner-icon"></i> Recherche...
            </div>
            
            <div *ngIf="!isSearching">
                <!-- Clients -->
                <div *ngIf="foundClients.length > 0">
                    <div class="search-section-title">Clients</div>
                    <div *ngFor="let client of foundClients" (click)="goToClient(client.id)" class="search-item">
                        <div class="search-item-icon blue">
                             <i class="ri-user-3-line"></i>
                        </div>
                        <div class="search-item-info">
                            <div class="search-item-title">{{client.prenom}} {{client.nom}}</div>
                            <div class="search-item-sub">{{client.courriel}}</div>
                        </div>
                    </div>
                </div>

                <!-- Accounts -->
                 <div *ngIf="foundAccounts.length > 0">
                    <div class="search-section-title">Comptes</div>
                    <div *ngFor="let account of foundAccounts" (click)="goToAccount(account.numeroCompte)" class="search-item">
                        <div class="search-item-icon green">
                             <i class="ri-wallet-3-line"></i>
                        </div>
                        <div class="search-item-info">
                            <div class="search-item-title font-mono">{{account.numeroCompte}}</div>
                            <div class="search-item-sub">{{account.typeCompte}} • {{account.solde | number:'1.0-0'}} FCFA</div>
                        </div>
                    </div>
                </div>

                <div *ngIf="foundClients.length === 0 && foundAccounts.length === 0" class="search-empty">
                    <i class="ri-search-line"></i>
                    <span>Aucun résultat trouvé</span>
                </div>
            </div>
        </div>
      </div>

      <!-- Right Section -->
      <div class="header-right">
        <!-- Notifications -->
        <button (click)="toggleNotifications()" class="header-icon-btn" [class.active]="showNotifications">
            <i class="ri-notification-4-line"></i>
            <span *ngIf="unreadNotifications" class="notif-dot"></span>
        </button>
        
        <!-- Notification Dropdown -->
        <div *ngIf="showNotifications" class="dropdown-menu notification-dropdown">
            <div class="dropdown-header">
                <span>Notifications</span>
                <button class="mark-read-btn">Tout marquer lu</button>
            </div>
            
            <div class="notification-list">
                <div class="notification-item unread">
                    <div class="notif-icon blue">
                        <i class="ri-money-dollar-circle-line"></i>
                    </div>
                    <div class="notif-content">
                        <p><strong>Virement reçu</strong> de 150 000 FCFA</p>
                        <span class="notif-time">Il y a 25 min</span>
                    </div>
                </div>
                
                <div class="notification-item unread">
                    <div class="notif-icon green">
                        <i class="ri-user-add-line"></i>
                    </div>
                    <div class="notif-content">
                        <p><strong>Nouveau client</strong> Jean Dupont ajouté</p>
                        <span class="notif-time">Il y a 2 heures</span>
                    </div>
                </div>
                
                <div class="notification-item">
                    <div class="notif-icon purple">
                        <i class="ri-exchange-funds-line"></i>
                    </div>
                    <div class="notif-content">
                        <p>Transaction #TRX-4521 complétée</p>
                        <span class="notif-time">Hier</span>
                    </div>
                </div>
            </div>
            
            <div class="dropdown-footer">
                <a routerLink="/notifications">Voir toutes les notifications</a>
            </div>
        </div>

        <!-- User Profile -->
        <button (click)="toggleProfile()" class="profile-btn" [class.active]="showProfile">
          <div class="profile-avatar">A</div>
          <span class="profile-name">Admin</span>
          <i class="ri-arrow-down-s-line" [class.rotated]="showProfile"></i>
        </button>

        <!-- Profile Dropdown -->
        <div *ngIf="showProfile" class="dropdown-menu profile-dropdown">
            <div class="profile-header">
                <div class="profile-avatar-lg">A</div>
                <div class="profile-info">
                    <span class="profile-fullname">Administrateur</span>
                    <span class="profile-email">admin@egabank.com</span>
                </div>
            </div>
            
            <div class="dropdown-divider"></div>
            
            <div class="menu-items">
                <a (click)="goSettings()" class="menu-item">
                    <i class="ri-settings-4-line"></i>
                    <span>Paramètres</span>
                </a>
                <a class="menu-item">
                    <i class="ri-user-line"></i>
                    <span>Mon profil</span>
                </a>
                <a class="menu-item">
                    <i class="ri-customer-service-2-line"></i>
                    <span>Support</span>
                </a>
            </div>
            
            <div class="dropdown-divider"></div>
            
            <div class="menu-items">
                <a (click)="logout()" class="menu-item logout">
                    <i class="ri-logout-circle-r-line"></i>
                    <span>Déconnexion</span>
                </a>
            </div>
        </div>
      </div>
    </header>
    
    <!-- Click overlay to close dropdowns -->
    <div *ngIf="showSearch || showNotifications || showProfile" (click)="closeAll()" class="overlay"></div>
  `,
  styles: [`
    /* ===== Header Container ===== */
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
      z-index: 40;
    }

    /* ===== Search Section ===== */
    .header-search-wrapper {
      flex: 1;
      max-width: 480px;
      margin: 0 auto;
      position: relative;
    }

    .header-search {
      position: relative;
      display: flex;
      align-items: center;
    }

    .header-search .search-icon {
      position: absolute;
      left: 14px;
      color: #94a3b8;
      font-size: 1.1rem;
    }

    .header-search .search-input {
      width: 100%;
      padding: 0.625rem 1rem 0.625rem 2.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #1e293b;
      transition: all 0.2s;
    }

    .header-search .search-input:focus {
      outline: none;
      background: white;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .header-search .search-input::placeholder {
      color: #94a3b8;
    }

    /* Search Results */
    .search-results {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      z-index: 100;
      overflow: hidden;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .search-loading {
      padding: 1.5rem;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }

    .search-section-title {
      padding: 0.5rem 1rem;
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #f8fafc;
      border-bottom: 1px solid #f1f5f9;
    }

    .search-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.15s;
    }

    .search-item:hover {
      background: #f8fafc;
    }

    .search-item-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }

    .search-item-icon.blue {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .search-item-icon.green {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .search-item-info {
      flex: 1;
      min-width: 0;
    }

    .search-item-title {
      font-weight: 500;
      color: #1e293b;
      font-size: 0.9rem;
    }

    .search-item-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    .search-empty {
      padding: 2rem;
      text-align: center;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .search-empty i {
      font-size: 2rem;
      opacity: 0.5;
    }

    /* ===== Right Section ===== */
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .header-icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #64748b;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .header-icon-btn:hover,
    .header-icon-btn.active {
      background: #f1f5f9;
      color: #1e293b;
    }

    .notif-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
    }

    /* Profile Button */
    .profile-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem 0.375rem 0.375rem;
      background: transparent;
      border: 1px solid #e2e8f0;
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .profile-btn:hover,
    .profile-btn.active {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .profile-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .profile-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #475569;
    }

    .profile-btn i {
      font-size: 1.1rem;
      color: #94a3b8;
      transition: transform 0.2s;
    }

    .profile-btn i.rotated {
      transform: rotate(180deg);
    }

    /* ===== Dropdowns ===== */
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      z-index: 100;
      overflow: hidden;
      animation: slideDown 0.2s ease;
    }

    .notification-dropdown {
      width: 360px;
    }

    .profile-dropdown {
      width: 240px;
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1e293b;
    }

    .mark-read-btn {
      font-size: 0.75rem;
      font-weight: 500;
      color: #3b82f6;
      background: none;
      border: none;
      cursor: pointer;
    }

    .mark-read-btn:hover {
      text-decoration: underline;
    }

    .dropdown-footer {
      padding: 0.875rem 1rem;
      border-top: 1px solid #f1f5f9;
      text-align: center;
    }

    .dropdown-footer a {
      font-size: 0.8125rem;
      font-weight: 500;
      color: #3b82f6;
      text-decoration: none;
      cursor: pointer;
    }

    .dropdown-footer a:hover {
      text-decoration: underline;
    }

    .dropdown-divider {
      height: 1px;
      background: #f1f5f9;
    }

    /* Notification Items */
    .notification-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid #f8fafc;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .notification-item:hover {
      background: #f8fafc;
    }

    .notification-item.unread {
      background: rgba(59, 130, 246, 0.04);
    }

    .notif-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .notif-icon.blue {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    .notif-icon.green {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .notif-icon.purple {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-content p {
      font-size: 0.8125rem;
      color: #475569;
      margin: 0;
      line-height: 1.4;
    }

    .notif-content strong {
      color: #1e293b;
    }

    .notif-time {
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 0.25rem;
      display: block;
    }

    /* Profile Dropdown */
    .profile-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
    }

    .profile-avatar-lg {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
    }

    .profile-fullname {
      font-weight: 600;
      font-size: 0.9375rem;
      color: #1e293b;
    }

    .profile-email {
      font-size: 0.75rem;
      color: #64748b;
    }

    .menu-items {
      padding: 0.25rem;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
      font-size: 0.875rem;
      color: #475569;
      text-decoration: none;
    }

    .menu-item:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .menu-item i {
      font-size: 1.125rem;
      color: #64748b;
    }

    .menu-item:hover i {
      color: #475569;
    }

    .menu-item.logout {
      color: #ef4444;
    }

    .menu-item.logout i {
      color: #ef4444;
    }

    .menu-item.logout:hover {
      background: rgba(239, 68, 68, 0.08);
    }

    /* Overlay */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 30;
    }

    /* Spinner */
    .spinner-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .font-mono {
      font-family: 'SF Mono', Monaco, monospace;
    }
  `]
})
export class DashboardHeader {
  searchQuery = '';
  showSearch = false;
  isSearching = false;
  foundClients: any[] = [];
  foundAccounts: any[] = [];

  showNotifications = false;
  showProfile = false;
  unreadNotifications = true;

  constructor(
    private auth: AuthService,
    private router: Router,
    private clientService: ClientService,
    private accountService: AccountService
  ) { }

  onSearch() {
    if (this.searchQuery.length < 2) {
      this.foundClients = [];
      this.foundAccounts = [];
      return;
    }

    this.isSearching = true;

    // Search Clients
    this.clientService.search(this.searchQuery).subscribe({
      next: (res) => {
        this.foundClients = res.content || [];
        this.isSearching = false;
      },
      error: () => this.isSearching = false
    });

    // Simple account search simulation
    if (this.searchQuery.length > 5) {
      this.accountService.getByNumber(this.searchQuery).subscribe({
        next: (acc) => this.foundAccounts = [acc],
        error: () => this.foundAccounts = []
      });
    }
  }

  goToClient(id: number) {
    this.router.navigate(['/clients'], { queryParams: { id } });
    this.closeAll();
  }

  goToAccount(num: string) {
    this.router.navigate(['/transactions'], { queryParams: { accountId: num } });
    this.closeAll();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
    this.showSearch = false;
  }

  toggleProfile() {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
    this.showSearch = false;
  }

  closeAll() {
    this.showSearch = false;
    this.showNotifications = false;
    this.showProfile = false;
  }

  goSettings() {
    this.router.navigate(['/settings']);
    this.closeAll();
  }

  logout() {
    this.auth.logout();
    this.closeAll();
  }
}
