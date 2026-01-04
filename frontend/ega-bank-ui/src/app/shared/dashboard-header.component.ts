import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { ClientService } from '../services/client.service';

@Component({
  standalone: true,
  selector: 'dashboard-header',
  imports: [CommonModule, FormsModule],
  template: `
    <header style="height:64px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;padding:0 16px;background:white;position:sticky;top:0;z-index:40;">
      <!-- Spacer to center search -->
      <div style="flex:1;"></div>

      <!-- Centered Search -->
      <div style="max-width:480px;width:100%;position:relative;">
        <div style="position:relative;">
            <input 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="onSearch()"
                placeholder="Search clients or accounts..." 
                style="width:100%;padding:10px 16px 10px 40px;border-radius:24px;border:1px solid #e5e7eb;background:#f9fafb;outline:none;transition:all 0.2s;"
                (focus)="showSearch = true"
            />
            <i class="ri-search-line" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:1.1rem;"></i>
        </div>

        <!-- Search Results Dropdown -->
        <div *ngIf="showSearch && searchQuery.length > 1" class="search-results">
            <div *ngIf="isSearching" class="p-4 text-center text-gray-400 text-sm">
                <i class="ri-loader-4-line spinner-icon"></i> Searching...
            </div>
            
            <div *ngIf="!isSearching">
                <!-- Clients -->
                <div *ngIf="foundClients.length > 0">
                    <div class="px-3 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">Clients</div>
                    <div *ngFor="let client of foundClients" (click)="goToClient(client.id)" class="search-item flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                             <i class="ri-user-line"></i>
                        </div>
                        <div>
                            <div class="font-medium">{{client.prenom}} {{client.nom}}</div>
                            <div class="text-xs text-gray-500">{{client.courriel}}</div>
                        </div>
                    </div>
                </div>

                <!-- Accounts -->
                 <div *ngIf="foundAccounts.length > 0">
                    <div class="px-3 py-2 text-xs font-bold text-gray-500 uppercase bg-gray-50">Accounts</div>
                    <div *ngFor="let account of foundAccounts" (click)="goToAccount(account.numeroCompte)" class="search-item flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                             <i class="ri-bank-card-line"></i>
                        </div>
                        <div>
                            <div class="font-medium">{{account.numeroCompte}}</div>
                            <div class="text-xs text-gray-500">{{account.typeCompte}} • {{account.solde | currency:'XOF':'symbol':'1.0-0'}}</div>
                        </div>
                    </div>
                </div>

                <div *ngIf="foundClients.length === 0 && foundAccounts.length === 0" class="p-4 text-center text-gray-500 text-sm">
                    No results found.
                </div>
            </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div style="flex:1;display:flex;justify-content:flex-end;align-items:center;gap:12px;">
        <!-- Notifications -->
        <div style="position:relative;">
            <button (click)="toggleNotifications()" class="header-icon-btn">
                <i class="ri-notification-3-line"></i>
                <span *ngIf="unreadNotifications" class="notification-badge">
                    <span class="notification-count">2</span>
                </span>
            </button>
            
            <div *ngIf="showNotifications" class="dropdown-menu notification-dropdown">
                <div class="dropdown-header">
                    <span>Notifications</span>
                    <a class="mark-read-link">Tout marquer lu</a>
                </div>
                
                <div class="notification-list">
                    <div class="notification-item unread">
                        <div class="notif-icon primary">
                            <i class="ri-bank-card-line"></i>
                        </div>
                        <div class="notif-body">
                            <p class="notif-text"><strong>Nouveau virement reçu</strong> de 150 000 XOF sur le compte EGA-2024-001</p>
                            <span class="notif-time">Il y a 25 min</span>
                        </div>
                    </div>
                    
                    <div class="notification-item unread">
                        <div class="notif-icon accent">
                            <i class="ri-user-add-line"></i>
                        </div>
                        <div class="notif-body">
                            <p class="notif-text"><strong>Nouveau client</strong> Jean Dupont ajouté avec succès</p>
                            <span class="notif-time">Il y a 2h</span>
                        </div>
                    </div>
                    
                    <div class="notification-item">
                        <div class="notif-icon secondary">
                            <i class="ri-exchange-funds-line"></i>
                        </div>
                        <div class="notif-body">
                            <p class="notif-text">Transaction #TRX-4521 effectuée - Retrait de 75 000 XOF</p>
                            <span class="notif-time">Hier, 14:30</span>
                        </div>
                    </div>
                </div>
                
                <div class="dropdown-footer">
                    <a class="see-all-link" routerLink="/notifications">Voir toutes les notifications</a>
                </div>
            </div>
        </div>

        <!-- User Profile -->
        <div style="position:relative;">
           <button (click)="toggleProfile()" class="profile-btn">
             <div class="profile-avatar">
               <i class="ri-user-3-line"></i>
             </div>
             <div class="profile-info">
               <span class="profile-name">Admin</span>
               <i class="ri-arrow-down-s-line profile-arrow" [class.rotated]="showProfile"></i>
             </div>
           </button>

           <div *ngIf="showProfile" class="dropdown-menu profile-dropdown">
               <div class="profile-menu-header">
                   <div class="user-avatar-lg">A</div>
                   <div class="user-details">
                       <span class="user-fullname">Administrateur</span>
                       <span class="user-email">admin&#64;egabank.com</span>
                   </div>
               </div>
               
               <div class="dropdown-divider"></div>
               
               <div class="menu-items">
                   <a (click)="goSettings()" class="menu-item">
                       <i class="ri-settings-3-line"></i>
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
               
               <div class="menu-divider"></div>
               
               <div class="menu-items">
                   <a (click)="logout()" class="menu-item logout">
                       <i class="ri-logout-box-r-line"></i>
                       <span>Déconnexion</span>
                   </a>
               </div>
           </div>
        </div>
      </div>
    </header>
    
    <!-- Click overlay to close dropdowns -->
    <div *ngIf="showSearch || showNotifications || showProfile" (click)="closeAll()" style="position:fixed;top:0;left:0;right:0;bottom:0;z-index:30;"></div>
  `,
  styles: [`
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 50;
        margin-top: 8px;
        overflow: hidden;
    }
    .search-item {
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .search-item:hover {
        background-color: #f9fafb;
    }
    
    /* Header Icon Button */
    .header-icon-btn {
      position: relative;
      background: transparent;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      color: var(--gray-500);
      transition: all 0.15s ease;
    }
    .header-icon-btn:hover {
      background: var(--gray-100);
      color: var(--gray-800);
    }
    
    /* Notification Badge */
    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      min-width: 16px;
      height: 16px;
      background: var(--danger);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }
    .notification-count {
      font-size: 9px;
      font-weight: 600;
      color: white;
    }
    
    /* Profile Button */
    .profile-btn {
      background: transparent;
      border: 1px solid var(--gray-200);
      padding: 4px 10px 4px 4px;
      border-radius: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    .profile-btn:hover {
      background: var(--gray-50);
      border-color: var(--gray-300);
    }
    .profile-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.9rem;
    }
    .profile-info {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .profile-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--gray-700);
    }
    .profile-arrow {
      font-size: 1rem;
      color: var(--gray-400);
      transition: transform 0.2s ease;
    }
    .profile-arrow.rotated {
      transform: rotate(180deg);
    }
    
    /* Dropdown Menu Base */
    .dropdown-menu {
      position: absolute;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--gray-200);
      z-index: 100;
      overflow: hidden;
    }
    
    /* Notification Dropdown */
    .notification-dropdown {
      width: 340px;
      right: 0;
      top: calc(100% + 6px);
    }
    .dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--gray-100);
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--gray-800);
    }
    .mark-read-link {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--primary);
      cursor: pointer;
    }
    .mark-read-link:hover {
      text-decoration: underline;
    }
    
    /* Notification List */
    .notification-list {
      max-height: 320px;
      overflow-y: auto;
    }
    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid var(--gray-50);
    }
    .notification-item:last-child {
      border-bottom: none;
    }
    .notification-item:hover {
      background: var(--gray-50);
    }
    .notification-item.unread {
      background: oklch(95% 0.02 263);
    }
    .notification-item.unread:hover {
      background: oklch(92% 0.03 263);
    }
    .notif-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1rem;
    }
    .notif-icon.primary {
      background: oklch(92% 0.05 263);
      color: var(--primary);
    }
    .notif-icon.accent {
      background: oklch(92% 0.05 332);
      color: var(--accent);
    }
    .notif-icon.secondary {
      background: oklch(92% 0.05 296);
      color: var(--secondary);
    }
    .notif-body {
      flex: 1;
      min-width: 0;
    }
    .notif-text {
      font-size: 0.8rem;
      color: var(--gray-600);
      line-height: 1.4;
      margin: 0;
    }
    .notif-text strong {
      color: var(--gray-800);
    }
    .notif-time {
      font-size: 0.7rem;
      color: var(--gray-400);
      margin-top: 4px;
    }
    
    /* Dropdown Footer */
    .dropdown-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--gray-100);
      text-align: center;
    }
    .see-all-link {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--primary);
      cursor: pointer;
    }
    .see-all-link:hover {
      text-decoration: underline;
    }
    
    /* Profile Dropdown */
    .profile-dropdown {
      width: 220px;
      right: 0;
      top: calc(100% + 6px);
    }
    .profile-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid var(--gray-100);
    }
    .user-avatar-lg {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .user-details {
      display: flex;
      flex-direction: column;
    }
    .user-fullname {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--gray-800);
    }
    .user-email {
      font-size: 0.75rem;
      color: var(--gray-500);
    }
    
    /* Menu Items */
    .menu-items {
      padding: 6px;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 0.15s;
      font-size: 0.85rem;
      color: var(--gray-700);
    }
    .menu-item:hover {
      background: var(--gray-100);
    }
    .menu-item i {
      font-size: 1.1rem;
      color: var(--gray-500);
    }
    .menu-item.logout {
      color: var(--danger);
    }
    .menu-item.logout i {
      color: var(--danger);
    }
    .menu-item.logout:hover {
      background: oklch(95% 0.03 15);
    }
    
    /* Menu Divider */
    .menu-divider {
      height: 1px;
      background: var(--gray-100);
      margin: 4px 0;
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
