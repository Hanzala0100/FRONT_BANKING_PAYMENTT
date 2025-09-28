// components/super-admin/bank-management/create-bank/create-bank.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { BankCreateRequest } from '../../../../shared/models/Bank.interface';

@Component({
  selector: 'app-create-bank',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './create-bank.component.html',
  styleUrls: ['./create-bank.component.css']
})
export class CreateBankComponent implements OnInit {
  bankForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private superAdminService: SuperAdminService,
    private router: Router
  ) {
    this.bankForm = this.createForm();
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // Bank Information
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],

      // Contact Information
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]{10,15}$/)]],

      // Administrator Information
      adminUsername: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      adminFullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('adminPassword');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep = Math.min(this.currentStep + 1, this.totalSteps);
    } else {
      this.markStepFieldsAsTouched(this.currentStep);
    }
  }

  previousStep(): void {
    this.currentStep = Math.max(this.currentStep - 1, 1);
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1: // Bank Information
        return !!(
          this.bankForm.get('name')?.valid &&
          this.bankForm.get('address')?.valid
        );

      case 2: // Contact Information
        return !!(
          this.bankForm.get('contactEmail')?.valid &&
          this.bankForm.get('contactPhone')?.valid
        );

      case 3: // Administrator Information
        return !!(
          this.bankForm.get('adminUsername')?.valid &&
          this.bankForm.get('adminFullName')?.valid &&
          this.bankForm.get('adminEmail')?.valid &&
          this.bankForm.get('adminPassword')?.valid &&
          this.bankForm.get('confirmPassword')?.valid
        );

      default:
        return false;
    }
  }


  markStepFieldsAsTouched(step: number): void {
    const fieldsToTouch: string[] = [];

    switch (step) {
      case 1:
        fieldsToTouch.push('name', 'address');
        break;
      case 2:
        fieldsToTouch.push('contactEmail', 'contactPhone');
        break;
      case 3:
        fieldsToTouch.push('adminUsername', 'adminFullName', 'adminEmail', 'adminPassword', 'confirmPassword');
        break;
    }

    fieldsToTouch.forEach(field => {
      this.bankForm.get(field)?.markAsTouched();
    });
  }

  getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Bank Information';
      case 2: return 'Contact Details';
      case 3: return 'Administrator Setup';
      default: return '';
    }
  }

  getStepDescription(step: number): string {
    switch (step) {
      case 1: return 'Enter basic bank information';
      case 2: return 'Provide contact information';
      case 3: return 'Create administrator account';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.bankForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData: BankCreateRequest = {
      bankName: this.bankForm.get('name')?.value?.trim(),
      address: this.bankForm.get('address')?.value?.trim(),
      contactEmail: this.bankForm.get('contactEmail')?.value?.trim(),
      contactPhone: this.bankForm.get('contactPhone')?.value?.trim(),
      adminUsername: this.bankForm.get('adminUsername')?.value?.trim(),
      adminFullName: this.bankForm.get('adminFullName')?.value?.trim(),
      adminEmail: this.bankForm.get('adminEmail')?.value?.trim(),
      adminPassword: this.bankForm.get('adminPassword')?.value
    };

    this.superAdminService.createBank(formData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = 'Bank created successfully! Redirecting...';
          this.bankForm.reset();

          // Redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/super-admin/banks']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to create bank. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating bank:', error);

        if (error.status === 400) {
          this.errorMessage = 'Invalid data. Please check the form and try again.';
        } else if (error.status === 409) {
          this.errorMessage = 'A bank with this name or email already exists.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bankForm.controls).forEach(key => {
      const control = this.bankForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  hasError(controlName: string, errorType: string): boolean {
    const control = this.bankForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.bankForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.bankForm.get(controlName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(controlName)} is required`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(controlName)} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['pattern']) {
        if (controlName === 'adminUsername') {
          return 'Username can only contain letters, numbers, and underscores';
        }
        if (controlName === 'contactPhone') {
          return 'Please enter a valid phone number';
        }
      }
      if (control.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Bank name',
      address: 'Address',
      contactEmail: 'Contact email',
      contactPhone: 'Contact phone',
      adminUsername: 'Admin username',
      adminFullName: 'Admin full name',
      adminEmail: 'Admin email',
      adminPassword: 'Password',
      confirmPassword: 'Confirm password'
    };
    return labels[controlName] || controlName;
  }
}
