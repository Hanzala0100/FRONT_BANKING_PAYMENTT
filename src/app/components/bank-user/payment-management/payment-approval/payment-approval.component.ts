import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Payment, PaymentApprovalRequest } from '../../../../shared/models/Payment.inteface';


@Component({
  selector: 'app-payment-approval',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payment-approval.component.html'
})
export class PaymentApprovalComponent implements OnInit {
  paymentId!: number;
  payment: Payment | null = null;
  isLoading = true;
  isSubmitting = false;

  approvalForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bankUserService: BankUserService,
    private fb: FormBuilder
  ) {
    this.approvalForm = this.createApprovalForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.paymentId = +params['id'];
      if (this.paymentId) {
        this.loadPaymentDetails();
      }
    });
  }

  createApprovalForm(): FormGroup {
    return this.fb.group({
      decision: ['', Validators.required],
      notes: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadPaymentDetails() {
    this.isLoading = true;
    this.bankUserService.getPaymentById(this.paymentId).subscribe({
      next: (response) => {
        if (response.success) {
          this.payment = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payment details:', error);
        this.errorMessage = 'Failed to load payment details';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.approvalForm.invalid || !this.payment) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const approvalRequest: PaymentApprovalRequest = {
      notes: this.approvalForm.value.notes
    };

    const decision = this.approvalForm.value.decision;

    if (decision === 'approve') {
      this.approvePayment(approvalRequest);
    } else {
      this.rejectPayment(approvalRequest);
    }
  }

  approvePayment(approvalRequest: PaymentApprovalRequest) {
    this.bankUserService.approvePayment(this.paymentId, approvalRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'Payment approved successfully!';
          this.payment = response.data;
          setTimeout(() => {
            this.router.navigate(['/bank-user/payments/pending']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to approve payment';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error approving payment:', error);
        this.errorMessage = 'An error occurred while approving payment';
      }
    });
  }

  rejectPayment(approvalRequest: PaymentApprovalRequest) {
    this.bankUserService.rejectPayment(this.paymentId, approvalRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'Payment rejected successfully!';
          this.payment = response.data;
          setTimeout(() => {
            this.router.navigate(['/bank-user/payments/pending']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to reject payment';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error rejecting payment:', error);
        this.errorMessage = 'An error occurred while rejecting payment';
      }
    });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.approvalForm.controls).forEach(key => {
      const control = this.approvalForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
