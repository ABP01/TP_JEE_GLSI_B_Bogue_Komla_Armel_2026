import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-settings',
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 mb-2">Settings</h1>
        <p class="text-gray-500">Manage your account preferences and security settings.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Sidebar Navigation (within settings) -->
        <div class="md:col-span-1">
          <div class="card p-2 sticky top-24">
            <button 
              (click)="activeTab = 'profile'"
              [class.bg-blue-50]="activeTab === 'profile'"
              [class.text-primary]="activeTab === 'profile'"
              class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-gray-50 mb-1">
              <i class="ri-user-settings-line text-xl"></i>
              <span class="font-medium">Profile Settings</span>
            </button>
            <button 
              (click)="activeTab = 'security'"
              [class.bg-blue-50]="activeTab === 'security'"
              [class.text-primary]="activeTab === 'security'"
              class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-gray-50 mb-1">
              <i class="ri-shield-key-line text-xl"></i>
              <span class="font-medium">Security</span>
            </button>
            <button 
              (click)="activeTab = 'notifications'"
              [class.bg-blue-50]="activeTab === 'notifications'"
              [class.text-primary]="activeTab === 'notifications'"
              class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-gray-50">
              <i class="ri-notification-3-line text-xl"></i>
              <span class="font-medium">Notifications</span>
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="md:col-span-2 space-y-6">
          
          <!-- Profile Tab -->
          <div *ngIf="activeTab === 'profile'" class="card p-6 animate-fade-in">
            <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i class="ri-user-smile-line text-primary"></i> Personal Information
            </h2>
            
            <div class="flex items-center gap-6 mb-8">
              <div class="relative group cursor-pointer">
                <div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl text-gray-400 border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors">
                  <i class="ri-camera-add-line"></i>
                </div>
                <div class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                  <i class="ri-edit-2-line text-sm"></i>
                </div>
              </div>
              <div>
                <h3 class="font-bold text-lg">Admin User</h3>
                <p class="text-gray-500 text-sm">admin@egabank.com</p>
                <button class="text-primary text-sm font-medium hover:underline mt-1">Change Avatar</button>
              </div>
            </div>

            <form class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" class="input w-full" value="Admin" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" class="input w-full" value="User" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" class="input w-full" value="admin@egabank.com" readonly />
                <p class="text-xs text-gray-500 mt-1">Contact support to change email.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" class="input w-full" placeholder="+1 (555) 000-0000" />
              </div>

              <div class="pt-4 flex justify-end">
                <button type="button" class="btn btn-primary" (click)="saveProfile()">
                  <span *ngIf="!isSaving">Save Changes</span>
                  <span *ngIf="isSaving"><i class="ri-loader-4-line animate-spin"></i> Saving...</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Security Tab -->
          <div *ngIf="activeTab === 'security'" class="card p-6 animate-fade-in">
             <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i class="ri-lock-password-line text-primary"></i> Password & Security
            </h2>

            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" class="input w-full" placeholder="Enter current password" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" class="input w-full" placeholder="Enter new password" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" class="input w-full" placeholder="Confirm new password" />
                </div>
              </div>
              
              <div class="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm flex gap-3 items-start my-4">
                <i class="ri-information-line text-lg mt-0.5"></i>
                <div>
                  <p class="font-bold">Password Requirements:</p>
                  <ul class="list-disc list-inside mt-1 space-y-1">
                    <li>Minimum 8 characters long</li>
                    <li>At least one uppercase character</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
              </div>

              <div class="pt-2 flex justify-end">
                <button type="button" class="btn btn-primary" (click)="updatePassword()">Update Password</button>
              </div>
            </form>
          </div>

           <!-- Notifications Tab -->
          <div *ngIf="activeTab === 'notifications'" class="card p-6 animate-fade-in">
             <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
              <i class="ri-notification-badge-line text-primary"></i> Notification Preferences
            </h2>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <div class="font-medium">Email Notifications</div>
                  <div class="text-sm text-gray-500">Receive daily summaries and alerts via email</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <div class="font-medium">Login Alerts</div>
                  <div class="text-sm text-gray-500">Get notified when your account is accessed from a new device</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked class="sr-only peer">
                   <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

               <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <div class="font-medium">Marketing Emails</div>
                  <div class="text-sm text-gray-500">Receive news about new features and offers</div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer">
                   <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .input {
      @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none;
    }
    .btn {
      @apply px-6 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95;
    }
    .btn-primary {
      @apply bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-md hover:opacity-90;
    }
  `]
})
export class SettingsComponent {
    activeTab: 'profile' | 'security' | 'notifications' = 'profile';
    isSaving = false;

    saveProfile() {
        this.isSaving = true;
        // Simulate API call
        setTimeout(() => {
            this.isSaving = false;
            alert('Profile updated successfully!');
        }, 1000);
    }

    updatePassword() {
        // Simulate API call
        alert('Password updated successfully!');
    }
}
