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
  templateUrl: './client-verification.component.html',
  styleUrls: ['./client-verification.component.css']
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
      this.bankUserService.getClientDocuments(client.clientId).subscribe({
        next: (response) => {
          if (response.success) {
            this.clientDocuments[client.clientId] = response.data.map((doc: any) => ({
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
        error: (error) => console.error(`Error loading documents for client ${client.clientId}:`, error)
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
  viewDocument(doc: Document): void {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
    } else {
      console.warn('Document URL not available:', doc);
      // You can show a toast or message here
    }
  }

  downloadDocument(doc: Document): void {
    if (doc.fileUrl) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.warn('Download URL not available for document:', doc);

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

      this.bankUserService.verifyClient(client.clientId, verificationRequest).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the client in the local array
            const clientIndex = this.allClients.findIndex(c => c.clientId === client.clientId);
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
