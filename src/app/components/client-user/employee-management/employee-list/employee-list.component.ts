import { UserStateService } from './../../../../core/services/user-state.service';
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

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  hasPrevious = false;
  hasNext = false;
  currentUser: any;

  constructor(
    private clientUserService: ClientUserService,
    private userStateService: UserStateService
  ) { }

  ngOnInit() {
    this.currentUser = this.userStateService.currentUser;
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;

    const clientId = this.currentUser?.clientId || 0;

    this.clientUserService.getPaginatedEmployees(
      this.currentPage,
      this.pageSize,
      clientId,
      this.searchTerm,
      this.sortBy === 'salary'
    ).subscribe({
      next: (response) => {
        console.log('API Response:', response); // Debug log
        if (response.success && response.data) {
          // Updated to match the actual response structure
          this.employees = response.data.data; // response.data.data contains the employee array
          this.filteredEmployees = [...this.employees];
          this.totalRecords = response.data.pagination.totalCount; // Use pagination.totalCount
          this.calculatePagination(response.data.pagination);
        } else {
          console.error('API returned unsuccessful response:', response);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.isLoading = false;
      }
    });
  }

  calculatePagination(pagination?: any) {
    if (pagination) {
      // Use server-provided pagination data
      this.totalPages = pagination.totalPages;
      this.hasPrevious = pagination.hasPrevious;
      this.hasNext = pagination.hasNext;
      this.currentPage = pagination.currentPage;
      this.totalRecords = pagination.totalCount;
    } else {
      // Fallback to client-side calculation
      this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.hasPrevious = this.currentPage > 1;
      this.hasNext = this.currentPage < this.totalPages;
    }
  }

  applyFilters() {
    // Reset to first page when filtering
    this.currentPage = 1;
    this.loadEmployees();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadEmployees();
  }

  deleteEmployee(employee: Employee) {
    if (confirm(`Are you sure you want to delete ${employee.fullName}?`)) {
      this.clientUserService.deleteEmployee(employee.employeeId).subscribe({
        next: (response) => {
          if (response.success) {
            // Reload current page after deletion
            this.loadEmployees();
          }
        },
        error: (error) => console.error('Error deleting employee:', error)
      });
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  getEmployeeInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  formatSalary(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
