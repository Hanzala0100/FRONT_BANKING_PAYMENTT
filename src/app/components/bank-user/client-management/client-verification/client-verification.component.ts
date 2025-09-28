// components/bank-user/client-management/client-verification/client-verification.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Client } from '../../../../shared/models/Client.interface';
import { Document } from '../../../../shared/models/Document.interface';
import { VerificationStatus } from '../../../../shared/enums/Verification-status.enum';
import { ClientVerificationRequest } from '../../../../shared/models/Document.interface';

@Component({
  selector: 'app-client-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Client Verification</h1>
          <p class="text-gray-600 mt-1">Review and approve client registrations</p>
        </div>
        <div class="text-sm text-gray-500">
          {{ pendingClients.length }} clients pending verification
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button *ngFor="let filter of filters" 
                    (click)="activeFilter = filter.id; applyFilter()"
                    class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                    [class.border-blue-500]="activeFilter === filter.id"
                    [class.text-blue-600]="activeFilter === filter.id"
                    [class.border-transparent]="activeFilter !== filter.id"
                    [class.text-gray-500]="activeFilter !== filter.id"
                    [class.hover:text-gray-700]="activeFilter !== filter.id">
              {{ filter.label }}
              <span class="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full"
                    [class.bg-orange-100]="filter.id === 'pending' && activeFilter === filter.id"
                    [class.text-orange-800]="filter.id === 'pending' && activeFilter === filter.id">
                {{ filter.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Clients List -->
      <div class="space-y-4" *ngIf="filteredClients.length > 0; else noClientsTemplate">
        <div *ngFor="let client of filteredClients" 
             class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          
          <!-- Client Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <span class="text-lg font-medium text-white">
                  {{ getClientInitials(client.name) }}
                </span>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ client.name }}</h3>
                <p class="text-sm text-gray-600">{{ client.registrationNumber }}</p>
                <p class="text-xs text-gray-500">{{ client.address }}</p>
              </div>
            </div>
            
            <div class="text-right">
              <span class="inline-flex px-3 py-1 text-sm font-semibold rounded-full"
                    [ngClass]="getStatusBadgeClass(client.verificationStatus)">
                {{ client.verificationStatus }}
              </span>
              <p class="text-xs text-gray-500 mt-1">{{ client.bankName }}</p>
            </div>
          </div>

          <!-- Client Stats -->
          <div class="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div class="text-center">
              <p class="text-lg font-semibold text-gray-900">{{ client.totalEmployees }}</p>
              <p class="text-xs text-gray-600">Employees</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-semibold text-gray-900">{{ client.totalBeneficiaries }}</p>
              <p class="text-xs text-gray-600">Beneficiaries</p>
            </div>
            <div class="text-center">
              <p class="text-lg font-semibold text-gray-900">{{ client.totalPayments }}</p>
              <p class="text-xs text-gray-600">Payments</p>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="mb-4" *ngIf="getClientDocuments(client.id).length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <ion-icon name="document-text-outline" class="mr-2 text-blue-600"></ion-icon>
              Documents ({{ getClientDocuments(client.id).length }})
            </h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div *ngFor="let doc of getClientDocuments(client.id)" 
                   class="flex items-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                <ion-icon name="document-outline" class="text-blue-600 mr-2"></ion-icon>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-blue-900 truncate">{{ doc.fileName }}</p>
                  <p class="text-xs text-blue-700">{{ doc.docType }}</p>
                </div>
                <button class="ml-2 text-blue-600 hover:text-blue-800">
                  <ion-icon name="eye-outline" class="text-sm"></ion-icon>
                </button>
              </div>
            </div>
          </div>

          <!-- Verification Actions -->
          <div *ngIf="client.verificationStatus === 'Pending'" class="border-t border-gray-200 pt-4">
            
            <!-- Verification Form -->
            <div *ngIf="selectedClientId === client.id" class="space-y-4">
              <form [formGroup]="verificationForm" (ngSubmit)="submitVerification(client)" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Verification Decision <span class="text-red-500">*</span>
                  </label>
                  <div class="flex space-x-4">
                    <label class="flex items-center">
                      <input type="radio" 
                             formControlName="verificationStatus" 
                             value="Verified"
                             class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-900">Approve</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" 
                             formControlName="verificationStatus" 
                             value="Rejected"
                             class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300">
                      <span class="ml-2 text-sm text-gray-900">Reject</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes <span class="text-red-500">*</span>
                  </label>
                  <textarea 
                    id="notes"
                    formControlName="notes"
                    rows="3"
                    placeholder="Enter verification notes or reason for rejection..."
                    class="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    [class.border-red-300]="verificationForm.get('notes')?.invalid && verificationForm.get('notes')?.touched">
                  </textarea>
                  <div *ngIf="verificationForm.get('notes')?.invalid && verificationForm.get('notes')?.touched" 
                       class="text-red-600 text-sm mt-1 flex items-center">
                    <ion-icon name="alert-circle-outline" class="mr-1 text-sm"></ion-icon>
                    Verification notes are required
                  </div>
                </div>

                <div class="flex items-center justify-end space-x-3">
                  <button type="button" 
                          (click)="cancelVerification()"
                          class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  
                  <button type="submit" 
                          [disabled]="verificationForm.invalid || isSubmitting"
                          class="px-6 py-2 font-medium rounded-lg transition-colors flex items-center"
                          [class.bg-green-600]="verificationForm.get('verificationStatus')?.value === 'Verified'"
                          [class.hover:bg-green-700]="verificationForm.get('verificationStatus')?.value === 'Verified'"
                          [class.bg-red-600]="verificationForm.get('verificationStatus')?.value === 'Rejected'"
                          [class.hover:bg-red-700]="verificationForm.get('verificationStatus')?.value === 'Rejected'"
                          [class.bg-gray-300]="!verificationForm.get('verificationStatus')?.value"
                          class="text-white disabled:bg-gray-300 disabled:cursor-not-allowed">
                    
                    <div *ngIf="isSubmitting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <ion-icon *ngIf="!isSubmitting && verificationForm.get('verificationStatus')?.value === 'Verified'" 
                              name="checkmark-outline" class="mr-2"></ion-icon>
                    <ion-icon *ngIf="!isSubmitting && verificationForm.get('verificationStatus')?.value === 'Rejected'" 
                              name="close-outline" class="mr-2"></ion-icon>
                    
                    {{ isSubmitting ? 'Processing...' : 'Submit Verification' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- Action Buttons -->
            <div *ngIf="selectedClientId !== client.id" class="flex items-center justify-end space-x-3">
              <a [routerLink]="['/bank-admin/clients', client.id]" 
                 class="flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <ion-icon name="eye-outline" class="mr-2"></ion-icon>
                View Details
              </a>
              
              <button (click)="startVerification(client.id)"
                      class="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <ion-icon name="checkmark-circle-outline" class="mr-2"></ion-icon>
                Start Verification
              </button>
            </div>
          </div>

          <!-- Verification Result (for Verified/rejected clients) -->
          <div *ngIf="client.verificationStatus !== 'Pending'" class="border-t border-gray-200 pt-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <ion-icon name="checkmark-circle" 
                          *ngIf="client.verificationStatus === 'Verified'"
                          class="text-green-500 text-lg mr-2"></ion-icon>
                <ion-icon name="close-circle" 
                          *ngIf="client.verificationStatus === 'Rejected'"
                          class="text-red-500 text-lg mr-2"></ion-icon>
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{ client.verificationStatus === 'Verified' ? 'Verification Verified' : 'Verification Rejected' }}
                  </p>
                  <p class="text-xs text-gray-600" *ngIf="client.verifiedAt">
                    {{ client.verifiedAt | date:'medium' }}
                  </p>
                </div>
              </div>
              
              <a [routerLink]="['/bank-admin/clients', client.id]" 
                 class="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Details →
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- No Clients Template -->
      <ng-template #noClientsTemplate>
        <div class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <ion-icon name="checkmark-done-outline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ activeFilter === 'pending' ? 'No pending verifications' : 'No clients found' }}
          </h3>
          <p class="text-gray-500 mb-6">
            {{ activeFilter === 'pending' ? 'All clients have been verified.' : 'No clients match the selected filter.' }}
          </p>
          <a routerLink="/bank-admin/clients/create" 
             *ngIf="activeFilter === 'pending'"
             class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <ion-icon name="add" class="mr-2"></ion-icon>
            Add New Client
          </a>
        </div>
      </ng-template>

      <!-- Bulk Actions (if multiple clients selected) -->
      <div class="fixed bottom-6 right-6" *ngIf="selectedClients.length > 0">
        <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ selectedClients.length }} selected</span>
            <button class="text-sm text-green-600 hover:text-green-700 font-medium">
              Approve All
            </button>
            <button class="text-sm text-red-600 hover:text-red-700 font-medium">
              Reject All
            </button>
            <button (click)="clearSelection()" class="text-sm text-gray-600 hover:text-gray-700">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientVerificationComponent implements OnInit {
  allClients: Client[] = [];
  filteredClients: Client[] = [];
  pendingClients: Client[] = [];
  clientDocuments: { [clientId: number]: Document[] } = {};

  verificationForm: FormGroup;
  selectedClientId: number | null = null;
  selectedClients: number[] = [];
  isSubmitting = false;

  activeFilter = 'pending';
  filters = [
    { id: 'pending', label: 'Pending', count: 0 },
    { id: 'Verified', label: 'Verified', count: 0 },
    { id: 'rejected', label: 'Rejected', count: 0 },
    { id: 'all', label: 'All', count: 0 }
  ];

  constructor(
    private bankUserService: BankUserService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.verificationForm = this.formBuilder.group({
      verificationStatus: ['', Validators.required],
      notes: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.loadClients();

    // Check if there's a specific client to verify from query params
    this.route.queryParams.subscribe(params => {
      if (params['clientId']) {
        const clientId = +params['clientId'];
        this.startVerification(clientId);
      }
    });
  }

  loadClients() {
    this.bankUserService.getAllClients().subscribe({
      next: (response) => {
        if (response.success) {
          this.allClients = response.data;
          this.pendingClients = this.allClients.filter(c => c.verificationStatus === 'Pending');
          this.updateFilterCounts();
          this.applyFilter();
          this.loadDocumentsForClients();
        }
      },
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadDocumentsForClients() {
    // Load documents for each client
    this.allClients.forEach(client => {
      this.bankUserService.getClientDocuments(client.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.clientDocuments[client.id] = response.data.map((doc: any) => ({
              uploadedBy: doc.uploadedBy,
              bankId: doc.bankId,
              fileName: doc.fileName,
              fileUrl: doc.fileUrl,
              uploadedAt: doc.uploadedAt,
              docType: doc.docType,
              clientId: doc.clientId,
              id: doc.id
            }));
          }
        },
        error: (error) => console.error(`Error loading documents for client ${client.id}:`, error)
      });
    });
  }

  updateFilterCounts() {
    this.filters.find(f => f.id === 'pending')!.count =
      this.allClients.filter(c => c.verificationStatus === 'Pending').length;
    this.filters.find(f => f.id === 'Verified')!.count =
      this.allClients.filter(c => c.verificationStatus === 'Verified').length;
    this.filters.find(f => f.id === 'rejected')!.count =
      this.allClients.filter(c => c.verificationStatus === 'Rejected').length;
    this.filters.find(f => f.id === 'all')!.count = this.allClients.length;
  }

  applyFilter() {
    switch (this.activeFilter) {
      case 'pending':
        this.filteredClients = this.allClients.filter(c => c.verificationStatus === 'Pending');
        break;
      case 'Verified':
        this.filteredClients = this.allClients.filter(c => c.verificationStatus === 'Verified');
        break;
      case 'rejected':
        this.filteredClients = this.allClients.filter(c => c.verificationStatus === 'Rejected');
        break;
      default:
        this.filteredClients = [...this.allClients];
    }
  }

  startVerification(clientId: number) {
    this.selectedClientId = clientId;
    this.verificationForm.reset();
  }

  cancelVerification() {
    this.selectedClientId = null;
    this.verificationForm.reset();
  }

  submitVerification(client: Client) {
    if (this.verificationForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const verificationRequest: ClientVerificationRequest = {
        verificationStatus: this.verificationForm.get('verificationStatus')?.value as VerificationStatus,
        notes: this.verificationForm.get('notes')?.value
      };

      this.bankUserService.verifyClient(client.id, verificationRequest).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the client in the local array
            const clientIndex = this.allClients.findIndex(c => c.id === client.id);
            if (clientIndex >= 0) {
              this.allClients[clientIndex] = response.data;
            }

            // Update counts and filters
            this.updateFilterCounts();
            this.applyFilter();

            // Reset form and selection
            this.cancelVerification();
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error verifying client:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  getClientDocuments(clientId: number): Document[] {
    return this.clientDocuments[clientId] || [];
  }

  getClientInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  clearSelection() {
    this.selectedClients = [];
  }
}