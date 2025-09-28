import { Routes } from '@angular/router';

export const SUPER_ADMIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./super-admin-layout/super-admin-layout.component').then(m => m.SuperAdminLayoutComponent),
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent)
            },
            {
                path: 'banks',
                loadComponent: () => import('./bank-management/bank-list/bank-list.component').then(m => m.BankListComponent)
            },
            {
                path: 'banks/create',
                loadComponent: () => import('./bank-management/create-bank/create-bank.component').then(m => m.CreateBankComponent)
            },
            {
                path: 'banks/:id',
                loadComponent: () => import('./bank-management/bank-details/bank-details.component').then(m => m.BankDetailsComponent)
            },
            {
                path: 'reports',
                loadComponent: () => import('./reports/super-admin-reports.component').then(m => m.SuperAdminReportsComponent)
            },
            {
                path: 'system-logs',
                loadComponent: () => import('./system-logs/system-logs.component').then(m => m.SystemLogsComponent)
            }
        ]
    }
];