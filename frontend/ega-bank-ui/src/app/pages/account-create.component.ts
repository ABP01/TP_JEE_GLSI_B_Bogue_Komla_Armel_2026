import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClientResponse } from '../models/client.model';
import { AccountService } from '../services/account.service';
import { AuthService } from '../services/auth.service';
import { ClientSearchInputComponent } from '../shared/client-search-input.component';
import { AppStore } from '../stores/app.store';

@Component({
  selector: 'app-account-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ClientSearchInputComponent],
  template: `
    <div class="form-container">
      <div class="form-card animate-slide-in">
        <div class="form-header">
          <a routerLink="/accounts" class="back-link">
            <i class="ri-arrow-left-line"></i>
          </a>
          <div>
            <h1 class="form-title">Ouvrir un Compte</h1>
            <p class="form-subtitle">Créez un nouveau compte bancaire pour un client existant</p>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="alert alert-danger mx-6 mt-6">
          <i class="ri-error-warning-line"></i> {{ errorMessage }}
        </div>

        <!-- Success Message -->
        <div *ngIf="successMessage" class="alert alert-success mx-6 mt-6">
          <i class="ri-checkbox-circle-line"></i> {{ successMessage }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <!-- Client Selection (Admin Only) -->
          <div class="form-group" *ngIf="isAdmin">
            <label>
              <i class="ri-user-3-line"></i> Sélectionner un Client <span class="required">*</span>
            </label>
            
            <client-search-input
              formControlName="clientId"
              placeholder="Recherchez par nom ou email..."
              [allowCreate]="true"
              [showAccountCount]="true"
              (clientSelected)="onClientSelected($event)"
              (createNewClient)="goToCreateClient()"
            ></client-search-input>
            
            <div *ngIf="form.get('clientId')?.touched && form.get('clientId')?.invalid" class="error-text">
              Veuillez sélectionner un client
            </div>
          </div>

          <!-- Account Type -->
          <div class="form-group">
            <label>
              <i class="ri-wallet-3-line"></i> Type de Compte <span class="required">*</span>
            </label>
            <div class="account-types">
              <label class="type-option">
                <input type="radio" formControlName="typeCompte" value="EPARGNE" class="sr-only peer">
                <div class="type-card">
                  <div class="type-icon epargne">
                    <i class="ri-safe-2-line"></i>
                  </div>
                  <div class="type-info">
                    <div class="type-name">Épargne</div>
                    <div class="type-desc">Idéal pour économiser</div>
                  </div>
                  <div class="type-check">
                    <i class="ri-checkbox-circle-fill"></i>
                  </div>
                </div>
              </label>
              <label class="type-option">
                <input type="radio" formControlName="typeCompte" value="COURANT" class="sr-only peer">
                <div class="type-card">
                  <div class="type-icon courant">
                    <i class="ri-bank-card-line"></i>
                  </div>
                  <div class="type-info">
                    <div class="type-name">Courant</div>
                    <div class="type-desc">Usage quotidien</div>
                  </div>
                  <div class="type-check">
                    <i class="ri-checkbox-circle-fill"></i>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Info Box -->
          <div class="info-box">
            <i class="ri-information-line"></i>
            <div>
              <p class="info-title">Le compte sera créé avec un solde de 0 FCFA</p>
              <p class="info-desc">Pour alimenter le compte, utilisez la fonction Dépôt après la création.</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <a routerLink="/accounts" class="btn btn-secondary">
              <i class="ri-close-line"></i> Annuler
            </a>
            <button type="submit" 
                    [disabled]="form.invalid || isSubmitting" 
                    class="btn btn-primary">
              <span *ngIf="isSubmitting">
                <span class="spinner"></span> Création...
              </span>
              <span *ngIf="!isSubmitting">
                <i class="ri-add-line"></i> Ouvrir le Compte
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 2rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .form-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      overflow: hidden;
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    .back-link {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: white;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 1.25rem;
      transition: all 0.15s;
    }

    .back-link:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .form-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .form-subtitle {
      font-size: 0.875rem;
      color: #64748b;
    }

    form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group > label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.75rem;
    }

    .form-group > label i {
      color: #3b82f6;
    }

    .required {
      color: #ef4444;
    }

    .error-text {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.5rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* Account Types */
    .account-types {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .type-option {
      cursor: pointer;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .type-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.2s;
      position: relative;
    }

    .type-option:hover .type-card {
      border-color: #cbd5e1;
      background: #fafafa;
    }

    .peer:checked + .type-card {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
    }

    .type-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .type-icon.epargne {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .type-icon.courant {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }

    .type-info {
      flex: 1;
    }

    .type-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .type-desc {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.125rem;
    }

    .type-check {
      color: #e2e8f0;
      font-size: 1.25rem;
      transition: color 0.2s;
    }

    .peer:checked + .type-card .type-check {
      color: #3b82f6;
    }

    /* Info Box */
    .info-box {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.1);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .info-box > i {
      color: #3b82f6;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .info-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    .info-desc {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* Actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: none;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #f8fafc;
    }

    .spinner {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
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

    .mx-6 { margin-left: 1.5rem; margin-right: 1.5rem; }
    .mt-6 { margin-top: 1.5rem; }

    @media (max-width: 480px) {
      .account-types {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class AccountCreateComponent implements OnInit, OnDestroy {
  form: FormGroup;
  selectedClient: ClientResponse | null = null;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  isAdmin = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private router: Router,
    private store: AppStore,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      clientId: [null, Validators.required],
      typeCompte: ['EPARGNE', Validators.required],
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ROLE_ADMIN';

    if (!this.isAdmin) {
      const clientId = this.authService.getClientId();
      if (clientId) {
        this.form.patchValue({ clientId: clientId });
      } else {
        this.errorMessage = "Impossible de récupérer votre identifiant client.";
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClientSelected(client: ClientResponse) {
    this.selectedClient = client;
  }

  goToCreateClient() {
    this.router.navigateByUrl('/clients/new');
  }

  submit(): void {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      clientId: Number(this.form.value.clientId),
      typeCompte: this.form.value.typeCompte,
    };

    this.accountService.create(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (account) => {
        this.successMessage = `Compte ${account.numeroCompte} créé avec succès !`;

        this.store.addAccount(account);
        this.store.triggerFullRefresh();

        setTimeout(() => {
          this.router.navigateByUrl('/accounts');
        }, 1500);
      },
      error: (err) => {
        console.error('Create account failed', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Échec de la création du compte. Veuillez réessayer.';
      },
    });
  }
}
