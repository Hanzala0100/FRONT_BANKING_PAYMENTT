import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { EmployeeCreateRequest } from '../../../../shared/models/Employee.interface';


@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './create-employee.component.html'
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private clientUserService: ClientUserService,
    private router: Router
  ) {
    this.employeeForm = this.createForm();
  }

  ngOnInit(): void { }

  createForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      accountNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      bankName: ['', [Validators.required]],
      ifscCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      salaryAmount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const employeeData: EmployeeCreateRequest = {
      clientId: 0, // Will be set from current user context
      fullName: this.employeeForm.value.fullName.trim(),
      username: this.employeeForm.value.username.trim(),
      phoneNumber: this.employeeForm.value.phoneNumber.trim(),
      email: this.employeeForm.value.email.trim(),
      accountNumber: parseInt(this.employeeForm.value.accountNumber),
      bankName: this.employeeForm.value.bankName.trim(),
      ifscCode: this.employeeForm.value.ifscCode.trim().toUpperCase(),
      salaryAmount: parseFloat(this.employeeForm.value.salaryAmount)
    };

    this.clientUserService.createEmployee(employeeData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'Employee created successfully!';
          this.employeeForm.reset();
          setTimeout(() => {
            this.router.navigate(['/client-user/employees']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Failed to create employee';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating employee:', error);
        this.errorMessage = 'An error occurred while creating employee';
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.employeeForm.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  formatSalary(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }
}
