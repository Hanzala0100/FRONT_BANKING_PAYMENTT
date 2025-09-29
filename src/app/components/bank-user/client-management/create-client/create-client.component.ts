import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { UserStateService } from '../../../../core/services/user-state.service';
import { ClientCreateRequest } from '../../../../shared/models/Client.interface';
import { Document } from '../../../../shared/models/Document.interface';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './create-client.component.html',
  styles: [`
    :host {
      display: block;
    }
    .file-upload {
      border: 2px dashed #d1d5db;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
    }
    .file-upload.dragover {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
  `]
})
export class CreateClientComponent implements OnInit {
  clientForm: FormGroup;
  isLoading = false;
  isUploadingDocuments = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;
  selectedFiles: File[] = [];
  isDragging = false;
  createdClientId: number | null = null;

  // Document types for dropdown
  documentTypes = [
    'Registration Certificate',
    'PAN Card',
    'GST Certificate',
    'Address Proof',
    'Bank Statement',
    'Company PAN',
    'Incorporation Certificate',
    'Board Resolution',
    'Other'
  ];
  selectedDocType = 'Registration Certificate';

  constructor(
    private fb: FormBuilder,
    private bankUserService: BankUserService,
    private userStateService: UserStateService,
    private router: Router
  ) {
    this.clientForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      registerationNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      bankName: [{ value: '', disabled: true }],
      bankId: [0],
      documentType: ['Registration Certificate']
    });
  }

  private initializeForm(): void {
    this.currentUser = this.userStateService.currentUser;

    if (this.currentUser) {
      this.clientForm.patchValue({
        bankName: this.currentUser.bankName || 'Your Bank',
        bankId: this.currentUser.bankId
      });
    }
  }

  // File handling methods
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.addFiles(files);
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
    if (files) {
      this.addFiles(files);
    }
  }

  addFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = `File ${file.name} is too large. Maximum size is 10MB.`;
        continue;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = `File ${file.name} is not a supported format. Please upload PDF, JPEG, PNG, or Word documents.`;
        continue;
      }

      // Add file if not already selected
      if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return 'document-text-outline';
    if (fileType.includes('image')) return 'image-outline';
    if (fileType.includes('word')) return 'document-outline';
    return 'document-attach-outline';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async onSubmit(): Promise<void> {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Step 1: Create the client
      const clientData: ClientCreateRequest = {
        clientName: this.clientForm.get('name')?.value?.trim(),
        registerationNumber: this.clientForm.get('registerationNumber')?.value?.trim(),
        address: this.clientForm.get('address')?.value?.trim(),
        bankId: this.currentUser?.bankId || 0,
        bankName: this.currentUser?.bankName || 'Your Bank'
      };

      const clientResponse = await this.bankUserService.createClient(clientData).toPromise();

      if (clientResponse && clientResponse.success) {
        this.createdClientId = clientResponse.data.clientId;
        this.successMessage = 'Client created successfully!';

        // Step 2: Upload documents if any files are selected
        if (this.selectedFiles.length > 0) {
          this.isUploadingDocuments = true;
          await this.uploadDocuments(this.createdClientId);
          this.isUploadingDocuments = false;
          this.successMessage += ' Documents uploaded successfully!';
        } else {
          this.successMessage += ' No documents to upload.';
        }

        // Reset form and redirect
        this.clientForm.reset();
        this.selectedFiles = [];

        setTimeout(() => {
          this.router.navigate(['/bank-user/clients']);
        }, 2000);

      } else {
        this.errorMessage = clientResponse?.message || 'Failed to create client. Please try again.';
      }

    } catch (error: any) {
      console.error('Error creating client:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
      this.isUploadingDocuments = false;
    }
  }

  private async uploadDocuments(clientId: number): Promise<void> {
    const uploadPromises = this.selectedFiles.map(async (file, index) => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', this.clientForm.get('documentType')?.value || 'Registration Certificate');

        const response = await this.bankUserService.uploadClientDocument(clientId, formData).toPromise();

        if (response && !response.success) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return { success: true, fileName: file.name };
      } catch (error) {
        return { success: false, fileName: file.name, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    const failedUploads = results.filter(result => !result.success);

    if (failedUploads.length > 0) {
      console.warn('Some documents failed to upload:', failedUploads);
    }
  }

  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Invalid data. Please check the form and try again.';
    } else if (error.status === 401) {
      this.router.navigate(['/login']);
      return 'Session expired. Please log in again.';
    } else if (error.status === 403) {
      return 'You do not have permission to create clients.';
    } else {
      return 'An unexpected error occurred. Please try again later.';
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(controlName: string, errorType: string): boolean {
    const control = this.clientForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.clientForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}
