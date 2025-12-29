import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-layout">
      <div class="card login-card">
        <div class="header">
           <div class="logo-container">
            <img src="/assets/logoega.svg" alt="EGA Bank" class="app-logo" />
           </div>
          <h2 class="text-2xl font-bold mb-2 text-center">Create Account</h2>
          <p class="text-gray-500 text-sm text-center">Join EGA Bank today</p>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger">
           <span>⚠️</span> {{ errorMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
           <div class="mb-4">
            <label for="email" class="label">Email</label>
            <input 
              id="email" 
              type="email" 
              formControlName="email" 
              class="input-field w-full"
              [class.error-border]="form.get('email')?.invalid && form.get('email')?.touched"
            />
            <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-xs text-danger mt-1">
              Valid email is required
            </div>
          </div>

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
              Username is required (min 3 characters)
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
            {{ isLoading ? 'Creating account...' : 'Sign up' }}
          </button>
        </form>

        <div class="footer">
          Already have an account? <a routerLink="/login" class="link">Sign in</a>
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
      max-width: 440px;
      padding: 2.5rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      background: var(--white);
      border-radius: var(--radius-lg);
      border: 1px solid var(--gray-200);
    }
    .header {
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo-container {
      margin-bottom: 1.5rem;
      padding: 0.75rem;
      background: var(--gray-50);
      border-radius: 1rem;
    }
    .app-logo {
      height: 48px;
      width: auto;
    }
    .text-center { text-align: center; }
    .label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--gray-700);
      margin-bottom: 0.375rem;
    }
    .input-field {
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--radius-md);
      transition: all 0.2s;
      outline: none;
      font-size: 0.95rem;
       width: 100%;
    }
    .input-field:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary), transparent 90%);
    }
    .error-border { border-color: var(--danger); }
    .alert-danger {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      color: var(--danger);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.875rem;
      color: var(--gray-500);
    }
    .link {
      color: var(--primary);
      font-weight: 600;
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
    .w-full { width: 100%; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .btn { height: 44px; font-size: 0.95rem; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.register(this.form.value).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        // Store tokens from registration response (auto-login)
        if (res?.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res?.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        // Redirect to dashboard
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Register failed', err);
        this.errorMessage = 'Registration failed. Please try again.';
      },
    });
  }
}
