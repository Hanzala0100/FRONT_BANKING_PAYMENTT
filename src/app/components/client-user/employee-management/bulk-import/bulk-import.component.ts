import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';

@Component({
  selector: 'app-bulk-import',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bulk-import.component.html'
})
export class BulkImportComponent {
  selectedFile: File | null = null;
  isDragging = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private clientUserService: ClientUserService,
    private router: Router
  ) { }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File): void {
    // Validate file type
    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      this.errorMessage = 'Please select a CSV file';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File size should be less than 10MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file to upload';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.clientUserService.bulkImportEmployees(this.selectedFile).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = `Bulk import completed! ${response.data.successful} successful, ${response.data.failed} failed.`;
          this.selectedFile = null;
          setTimeout(() => {
            this.router.navigate(['/client-user/employees']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to process bulk import';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error in bulk import:', error);
        this.errorMessage = 'An error occurred while processing the file';
      }
    });
  }

  downloadTemplate(): void {
    const template = `FullName,userName,PhoneNumber,Email,AccountNumber,BankName,Ifsccode,SalaryAmount
John Doe,john.doe,9876543210,john@company.com,12345678901,State Bank of India,SBIN0000123,50000
Jane Smith,jane.smith,9876543211,jane@company.com,12345678902,HDFC Bank,HDFC0000123,60000`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getFileIcon(): string {
    return 'document-outline';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
