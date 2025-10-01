import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Report } from '../../../../shared/models/Report.interface';

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="close()">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full" (click)="$event.stopPropagation()">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>

          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Report Type:</span>
              <span class="font-medium">{{ getReportTypeLabel() }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Generated At:</span>
              <span class="font-medium">{{ getFormattedDate() }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Report ID:</span>
              <span class="font-medium">#{{ report.reportId }}</span>
            </div>

            <div class="flex justify-between">
              <span class="text-gray-600">Status:</span>
              <span
                class="font-medium"
                [class.text-green-600]="report.fileUrl"
                [class.text-orange-600]="!report.fileUrl"
              >
                {{ report.fileUrl ? 'Ready to Download' : 'Generating...' }}
              </span>
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              (click)="close()"
              class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>

            <button
              *ngIf="report.fileUrl"
              (click)="download()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportDetailsModalComponent {
  @Input() report!: Report;
  @Input() onDownload!: (reportId: number) => void;
  @Input() onClose!: () => void;

  getReportTypeLabel(): string {
    const reportTypes: { [key: string]: string } = {
      'payment_history': 'Payment History Report',
      'salary_disbursement': 'Salary Disbursement Report',
      'employee_list': 'Employee List Report',
      'beneficiary_list': 'Beneficiary List Report'
    };
    return reportTypes[this.report.reportType] || this.report.reportType;
  }

  getFormattedDate(): string {
    return new Date(this.report.generatedAt).toLocaleString();
  }

  download(): void {
    if (this.onDownload) {
      this.onDownload(this.report.reportId);
    }
    this.close();
  }

  close(): void {
    if (this.onClose) {
      this.onClose();
    }
  }
}
