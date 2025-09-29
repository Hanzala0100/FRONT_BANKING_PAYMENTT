import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { Report, ReportStatistics } from '../../../../shared/models/Report.interface';

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './report-dashboard.component.html'
})
export class ReportDashboardComponent implements OnInit {
  reportStats: ReportStatistics = {
    totalReports: 0,
    reportsByType: {},
    recentReports: []
  };

  isLoading = true;
  recentReports: Report[] = [];

  reportTypes = [
    { name: 'Client Summary', value: 'client_summary', icon: 'business-outline', color: 'blue' },
    // { name: 'Payment Analysis', value: 'payment_analysis', icon: 'card-outline', color: 'green' },
    // { name: 'Verification Status', value: 'verification_status', icon: 'shield-checkmark-outline', color: 'orange' },
    // { name: 'Transaction Log', value: 'transaction_log', icon: 'document-text-outline', color: 'purple' }
  ];

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.isLoading = true;

    // Load report statistics
    this.reportService.getReportStatistics().subscribe({
      next: (response) => {
        if (response.success) {
          this.reportStats = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading report statistics:', error);
        this.isLoading = false;
      }
    });

    // Load recent reports
    this.reportService.getMyReports().subscribe({
      next: (response) => {
        if (response.success) {
          this.recentReports = response.data;
        }
      },
      error: (error) => console.error('Error loading recent reports:', error)
    });
  }

  getReportTypeCount(type: string): number {
    return this.reportStats.totalReports;
  }

  getReportTypeColor(type: string): string {
    const reportType = this.reportTypes.find(t => t.value === type);
    return reportType?.color || 'gray';
  }

  getReportTypeIcon(type: string): string {
    const reportType = this.reportTypes.find(t => t.value === type);
    return reportType?.icon || 'document-outline';
  }

  downloadReport(report: Report): void {
    this.reportService.downloadReport(report.reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_${report.reportId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error downloading report:', error)
    });
  }

  getReportTypeName(type: string): string {
    const reportType = this.reportTypes.find(t => t.value === type);
    return reportType?.name || type;
  }
}
