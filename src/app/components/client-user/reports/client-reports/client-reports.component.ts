import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { ReportService } from '../../../../core/services/report.service';


import { Report, ReportStatistics } from '../../../../shared/models/Report.interface';
import { ReportDetailsModalComponent } from '../client-report-details/client-report-details.component';

interface ReportFilter {
  dateRange: string;
  reportType: string;
}

@Component({
  selector: 'app-client-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './client-reports.component.html',
  styleUrls: ['./client-reports.component.css']
})
export class ClientReportsComponent implements OnInit {
  reports: Report[] = [];
  statistics: ReportStatistics | null = null;
  isLoading = true;
  isGenerating = false;

  filters: ReportFilter = {
    dateRange: 'all',
    reportType: 'all'
  };

  reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'overall', label: 'Overall Report' },
    { value: 'payment_history', label: 'Payment History Report' },
    { value: 'salary_disbursement', label: 'Salary Disbursement Report' },
    { value: 'employee_list', label: 'Employee List Report' },
    { value: 'beneficiary_list', label: 'Beneficiary List Report' }
  ];

  dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' }
  ];

  quickReports = [
    {
      title: 'Overall Detailed Report',
      description: 'Complete Detailed Report of all activities',
      type: 'Overall',
      icon: 'card-outline',
      color: 'blue',
      estimatedTime: '1-2 minutes'
    }

  ];

  constructor(
    private reportService: ReportService,
    private clientUserService: ClientUserService,
    private viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.loadReports();
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

  convertToLocalTime(utcDateString: string): Date {
    const utcDate = new Date(utcDateString);
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
          this.reports.unshift(response.data);
          this.loadStatistics();
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
      link.download = `client_report_${reportId}.pdf`;
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
    return reportType ? reportType.label : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getReportIcon(type: string): string {
    switch (type) {
      case 'payment_history':
        return 'card-outline';
      case 'salary_disbursement':
        return 'cash-outline';
      case 'employee_list':
        return 'people-outline';
      case 'beneficiary_list':
        return 'person-outline';
      default:
        return 'document-text-outline';
    }
  }

  getQuickReportColorClass(color: string): string {
    const baseClasses = 'border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md';

    switch (color) {
      case 'blue':
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100`;
      case 'green':
        return `${baseClasses} bg-green-50 border-green-200 text-green-700 hover:bg-green-100`;
      case 'purple':
        return `${baseClasses} bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100`;
      case 'orange':
        return `${baseClasses} bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100`;
    }
  }

  getRelativeTime(timestamp: string): string {
    const now = new Date();
    const utcDate = new Date(timestamp);
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

  getReportCountByType(type: string): number {
    return this.statistics?.reportsByType[type] || 0;
  }


}
