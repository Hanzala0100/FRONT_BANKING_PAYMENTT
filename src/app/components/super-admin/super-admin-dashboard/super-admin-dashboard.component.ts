// components/super-admin/super-admin-dashboard/super-admin-dashboard.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { Bank } from '../../../shared/models/Bank.interface';
import { User } from '../../../shared/models/User.interface';

interface DashboardStats {
  totalBanks: number;
  totalClients: number;
  totalUsers: number;
  totalPayments: number;
  recentBanks: Bank[];
  systemHealth: {
    status: string;
    uptime: string;
    lastBackup: string;
  };
}

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.css']
})
export class SuperAdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  lastUpdated = new Date();
  dashboardStats: DashboardStats = {
    totalBanks: 0,
    totalClients: 0,
    totalUsers: 0,
    totalPayments: 0,
    recentBanks: [],
    systemHealth: {
      status: 'Healthy',
      uptime: '99.9%',
      lastBackup: new Date().toISOString()
    }
  };

  quickActions = [
    {
      title: 'Add New Bank',
      description: 'Onboard a new banking partner',
      icon: 'add-circle-outline',
      route: '/super-admin/banks/create',
      color: 'blue'
    },
    {
      title: 'View All Banks',
      description: 'Manage existing banking partners',
      icon: 'business-outline',
      route: '/super-admin/banks',
      color: 'green'
    },
    {
      title: 'Generate Reports',
      description: 'Create system-wide reports',
      icon: 'document-text-outline',
      route: '/super-admin/reports',
      color: 'purple'
    }
    
    // ,
    // {
    //   title: 'System Logs',
    //   description: 'Monitor system activities',
    //   icon: 'list-outline',
    //   route: '/super-admin/system-logs',
    //   color: 'orange'
    // }
  ];

  recentActivities = [
    {
      type: 'bank_created',
      title: 'New Bank Added',
      description: 'State Bank of India was successfully onboarded',
      timestamp: new Date().toISOString(),
      icon: 'business-outline'
    },
    {
      type: 'system_backup',
      title: 'System Backup Completed',
      description: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: 'cloud-done-outline'
    },
    {
      type: 'report_generated',
      title: 'Monthly Report Generated',
      description: 'System performance report for current month',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: 'document-text-outline'
    }
  ];

  constructor(
    private superAdminService: SuperAdminService,
    private userStateService: UserStateService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.userStateService.currentUser;
    this.loadDashboardData();
  }
  getBankInitials(name: string): string {
    return name?.split(' ')?.map(word => word[0])?.join('')?.toUpperCase()?.substring(0, 2);
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load banks data
    this.superAdminService.getAllBanks().subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardStats.totalBanks = response.data.length;
          this.dashboardStats.recentBanks = response.data
            .sort((a, b) => b.bankId - a.bankId)
            .slice(0, 5);

          // Calculate totals from banks
          this.dashboardStats.totalClients = response.data
            .reduce((sum, bank) => sum + bank.totalClients, 0);
          this.dashboardStats.totalUsers = response.data
            .reduce((sum, bank) => sum + bank.totalUsers, 0);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });

    this.dashboardStats.totalPayments = 125430;
  }

  getQuickActionColorClass(color: string): string {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700';
      case 'green':
        return 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700';
      case 'purple':
        return 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700';
      case 'orange':
        return 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700';
      default:
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700';
    }
  }

  getSystemHealthClass(): string {
    switch (this.dashboardStats.systemHealth.status) {
      case 'Healthy':
        return 'text-green-600 bg-green-100';
      case 'Warning':
        return 'text-orange-600 bg-orange-100';
      case 'Critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'bank_created':
        return 'business-outline';
      case 'system_backup':
        return 'cloud-done-outline';
      case 'report_generated':
        return 'document-text-outline';
      case 'user_created':
        return 'person-add-outline';
      default:
        return 'information-circle-outline';
    }
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
