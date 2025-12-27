import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    template: `
    <div class="min-h-screen bg-gray-100">
      <app-navbar />
      <main class="pb-8">
        <router-outlet />
      </main>
      
      <!-- Footer -->
      <footer class="bg-white border-t mt-auto">
        <div class="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 EGA Bank - Système de Gestion Bancaire</p>
          <p class="mt-1">GLSI B - TP JEE - Bogue Komla Armel</p>
        </div>
      </footer>
    </div>
  `
})
export class MainLayoutComponent { }
