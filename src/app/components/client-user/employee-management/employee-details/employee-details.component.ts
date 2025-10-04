import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { Employee } from '../../../../shared/models/Employee.interface';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './employee-details.component.html'
})
export class EmployeeDetailsComponent implements OnInit {
  employeeId!: number;
  employee: Employee | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientUserService: ClientUserService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeeId = +params['id'];
      if (this.employeeId) {
        this.loadEmployeeDetails();
      }
    });
  }

  loadEmployeeDetails(): void {
    this.isLoading = true;
    this.clientUserService.getEmployeeById(this.employeeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.employee = response.data;
        } else {
          this.errorMessage = 'Employee not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employee details:', error);
        this.errorMessage = 'Failed to load employee details';
        this.isLoading = false;
      }
    });
  }

  deleteEmployee(): void {
    if (this.employee && confirm(`Are you sure you want to delete ${this.employee.fullName}? This action cannot be undone.`)) {
      this.clientUserService.deleteEmployee(this.employeeId).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/client-user/employees']);
          } else {
            this.errorMessage = response.message || 'Failed to delete employee';
          }
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.errorMessage = 'An error occurred while deleting employee';
        }
      });
    }
  }

  getEmployeeInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  formatSalary(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  formatAccountNumber(accountNumber: number): string {
    const accStr = accountNumber.toString();
    return 'XXXX' + accStr.slice(-4);
  }
}
