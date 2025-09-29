
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserStateService } from '../../../core/services/user-state.service';
import { User } from '../../../shared/models/User.interface';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface MenuItem {
  title: string;
  route: string;
  icon: string;
  badge?: string;
  children?: MenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './super-admin-layout.component.html',
  styleUrls: ['./super-admin-layout.component.css']
})
export class SuperAdminLayoutComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  currentRoute = '';
  isSidebarOpen = false;

  private subscriptions = new Subscription();

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      route: '/super-admin/dashboard',
      icon: 'grid-outline'
    },
    {
      title: 'Bank Management',
      route: '/super-admin/banks',
      icon: 'business-outline',
      children: [
        {
          title: 'All Banks',
          route: '/super-admin/banks',
          icon: 'list-outline'
        },
        {
          title: 'Add New Bank',
          route: '/super-admin/banks/create',
          icon: 'add-circle-outline'
        }
      ]
    },
    {
      title: 'System Reports',
      route: '/super-admin/reports',
      icon: 'document-text-outline'
    }
    // ,
    // {
    //   title: 'System Logs',
    //   route: '/super-admin/system-logs',
    //   icon: 'list-circle-outline'
    // }
  ];

  constructor(
    private userStateService: UserStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to current user
    const userSub = this.userStateService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to route changes
    const routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.updateMenuExpansion();
    });

    this.subscriptions.add(userSub);
    this.subscriptions.add(routeSub);

    // Set initial route
    this.currentRoute = this.router.url;
    this.updateMenuExpansion();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleMenuItem(item: MenuItem): void {
    if (item.children) {
      item.isExpanded = !item.isExpanded;
    }
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  isParentActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isActiveRoute(child.route));
  }

  private updateMenuExpansion(): void {
    this.menuItems.forEach(item => {
      if (item.children) {
        item.isExpanded = this.isParentActive(item);
      }
    });
  }

  getBreadcrumbs(): string[] {
    const segments = this.currentRoute.split('/').filter(segment => segment);
    const breadcrumbs: string[] = [];

    if (segments.includes('dashboard')) {
      breadcrumbs.push('Dashboard');
    } else if (segments.includes('banks')) {
      breadcrumbs.push('Bank Management');
      if (segments.includes('create')) {
        breadcrumbs.push('Add New Bank');
      } else if (segments.length > 2 && !isNaN(Number(segments[2]))) {
        breadcrumbs.push('Bank Details');
      } else {
        breadcrumbs.push('All Banks');
      }
    } else if (segments.includes('reports')) {
      breadcrumbs.push('System Reports');
    } else if (segments.includes('system-logs')) {
      breadcrumbs.push('System Logs');
    }

    return breadcrumbs;
  }

  getPageTitle(): string {
    const breadcrumbs = this.getBreadcrumbs();
    return breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1] : 'Super Admin';
  }
}
