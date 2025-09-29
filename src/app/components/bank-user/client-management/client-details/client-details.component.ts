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
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
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
        queryParams: { clientId: this.client.clientId }
      });
    }
    this.showActionsMenu = false;
  }

  deleteClient() {
    if (this.client && confirm(`Are you sure you want to delete ${this.client.clientName}?`)) {
      this.bankUserService.deleteClient(this.client.clientId).subscribe({
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
