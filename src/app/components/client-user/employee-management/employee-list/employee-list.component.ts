import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { Employee } from '../../../../shared/models/Employee.interface';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  sortBy = 'name';

  constructor(private clientUserService: ClientUserService) { }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this.clientUserService.getAllEmployees().subscribe({
      next: (response) => {
        if (response.success) {
          this.employees = response.data;
          this.filteredEmployees = [...this.employees];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.employees];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(employee =>
        employee.fullName.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.accountNumber.toString().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.fullName.localeCompare(b.fullName);
        case 'salary': return b.salaryAmount - a.salaryAmount;
        default: return 0;
      }
    });

    this.filteredEmployees = filtered;
  }

  deleteEmployee(employee: Employee) {
    if (confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      this.clientUserService.deleteEmployee(employee.clientId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadEmployees();
          }
        },
        error: (error) => console.error('Error deleting employee:', error)
      });
    }
  }

  getEmployeeInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  formatSalary(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }
}