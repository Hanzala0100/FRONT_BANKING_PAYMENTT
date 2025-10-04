import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStateService } from '../../../core/services/user-state.service';
import { User } from '../../../shared/models/User.interface';
import { ClientUserService } from '../../../core/services/client-user.service';
import { Client } from '../../../shared/models/Client.interface';
import { VerificationStatus } from '../../../shared/enums/Verification-status.enum';
interface MenuItem {
  name: string;
  route: string;
  icon: string;
  active?: boolean;
  badge?: string;
  isExpanded?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-client-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './client-user-layout.component.html',
  styleUrls: ['./client-user-layout.component.css']
})
export class ClientUserLayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentClient: Client | null = null;
  currentRoute = '';
  isSidebarOpen = false;
  isLoading = true;

  navigationItems: any[] = [];

  constructor(
    private userStateService: UserStateService,
    private clientUserService: ClientUserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.userStateService.currentUser;

    if (this.currentUser?.clientId) {
      this.loadClientData();
    } else {
      this.isLoading = false;
    }

    // Subscribe to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        this.updateActiveNavigation();
      });

    // Initialize active navigation
    this.updateActiveNavigation();
  }

  loadClientData(): void {
    if (!this.currentUser?.clientId) return;

    this.clientUserService.getClientById(this.currentUser.clientId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentClient = response.data;
          this.initializeNavigationItems();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client data:', error);
        this.isLoading = false;
      }
    });
  }

  initializeNavigationItems(): void {
    const isVerified = this.currentClient?.verificationStatus === VerificationStatus.Verified;

    this.navigationItems = [
      {
        name: 'Dashboard',
        route: '/client-user/dashboard',
        icon: 'grid-outline',
        active: false,
        enabled: isVerified
      },
      {
        name: 'Employee Mgmt',
        route: '/client-user/employees',
        icon: 'people-circle-outline',
        active: false,
        isExpanded: false,
        enabled: isVerified,
        children: [
          { name: 'All Employees', route: '/client-user/employees', icon: 'list-outline', active: false, enabled: isVerified },
          { name: 'Add Employee', route: '/client-user/employees/create', icon: 'person-add-outline', active: false, enabled: isVerified },
          { name: 'Bulk Import', route: '/client-user/employees/import', icon: 'cloud-upload-outline', active: false, enabled: isVerified }
        ]
      },
      {
        name: 'Beneficiaries',
        route: '/client-user/beneficiaries',
        icon: 'person-outline',
        active: false,
        isExpanded: false,
        enabled: isVerified,
        children: [
          { name: 'All Beneficiaries', route: '/client-user/beneficiaries', icon: 'list-outline', active: false, enabled: isVerified },
          { name: 'Add Beneficiary', route: '/client-user/beneficiaries/create', icon: 'person-add-outline', active: false, enabled: isVerified }
        ]
      },
      {
        name: 'Payments',
        route: '/client-user/payments',
        icon: 'card-outline',
        active: false,
        isExpanded: false,
        enabled: isVerified,
        children: [
          { name: 'Payment History', route: '/client-user/payments', icon: 'time-outline', active: false, enabled: isVerified },
          { name: 'Initiate Payment', route: '/client-user/payments/create', icon: 'add-circle-outline', active: false, enabled: isVerified }
        ]
      },
      {
        name: 'Salary Disbursement',
        route: '/client-user/salary',
        icon: 'cash-outline',
        active: false,
        isExpanded: false,
        enabled: isVerified,
        children: [
          { name: 'Salary History', route: '/client-user/salary', icon: 'time-outline', active: false, enabled: isVerified },
          { name: 'Disburse Salary', route: '/client-user/salary/disburse', icon: 'cash-outline', active: false, enabled: isVerified },
          { name: 'Batch Salary', route: '/client-user/salary/batch', icon: 'document-text-outline', active: false, enabled: isVerified }
        ]
      },
      {
        name: 'Documents',
        route: '/client-user/documents',
        icon: 'document-text-outline',
        active: false,
        isExpanded: false,
        enabled: true, // Always enabled for document upload
        children: [
          { name: 'All Documents', route: '/client-user/documents', icon: 'folder-outline', active: false, enabled: true },
          { name: 'Upload Document', route: '/client-user/documents/upload', icon: 'cloud-upload-outline', active: false, enabled: true }
        ]
      },
      {
        name: 'Reports',
        route: '/client-user/reports',
        icon: 'document-text-outline',
        active: false,
        enabled: isVerified
      }
    ];

    this.updateActiveNavigation();
  }





  updateActiveNavigation(): void {
    this.navigationItems.forEach(item => {
      const isParentActive = this.currentRoute.startsWith(item.route);
      item.active = isParentActive;

      // Auto-expand parent menu if child route is active
      if (item.children) {
        const hasActiveChild = item.children.some((child: { route: string; }) =>
          this.currentRoute === child.route || this.currentRoute.startsWith(child.route)
        );

        if (hasActiveChild) {
          item.isExpanded = true;
          item.active = true;
        }

        item.children.forEach((child: { active: boolean; route: string; }) => {
          child.active = this.currentRoute === child.route || this.currentRoute.startsWith(child.route);
        });
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleMenuItem(item: MenuItem): void {
    item.isExpanded = !item.isExpanded;
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => child.active);
  }

  getBreadcrumbs(): string[] {
    const breadcrumbs: string[] = [];

    for (const item of this.navigationItems) {
      if (item.children) {
        const activeChild = item.children.find((child: { active: any; }) => child.active);
        if (activeChild) {
          breadcrumbs.push(item.name, activeChild.name);
          return breadcrumbs;
        }
      } else if (item.active) {
        breadcrumbs.push(item.name);
        return breadcrumbs;
      }
    }

    return breadcrumbs;
  }

  logout(): void {
    this.userStateService.clearUser();
    this.router.navigate(['/login']);
  }

  getUserInitials(fullName?: string): string {
    if (!fullName) return 'CU';
    return fullName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  } getVerificationStatusText(): string {
    if (!this.currentClient) return 'Loading...';

    switch (this.currentClient.verificationStatus) {
      case VerificationStatus.Verified:
        return 'Verified';
      case VerificationStatus.Pending:
        return 'Verification Pending';
      case VerificationStatus.Rejected:
        return 'Verification Rejected';
      default:
        return 'Unknown Status';
    }
  }

  getVerificationStatusColor(): string {
    if (!this.currentClient) return 'gray';

    switch (this.currentClient.verificationStatus) {
      case VerificationStatus.Verified:
        return 'green';
      case VerificationStatus.Pending:
        return 'orange';
      case VerificationStatus.Rejected:
        return 'red';
      default:
        return 'gray';
    }
  }
}
