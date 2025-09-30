import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Payment } from '../../../../shared/models/Payment.inteface';
import { ClientUserService } from '../../../../core/services/client-user.service';


@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './payment-list.component.html'
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  selectedStatus = '';
  selectedDateRange = '';
  startDate = '';
  endDate = '';

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Completed', label: 'Completed' }
  ];

  dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  constructor(private clientUserService: ClientUserService) { }

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.clientUserService.getPayments().subscribe({
      next: (response) => {
        if (response.success) {
          this.payments = response.data;
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

  applyFilters() {
    let filtered = [...this.payments];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.beneficiaryName.toLowerCase().includes(search) ||
        payment.beneficiaryAccountNumber.toString().includes(search) ||
        payment.clientName.toLowerCase().includes(search) ||
        payment.paymentId.toString().includes(search)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(payment => payment.status === this.selectedStatus);
    }

    // Date range filter
    if (this.selectedDateRange && this.selectedDateRange !== 'custom') {
      const dateRange = this.calculateDateRange(this.selectedDateRange);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= dateRange.startDate && paymentDate <= dateRange.endDate;
      });
    }

    // Custom date range
    if (this.selectedDateRange === 'custom' && this.startDate && this.endDate) {
      const startDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredPayments = filtered;
  }

  calculateDateRange(range: string): { startDate: Date; endDate: Date } {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_week':
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_week':
        startDate.setDate(today.getDate() - today.getDay() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - today.getDay() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_month':
        startDate.setMonth(today.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  }

  deletePayment(payment: Payment) {
    if (confirm(`Are you sure you want to delete payment #${payment.paymentId} to ${payment.beneficiaryName}?`)) {
      this.clientUserService.deletePayment(payment.paymentId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPayments();
          }
        },
        error: (error) => console.error('Error deleting payment:', error)
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'checkmark-circle-outline';
      case 'Pending':
        return 'time-outline';
      case 'Rejected':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  }

  formatAmount(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getTotalAmount(): number {
    return this.filteredPayments.reduce((total, payment) => total + payment.amount, 0);
  }

  getStatusCount(status: string): number {
    return this.payments.filter(payment => payment.status === status).length;
  }

  getRecentPaymentsCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.payments.filter(payment => new Date(payment.createdAt) >= oneWeekAgo).length;
  }
}
