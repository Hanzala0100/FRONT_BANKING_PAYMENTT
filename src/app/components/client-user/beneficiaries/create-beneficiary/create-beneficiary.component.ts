import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { BeneficiaryCreateRequest } from '../../../../shared/models/Beneficiary.interface';

@Component({
  selector: 'app-create-beneficiary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './create-beneficiary.component.html'
})
export class CreateBeneficiaryComponent implements OnInit {
  beneficiaryForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private router: Router
  ) {
    this.beneficiaryForm = this.createForm();
  }

  ngOnInit(): void { }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      bankName: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.beneficiaryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const beneficiaryData: BeneficiaryCreateRequest = {
      clientId: 0, // Will be set from current user context
      fullName: this.beneficiaryForm.value.fullName.trim(),
      accountNumber: parseInt(this.beneficiaryForm.value.accountNumber),
      bankName: this.beneficiaryForm.value.bankName.trim(),
      ifsccode: this.beneficiaryForm.value.ifscCode.trim().toUpperCase()
    };

    this.clientUserService.createBeneficiary(beneficiaryData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Beneficiary created successfully!';
          this.beneficiaryForm.reset();
          setTimeout(() => {
            this.router.navigate(['/client-user/beneficiaries']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to create beneficiary';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating beneficiary:', error);
        this.errorMessage = 'An error occurred while creating beneficiary';
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.beneficiaryForm.controls).forEach(key => {
      const control = this.beneficiaryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.beneficiaryForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }
}
