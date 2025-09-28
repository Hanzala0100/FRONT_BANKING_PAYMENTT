import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Client } from '../../../../shared/models/Client.interface';
import { VerificationStatus } from '../../../../shared/enums/Verification-status.enum';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Client Management</h1>
          <p class="text-gray-600 mt-1">Manage and monitor all corporate clients</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <a routerLink="/bank-admin/clients/create" 
             class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
            <ion-icon name="add" class="mr-2"></ion-icon>
            Add New Client
          </a>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Search Clients</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ion-icon name="search-outline" class="text-gray-400"></ion-icon>
              </div>
              <input 
                type="text" 
                [(ngModel)]="searchTerm"
                (input)="applyFilters()"
                placeholder="Search by name, registration number..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
            <select [(ngModel)]="selectedStatus" 
                    (change)="applyFilters()"
                    class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select [(ngModel)]="sortBy" 
                    (change)="applyFilters()"
                    class="block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="name">Name</option>
              <option value="registrationDate">Registration Date</option>
              <option value="verificationStatus">Status</option>
              <option value="totalEmployees">Employees</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="bg-blue-100 p-2 rounded-lg">
              <ion-icon name="people" class="text-blue-600 text-lg"></ion-icon>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Total Clients</p>
              <p class="text-xl font-semibold text-gray-900">{{ allClients.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="bg-orange-100 p-2 rounded-lg">
              <ion-icon name="hourglass" class="text-orange-600 text-lg"></ion-icon>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Pending</p>
              <p class="text-xl font-semibold text-gray-900">{{ getPendingCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="bg-green-100 p-2 rounded-lg">
              <ion-icon name="checkmark-circle" class="text-green-600 text-lg"></ion-icon>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Approved</p>
              <p class="text-xl font-semibold text-gray-900">{{ getApprovedCount() }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center">
            <div class="bg-red-100 p-2 rounded-lg">
              <ion-icon name="close-circle" class="text-red-600 text-lg"></ion-icon>
            </div>
            <div class="ml-3">
              <p class="text-sm text-gray-600">Rejected</p>
              <p class="text-xl font-semibold text-gray-900">{{ getRejectedCount() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Clients Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">
            Clients ({{ filteredClients.length }})
          </h2>
        </div>

        <div class="overflow-x-auto" *ngIf="!isLoading; else loadingTemplate">
          <table class="min-w-full divide-y divide-gray-200" *ngIf="filteredClients.length > 0; else noClientsTemplate">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client Details
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statistics
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let client of filteredClients; trackBy: trackByClientId" 
                  class="hover:bg-gray-50 transition-colors">
                
                <!-- Client Details -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ getClientInitials(client.name) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ client.name }}</div>
                      <div class="text-sm text-gray-500">{{ client.address }}</div>
                    </div>
                  </div>
                </td>

                <!-- Registration -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ client.registrationNumber }}</div>
                  <div class="text-sm text-gray-500">{{ client.bankName }}</div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="getStatusBadgeClass(client.verificationStatus)">
                    {{ client.verificationStatus }}
                  </span>
                  <div *ngIf="client.verifiedAt" class="text-xs text-gray-500 mt-1">
                    {{ client.verifiedAt | date:'short' }}
                  </div>
                </td>

                <!-- Statistics -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="space-y-1">
                    <div class="flex items-center">
                      <ion-icon name="people-outline" class="text-xs mr-1"></ion-icon>
                      {{ client.totalEmployees }} employees
                    </div>
                    <div class="flex items-center">
                      <ion-icon name="person-outline" class="text-xs mr-1"></ion-icon>
                      {{ client.totalBeneficiaries }} beneficiaries
                    </div>
                    <div class="flex items-center">
                      <ion-icon name="card-outline" class="text-xs mr-1"></ion-icon>
                      {{ client.totalPayments }} payments
                    </div>
                  </div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <a [routerLink]="['/bank-admin/clients', client.id]" 
                       class="text-blue-600 hover:text-blue-900 transition-colors"
                       title="View Details">
                      <ion-icon name="eye-outline"></ion-icon>
                    </a>
                    
                    <a [routerLink]="['/bank-admin/clients', client.id, 'users']" 
                       class="text-green-600 hover:text-green-900 transition-colors"
                       title="Manage Users">
                      <ion-icon name="people-outline"></ion-icon>
                    </a>

                    <button *ngIf="client.verificationStatus === 'Pending'"
                            (click)="quickVerify(client)"
                            class="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Quick Verify">
                      <ion-icon name="checkmark-circle-outline"></ion-icon>
                    </button>

                    <button (click)="deleteClient(client)"
                            class="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete Client">
                      <ion-icon name="trash-outline"></ion-icon>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- No Clients Template -->
          <ng-template #noClientsTemplate>
            <div class="text-center py-12">
              <ion-icon name="people-outline" class="text-6xl text-gray-300 mb-4"></ion-icon>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p class="text-gray-500 mb-6">Get started by adding your first corporate client.</p>
              <a routerLink="/bank-admin/clients/create" 
                 class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                <ion-icon name="add" class="mr-2"></ion-icon>
                Add First Client
              </a>
            </div>
          </ng-template>
        </div>

        <!-- Loading Template -->
        <ng-template #loadingTemplate>
          <div class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p class="text-gray-500 mt-2">Loading clients...</p>
          </div>
        </ng-template>
      </div>

      <!-- Pagination (if needed) -->
      <div class="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-3" 
           *ngIf="filteredClients.length > 0">
        <div class="text-sm text-gray-500">
          Showing {{ filteredClients.length }} of {{ allClients.length }} clients
        </div>
        <div class="text-sm text-gray-500">
          <!-- Add pagination controls here if needed -->
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div *ngIf="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" (click)="closeDeleteModal()">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ion-icon name="alert-triangle" class="text-red-600 text-xl"></ion-icon>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Client</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete <strong>{{ clientToDelete?.name }}</strong>? 
                    This action cannot be undone and will remove all associated data.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button (click)="confirmDelete()" 
                    [disabled]="isDeletingClient"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
              <span *ngIf="isDeletingClient" class="mr-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </span>
              {{ isDeletingClient ? 'Deleting...' : 'Delete' }}
            </button>
            <button (click)="closeDeleteModal()" 
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  allClients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  selectedStatus = '';
  sortBy = 'name';

  // Modal states
  showDeleteModal = false;
  clientToDelete: Client | null = null;
  isDeletingClient = false;

  constructor(private bankUserService: BankUserService) { }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.bankUserService.getAllClients().subscribe({
      next: (response) => {
        if (response.success) {
          this.allClients = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allClients];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(search) ||
        client.registrationNumber.toLowerCase().includes(search) ||
        client.address.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(client => client.verificationStatus === this.selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'verificationStatus':
          return a.verificationStatus.localeCompare(b.verificationStatus);
        case 'totalEmployees':
          return b.totalEmployees - a.totalEmployees;
        default:
          return 0;
      }
    });

    this.filteredClients = filtered;
  }

  getClientInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusBadgeClass(status: string): string {
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

  getPendingCount(): number {
    return this.allClients.filter(c => c.verificationStatus === 'Pending').length;
  }

  getApprovedCount(): number {
    return this.allClients.filter(c => c.verificationStatus === 'Verified').length;
  }

  getRejectedCount(): number {
    return this.allClients.filter(c => c.verificationStatus === 'Rejected').length;
  }

  quickVerify(client: Client) {
    // Navigate to verification page or open quick verification modal
    // This is a placeholder - implement based on your verification workflow
  }

  deleteClient(client: Client) {
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.clientToDelete) return;

    this.isDeletingClient = true;
    this.bankUserService.deleteClient(this.clientToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allClients = this.allClients.filter(c => c.id !== this.clientToDelete!.id);
          this.applyFilters();
          this.closeDeleteModal();
        }
        this.isDeletingClient = false;
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.isDeletingClient = false;
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.clientToDelete = null;
    this.isDeletingClient = false;
  }

  trackByClientId(index: number, client: Client): number {
    return client.id;
  }
}