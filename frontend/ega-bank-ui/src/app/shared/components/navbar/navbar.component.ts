import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <nav class="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/dashboard" class="flex items-center gap-3 text-white">
            <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                </path>
              </svg>
            </div>
            <span class="text-xl font-bold tracking-wide">EGA Bank</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-1">
            <a routerLink="/dashboard" routerLinkActive="bg-blue-600" 
              class="px-4 py-2 text-white rounded-lg hover:bg-blue-600/50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6">
                </path>
              </svg>
              Accueil
            </a>
            <a routerLink="/clients" routerLinkActive="bg-blue-600" 
              class="px-4 py-2 text-white rounded-lg hover:bg-blue-600/50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z">
                </path>
              </svg>
              Clients
            </a>
            <a routerLink="/accounts" routerLinkActive="bg-blue-600" 
              class="px-4 py-2 text-white rounded-lg hover:bg-blue-600/50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z">
                </path>
              </svg>
              Comptes
            </a>
            <a routerLink="/transactions" routerLinkActive="bg-blue-600" 
              class="px-4 py-2 text-white rounded-lg hover:bg-blue-600/50 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4">
                </path>
              </svg>
              Virements
            </a>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <div class="hidden md:flex items-center gap-3 text-white">
              <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
                {{ getUserInitials() }}
              </div>
              <span class="text-sm">{{ authService.currentUser()?.username }}</span>
            </div>
            <button (click)="logout()" 
              class="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                </path>
              </svg>
              <span class="hidden md:inline">Déconnexion</span>
            </button>

            <!-- Mobile Menu Button -->
            <button (click)="mobileMenuOpen.set(!mobileMenuOpen())" class="md:hidden text-white p-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                @if (mobileMenuOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                }
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden pb-4 space-y-2">
            <a routerLink="/dashboard" (click)="mobileMenuOpen.set(false)" 
              class="block px-4 py-2 text-white rounded-lg hover:bg-blue-600/50">
              Accueil
            </a>
            <a routerLink="/clients" (click)="mobileMenuOpen.set(false)" 
              class="block px-4 py-2 text-white rounded-lg hover:bg-blue-600/50">
              Clients
            </a>
            <a routerLink="/accounts" (click)="mobileMenuOpen.set(false)" 
              class="block px-4 py-2 text-white rounded-lg hover:bg-blue-600/50">
              Comptes
            </a>
            <a routerLink="/transactions" (click)="mobileMenuOpen.set(false)" 
              class="block px-4 py-2 text-white rounded-lg hover:bg-blue-600/50">
              Virements
            </a>
          </div>
        }
      </div>
    </nav>
  `
})
export class NavbarComponent {
    mobileMenuOpen = signal(false);

    constructor(
        public authService: AuthService,
        private router: Router
    ) { }

    getUserInitials(): string {
        const username = this.authService.currentUser()?.username || 'U';
        return username.substring(0, 2).toUpperCase();
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
