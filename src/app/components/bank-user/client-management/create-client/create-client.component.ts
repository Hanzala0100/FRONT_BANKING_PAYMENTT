// components/bank-user/client-management/create-client/create-client.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { UserStateService } from '../../../../core/services/user-state.service';
import { ClientCreateRequest } from '../../../../shared/models/Client.interface';

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
  `]
})
export class CreateClientComponent implements OnInit {
  clientForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;

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
      bankId: [0]
    });
  }

  private initializeForm(): void {
    // Get current user info
    this.currentUser = this.userStateService.currentUser;

    if (this.currentUser) {
      this.clientForm.patchValue({
        bankName: this.currentUser.bankName || 'Your Bank',
        bankId: this.currentUser.bankId
      });
    }
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData: ClientCreateRequest = {
      clientName: this.clientForm.get('clientName')?.value?.trim(),
      registerationNumber: this.clientForm.get('registerationNumber')?.value?.trim(),
      address: this.clientForm.get('address')?.value?.trim(),
      bankId: this.currentUser?.bankId || 0,
      bankName: this.currentUser?.bankName || 'Your Bank'
    };

    this.bankUserService.createClient(formData).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success) {
          this.successMessage = 'Client created successfully! Redirecting...';
          this.clientForm.reset();

          // Redirect after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/bank-user/clients']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to create client. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating client:', error);

        if (error.status === 400) {
          this.errorMessage = 'Invalid data. Please check the form and try again.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please log in again.';
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          this.errorMessage = 'You do not have permission to create clients.';
        } else {
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  hasError(controlName: string, errorType: string): boolean {
    const control = this.clientForm.get(controlName);
    return control ? control.hasError(errorType) && control.touched : false;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.clientForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
}
