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
    <div class="auth-page">
      <!-- Left Side - Branding (Hidden on Mobile) -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="brand-logo">
            <img src="/assets/logoega.png" alt="EGA Bank" />
          </div>
          <h1 class="brand-title">Bienvenue sur EGA Bank</h1>
          <p class="brand-subtitle">La banque digitale qui simplifie la gestion de vos finances.</p>
          
          <div class="brand-features">
            <div class="feature">
              <i class="ri-shield-check-line"></i>
              <span>Sécurité maximale</span>
            </div>
            <div class="feature">
              <i class="ri-time-line"></i>
              <span>Accès 24h/24</span>
            </div>
            <div class="feature">
              <i class="ri-exchange-funds-line"></i>
              <span>Virements instantanés</span>
            </div>
          </div>
        </div>
        <div class="branding-decoration"></div>
      </div>

      <!-- Right Side - Form -->
      <div class="auth-form-container">
        <div class="auth-form-wrapper">
          <!-- Mobile Logo -->
          <div class="mobile-logo">
            <div class="logo-box">
              <img src="/assets/logoega.png" alt="EGA Bank" />
            </div>
          </div>

          <div class="form-header">
            <h2 class="form-title">Connexion</h2>
            <p class="form-subtitle">Accédez à votre espace bancaire sécurisé</p>
          </div>

          <!-- Session Expired Alert -->
          <div *ngIf="sessionExpired" class="alert alert-warning">
            <i class="ri-lock-line"></i>
            <span>Votre session a expiré. Veuillez vous reconnecter.</span>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger">
            <i class="ri-error-warning-line"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <div class="input-wrapper">
                <i class="ri-user-3-line input-icon"></i>
                <input 
                  id="username" 
                  type="text" 
                  formControlName="username"
                  placeholder="Entrez votre nom d'utilisateur"
                  [class.has-error]="form.get('username')?.invalid && form.get('username')?.touched"
                />
              </div>
              <div *ngIf="form.get('username')?.invalid && form.get('username')?.touched" class="error-text">
                Le nom d'utilisateur est requis
              </div>
            </div>

            <div class="form-group">
              <div class="label-row">
                <label for="password">Mot de passe</label>
                <a class="forgot-link">Mot de passe oublié ?</a>
              </div>
              <div class="input-wrapper">
                <i class="ri-lock-2-line input-icon"></i>
                <input 
                  id="password" 
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Entrez votre mot de passe"
                  [class.has-error]="form.get('password')?.invalid && form.get('password')?.touched"
                />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
              <div *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="error-text">
                Le mot de passe est requis
              </div>
            </div>

            <button 
              type="submit" 
              class="submit-btn"
              [disabled]="form.invalid || isLoading"
            >
              <span *ngIf="isLoading" class="spinner"></span>
              <span *ngIf="!isLoading">Se connecter</span>
              <span *ngIf="isLoading">Connexion en cours...</span>
            </button>
          </form>

          <div class="form-footer">
            <p>Pas encore de compte ? <a routerLink="/register">Créer un compte</a></p>
          </div>

          <!-- Mobile Footer -->
          <div class="mobile-footer">
            <p>&copy; 2024 EGA Bank. Système bancaire sécurisé.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: -1rem -1.5rem;
    }

    @media (min-width: 768px) {
      :host {
        margin: -1.5rem;
      }
    }

    .auth-page {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    /* ===== LEFT SIDE - BRANDING ===== */
    .auth-branding {
      background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;
    }

    .branding-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }

    .branding-content {
      position: relative;
      z-index: 1;
      max-width: 420px;
      color: white;
    }

    .brand-logo {
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .brand-logo img {
      height: 50px;
      width: auto;
      filter: brightness(0) invert(1);
    }

    .brand-title {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 1rem;
      letter-spacing: -0.025em;
    }

    .brand-subtitle {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-bottom: 3rem;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.85);
    }

    .feature i {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: #60a5fa;
    }

    /* ===== RIGHT SIDE - FORM ===== */
    .auth-form-container {
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .mobile-logo {
      display: none;
    }

    .form-header {
      margin-bottom: 2rem;
    }

    .form-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .form-subtitle {
      color: #64748b;
      font-size: 0.9375rem;
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .alert i {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .alert-warning {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #b45309;
    }

    .alert-danger {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #dc2626;
    }

    /* Form */
    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.5rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .label-row label {
      margin-bottom: 0;
    }

    .forgot-link {
      font-size: 0.8125rem;
      color: #3b82f6;
      cursor: pointer;
      font-weight: 500;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 1.25rem;
      pointer-events: none;
      transition: color 0.2s;
    }

    .input-wrapper input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.9375rem;
      color: #1e293b;
      background: white;
      transition: all 0.2s;
    }

    .input-wrapper input::placeholder {
      color: #94a3b8;
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
    }

    .input-wrapper:focus-within .input-icon {
      color: #3b82f6;
    }

    .input-wrapper input.has-error {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .toggle-password {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 0.25rem;
      font-size: 1.25rem;
      transition: color 0.2s;
    }

    .toggle-password:hover {
      color: #64748b;
    }

    .error-text {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.375rem;
      font-weight: 500;
    }

    /* Submit Button */
    .submit-btn {
      width: 100%;
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      margin-top: 1.5rem;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Footer */
    .form-footer {
      margin-top: 2rem;
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .form-footer p {
      color: #64748b;
      font-size: 0.9375rem;
    }

    .form-footer a {
      color: #3b82f6;
      font-weight: 600;
      text-decoration: none;
    }

    .form-footer a:hover {
      text-decoration: underline;
    }

    .mobile-footer {
      display: none;
    }

    /* ===== RESPONSIVE - TABLET ===== */
    @media (max-width: 1024px) {
      .auth-branding {
        padding: 2rem;
      }

      .brand-title {
        font-size: 2rem;
      }

      .brand-features {
        gap: 0.75rem;
      }
    }

    /* ===== RESPONSIVE - MOBILE ===== */
    @media (max-width: 768px) {
      .auth-page {
        grid-template-columns: 1fr;
      }

      .auth-branding {
        display: none;
      }

      .auth-form-container {
        min-height: 100vh;
        background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 30%, #f8fafc 30%);
        padding: 0;
        align-items: flex-start;
      }

      .auth-form-wrapper {
        background: white;
        margin: 6rem 1rem 2rem;
        padding: 2rem 1.5rem;
        border-radius: 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        max-width: none;
      }

      .mobile-logo {
        display: flex;
        justify-content: center;
        margin: -5rem 0 2rem;
      }

      .logo-box {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
      }

      .logo-box img {
        height: 40px;
        width: auto;
        filter: brightness(0) invert(1);
      }

      .form-header {
        text-align: center;
      }

      .form-title {
        font-size: 1.5rem;
      }

      .mobile-footer {
        display: block;
        text-align: center;
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #f1f5f9;
      }

      .mobile-footer p {
        font-size: 0.75rem;
        color: #94a3b8;
      }

      .input-wrapper input {
        padding: 1rem 1rem 1rem 3rem;
      }

      .submit-btn {
        padding: 1rem;
      }
    }

    /* ===== RESPONSIVE - SMALL MOBILE ===== */
    @media (max-width: 375px) {
      .auth-form-wrapper {
        margin: 5rem 0.75rem 1.5rem;
        padding: 1.5rem 1.25rem;
      }

      .form-title {
        font-size: 1.375rem;
      }

      .label-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  sessionExpired = false;
  showPassword = false;
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
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/');
      return;
    }

    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/';
      if (params['returnUrl'] && !this.auth.isAuthenticated()) {
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
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed', err);
        if (err.status === 401) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = err.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        }
      },
    });
  }
}
