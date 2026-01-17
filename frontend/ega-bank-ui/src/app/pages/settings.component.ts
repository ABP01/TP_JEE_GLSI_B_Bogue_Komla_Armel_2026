import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <!-- Page Header -->
      <header class="settings-header animate-slide-in">
        <h1 class="settings-title">Paramètres</h1>
        <p class="settings-subtitle">Gérez vos préférences de compte et vos paramètres de sécurité.</p>
      </header>

      <div class="settings-layout">
        <!-- Sidebar Navigation -->
        <nav class="settings-nav animate-slide-in">
          <button 
            (click)="activeTab = 'profile'"
            [class.active]="activeTab === 'profile'"
            class="nav-btn">
            <i class="ri-user-settings-line"></i>
            <span>Profil</span>
          </button>
          <button 
            (click)="activeTab = 'security'"
            [class.active]="activeTab === 'security'"
            class="nav-btn">
            <i class="ri-shield-keyhole-line"></i>
            <span>Sécurité</span>
          </button>
          <button 
            (click)="activeTab = 'notifications'"
            [class.active]="activeTab === 'notifications'"
            class="nav-btn">
            <i class="ri-notification-4-line"></i>
            <span>Notifications</span>
          </button>
        </nav>

        <!-- Content Area -->
        <div class="settings-content">
          
          <!-- Profile Tab -->
          <div *ngIf="activeTab === 'profile'" class="settings-panel animate-fade-in">
            <div class="panel-header">
              <i class="ri-user-smile-line"></i>
              <div>
                <h2 class="panel-title">Informations Personnelles</h2>
                <p class="panel-subtitle">Mettez à jour vos informations de profil</p>
              </div>
            </div>
            
            <div class="profile-section">
              <div class="avatar-area">
                <div class="avatar-container">
                  <div class="avatar-lg">
                    <span>A</span>
                  </div>
                  <button class="avatar-edit-btn">
                    <i class="ri-camera-line"></i>
                  </button>
                </div>
                <div class="avatar-info">
                  <h3 class="avatar-name">Admin User</h3>
                  <p class="avatar-email">admin@egabank.com</p>
                  <button class="change-avatar-btn">Changer l'avatar</button>
                </div>
              </div>
            </div>

            <form class="settings-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Prénom</label>
                  <input type="text" value="Admin" />
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input type="text" value="User" />
                </div>
              </div>
              
              <div class="form-group">
                <label>Adresse Email</label>
                <input type="email" value="admin@egabank.com" readonly class="readonly" />
                <span class="form-hint">Contactez le support pour modifier l'email.</span>
              </div>
              
              <div class="form-group">
                <label>Numéro de téléphone</label>
                <input type="tel" placeholder="+228 90 00 00 00" />
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-primary" (click)="saveProfile()">
                  <span *ngIf="!isSaving">
                    <i class="ri-save-line"></i> Enregistrer
                  </span>
                  <span *ngIf="isSaving">
                    <i class="ri-loader-4-line spinning"></i> Enregistrement...
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- Security Tab -->
          <div *ngIf="activeTab === 'security'" class="settings-panel animate-fade-in">
            <div class="panel-header">
              <i class="ri-lock-password-line"></i>
              <div>
                <h2 class="panel-title">Sécurité du Compte</h2>
                <p class="panel-subtitle">Gérez votre mot de passe et la sécurité</p>
              </div>
            </div>

            <form class="settings-form">
              <div class="form-group">
                <label>Mot de passe actuel</label>
                <input type="password" placeholder="Entrez votre mot de passe actuel" />
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Nouveau mot de passe</label>
                  <input type="password" placeholder="Nouveau mot de passe" />
                </div>
                <div class="form-group">
                  <label>Confirmer le mot de passe</label>
                  <input type="password" placeholder="Confirmez le mot de passe" />
                </div>
              </div>
              
              <div class="info-box">
                <i class="ri-information-line"></i>
                <div>
                  <strong>Exigences du mot de passe :</strong>
                  <ul>
                    <li>Minimum 8 caractères</li>
                    <li>Au moins une lettre majuscule</li>
                    <li>Au moins un chiffre</li>
                    <li>Au moins un caractère spécial</li>
                  </ul>
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn btn-primary" (click)="updatePassword()">
                  <i class="ri-lock-line"></i> Mettre à jour le mot de passe
                </button>
              </div>
            </form>
          </div>

          <!-- Notifications Tab -->
          <div *ngIf="activeTab === 'notifications'" class="settings-panel animate-fade-in">
            <div class="panel-header">
              <i class="ri-notification-badge-line"></i>
              <div>
                <h2 class="panel-title">Préférences de Notification</h2>
                <p class="panel-subtitle">Choisissez comment vous souhaitez être notifié</p>
              </div>
            </div>
            
            <div class="notification-options">
              <div class="notification-option">
                <div class="option-info">
                  <div class="option-icon">
                    <i class="ri-mail-line"></i>
                  </div>
                  <div>
                    <h4>Notifications par Email</h4>
                    <p>Recevez des résumés quotidiens et des alertes par email</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-option">
                <div class="option-info">
                  <div class="option-icon">
                    <i class="ri-smartphone-line"></i>
                  </div>
                  <div>
                    <h4>Alertes de Connexion</h4>
                    <p>Soyez notifié lors d'une connexion depuis un nouvel appareil</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-option">
                <div class="option-info">
                  <div class="option-icon">
                    <i class="ri-exchange-funds-line"></i>
                  </div>
                  <div>
                    <h4>Alertes de Transaction</h4>
                    <p>Recevez une notification pour chaque transaction</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-option">
                <div class="option-info">
                  <div class="option-icon">
                    <i class="ri-megaphone-line"></i>
                  </div>
                  <div>
                    <h4>Emails Marketing</h4>
                    <p>Recevez des nouvelles sur les fonctionnalités et offres</p>
                  </div>
                </div>
                <label class="toggle">
                  <input type="checkbox">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 1.5rem 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 2rem;
    }

    .settings-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.025em;
      margin-bottom: 0.25rem;
    }

    .settings-subtitle {
      color: #64748b;
      font-size: 0.9375rem;
    }

    .settings-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 2rem;
      align-items: start;
    }

    /* Navigation */
    .settings-nav {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 0.5rem;
      position: sticky;
      top: 1.5rem;
    }

    .nav-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: none;
      background: transparent;
      border-radius: 0.625rem;
      cursor: pointer;
      font-size: 0.9375rem;
      font-weight: 500;
      color: #64748b;
      transition: all 0.15s;
      text-align: left;
    }

    .nav-btn:hover {
      background: #f8fafc;
      color: #1e293b;
    }

    .nav-btn.active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
      color: #3b82f6;
    }

    .nav-btn i {
      font-size: 1.25rem;
    }

    /* Panel */
    .settings-panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;
    }

    .panel-header > i {
      font-size: 1.75rem;
      color: #3b82f6;
    }

    .panel-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.125rem;
    }

    .panel-subtitle {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* Profile Section */
    .profile-section {
      padding: 1.5rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .avatar-area {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .avatar-container {
      position: relative;
    }

    .avatar-lg {
      width: 80px;
      height: 80px;
      border-radius: 1rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: 700;
    }

    .avatar-edit-btn {
      position: absolute;
      bottom: -4px;
      right: -4px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: white;
      border: 2px solid #e2e8f0;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }

    .avatar-edit-btn:hover {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .avatar-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.125rem;
    }

    .avatar-email {
      font-size: 0.875rem;
      color: #64748b;
      margin-bottom: 0.5rem;
    }

    .change-avatar-btn {
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
    }

    .change-avatar-btn:hover {
      text-decoration: underline;
    }

    /* Form */
    .settings-form {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.625rem;
      font-size: 0.9375rem;
      color: #1e293b;
      transition: all 0.15s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    .form-group input.readonly {
      background: #f8fafc;
      color: #64748b;
    }

    .form-group input::placeholder {
      color: #94a3b8;
    }

    .form-hint {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.375rem;
    }

    .form-actions {
      padding-top: 0.5rem;
      display: flex;
      justify-content: flex-end;
    }

    /* Info Box */
    .info-box {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.1);
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .info-box > i {
      color: #3b82f6;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .info-box strong {
      display: block;
      font-size: 0.8125rem;
      color: #1e293b;
      margin-bottom: 0.375rem;
    }

    .info-box ul {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.8125rem;
      color: #475569;
    }

    .info-box li {
      margin-bottom: 0.125rem;
    }

    /* Notification Options */
    .notification-options {
      padding: 0.5rem;
    }

    .notification-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      transition: background 0.15s;
    }

    .notification-option:hover {
      background: #f8fafc;
    }

    .option-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .option-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .option-info h4 {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.125rem;
    }

    .option-info p {
      font-size: 0.8125rem;
      color: #64748b;
      margin: 0;
    }

    /* Toggle Switch */
    .toggle {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 26px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #e2e8f0;
      border-radius: 26px;
      transition: 0.3s;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    }

    .toggle input:checked + .toggle-slider {
      background: #3b82f6;
    }

    .toggle input:checked + .toggle-slider:before {
      transform: translateX(22px);
    }

    /* Button */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.625rem;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:hover {
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
    }

    /* Animations */
    .animate-slide-in {
      animation: slideIn 0.4s ease-out;
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-layout {
        grid-template-columns: 1fr;
      }

      .settings-nav {
        position: static;
        display: flex;
        overflow-x: auto;
        gap: 0.5rem;
      }

      .nav-btn {
        flex-shrink: 0;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .avatar-area {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class SettingsComponent {
  activeTab: 'profile' | 'security' | 'notifications' = 'profile';
  isSaving = false;

  saveProfile() {
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
      alert('Profil mis à jour avec succès !');
    }, 1000);
  }

  updatePassword() {
    alert('Mot de passe mis à jour avec succès !');
  }
}
