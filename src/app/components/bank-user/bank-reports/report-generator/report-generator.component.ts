import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReportService } from '../../../../core/services/report.service';
import { BankUserService } from '../../../../core/services/bank-user.service';
import { Client } from '../../../../shared/models/Client.interface';

@Component({
  selector: 'app-report-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './report-generator.component.html'
})
export class ReportGeneratorComponent implements OnInit {
  reportForm: FormGroup;
  clients: Client[] = [];
  isLoading = false;
  isGenerating = false;
  errorMessage = '';
  successMessage = '';

  reportTypes = [
    { value: 'client_overall_report', label: 'Client Overall Report', icon: 'business-outline' },
    // { value: 'payment_analysis', label: 'Payment Analysis Report', icon: 'card-outline' },
    // { value: 'verification_status', label: 'Verification Status Report', icon: 'shield-checkmark-outline' },
    // { value: 'transaction_log', label: 'Transaction Log Report', icon: 'document-text-outline' }
  ];

  dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private bankUserService: BankUserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.reportForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();

    // Check for pre-selected report type from query params
    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.reportForm.patchValue({
          reportType: params['type']
        });
      }
    });

    // Set default report title based on type
    this.reportForm.get('reportType')?.valueChanges.subscribe(type => {
      this.updateDefaultTitle(type);
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      reportType: ['', Validators.required],
      reportTitle: ['', [Validators.required, Validators.minLength(3)]],
      dateRange: ['this_month', Validators.required],
      startDate: [''],
      endDate: [''],
      clientId: [''],
      includeCharts: [true],
      includeSummary: [true],
      format: ['pdf', Validators.required]
    });
  }

  loadClients(): void {
    this.isLoading = true;
    this.bankUserService.getAllClients().subscribe({
      next: (response) => {
        if (response.success) {
          this.clients = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.errorMessage = 'Failed to load clients. Please try again.';
        this.isLoading = false;
      }
    });
  }

  updateDefaultTitle(reportType: string): void {
    const reportTypeObj = this.reportTypes.find(t => t.value === reportType);
    if (reportTypeObj && !this.reportForm.get('reportTitle')?.value) {
      const defaultTitle = `${reportTypeObj.label} - ${new Date().toLocaleDateString()}`;
      this.reportForm.patchValue({ reportTitle: defaultTitle });
    }
  }

  onSubmit(): void {
    if (this.reportForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // Validate custom date range
    if (this.reportForm.get('dateRange')?.value === 'custom') {
      const startDate = this.reportForm.get('startDate')?.value;
      const endDate = this.reportForm.get('endDate')?.value;

      if (!startDate || !endDate) {
        this.errorMessage = 'Please select both start and end dates for custom range.';
        return;
      }

      if (new Date(startDate) > new Date(endDate)) {
        this.errorMessage = 'Start date cannot be after end date.';
        return;
      }
    }

    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.prepareFormData();

    this.reportService.generateReport().subscribe({
      next: (response) => {
        this.isGenerating = false;

        if (response.success) {
          this.successMessage = 'Report generated successfully! Download will start shortly...';

          // Auto-download the report
          setTimeout(() => {
            this.downloadReport(response.data);
          }, 1000);
        } else {
          this.errorMessage = response.message || 'Failed to generate report. Please try again.';
        }
      },
      error: (error) => {
        this.isGenerating = false;
        console.error('Error generating report:', error);
        this.errorMessage = 'An error occurred while generating the report. Please try again.';
      }
    });
  }

  prepareFormData(): any {
    const formData = { ...this.reportForm.value };

    // Calculate actual dates based on selected range
    if (formData.dateRange !== 'custom') {
      const dateRange = this.calculateDateRange(formData.dateRange);
      formData.startDate = dateRange.startDate;
      formData.endDate = dateRange.endDate;
    }

    return formData;
  }

  calculateDateRange(range: string): { startDate: string, endDate: string } {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_week':
        startDate.setDate(today.getDate() - today.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_week':
        startDate.setDate(today.getDate() - today.getDay() - 7);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - today.getDay() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_month':
        startDate.setMonth(today.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  downloadReport(report: any): void {
    this.reportService.downloadReport(report.reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.reportForm.value.reportTitle.replace(/\s+/g, '_')}.${this.reportForm.value.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.successMessage = 'Report downloaded successfully!';
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        this.errorMessage = 'Error downloading report. Please try again.';
      }
    });
  }

  onDateRangeChange(): void {
    const dateRange = this.reportForm.get('dateRange')?.value;

    if (dateRange !== 'custom') {
      this.reportForm.patchValue({
        startDate: '',
        endDate: ''
      });
    }
  }

  getReportTypeIcon(type: string): string {
    const reportType = this.reportTypes.find(t => t.value === type);
    return reportType?.icon || 'document-outline';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reportForm.controls).forEach(key => {
      const control = this.reportForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.reportForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  onCancel(): void {
    this.router.navigate(['/bank-user/reports']);
  }

  resetForm(): void {
    this.reportForm.reset({
      reportType: '',
      reportTitle: '',
      dateRange: 'this_month',
      startDate: '',
      endDate: '',
      clientId: '',
      includeCharts: true,
      includeSummary: true,
      format: 'pdf'
    });
    this.errorMessage = '';
    this.successMessage = '';
  }
}
