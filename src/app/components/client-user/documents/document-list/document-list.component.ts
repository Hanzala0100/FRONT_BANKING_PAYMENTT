import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { Document } from '../../../../shared/models/Document.interface';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './document-list.component.html'
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  selectedDocType = '';
  sortBy = 'date';

  docTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'PAN', label: 'PAN Card' },
    { value: 'Aadhar', label: 'Aadhar Card' },
    { value: 'GST', label: 'GST Certificate' },
    { value: 'Incorporation', label: 'Incorporation Certificate' },
    { value: 'BankStatement', label: 'Bank Statement' },
    { value: 'AddressProof', label: 'Address Proof' },
    { value: 'Other', label: 'Other' }
  ];

  sortOptions = [
    { value: 'date', label: 'Newest First' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'type', label: 'Document Type' }
  ];

  constructor(private clientUserService: ClientUserService) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoading = true;
    this.clientUserService.getDocuments().subscribe({
      next: (response) => {
        if (response.success) {
          this.documents = response.data.map((doc: any) => ({
            id: doc.id,
            uploadedBy: doc.uploadedBy,
            bankId: doc.bankId,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            uploadedAt: doc.uploadedAt,
            docType: doc.docType,
            fileSize: doc.fileSize
          }));
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.documents];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(document =>
        document.fileName.toLowerCase().includes(search) ||
        (document.docType && document.docType.toLowerCase().includes(search))
      );
    }

    // Document type filter
    if (this.selectedDocType) {
      filtered = filtered.filter(document => document.docType === this.selectedDocType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'type':
          return (a.docType || '').localeCompare(b.docType || '');
        default:
          return 0;
      }
    });

    this.filteredDocuments = filtered;
  }

  getDocTypeIcon(docType: string | undefined): string {
    switch (docType) {
      case 'PAN':
        return 'card-outline';
      case 'Aadhar':
        return 'id-card-outline';
      case 'GST':
        return 'document-text-outline';
      case 'Incorporation':
        return 'business-outline';
      case 'BankStatement':
        return 'cash-outline';
      case 'AddressProof':
        return 'home-outline';
      default:
        return 'document-outline';
    }
  }

  getDocTypeBadgeClass(docType: string | undefined): string {
    switch (docType) {
      case 'PAN':
        return 'bg-purple-100 text-purple-800';
      case 'Aadhar':
        return 'bg-blue-100 text-blue-800';
      case 'GST':
        return 'bg-green-100 text-green-800';
      case 'Incorporation':
        return 'bg-orange-100 text-orange-800';
      case 'BankStatement':
        return 'bg-red-100 text-red-800';
      case 'AddressProof':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'document-text-outline';
      case 'doc':
      case 'docx':
        return 'document-outline';
      case 'xls':
      case 'xlsx':
        return 'document-attach-outline';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image-outline';
      default:
        return 'document-outline';
    }
  }

  getFileTypeColor(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'bg-red-100 text-red-600';
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-600';
      case 'xls':
      case 'xlsx':
        return 'bg-green-100 text-green-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadDocument(document: Document) {
    // Implementation for document download
    console.log('Downloading document:', document);
    // This would typically call a service method to download the file
    window.open(document.fileUrl, '_blank');
  }

  deleteDocument(document: Document) {
    if (confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
      this.clientUserService.deleteDocument(document.id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadDocuments();
          }
        },
        error: (error) => console.error('Error deleting document:', error)
      });
    }
  }

  getDocTypeCount(docType: string): number {
    return this.documents.filter(doc => doc.docType === docType).length;
  }

  getTotalSize(): string {
    // Mock total size calculation - in real app, this would come from API
    const totalBytes = this.documents.length * 1024 * 1024; // Mock 1MB per file
    return this.formatFileSize(totalBytes);
  }
}
