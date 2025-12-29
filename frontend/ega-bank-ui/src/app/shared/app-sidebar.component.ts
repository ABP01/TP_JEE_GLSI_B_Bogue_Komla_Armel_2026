import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Clients', href: '/clients' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Transactions', href: '/transactions' },
];

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './app-sidebar.component.html',
  // styles centralized in global styles.css
})
export class AppSidebar {
  items = navItems;
  constructor(private router: Router) { }

  navigate(href: string) {
    this.router.navigateByUrl(href);
  }
}
