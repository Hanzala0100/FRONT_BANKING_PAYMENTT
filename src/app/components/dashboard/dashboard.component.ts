import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, forkJoin } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { OutletData, OutletDataResponse, VoucherStatsResponse } from '../../models/VoucherResponse.interface';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { PersistenceService } from '../../services/persistence.service';
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Data properties
  voucherStats: VoucherStatsResponse | null = null;
  outletData: OutletDataResponse | null = null;
  lastUpdated: Date = new Date();

  // UI state
  isLoading: boolean = false;
  error: string | null = null;

  // Subscriptions
  private refreshSubscription: Subscription = new Subscription();
  private dataSubscription: Subscription = new Subscription();

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private persistenceService: PersistenceService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
  }


  private startAutoRefresh(): void {
    this.refreshSubscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(async () => this.loadDashboardData())
      )
      .subscribe();
  }


  private loadDashboardData() {
    this.isLoading = true;
    this.error = null;

    return forkJoin({
      voucherStats: this.dashboardService.getAllVouchersData(),
      outletData: this.dashboardService.getSuccessfulRedeemsPerOutlet()
    }).pipe(
      catchError((error) => {
        console.error('Dashboard data loading error:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        return of({ voucherStats: null, outletData: null });
      })
    ).subscribe({
      next: (data) => {
        this.voucherStats = data.voucherStats;
        this.outletData = data.outletData;
        this.lastUpdated = new Date();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        this.error = 'An unexpected error occurred.';
        this.isLoading = false;
      }
    });
  }

  getPercentage(value: number, total: number): number {
    if (!value || !total || total === 0) {
      return 0;
    }
    return Math.round((value / total) * 100);
  }

  getOutletArray(): OutletData[] {
    if (!this.outletData) {
      return [];
    }

    return Object.values(this.outletData).sort((a, b) => {
      return b.successful_redeems - a.successful_redeems;
    });
  }


  trackByOutletId(index: number, outlet: OutletData): number {
    return outlet.id;
  }

  refreshData(): void {
    this.loadDashboardData();
  }


  goToRedeem(): void {
    this.router.navigate(['/redeem']);
  }


  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out from server');
        this.persistenceService.delete('accessToken');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.persistenceService.delete('accessToken');
        this.router.navigate(['/login']);
      }
    });
  }



  getTotalOutlets(): number {
    return this.getOutletArray().length;
  }


  getTopPerformingOutlet(): OutletData | null {
    const outlets = this.getOutletArray();
    return outlets.length > 0 ? outlets[0] : null;
  }


  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }
}