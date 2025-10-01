import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Payment } from '../../../../shared/models/Payment.inteface';
import { Client } from '../../../../shared/models/Client.interface';
import { UserStateService } from '../../../../core/services/user-state.service';


@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payment-history.component.html'
})
export class PaymentHistoryComponent implements OnInit {
  allPayments: Payment[] = [];
  filteredPayments: Payment[] = [];
  clients: Client[] = [];
  isLoading = true;

  // Filters
  selectedStatus = '';
  selectedClientId = '';
  startDate = '';
  endDate = '';
  currentUser: any;
  constructor(
    private bankUserService: BankUserService,
    private userStateService: UserStateService,

  ) { }

  ngOnInit() {
    this.currentUser = this.userStateService.currentUser;
    this.loadPayments();
    this.loadClients();
  }

  loadPayments() {
    this.isLoading = true;
    console.log(this.currentUser);
    this.bankUserService.getAllPayments(this.currentUser.bankId).subscribe({
      next: (response) => {
        if (response.success) {
          this.allPayments = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });
  }

  loadClients() {
    this.bankUserService.getAllClients().subscribe({
      next: (response) => {
        if (response.success) {
          this.clients = response.data;
        }
      },
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  applyFilters() {
    let filtered = [...this.allPayments];

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(payment => payment.status === this.selectedStatus);
    }

    // Client filter
    if (this.selectedClientId) {
      filtered = filtered.filter(payment => payment.clientId === +this.selectedClientId);
    }

    // Date range filter
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(payment => new Date(payment.paymentDate) >= start);
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(payment => new Date(payment.paymentDate) <= end);
    }

    this.filteredPayments = filtered;
  }

  getStatusBadgeClass(status: string): string {
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

  getApprovedCount(): number {
    return this.allPayments.filter(p => p.status === 'Approved' || p.status === 'Completed').length;
  }

  getPendingCount(): number {
    return this.allPayments.filter(p => p.status === 'Pending').length;
  }

  getRejectedCount(): number {
    return this.allPayments.filter(p => p.status === 'Rejected').length;
  }
}
