import { Routes } from '@angular/router';
import { ClientVerificationGuard } from '../../core/guards/clientVerification';


export const CLIENT_USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./client-user-layout/client-user-layout.component').then(m => m.ClientUserLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./client-user-dashboard/client-user-dashboard.component').then(m => m.ClientUserDashboardComponent)
      },
      {
        path: 'employees',
        loadComponent: () => import('./employee-management/employee-list/employee-list.component').then(m => m.EmployeeListComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'employees/create',
        loadComponent: () => import('./employee-management/create-employee/create-employee.component').then(m => m.CreateEmployeeComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'employees/import',
        loadComponent: () => import('./employee-management/bulk-import/bulk-import.component').then(m => m.BulkImportComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'employees/:id',
        loadComponent: () => import('./employee-management/employee-details/employee-details.component').then(m => m.EmployeeDetailsComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'beneficiaries',
        loadComponent: () => import('./beneficiaries/beneficiary-list/beneficiary-list.component').then(m => m.BeneficiaryListComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'beneficiaries/create',
        loadComponent: () => import('./beneficiaries/create-beneficiary/create-beneficiary.component').then(m => m.CreateBeneficiaryComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'beneficiaries/:id',
        loadComponent: () => import('./beneficiaries/beneficiary-details/beneficiary-details.component').then(m => m.BeneficiaryDetailsComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'payments',
        loadComponent: () => import('./payments/payment-list/payment-list.component').then(m => m.PaymentListComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'payments/create',
        loadComponent: () => import('./payments/create-payment/create-payment.component').then(m => m.CreatePaymentComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'salary',
        loadComponent: () => import('./salary-disbursement/salary-list/salary-list.component').then(m => m.SalaryListComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'salary/disburse',
        loadComponent: () => import('./salary-disbursement/disburse-salary/disburse-salary.component').then(m => m.DisburseSalaryComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'salary/batch',
        loadComponent: () => import('./salary-disbursement/batch-salary/batch-salary.component').then(m => m.BatchSalaryComponent),
        canActivate: [ClientVerificationGuard]
      },
      {
        path: 'documents',
        loadComponent: () => import('./documents/document-list/document-list.component').then(m => m.DocumentListComponent)
        // No guard - always accessible
      },
      {
        path: 'documents/upload',
        loadComponent: () => import('./documents/upload-document/upload-document.component').then(m => m.UploadDocumentComponent)
        // No guard - always accessible
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/client-reports/client-reports.component').then(m => m.ClientReportsComponent),
        canActivate: [ClientVerificationGuard]
      }
    ]
  }
];
