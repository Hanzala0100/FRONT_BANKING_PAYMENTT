import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { SalaryCreateRequest } from '../../../../shared/models/Salary.interface';
import { Employee } from '../../../../shared/models/Employee.interface';
import { UserStateService } from '../../../../core/services/user-state.service';

@Component({
  selector: 'app-disburse-salary',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './disburse-salary.component.html'
})
export class DisburseSalaryComponent implements OnInit {
  salaryForm: FormGroup;
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any;
  selectedEmployeeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private userStateService: UserStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.salaryForm = this.createForm();
  }

  ngOnInit(): void {
    this.currentUser = this.userStateService.currentUser;

    // Check for employeeId in query params
    this.route.queryParams.subscribe(params => {
      if (params['employeeId']) {
        this.selectedEmployeeId = +params['employeeId'];
      }
      this.loadEmployees();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      employeeId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      disbursementDate: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.clientUserService.getAllEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          this.employees = response.data;
          this.filteredEmployees = [...this.employees];

          // Pre-select employee if provided in query params
          if (this.selectedEmployeeId) {
            const employee = this.employees.find(emp => emp.employeeId === this.selectedEmployeeId);
            if (employee) {
              this.salaryForm.patchValue({
                employeeId: employee.employeeId,
                amount: employee.salaryAmount
              });
              this.onEmployeeChange();
            }
          }
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

  onEmployeeChange(): void {
    const employeeId = this.salaryForm.get('employeeId')?.value;
    const employee = this.employees.find(emp => emp.employeeId === parseInt(employeeId));

    if (employee) {
      // Auto-fill amount with employee's salary if not already set
      const currentAmount = this.salaryForm.get('amount')?.value;
      if (!currentAmount || currentAmount === '') {
        this.salaryForm.patchValue({
          amount: employee.salaryAmount
        });
      }
    }
  }

  onSubmit(): void {
    if (this.salaryForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const salaryData: SalaryCreateRequest = {
      clientId: this.currentUser?.clientId || 0,
      employeeId: parseInt(this.salaryForm.value.employeeId),
      amount: parseFloat(this.salaryForm.value.amount),
      disbursementDate: this.salaryForm.value.disbursementDate
    };

    this.clientUserService.createSalaryDisbursement(salaryData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'Salary disbursement initiated successfully! It will be processed shortly.';
          this.salaryForm.reset({
            disbursementDate: new Date().toISOString().split('T')[0]
          });
          setTimeout(() => {
            this.router.navigate(['/client-user/salary']);
          }, 3000);
        } else {
          this.errorMessage = response.message || 'Failed to create salary disbursement';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating salary disbursement:', error);
        this.errorMessage = 'An error occurred while creating salary disbursement';
      }
    });
  }

  getSelectedEmployee() {
    const employeeId = this.salaryForm.get('employeeId')?.value;
    return this.employees.find(emp => emp.employeeId === parseInt(employeeId));
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
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getEmployeeInitials(fullName: string): string {
    if (!fullName) return '';
    return fullName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
  }
}
