import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientUserService } from '../../../core/services/client-user.service';
import { UserStateService } from '../../../core/services/user-state.service';

@Component({
  selector: 'app-client-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './client-user-dashboard.component.html'
})
export class ClientUserDashboardComponent implements OnInit {
  dashboardStats = {
    totalEmployees: 0,
    totalBeneficiaries: 0,
    totalPayments: 0,
    pendingPayments: 0,
    totalSalaryDisbursements: 0,
    pendingSalary: 0
  };

  recentActivities: any[] = [];
  isLoading = true;

  constructor(
    private clientUserService: ClientUserService,
    private userStateService: UserStateService
  ) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load employees count
    this.clientUserService.getAllEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardStats.totalEmployees = response.data.length;
        }
      },
      error: (error) => console.error('Error loading employees:', error)
    });

    // Load beneficiaries count
    this.clientUserService.getBeneficiaries().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardStats.totalBeneficiaries = response.data.length;
        }
      },
      error: (error) => console.error('Error loading beneficiaries:', error)
    });

    // Load payments data
    this.clientUserService.getPayments().subscribe({
      next: (response) => {
        if (response.success) {
          const payments = response.data;
          this.dashboardStats.totalPayments = payments.length;
          this.dashboardStats.pendingPayments = payments.filter(p => p.status === 'Pending').length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.isLoading = false;
      }
    });

    // Load salary disbursements
    this.clientUserService.getSalaryDisbursements().subscribe({
      next: (response) => {
        if (response.success) {
          const salaries = response.data;
          this.dashboardStats.totalSalaryDisbursements = salaries.length;
          this.dashboardStats.pendingSalary = salaries.filter(s => s.status === 'Pending').length;
        }
      },
      error: (error) => console.error('Error loading salary disbursements:', error)
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Rejected':
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}