import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { BatchSalaryCreateRequest, BatchEmployeeSalary } from '../../../../shared/models/Salary.interface';
import { Employee } from '../../../../shared/models/Employee.interface';
import { UserStateService } from '../../../../core/services/user-state.service';

@Component({
  selector: 'app-batch-salary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './batch-salary.component.html'
})
export class BatchSalaryComponent implements OnInit {
  salaryForm: FormGroup;
  employees: Employee[] = [];
  selectedEmployees: BatchEmployeeSalary[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private userStateService: UserStateService,
    private router: Router
  ) {
    this.salaryForm = this.createForm();
  }

  ngOnInit(): void {
    this.currentUser = this.userStateService.currentUser;
    this.loadEmployees();
  }

  createForm(): FormGroup {
    return this.fb.group({
      disbursementDate: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.clientUserService.getAllEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          this.employees = response.data;
          // Initialize selected employees with their current salary
          this.selectedEmployees = this.employees.map(emp => ({
            employeeId: emp.employeeId,
            amount: emp.salaryAmount
          }));
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.errorMessage = 'Failed to load employees';
        this.isLoading = false;
      }
    });
  }

  updateEmployeeAmount(employeeId: number, amount: string): void {
    const numericAmount = parseFloat(amount) || 0;
    const employee = this.selectedEmployees.find(emp => emp.employeeId === employeeId);
    if (employee) {
      employee.amount = numericAmount;
    }
  }

  onSubmit(): void {
    if (this.salaryForm.invalid || this.selectedEmployees.length === 0) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const batchData: BatchSalaryCreateRequest = {
      clientId: this.currentUser?.clientId || 0,
      employees: this.selectedEmployees,
      disbursementDate: this.salaryForm.value.disbursementDate
    };

    this.clientUserService.createBatchSalaryDisbursement(batchData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = `Batch salary disbursement initiated! ${response.data.successful} successful, ${response.data.failed} failed.`;
          setTimeout(() => {
            this.router.navigate(['/client-user/salary']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to process batch salary';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error processing batch salary:', error);
        this.errorMessage = 'An error occurred while processing batch salary';
      }
    });
  }

  getTotalAmount(): number {
    return this.selectedEmployees.reduce((total, emp) => total + emp.amount, 0);
  }

  getEmployeeInitials(fullName: string): string {
    if (!fullName) return '';
    return fullName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.salaryForm.controls).forEach(key => {
      const control = this.salaryForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.salaryForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  formatSalary(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getAverageSalary(): number {
    return this.employees.length > 0 ? this.getTotalAmount() / this.employees.length : 0;
  }
}
