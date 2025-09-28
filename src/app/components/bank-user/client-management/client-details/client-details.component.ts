// components/bank-user/client-management/client-details/client-details.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Client } from '../../../../shared/models/Client.interface';
import { Document } from '../../../../shared/models/Document.interface';
import { User } from '../../../../shared/models/User.interface';
import { Payment } from '../../../../shared/models/Payment.inteface';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="p-6" *ngIf="!isLoading; else loadingTemplate">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-4">
          <a routerLink="/bank-admin/clients" 
             class="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <ion-icon name="arrow-back-outline" class="text-lg text-gray-600"></ion-icon>
          </a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ client?.name }}</h1>
            <p class="text-gray-600">Client Details & Management</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-3">
          <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                [ngClass]="getStatusBadgeClass(client?.verificationStatus)">
            {{ client?.verificationStatus }}
          </span>
          
          <div class="relative" *ngIf="client">
            <button (click)="toggleActionsMenu()" 
                    class="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ion-icon name="ellipsis-horizontal" class="mr-2"></ion-icon>
              Actions
            </button>
            
            <!-- Actions Dropdown -->
            <div *ngIf="showActionsMenu" 
                 class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
              <div class="py-2">
                <a [routerLink]="['/bank-admin/clients', client.id, 'users']" 
                   class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <ion-icon name="people-outline" class="mr-3"></ion-icon>
                  Manage Users
                </a>
                
                <button *ngIf="client.verificationStatus === 'Pending'" 
                        (click)="verifyClient()"
                        class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  <ion-icon name="checkmark-circle-outline" class="mr-3"></ion-icon>
                  Verify Client
                </button>
                
                <button (click)="deleteClient()" 
                        class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <ion-icon name="trash-outline" class="mr-3"></ion-icon>
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Client Info Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6" *ngIf="client">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="bg-blue-100 p-3 rounded-lg">
              <ion-icon name="people-outline" class="text-blue-600 text-xl"></ion-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Employees</p>
              <p class="text-2xl font-bold text-gray-900">{{ client.totalEmployees }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="bg-green-100 p-3 rounded-lg">
              <ion-icon name="person-outline" class="text-green-600 text-xl"></ion-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Beneficiaries</p>
              <p class="text-2xl font-bold text-gray-900">{{ client.totalBeneficiaries }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="bg-purple-100 p-3 rounded-lg">
              <ion-icon name="card-outline" class="text-purple-600 text-xl"></ion-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Payments</p>
              <p class="text-2xl font-bold text-gray-900">{{ client.totalPayments }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="bg-orange-100 p-3 rounded-lg">
              <ion-icon name="business-outline" class="text-orange-600 text-xl"></ion-icon>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Bank</p>
              <p class="text-sm font-medium text-gray-900">{{ client.bankName }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button *ngFor="let tab of tabs" 
                    (click)="activeTab = tab.id"
                    class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                    [class.border-blue-500]="activeTab === tab.id"
                    [class.text-blue-600]="activeTab === tab.id"
                    [class.border-transparent]="activeTab !== tab.id"
                    [class.text-gray-500]="activeTab !== tab.id"
                    [class.hover:text-gray-700]="activeTab !== tab.id">
              <ion-icon [name]="tab.icon" class="mr-2"></ion-icon>
              {{ tab.label }}
              <span *ngIf="tab.count !== undefined" class="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          
          <!-- Overview Tab -->
          <div *ngIf="activeTab === 'overview'" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Basic Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <ion-icon name="information-circle-outline" class="mr-2 text-blue-600"></ion-icon>
                  Basic Information
                </h3>
                
                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-600">Company Name:</span>
                    <span class="font-medium text-gray-900">{{ client?.name }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-600">Registration Number:</span>
                    <span class="font-medium text-gray-900">{{ client?.registrationNumber }}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-600">Bank:</span>
                    <span class="font-medium text-gray-900">{{ client?.bankName }}</span>
                  </div>
                  <div class="flex justify-between py-2">
                    <span class="text-gray-600">Address:</span>
                    <span class="font-medium text-gray-900 text-right max-w-xs">{{ client?.address }}</span>
                  </div>
                </div>
              </div>

              <!-- Verification Information -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <ion-icon name="shield-checkmark-outline" class="mr-2 text-green-600"></ion-icon>
                  Verification Status
                </h3>
                
                <div class="space-y-3">
                  <div class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-600">Status:</span>
                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                          [ngClass]="getStatusBadgeClass(client?.verificationStatus)">
                      {{ client?.verificationStatus }}
                    </span>
                  </div>
                  <div *ngIf="client?.verifiedBy" class="flex justify-between py-2 border-b border-gray-100">
                    <span class="text-gray-600">Verified By:</span>
                    <span class="font-medium text-gray-900">User ID: {{ client?.verifiedBy }}</span>
                  </div>
                  <div *ngIf="client?.verifiedAt" class="flex justify-between py-2">
                    <span class="text-gray-600">Verified At:</span>
                    <span class="font-medium text-gray-900">{{ client?.verifiedAt | date:'medium' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Tab -->
          <div *ngIf="activeTab === 'documents'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Client Documents</h3>
              <button (click)="uploadDocument()" 
                      class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <ion-icon name="cloud-upload-outline" class="mr-2"></ion-icon>
                Upload Document
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                 *ngIf="documents.length > 0; else noDocuments">
              <div *ngFor="let document of documents" 
                   class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div class="flex items-start justify-between">
                  <div class="flex items-center">
                    <div class="bg-blue-100 p-2 rounded-lg mr-3">
                      <ion-icon name="document-text-outline" class="text-blue-600"></ion-icon>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ document.fileName }}</p>
                      <p class="text-xs text-gray-600">{{ document.docType }}</p>
                      <p class="text-xs text-gray-500">{{ document.uploadedAt | date:'short' }}</p>
                    </div>
                  </div>
                  <button class="text-gray-400 hover:text-gray-600">
                    <ion-icon name="download-outline"></ion-icon>
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noDocuments>
              <div class="text-center py-12">
                <ion-icon name="document-outline" class="text-6xl text-gray-300 mb-4"></ion-icon>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p class="text-gray-500 mb-6">Upload verification documents for this client.</p>
                <button (click)="uploadDocument()" 
                        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  <ion-icon name="cloud-upload-outline" class="mr-2"></ion-icon>
                  Upload First Document
                </button>
              </div>
            </ng-template>
          </div>

          <!-- Users Tab -->
          <div *ngIf="activeTab === 'users'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Client Users</h3>
              <a [routerLink]="['/bank-admin/clients', client?.id, 'users']" 
                 class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <ion-icon name="person-add-outline" class="mr-2"></ion-icon>
                Manage Users
              </a>
            </div>

            <div class="space-y-3" *ngIf="users.length > 0; else noUsers">
              <div *ngFor="let user of users" 
                   class="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mr-4">
                    <span class="text-sm font-medium text-white">
                      {{ getUserInitials(user.fullName) }}
                    </span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ user.fullName }}</p>
                    <p class="text-sm text-gray-600">{{ user.email }}</p>
                    <p class="text-xs text-gray-500">{{ user.role }} • {{ user.username }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <ng-template #noUsers>
              <div class="text-center py-12">
                <ion-icon name="people-outline" class="text-6xl text-gray-300 mb-4"></ion-icon>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No users assigned</h3>
                <p class="text-gray-500 mb-6">Create user accounts for this client to enable system access.</p>
                <a [routerLink]="['/bank-admin/clients', client?.id, 'users']" 
                   class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  <ion-icon name="person-add-outline" class="mr-2"></ion-icon>
                  Add First User
                </a>
              </div>
            </ng-template>
          </div>

          <!-- Payments Tab -->
          <div *ngIf="activeTab === 'payments'">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">Payment History</h3>
              <a routerLink="/bank-admin/payments" 
                 class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <ion-icon name="card-outline" class="mr-2"></ion-icon>
                View All Payments
              </a>
            </div>

            <div class="space-y-3" *ngIf="payments.length > 0; else noPayments">
              <div *ngFor="let payment of payments" 
                   class="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div class="flex items-center">
                  <div class="bg-green-100 p-2 rounded-lg mr-4">
                    <ion-icon name="card-outline" class="text-green-600"></ion-icon>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ payment.beneficiaryName }}</p>
                    <p class="text-sm text-gray-600">{{ payment.beneficiaryAccountNumber }}</p>
                    <p class="text-xs text-gray-500">{{ payment.paymentDate | date:'medium' }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-lg font-semibold text-gray-900">₹{{ payment.amount | number:'1.2-2' }}</p>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="getPaymentStatusBadgeClass(payment.status)">
                    {{ payment.status }}
                  </span>
                </div>
              </div>
            </div>

            <ng-template #noPayments>
              <div class="text-center py-12">
                <ion-icon name="card-outline" class="text-6xl text-gray-300 mb-4"></ion-icon>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p class="text-gray-500">Payment history will appear here once transactions are processed.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Template -->
    <ng-template #loadingTemplate>
      <div class="p-6">
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="text-gray-500 mt-2">Loading client details...</p>
        </div>
      </div>
    </ng-template>
  `
})
export class ClientDetailsComponent implements OnInit {
  client: Client | null = null;
  documents: Document[] = [];
  users: User[] = [];
  payments: Payment[] = [];
  isLoading = true;

  activeTab = 'overview';
  showActionsMenu = false;

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
    { id: 'documents', label: 'Documents', icon: 'document-text-outline', count: 0 },
    { id: 'users', label: 'Users', icon: 'people-outline', count: 0 },
    { id: 'payments', label: 'Payments', icon: 'card-outline', count: 0 }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bankUserService: BankUserService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const clientId = +params['id'];
      if (clientId) {
        this.loadClientDetails(clientId);
      }
    });
  }

  loadClientDetails(clientId: number) {
    this.isLoading = true;

    // Load client basic info
    this.bankUserService.getClientById(clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.client = response.data;
          this.loadClientDocuments(clientId);
          this.loadClientUsers(clientId);
          this.loadClientPayments(clientId);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.isLoading = false;
      }
    });
  }

  loadClientDocuments(clientId: number) {
    this.bankUserService.getClientDocuments(clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.documents = response.data.map((doc: any) => ({
            uploadedBy: doc.uploadedBy ?? '',
            bankId: doc.bankId ?? 0,
            fileName: doc.fileName ?? '',
            fileUrl: doc.fileUrl ?? '',
            uploadedAt: doc.uploadedAt ?? null,
            docType: doc.docType ?? '',
          }));
          this.updateTabCount('documents', this.documents.length);
        }
      },
      error: (error) => console.error('Error loading documents:', error)
    });
  }

  loadClientUsers(clientId: number) {
    this.bankUserService.getClientUsers(clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
          this.updateTabCount('users', this.users.length);
        }
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  loadClientPayments(clientId: number) {
    // This would need to be implemented in the service to get payments by client
    // For now, we'll use mock data or handle it differently
    this.payments = []; // Replace with actual API call
    this.updateTabCount('payments', this.payments.length);
  }

  updateTabCount(tabId: string, count: number) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.count = count;
    }
  }

  toggleActionsMenu() {
    this.showActionsMenu = !this.showActionsMenu;
  }

  verifyClient() {
    if (this.client) {
      this.router.navigate(['/bank-admin/verification'], {
        queryParams: { clientId: this.client.id }
      });
    }
    this.showActionsMenu = false;
  }

  deleteClient() {
    if (this.client && confirm(`Are you sure you want to delete ${this.client.name}?`)) {
      this.bankUserService.deleteClient(this.client.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/bank-admin/clients']);
          }
        },
        error: (error) => console.error('Error deleting client:', error)
      });
    }
    this.showActionsMenu = false;
  }

  uploadDocument() {
    // Implement document upload functionality
    // This could open a modal or navigate to upload page
    console.log('Upload document functionality to be implemented');
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getUserInitials(fullName: string): string {
    return fullName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }
}