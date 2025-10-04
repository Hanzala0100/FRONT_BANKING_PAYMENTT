import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { PaymentCreateRequest } from '../../../../shared/models/Payment.inteface';
import { Beneficiary } from '../../../../shared/models/Beneficiary.interface';
import { UserStateService } from '../../../../core/services/user-state.service';

@Component({
  selector: 'app-create-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './create-payment.component.html'
})
export class CreatePaymentComponent implements OnInit {
  paymentForm: FormGroup;
  beneficiaries: Beneficiary[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private userStateService: UserStateService,

    private router: Router
  ) {
    this.paymentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  createForm(): FormGroup {
    return this.fb.group({
      beneficiaryId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      paymentDate: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  loadBeneficiaries(): void {
    this.isLoading = true;
    this.clientUserService.getBeneficiaries().subscribe({
      next: (response) => {
        if (response.success) {
          this.beneficiaries = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading beneficiaries:', error);
        this.errorMessage = 'Failed to load beneficiaries';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const paymentData: PaymentCreateRequest = {
      clientId: this.currentUser?.clientId,
      beneficiaryId: parseInt(this.paymentForm.value.beneficiaryId),
      amount: parseFloat(this.paymentForm.value.amount),
      paymentDate: this.paymentForm.value.paymentDate
    };

    this.clientUserService.createPayment(paymentData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'Payment initiated successfully! It will be processed after bank approval.';
          this.paymentForm.reset();
          setTimeout(() => {
            this.router.navigate(['/client-user/payments']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to create payment';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating payment:', error);
        this.errorMessage = 'An error occurred while creating payment';
      }
    });
  }

  getSelectedBeneficiary() {
    const beneficiaryId = this.paymentForm.get('beneficiaryId')?.value;
    return this.beneficiaries.find(b => b.beneficiaryId === parseInt(beneficiaryId));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.paymentForm.controls).forEach(key => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.paymentForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }
}
