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
  selector: 'app-bank-user-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bank-user-layout.component.html',
  styleUrls: ['./bank-user-layout.component.css']
})
export class BankUserLayoutComponent implements OnInit {
  currentUser: User | null = null;
  currentRoute = '';
  isSidebarOpen = false;

  navigationItems: MenuItem[] = [
    {
      name: 'Dashboard',
      route: '/bank-user/dashboard',
      icon: 'grid-outline',
      active: false
    },
    {
      name: 'Client Management',
      route: '/bank-user/clients',
      icon: 'business-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'All Clients', route: '/bank-user/clients', icon: 'list-outline', active: false },
        { name: 'Add Client', route: '/bank-user/clients/create', icon: 'add-circle-outline', active: false },
        { name: 'Verification', route: '/bank-user/verification', icon: 'shield-checkmark-outline', active: false }
      ]
    },
    {
      name: 'Payment Management',
      route: '/bank-user/payments',
      icon: 'card-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'Payment History', route: '/bank-user/payments', icon: 'time-outline', active: false },
        { name: 'Pending Payments', route: '/bank-user/payments/pending', icon: 'hourglass-outline', active: false }
      ]
    },
    {
      name: 'Reports',
      route: '/bank-user/reports',
      icon: 'document-text-outline',
      active: false,
      isExpanded: false,
      children: [
        { name: 'Report Dashboard', route: '/bank-user/reports', icon: 'analytics-outline', active: false },
        { name: 'Generate Report', route: '/bank-user/reports/generate', icon: 'create-outline', active: false },
        // { name: 'Report History', route: '/bank-user/reports/history', icon: 'archive-outline', active: false }
      ]
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
    if (!fullName) return 'BU';
    return fullName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }
}
