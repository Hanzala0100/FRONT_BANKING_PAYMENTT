import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserStateService } from '../../../core/services/user-state.service';
import { User } from '../../../shared/models/User.interface';

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
  currentRoute = '';
  isSidebarOpen = false;

  navigationItems: MenuItem[] = [
    {
      name: 'Dashboard',
      route: '/client-user/dashboard',
      icon: 'grid-outline',
      active: false
    },
    // {
    //   name: 'User Management',
    //   route: '/client-user/users',
    //   icon: 'people-outline',
    //   active: false,
    //   isExpanded: false,
    //   children: [
    //     { name: 'All Users', route: '/client-user/users', icon: 'list-outline', active: false },
    //     { name: 'Add User', route: '/client-user/users/create', icon: 'person-add-outline', active: false }
    //   ]
    // },
    {
      name: 'Employee Mgmt',
      route: '/client-user/employees',
      icon: 'people-circle-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'All Employees', route: '/client-user/employees', icon: 'list-outline', active: false },
        { name: 'Add Employee', route: '/client-user/employees/create', icon: 'person-add-outline', active: false },
        { name: 'Bulk Import', route: '/client-user/employees/import', icon: 'cloud-upload-outline', active: false }
      ]
    },
    {
      name: 'Beneficiaries',
      route: '/client-user/beneficiaries',
      icon: 'person-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'All Beneficiaries', route: '/client-user/beneficiaries', icon: 'list-outline', active: false },
        { name: 'Add Beneficiary', route: '/client-user/beneficiaries/create', icon: 'person-add-outline', active: false }
      ]
    },
    {
      name: 'Payments',
      route: '/client-user/payments',
      icon: 'card-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'Payment History', route: '/client-user/payments', icon: 'time-outline', active: false },
        { name: 'Initiate Payment', route: '/client-user/payments/create', icon: 'add-circle-outline', active: false }
      ]
    },
    {
      name: 'Salary Disbursement',
      route: '/client-user/salary',
      icon: 'cash-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'Salary History', route: '/client-user/salary', icon: 'time-outline', active: false },
        { name: 'Disburse Salary', route: '/client-user/salary/disburse', icon: 'cash-outline', active: false },
        { name: 'Batch Salary', route: '/client-user/salary/batch', icon: 'document-text-outline', active: false }
      ]
    },
    {
      name: 'Documents',
      route: '/client-user/documents',
      icon: 'document-text-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'All Documents', route: '/client-user/documents', icon: 'folder-outline', active: false },
        { name: 'Upload Document', route: '/client-user/documents/upload', icon: 'cloud-upload-outline', active: false }
      ]
    },
    {
      name: 'Reports',
      route: '/client-user/reports',
      icon: 'document-text-outline',
      active: false
    }
  ];

  constructor(
    private userStateService: UserStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get current user
    this.currentUser = this.userStateService.currentUser;

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

  updateActiveNavigation(): void {
    this.navigationItems.forEach(item => {
      const isParentActive = this.currentRoute.startsWith(item.route);
      item.active = isParentActive;

      // Auto-expand parent menu if child route is active
      if (item.children) {
        const hasActiveChild = item.children.some(child =>
          this.currentRoute === child.route || this.currentRoute.startsWith(child.route)
        );

        if (hasActiveChild) {
          item.isExpanded = true;
          item.active = true;
        }

        item.children.forEach(child => {
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
        const activeChild = item.children.find(child => child.active);
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
  }
}
