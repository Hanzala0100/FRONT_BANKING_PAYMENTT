import { Routes } from '@angular/router';
import { AuthGuardService } from './core/guards/authGuardService';
import { LoginComponent } from './components/auth/login/login.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


export const routes: Routes = [
  // Public routes
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Super Admin routes
  {
    path: 'super-admin',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./components/super-admin/super-admin.routes').then(m => m.SUPER_ADMIN_ROUTES)
  },

  // Bank User routes
  {
    path: 'bank-user',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./components/bank-user/bank-user.routes').then(m => m.BANK_USER_ROUTES)
  },

  // Client User routes
  {
    path: 'client-user',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./components/client-user/client-user.routes').then(m => m.CLIENT_USER_ROUTES)
  },

  // 404 - Not Found
  { path: '**', component: NotFoundComponent }
];
