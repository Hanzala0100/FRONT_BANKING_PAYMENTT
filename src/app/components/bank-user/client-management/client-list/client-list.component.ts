import { Client } from './../../../../shared/models/Client.interface';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BankUserService } from '../../../../core/services/bank-user.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './client-list.component.html'
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
        client.clientName.toLowerCase().includes(search) ||
        client.registerationNumber.toLowerCase().includes(search) ||
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
        case 'name': return a.clientName.localeCompare(b.clientName);
        case 'verificationStatus': return a.verificationStatus.localeCompare(b.verificationStatus);
        case 'totalEmployees': return b.totalEmployees - a.totalEmployees;
        default: return 0;
      }
    });

    this.filteredClients = filtered;
  }

  getClientInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getPendingCount(): number {
    return this.allClients.filter(c => c.verificationStatus === 'Pending').length;
  }

  getVerifiedCount(): number {
    return this.allClients.filter(c => c.verificationStatus === 'Verified').length;
  }

  getRejectedCount(): number {
    return this.allClients.filter(c => c.verificationStatus === 'Rejected').length;
  }

  deleteClient(client: Client) {
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  confirmDelete() {
    if (!this.clientToDelete) return;

    this.isDeletingClient = true;
    this.bankUserService.deleteClient(this.clientToDelete.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.allClients = this.allClients.filter(c => c.clientId !== this.clientToDelete!.clientId);
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
    return client.clientId;
  }
}
