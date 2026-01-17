import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-layout">
        <div class="background-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
        </div>
        
      <div class="card login-card glass-panel animate-slide-in">
        <div class="header">
          <div class="mb-8 flex justify-center">
            <div class="logo-container">
                <img src="/assets/logoega.png" alt="EGA Bank" width="120" style="height: 48px; width: auto; filter: brightness(0) invert(1);" />
            </div>
          </div>
          <h2 class="text-3xl font-bold mb-2 text-center text-gray-900 tracking-tight">Welcome Back</h2>
          <p class="text-gray-500 text-center mb-8">Sign in to access your secure banking dashboard</p>
        </div>

        <!-- Message de session expirée -->
        <div *ngIf="sessionExpired" class="alert alert-warning mb-6">
          <i class="ri-lock-line text-lg"></i> 
          <span>Your session has expired. Please sign in again.</span>
        </div>

        <div *ngIf="errorMessage" class="alert alert-danger mb-6">
           <i class="ri-error-warning-line text-lg"></i> 
           <span>{{ errorMessage }}</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="mb-5">
            <label for="username" class="label">Username</label>
            <div class="relative">
                <i class="ri-user-line input-icon"></i>
                <input 
                  id="username" 
                  type="text" 
                  formControlName="username" 
                  class="input-with-icon"
                  placeholder="Enter your username"
                  [class.error-border]="form.get('username')?.invalid && form.get('username')?.touched"
                />
            </div>
             <div *ngIf="form.get('username')?.invalid && form.get('username')?.touched" class="text-xs text-danger mt-1 font-medium">
              Username is required
            </div>
          </div>

          <div class="mb-8">
            <div class="flex justify-between items-center mb-1">
                <label for="password" class="label mb-0">Password</label>
                <a class="text-xs text-primary font-medium hover:underline cursor-pointer">Forgot password?</a>
            </div>
            
            <div class="relative">
                <i class="ri-lock-2-line input-icon"></i>
                <input 
                  id="password" 
                  type="password" 
                  formControlName="password"
                   class="input-with-icon"
                   placeholder="Enter your password"
                   [class.error-border]="form.get('password')?.invalid && form.get('password')?.touched"
                />
            </div>
            <div *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="text-xs text-danger mt-1 font-medium">
              Password is required
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full py-3 text-lg shadow-lg hover:shadow-xl transition-all"
            [disabled]="form.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner-border spinner-sm mr-2"></span>
            <span *ngIf="!isLoading">Sign in</span>
            <span *ngIf="isLoading">Signing in...</span>
          </button>
        </form>

        <div class="footer">
          <p class="text-gray-500">Don't have an account? <a routerLink="/register" class="link">Create an account</a></p>
        </div>
      </div>
      
      <div class="mt-8 text-center text-gray-400 text-xs">
        &copy; 2024 EGA Bank. Secure Banking System.
      </div>
    </div>
  `,
  styles: [`
    .login-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background-color: #f8fafc;
      background-image: radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
      background-size: 100% 100%;
      position: relative;
      overflow: hidden;
    }
    
    .background-shapes .shape {
        position: absolute;
        filter: blur(80px);
        z-index: 0;
        opacity: 0.6;
    }
    .shape-1 {
        top: -10%;
        left: -10%;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, var(--primary) 0%, transparent 70%);
        animation: float 20s infinite ease-in-out;
    }
    .shape-2 {
        bottom: -10%;
        right: -10%;
        width: 600px;
        height: 600px;
        background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
        animation: float 25s infinite ease-in-out reverse;
    }
    
    @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(30px, 50px) rotate(10deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      padding: 3rem 2.5rem;
      z-index: 10;
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.8);
    }
    
    .logo-container {
        width: 80px;
        height: 80px;
        background: var(--gray-900);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
    }

    .label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }
    
    .relative { position: relative; }
    
    .input-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray-400);
        font-size: 1.2rem;
        pointer-events: none;
        transition: color 0.2s;
    }
    
    .input-with-icon {
      padding: 0.75rem 1rem 0.75rem 3rem;
      width: 100%;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-md);
      transition: all 0.2s;
      outline: none;
      background: var(--white);
      font-size: 0.95rem;
    }
    
    .input-with-icon:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent);
    }
    
    .input-with-icon:focus + .input-icon, 
    .relative:focus-within .input-icon {
        color: var(--primary);
    }
    
    .error-border { border-color: var(--danger); background-color: #fff5f5; }
    
    .footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.9rem;
      border-top: 1px solid var(--gray-200);
      padding-top: 1.5rem;
    }
    .link {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
      transition: color 0.2s;
    }
    .link:hover { color: var(--primary-hover); text-decoration: underline; }
    
    .spinner-border {
        width: 1.2em;
        height: 1.2em;
        border: 0.2em solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin .75s linear infinite
    }
  `]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  sessionExpired = false;
  private returnUrl = '/';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/');
      return;
    }

    // Récupérer l'URL de retour depuis les query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';

      // Vérifier si la session a expiré (présence d'un returnUrl indique une redirection)
      if (params['returnUrl'] && !this.auth.isAuthenticated()) {
        // Vérifier s'il y avait un token avant (session expirée)
        const hadToken = localStorage.getItem('accessToken') !== null;
        if (!hadToken && params['expired'] === 'true') {
          this.sessionExpired = true;
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.sessionExpired = false;
    const { username, password } = this.form.value;

    this.auth.login({ username, password }).subscribe({
      next: () => {
        this.isLoading = false;
        // Rediriger vers l'URL de retour après connexion réussie
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        // Display a friendly error message
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your connection.';
        } else {
          this.errorMessage = err.error?.message || 'An error occurred. Please try again.';
        }
      },
    });
  }
}
