import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { FileUploadHelper } from '../../../../shared/helpers/file-upload.helper';

@Component({
  selector: 'app-upload-document',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './upload-document.component.html'
})
export class UploadDocumentComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isDragging = false;
  isUploading = false;
  errorMessage = '';
  successMessage = '';
  uploadProgress = 0;

  docTypeOptions = [
    { value: 'PAN', label: 'PAN Card', icon: 'card-outline' },
    { value: 'Aadhar', label: 'Aadhar Card', icon: 'id-card-outline' },
    { value: 'GST', label: 'GST Certificate', icon: 'document-text-outline' },
    { value: 'Incorporation', label: 'Incorporation Certificate', icon: 'business-outline' },
    { value: 'BankStatement', label: 'Bank Statement', icon: 'cash-outline' },
    { value: 'AddressProof', label: 'Address Proof', icon: 'home-outline' },
    { value: 'Other', label: 'Other Document', icon: 'document-outline' }
  ];

  supportedFormats = [
    'PDF (.pdf)',
    'Word Document (.doc, .docx)',
    'Excel (.xls, .xlsx)',
    'Images (.jpg, .jpeg, .png, .gif)'
  ];

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private router: Router
  ) {
    this.uploadForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      docType: ['', [Validators.required]],
      description: ['']
    });
  }

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
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|jpg|jpeg|png|gif)$/i)) {
      this.errorMessage = 'Please select a valid file type (PDF, Word, Excel, or Image)';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'File size should be less than 10MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    // Auto-detect document type from filename if not set
    if (!this.uploadForm.get('docType')?.value) {
      this.autoDetectDocType(file.name);
    }
  }

  autoDetectDocType(fileName: string): void {
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('pan')) {
      this.uploadForm.patchValue({ docType: 'PAN' });
    } else if (lowerName.includes('aadhar') || lowerName.includes('aadhaar')) {
      this.uploadForm.patchValue({ docType: 'Aadhar' });
    } else if (lowerName.includes('gst')) {
      this.uploadForm.patchValue({ docType: 'GST' });
    } else if (lowerName.includes('incorporation') || lowerName.includes('certificate')) {
      this.uploadForm.patchValue({ docType: 'Incorporation' });
    } else if (lowerName.includes('bank') || lowerName.includes('statement')) {
      this.uploadForm.patchValue({ docType: 'BankStatement' });
    } else if (lowerName.includes('address') || lowerName.includes('proof')) {
      this.uploadForm.patchValue({ docType: 'AddressProof' });
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.uploadProgress = 0;
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.markFormGroupTouched();
      if (!this.selectedFile) {
        this.errorMessage = 'Please select a file to upload';
      }
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.uploadProgress = 0;

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 200);

    const formData = FileUploadHelper.createDocumentFormData(
      this.selectedFile,
      this.uploadForm.value.docType
    );

    if (this.uploadForm.value.description) {
      formData.append('description', this.uploadForm.value.description);
    }

    this.clientUserService.uploadDocument(formData).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        this.isUploading = false;

        if (response.success) {
          this.successMessage = 'Document uploaded successfully!';
          this.uploadForm.reset();
          this.selectedFile = null;
          setTimeout(() => {
            this.router.navigate(['/client-user/documents']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to upload document';
        }
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        console.error('Error uploading document:', error);
        this.errorMessage = 'An error occurred while uploading the document';
      }
    });
  }

  getFileIcon(): string {
    if (!this.selectedFile) return 'document-outline';

    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase();
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getSelectedDocTypeIcon(): string {
    const docType = this.uploadForm.get('docType')?.value;
    const option = this.docTypeOptions.find(opt => opt.value === docType);
    return option ? option.icon : 'document-outline';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.uploadForm.controls).forEach(key => {
      const control = this.uploadForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.uploadForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }
}
