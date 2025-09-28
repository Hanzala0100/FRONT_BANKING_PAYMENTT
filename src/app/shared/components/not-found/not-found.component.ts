import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div class="text-center">
        <div class="mb-8">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
            <ion-icon name="warning-outline" class="text-blue-600 text-4xl"></ion-icon>
          </div>
          <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p class="text-gray-600 max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button 
            routerLink="/dashboard"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <ion-icon name="home-outline" class="mr-2"></ion-icon>
            Go to Dashboard
          </button>
          
          <button 
            routerLink="/login"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <ion-icon name="log-in-outline" class="mr-2"></ion-icon>
            Back to Login
          </button>
        </div>
        
        <div class="mt-12 text-sm text-gray-500">
          <p>If you believe this is an error, please contact your system administrator.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NotFoundComponent { }