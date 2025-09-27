import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log.service';
import { VoucherLog } from '../../models/Logs.interface';
import { PersistenceService } from '../../services/persistence.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LogsComponent implements OnInit, OnDestroy {

  logs: VoucherLog[] = [];
  lastUpdated: Date = new Date();

  isLoading: boolean = false;
  error: string | null = null;
  countdown: number = 30;

  private refreshSubscription: Subscription = new Subscription();
  private countdownSubscription: Subscription = new Subscription();

  constructor(
    private logService: LogService,
    private router: Router,
    private persistenceService: PersistenceService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.startAutoRefresh();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.refreshSubscription.unsubscribe();
    this.countdownSubscription.unsubscribe();
  }


  private startAutoRefresh(): void {
    this.refreshSubscription = interval(30000)
      .pipe(
        startWith(0),
        switchMap(async () => this.loadLogs())
      )
      .subscribe();
  }

  private startCountdown(): void {
    this.countdownSubscription = interval(1000).subscribe(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.countdown = 30;
      }
    });
  }


  private loadLogs() {
    this.isLoading = true;
    this.error = null;

    return this.logService.getAllLogs().pipe(
      catchError((error) => {
        console.error('Logs loading error:', error);
        this.error = 'Failed to load activity logs. Please try again.';
        return of([]);
      })
    ).subscribe({
      next: (logs) => {
        this.logs = this.sortLogsByTimestamp(logs);
        this.lastUpdated = new Date();
        this.isLoading = false;
        this.countdown = 30;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        this.error = 'An unexpected error occurred.';
        this.isLoading = false;
      }
    });
  }


  private sortLogsByTimestamp(logs: VoucherLog[]): VoucherLog[] {
    return logs.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  refreshLogs(): void {
    this.loadLogs();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  exportToCsv(): void {
    if (!this.logs || this.logs.length === 0) {
      return;
    }

    const headers = ['ID', 'Code', 'Outlet ID', 'Staff Name', 'Action', 'Timestamp', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...this.logs.map(log => [
        log.id,
        `"${log.code}"`,
        log.outletId,
        `"${log.staffName}"`,
        `"${log.action}"`,
        `"${log.timestamp}"`,
        `"${log.createdAt}"`,
        `"${log.updatedAt}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `voucher-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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



  trackByLogId(index: number, log: VoucherLog): number {
    return log.id;
  }

  getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'redeem_success':
        return 'checkmark-circle';
      case 'redeem_fail_already_redeemed':
        return 'repeat';
      case 'redeem_fail_invalid':
        return 'ban';
      default:
        return 'help-circle';
    }
  }


  getActionIconBg(action: string): string {
    switch (action.toLowerCase()) {
      case 'redeem_success':
        return 'bg-green-100';
      case 'redeem_fail_already_redeemed':
        return 'bg-orange-100';
      case 'redeem_fail_invalid':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  }

  getActionIconColor(action: string): string {
    switch (action.toLowerCase()) {
      case 'redeem_success':
        return 'text-green-600';
      case 'redeem_fail_already_redeemed':
        return 'text-orange-600';
      case 'redeem_fail_invalid':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }


  getActionTitle(action: string): string {
    switch (action.toLowerCase()) {
      case 'redeem_success':
        return 'Voucher Successfully Redeemed';
      case 'redeem_fail_already_redeemed':
        return 'Redemption Failed - Already Used';
      case 'redeem_fail_invalid':
        return 'Redemption Failed - Invalid Code';
      default:
        return 'Unknown Action';
    }
  }


  getActionStatus(action: string): string {
    switch (action.toLowerCase()) {
      case 'redeem_success':
        return 'SUCCESS';
      case 'redeem_fail_already_redeemed':
        return 'ALREADY USED';
      case 'redeem_fail_invalid':
        return 'INVALID';
      default:
        return 'UNKNOWN';
    }
  }


  getActionBadgeStyle(action: string): string {
    switch (action.toLowerCase()) {
      case 'redeem_success':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'redeem_fail_already_redeemed':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'redeem_fail_invalid':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }


  formatTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid time';
    }
  }


  formatDate(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }


  getTimeAgo(timestamp: string): string {
    try {
      const now = new Date();
      const logTime = new Date(timestamp);
      const diffInSeconds = Math.floor((now.getTime() - logTime.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      }
    } catch (error) {
      return 'Unknown';
    }
  }


  getSuccessfulRedemptions(): number {
    return this.logs.filter(log => log.action.toLowerCase() === 'redeem_success').length;
  }


  getFailedRedemptions(): number {
    return this.logs.filter(log => log.action.toLowerCase().includes('fail')).length;
  }


  getTodaysLogs(): VoucherLog[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  }


  getUniqueStaff(): string[] {
    const staffSet = new Set(this.logs.map(log => log.staffName));
    return Array.from(staffSet);
  }


  getUniqueOutlets(): number[] {
    const outletSet = new Set(this.logs.map(log => log.outletId));
    return Array.from(outletSet).sort((a, b) => a - b);
  }


  isRecentLog(timestamp: string): boolean {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInMinutes = (now.getTime() - logTime.getTime()) / (1000 * 60);
    return diffInMinutes <= 5;
  }
}