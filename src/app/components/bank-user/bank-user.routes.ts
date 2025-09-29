import { Routes } from '@angular/router';

export const BANK_USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bank-user-layout/bank-user-layout.component').then(m => m.BankUserLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./bank-user-dashboard/bank-user-dashboard.component').then(m => m.BankUserDashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./client-management/client-list/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'clients/create',
        loadComponent: () => import('./client-management/create-client/create-client.component').then(m => m.CreateClientComponent)
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./client-management/client-details/client-details.component').then(m => m.ClientDetailsComponent)
      },
      {
        path: 'clients/:id/users',
        loadComponent: () => import('./client-management/client-users/client-users.component').then(m => m.ClientUsersComponent)
      },
      {
        path: 'verification',
        loadComponent: () => import('./client-management/client-verification/client-verification.component').then(m => m.ClientVerificationComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./payment-management/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent)
      },
      {
        path: 'payments/pending',
        loadComponent: () => import('./payment-management/pending-payments/pending-payments.component').then(m => m.PendingPaymentsComponent)
      },
      {
        path: 'payments/:id',
        loadComponent: () => import('./payment-management/payment-approval/payment-approval.component').then(m => m.PaymentApprovalComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./bank-reports/report-dashboard/report-dashboard.component').then(m => m.ReportDashboardComponent)
      },
      {
        path: 'reports/generate',
        loadComponent: () => import('./bank-reports/report-generator/report-generator.component').then(m => m.ReportGeneratorComponent)
      },
      {
        path: 'reports/history',
        loadComponent: () => import('./bank-reports/report-history/report-history.component').then(m => m.ReportHistoryComponent)
      }
    ]
  }
];
