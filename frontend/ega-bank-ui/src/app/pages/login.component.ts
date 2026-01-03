import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-layout">
      <div class="card login-card">
        <div class="header">
          <div class="mb-6 flex justify-center">
            <img src="/assets/logoega.png" alt="EGA Bank" style="height: 48px; width: auto;" />
          </div>
          <h2 class="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
          <p class="text-gray-500 text-sm text-center">Sign in to access your account</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">
           <span>⚠️</span> {{ errorMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-4">
            <label for="username" class="label">Username</label>
            <input 
              id="username" 
              type="text" 
              formControlName="username" 
              class="input-field w-full"
              [class.error-border]="form.get('username')?.invalid && form.get('username')?.touched"
            />
             <div *ngIf="form.get('username')?.invalid && form.get('username')?.touched" class="text-xs text-danger mt-1">
              Username is required
            </div>
          </div>

          <div class="mb-6">
            <label for="password" class="label">Password</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password"
               class="input-field w-full"
               [class.error-border]="form.get('password')?.invalid && form.get('password')?.touched"
            />
            <div *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="text-xs text-danger mt-1">
              Password is required
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="form.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="footer">
          Don't have an account? <a routerLink="/register" class="link">Register</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background-color: var(--gray-50);
    }
    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 2rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    .text-center { text-align: center; }
    .label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: 0.25rem;
    }
    .input-field {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      outline: none;
    }
    .input-field:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary), transparent 85%);
    }
    .error-border { border-color: var(--danger); }
    .alert-danger {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: var(--danger);
      padding: 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      margin-bottom: 1rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--gray-500);
    }
    .link {
      color: var(--primary);
      font-weight: 500;
      text-decoration: none;
    }
    .link:hover { text-decoration: underline; }
    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      margin-right: 0.5rem;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { username, password } = this.form.value;

    this.auth.login({ username, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        // Display a friendly error message
        this.errorMessage = 'Invalid username or password. Please try again.';
      },
    });
  }
}
