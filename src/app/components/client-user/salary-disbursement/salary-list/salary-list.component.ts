import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { SalaryDisbursement } from '../../../../shared/models/Salary.interface';

@Component({
  selector: 'app-salary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './salary-list.component.html'
})
export class SalaryListComponent implements OnInit {
  salaries: SalaryDisbursement[] = [];
  filteredSalaries: SalaryDisbursement[] = [];
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
    { value: 'Processing', label: 'Processing' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Failed', label: 'Failed' }
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
    this.loadSalaries();
  }

  loadSalaries() {
    this.isLoading = true;
    this.clientUserService.getSalaryDisbursements().subscribe({
      next: (response) => {
        if (response.success) {
          this.salaries = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading salaries:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.salaries];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(salary =>
        salary.employeeName.toLowerCase().includes(search) ||
        salary.employeeAccountNumber.toString().includes(search) ||
        salary.clientName.toLowerCase().includes(search) ||
        salary.salaryId.toString().includes(search)
      );
    }

    // Status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(salary => salary.status === this.selectedStatus);
    }

    // Date range filter
    if (this.selectedDateRange && this.selectedDateRange !== 'custom') {
      const dateRange = this.calculateDateRange(this.selectedDateRange);
      filtered = filtered.filter(salary => {
        const salaryDate = new Date(salary.disbursementDate);
        return salaryDate >= dateRange.startDate && salaryDate <= dateRange.endDate;
      });
    }

    // Custom date range
    if (this.selectedDateRange === 'custom' && this.startDate && this.endDate) {
      const startDate = new Date(this.startDate);
      const endDate = new Date(this.endDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(salary => {
        const salaryDate = new Date(salary.disbursementDate);
        return salaryDate >= startDate && salaryDate <= endDate;
      });
    }

    // Sort by latest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    this.filteredSalaries = filtered;
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Completed':
        return 'checkmark-circle-outline';
      case 'Processing':
        return 'sync-outline';
      case 'Pending':
        return 'time-outline';
      case 'Failed':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  }

  formatSalary(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getTotalAmount(): number {
    return this.filteredSalaries.reduce((total, salary) => total + salary.amount, 0);
  }

  getStatusCount(status: string): number {
    return this.salaries.filter(salary => salary.status === status).length;
  }

  getRecentSalariesCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.salaries.filter(salary => new Date(salary.createdAt) >= oneWeekAgo).length;
  }

  processSalary(salaryId: number) {
    if (confirm('Are you sure you want to process this salary disbursement?')) {
      this.clientUserService.processSalaryDisbursement(salaryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSalaries();
          }
        },
        error: (error) => console.error('Error processing salary:', error)
      });
    }
  }
}
