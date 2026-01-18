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
    <div class="auth-page">
      <!-- Left Side - Branding (Hidden on Mobile) -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="brand-logo">
            <img src="/assets/logoega.png" alt="EGA Bank" />
          </div>
          <h1 class="brand-title">Rejoignez EGA Bank</h1>
          <p class="brand-subtitle">Ouvrez votre compte en quelques minutes et accédez à tous nos services bancaires.</p>
          
          <div class="brand-features">
            <div class="feature">
              <i class="ri-shield-star-line"></i>
              <span>Inscription gratuite</span>
            </div>
            <div class="feature">
              <i class="ri-timer-flash-line"></i>
              <span>Activation immédiate</span>
            </div>
            <div class="feature">
              <i class="ri-customer-service-2-line"></i>
              <span>Support disponible</span>
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
            <h2 class="form-title">Créer un compte</h2>
            <p class="form-subtitle">Commencez votre aventure bancaire avec nous</p>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="alert alert-danger">
            <i class="ri-error-warning-line"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Success Alert -->
          <div *ngIf="successMessage" class="alert alert-success">
            <i class="ri-checkbox-circle-line"></i>
            <span>{{ successMessage }}</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label for="email">Adresse email</label>
              <div class="input-wrapper">
                <i class="ri-mail-line input-icon"></i>
                <input 
                  id="email" 
                  type="email" 
                  formControlName="email"
                  placeholder="exemple@email.com"
                  [class.has-error]="form.get('email')?.invalid && form.get('email')?.touched"
                />
              </div>
              <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="error-text">
                Une adresse email valide est requise
              </div>
            </div>

            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <div class="input-wrapper">
                <i class="ri-user-3-line input-icon"></i>
                <input 
                  id="username" 
                  type="text" 
                  formControlName="username"
                  placeholder="Choisissez un nom d'utilisateur"
                  [class.has-error]="form.get('username')?.invalid && form.get('username')?.touched"
                />
              </div>
              <div *ngIf="form.get('username')?.invalid && form.get('username')?.touched" class="error-text">
                Minimum 3 caractères requis
              </div>
            </div>

            <div class="form-group">
              <label for="password">Mot de passe</label>
              <div class="input-wrapper">
                <i class="ri-lock-2-line input-icon"></i>
                <input 
                  id="password" 
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Minimum 6 caractères"
                  [class.has-error]="form.get('password')?.invalid && form.get('password')?.touched"
                />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  <i [class]="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
                </button>
              </div>
              <div *ngIf="form.get('password')?.invalid && form.get('password')?.touched" class="error-text">
                Minimum 6 caractères requis
              </div>
            </div>

            <!-- Terms Checkbox -->
            <div class="terms-check">
              <label class="checkbox-wrapper">
                <input type="checkbox" formControlName="acceptTerms" />
                <span class="checkmark"></span>
                <span class="terms-text">J'accepte les <a href="#">conditions d'utilisation</a> et la <a href="#">politique de confidentialité</a></span>
              </label>
            </div>

            <button 
              type="submit" 
              class="submit-btn"
              [disabled]="form.invalid || isLoading"
            >
              <span *ngIf="isLoading" class="spinner"></span>
              <span *ngIf="!isLoading">Créer mon compte</span>
              <span *ngIf="isLoading">Création en cours...</span>
            </button>
          </form>

          <div class="form-footer">
            <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
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
      background: linear-gradient(135deg, rgba(30, 58, 95, 0.85) 0%, rgba(15, 23, 42, 0.9) 15%),
                  url('/signup.avif') center/cover no-repeat;
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

    .alert-danger {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #dc2626;
    }

    .alert-success {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #15803d;
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

    /* Terms Checkbox */
    .terms-check {
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .checkbox-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      position: relative;
      padding-left: 28px;
    }

    .checkbox-wrapper input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      left: 0;
      top: 0;
    }

    .checkmark {
      position: absolute;
      left: 0;
      top: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .checkbox-wrapper:hover .checkmark {
      border-color: #3b82f6;
    }

    .checkbox-wrapper input:checked ~ .checkmark {
      background: #3b82f6;
      border-color: #3b82f6;
    }

    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .checkbox-wrapper input:checked ~ .checkmark:after {
      display: block;
    }

    .terms-text {
      font-size: 0.8125rem;
      color: #64748b;
      line-height: 1.5;
    }

    .terms-text a {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }

    .terms-text a:hover {
      text-decoration: underline;
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
        margin: 5rem 1rem 2rem;
        padding: 2rem 1.5rem;
        border-radius: 24px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        max-width: none;
      }

      .mobile-logo {
        display: flex;
        justify-content: center;
        margin: -4.5rem 0 1.5rem;
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
        height: 36px;
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
        margin-top: 1.5rem;
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
        margin: 4.5rem 0.75rem 1.5rem;
        padding: 1.5rem 1.25rem;
      }

      .form-title {
        font-size: 1.375rem;
      }

      .terms-text {
        font-size: 0.75rem;
      }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, username, password } = this.form.value;

    this.auth.register({ email, username, password }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.accessToken) localStorage.setItem('accessToken', res.accessToken);
        if (res?.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Register failed', err);

        if (err.status === 409) {
          this.errorMessage = 'Ce nom d\'utilisateur ou cet email est déjà utilisé.';
        } else if (err.status === 400) {
          if (err.error?.validationErrors) {
            const errors = Object.values(err.error.validationErrors).join('. ');
            this.errorMessage = errors;
          } else {
            this.errorMessage = err.error?.message || 'Données invalides. Veuillez vérifier vos informations.';
          }
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = err.error?.message || 'L\'inscription a échoué. Veuillez réessayer.';
        }
      },
    });
  }
}
