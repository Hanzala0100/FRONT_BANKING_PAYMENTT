import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankUserService } from '../../../core/services/bank-user.service';
import { Client } from '../../../shared/models/Client.interface';

@Component({
  selector: 'app-bank-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bank-user-dashboard.component.html'
})
export class BankUserDashboardComponent implements OnInit {
  dashboardStats = {
    totalClients: 0,
    pendingVerifications: 0,
    totalPayments: 0,
    pendingPayments: 0
  };

  recentClients: Client[] = [];
  isLoading = true;

  constructor(private bankUserService: BankUserService) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load clients for stats
    this.bankUserService.getAllClients().subscribe({
      next: (response) => {
        if (response.success) {
          const clients = response.data;
          this.dashboardStats.totalClients = clients.length;
          this.dashboardStats.pendingVerifications = clients.filter(c => c.verificationStatus === 'Pending').length;

          // Get recent clients (last 5)
          this.recentClients = clients.slice(0, 5);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });

    // Load payments stats
    this.bankUserService.getPendingPayments().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardStats.pendingPayments = response.data.length;
        }
      },
      error: (error) => console.error('Error loading payments:', error)
    });
  }

  getClientInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
