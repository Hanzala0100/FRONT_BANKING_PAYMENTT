import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';
import { SuperAdminService } from '../../../core/services/super-admin.service';
import { Report, ReportStatistics, RecentReport } from '../../../shared/models/Report.interface';
import { Bank } from '../../../shared/models/Bank.interface';

interface ReportFilter {
  dateRange: string;
  reportType: string;
  bankId?: number;
}

@Component({
  selector: 'app-super-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './super-admin-reports.component.html',
  styleUrls: ['./super-admin-reports.component.css']
})
export class SuperAdminReportsComponent implements OnInit {
  reports: Report[] = [];
  banks: Bank[] = [];
  statistics: ReportStatistics | null = null;
  isLoading = true;
  isGenerating = false;

  filters: ReportFilter = {
    dateRange: 'all',
    reportType: 'all'
  };

  reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'overall_system_report', label: 'Overall System Report' }
  ];

  dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  quickReports = [
    {
      title: 'Overall System Report',
      description: 'Complete system status and performance metrics',
      type: 'overall_system_report',
      icon: 'analytics-outline',
      color: 'blue',
      estimatedTime: '2-3 minutes'
    }
  ];

  constructor(
    private reportService: ReportService,
    private superAdminService: SuperAdminService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    // Load banks
    this.superAdminService.getAllBanks().subscribe({
      next: (response) => {
        if (response.success) {
          this.banks = response.data;
        }
      },
      error: (error) => console.error('Error loading banks:', error)
    });

    // Load reports
    this.loadReports();

    // Load statistics
    this.loadStatistics();
  }

  loadReports(): void {
    this.reportService.getMyReports().subscribe({
      next: (response) => {
        if (response.success) {
          this.reports = response.data;

        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.isLoading = false;
      }
    });
  }

  converToLocalTime(utcDateString: string): Date {
    // Parse as UTC
    const utcDate = new Date(utcDateString);

    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const localDate = new Date(utcDate.getTime() + istOffset);

    return localDate;
  }


  loadStatistics(): void {
    this.reportService.getReportStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.statistics = response.data;
        }
      },
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  generateReport(reportType: string): void {
    this.isGenerating = true;

    this.reportService.generateReport().subscribe({
      next: (response) => {
        if (response.success) {
          // Add the new report to the list
          this.reports.unshift(response.data);
          // Refresh statistics
          this.loadStatistics();
          // Reload reports to get updated list
          this.loadReports();
        }
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.isGenerating = false;
      }
    });
  }

  downloadReport(reportId: number): void {
    this.reportService.downloadReport(reportId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }


  deleteReport(reportId: number): void {
    if (confirm('Are you sure you want to delete this report?')) {
      this.reportService.deleteReport(reportId).subscribe({
        next: (response) => {
          if (response.success) {
            this.reports = this.reports.filter(r => r.reportId !== reportId);
            this.loadStatistics();
          }
        },
        error: (error) => console.error('Error deleting report:', error)
      });
    }
  }

  applyFilters(): void {
    this.loadReports();
  }

  getFilteredReports(): Report[] {
    let filtered = [...this.reports];

    if (this.filters.reportType !== 'all') {
      filtered = filtered.filter(report => report.reportType === this.filters.reportType);
    }

    return filtered;
  }

  getReportTypeLabel(type: string): string {
    const reportType = this.reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.label : type;
  }

  getReportIcon(type: string): string {
    return 'document-text-outline';
  }

  getQuickReportColorClass(color: string): string {
    return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();

    // Parse UTC timestamp
    const utcDate = new Date(timestamp);

    // Convert UTC → IST (+5:30 hours = 330 minutes)
    const istDate = new Date(utcDate.getTime() + (330 * 60 * 1000));

    const diffInMinutes = Math.floor((now.getTime() - istDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 0) {
      return "in the future";
    }

    if (diffInMinutes < 1) {
      return "just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    }
  }

  // Helper to get report count by type from statistics
  getReportCountByType(type: string): number {
    return this.statistics?.reportsByType[type] || 0;
  }
}
