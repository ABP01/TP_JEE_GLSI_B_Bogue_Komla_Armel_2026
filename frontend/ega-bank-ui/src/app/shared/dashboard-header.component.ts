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
    <header class="dashboard-header glass">
      <!-- Spacer to center search -->
      <div class="flex-1"></div>

      <!-- Centered Search -->
      <div class="search-container">
        <div class="relative">
            <input 
                [(ngModel)]="searchQuery" 
                (ngModelChange)="onSearch()"
                placeholder="Search clients or accounts..." 
                class="search-input"
                (focus)="showSearch = true"
            />
            <i class="ri-search-line search-icon"></i>
        </div>

        <!-- Search Results Dropdown -->
        <div *ngIf="showSearch && searchQuery.length > 1" class="search-results animate-slide-in">
            <div *ngIf="isSearching" class="p-4 text-center text-gray-400 text-sm">
                <i class="ri-loader-4-line spinner-icon"></i> Searching...
            </div>
            
            <div *ngIf="!isSearching">
                <!-- Clients -->
                <div *ngIf="foundClients.length > 0">
                    <div class="search-section-title">Clients</div>
                    <div *ngFor="let client of foundClients" (click)="goToClient(client.id)" class="search-item flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center">
                             <i class="ri-user-line"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">{{client.prenom}} {{client.nom}}</div>
                            <div class="text-xs text-gray-500">{{client.courriel}}</div>
                        </div>
                    </div>
                </div>

                <!-- Accounts -->
                 <div *ngIf="foundAccounts.length > 0">
                    <div class="search-section-title">Accounts</div>
                    <div *ngFor="let account of foundAccounts" (click)="goToAccount(account.numeroCompte)" class="search-item flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-green-50 text-success flex items-center justify-center">
                             <i class="ri-bank-card-line"></i>
                        </div>
                        <div>
                            <div class="font-medium font-mono text-gray-900">{{account.numeroCompte}}</div>
                            <div class="text-xs text-gray-500">{{account.typeCompte}} • {{account.solde | currency:'XOF':'symbol':'1.0-0'}}</div>
                        </div>
                    </div>
                </div>

                <div *ngIf="foundClients.length === 0 && foundAccounts.length === 0" class="p-8 text-center text-gray-400 text-sm">
                    <i class="ri-search-line text-2xl mb-2 block opacity-50"></i>
                    No results found.
                </div>
            </div>
        </div>
      </div>

      <!-- Right Actions -->
      <div class="header-actions">
        <!-- Notifications -->
        <div class="relative">
            <button (click)="toggleNotifications()" class="header-icon-btn" [class.active]="showNotifications">
                <i class="ri-notification-3-line"></i>
                <span *ngIf="unreadNotifications" class="notification-badge">
                    <span class="notification-count">2</span>
                </span>
            </button>
            
            <div *ngIf="showNotifications" class="dropdown-menu notification-dropdown animate-slide-in">
                <div class="dropdown-header">
                    <span>Notifications</span>
                    <a class="mark-read-link">Mark all read</a>
                </div>
                
                <div class="notification-list">
                    <div class="notification-item unread">
                        <div class="notif-icon primary">
                            <i class="ri-bank-card-line"></i>
                        </div>
                        <div class="notif-body">
                            <p class="notif-text"><strong>Transfer received</strong> 150 000 XOF to account ending 001</p>
                            <span class="notif-time">25 min ago</span>
                        </div>
                    </div>
                    
                    <div class="notification-item unread">
                        <div class="notif-icon accent">
                            <i class="ri-user-add-line"></i>
                        </div>
                        <div class="notif-body">
                            <p class="notif-text"><strong>New client</strong> Jean Dupont added successfully</p>
                            <span class="notif-time">2 hours ago</span>
                        </div>
                    </div>
                    
                    <div class="notification-item">
                        <div class="notif-icon secondary">
                            <i class="ri-exchange-funds-line"></i>
                        </div>
                        <div class="notif-body">
                            <p class="notif-text">Transaction #TRX-4521 completed - Withdrawal</p>
                            <span class="notif-time">Yesterday</span>
                        </div>
                    </div>
                </div>
                
                <div class="dropdown-footer">
                    <a class="see-all-link" routerLink="/notifications">View all notifications</a>
                </div>
            </div>
        </div>

        <!-- User Profile -->
        <div class="relative">
           <button (click)="toggleProfile()" class="profile-btn" [class.active]="showProfile">
             <div class="profile-avatar">
               <span class="font-bold">A</span>
             </div>
             <div class="profile-info">
               <span class="profile-name">Admin</span>
               <i class="ri-arrow-down-s-line profile-arrow" [class.rotated]="showProfile"></i>
             </div>
           </button>

           <div *ngIf="showProfile" class="dropdown-menu profile-dropdown animate-slide-in">
               <div class="profile-menu-header">
                   <div class="user-avatar-lg">A</div>
                   <div class="user-details">
                       <span class="user-fullname">Administrateur</span>
                       <span class="user-email">admin@egabank.com</span>
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
    <div *ngIf="showSearch || showNotifications || showProfile" (click)="closeAll()" class="fixed inset-0 z-30"></div>
  `,
  styles: [`
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--gray-200);
        border-radius: 12px;
        box-shadow: var(--shadow-lg);
        z-index: 50;
        margin-top: 8px;
        overflow: hidden;
    }
    .search-section-title {
        padding: 8px 12px;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--gray-500);
        text-transform: uppercase;
        background-color: var(--gray-50);
        letter-spacing: 0.05em;
    }
    .search-item {
        padding: 10px 16px;
        cursor: pointer;
        transition: background-color 0.2s;
        border-bottom: 1px solid var(--gray-50);
    }
    .search-item:last-child {
        border-bottom: none;
    }
    .search-item:hover {
        background-color: var(--gray-50);
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
    .header-icon-btn:hover, .header-icon-btn.active {
      background: var(--gray-100);
      color: var(--gray-800);
    }
    .header-icon-btn.active {
        background: var(--primary-light);
        color: var(--primary);
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
    .profile-btn:hover, .profile-btn.active {
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
      border-radius: 12px;
      box-shadow: var(--shadow-xl);
      border: 1px solid var(--gray-200);
      z-index: 100;
      overflow: hidden;
      transform-origin: top right;
    }
    
    /* Notification Dropdown */
    .notification-dropdown {
      width: 340px;
      right: 0;
      top: calc(100% + 8px);
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
      background: var(--primary-light);
    }
    .notification-item.unread:hover {
      background: #edebfe; /* Slightly darker than primary-light */
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
      background: var(--primary-light);
      color: var(--primary);
    }
    .notif-icon.accent {
      background: #fdf2f8;
      color: var(--accent);
    }
    .notif-icon.secondary {
      background: #fdf4ff;
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
      display: block;
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
      width: 240px;
      right: 0;
      top: calc(100% + 8px);
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
      overflow: hidden;
    }
    .user-fullname {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--gray-800);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      font-size: 0.75rem;
      color: var(--gray-500);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
      font-size: 0.85rem;
      color: var(--gray-700);
      text-decoration: none;
    }
    .menu-item:hover {
      background: var(--gray-50);
      color: var(--gray-900);
    }
    .menu-item i {
      font-size: 1.1rem;
      color: var(--gray-500);
    }
    .menu-item:hover i {
      color: var(--gray-700);
    }
    .menu-item.logout {
      color: var(--danger);
    }
    .menu-item.logout i {
      color: var(--danger);
    }
    .menu-item.logout:hover {
      background: #fef2f2;
    }
    
    /* Menu Divider */
    .dropdown-divider, .menu-divider {
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
