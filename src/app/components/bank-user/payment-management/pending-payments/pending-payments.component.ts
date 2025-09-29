import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Payment, PaymentApprovalRequest } from '../../../../shared/models/Payment.inteface';

@Component({
  selector: 'app-pending-payments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './pending-payments.component.html'
})
export class PendingPaymentsComponent implements OnInit {
  pendingPayments: Payment[] = [];
  isLoading = true;

  constructor(private bankUserService: BankUserService) { }

  ngOnInit() {
    this.loadPendingPayments();
  }

  loadPendingPayments() {
    this.isLoading = true;
    this.bankUserService.getPendingPayments().subscribe({
      next: (response) => {
        if (response.success) {
          this.pendingPayments = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending payments:', error);
        this.isLoading = false;
      }
    });
  }

  quickApprove(payment: Payment) {
    if (confirm(`Approve payment of ₹${payment.amount} to ${payment.beneficiaryName}?`)) {
      const approvalRequest: PaymentApprovalRequest = {
        notes: 'Approved via quick action'
      };

      this.bankUserService.approvePayment(payment.paymentId, approvalRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPendingPayments();
          }
        },
        error: (error) => console.error('Error approving payment:', error)
      });
    }
  }

  quickReject(payment: Payment) {
    if (confirm(`Reject payment of ₹${payment.amount} to ${payment.beneficiaryName}?`)) {
      const rejectionRequest: PaymentApprovalRequest = {
        notes: 'Rejected via quick action'
      };

      this.bankUserService.rejectPayment(payment.paymentId, rejectionRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPendingPayments();
          }
        },
        error: (error) => console.error('Error rejecting payment:', error)
      });
    }
  }

  getUniqueClientsCount(): number {
    const clientIds = new Set(this.pendingPayments.map(p => p.clientId));
    return clientIds.size;
  }

  getTotalAmount(): number {
    return this.pendingPayments.reduce((total, payment) => total + payment.amount, 0);
  }
}
