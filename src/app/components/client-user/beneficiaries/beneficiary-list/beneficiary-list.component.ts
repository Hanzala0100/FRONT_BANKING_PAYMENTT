import { Client } from './../../../../shared/models/Client.interface';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Beneficiary } from '../../../../shared/models/Beneficiary.interface';
import { ClientUserService } from '../../../../core/services/client-user.service';
import { UserStateService } from '../../../../core/services/user-state.service';

@Component({
  selector: 'app-beneficiary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './beneficiary-list.component.html'
})
export class BeneficiaryListComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];
  filteredBeneficiaries: Beneficiary[] = [];
  isLoading = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  totalPages = 0;
  currentUser: any;
  // Filters
  searchTerm = '';
  sortBy = 'name';
  sortDescending = false;

  constructor(private clientUserService: ClientUserService, private userStateService: UserStateService) { }

  ngOnInit() {
    this.currentUser = this.userStateService.currentUser;
    this.loadBeneficiaries();
  }

  loadBeneficiaries() {
    this.isLoading = true;
    const clientId = this.currentUser?.clientId || 0;
    this.clientUserService.getPaginatedBeneficiaries(
      this.currentPage,
      this.pageSize,
      clientId,
      this.searchTerm,
      this.sortDescending
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.beneficiaries = response.data.data;
          this.filteredBeneficiaries = [...this.beneficiaries];
          this.totalRecords = response.data.pagination.totalCount;
          this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading beneficiaries:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1; // Reset to first page when searching
    this.loadBeneficiaries();
  }

  onSortChange() {
    this.currentPage = 1; // Reset to first page when sorting
    this.sortDescending = this.sortBy === 'payments'; // Sort descending for payments, ascending for others
    this.loadBeneficiaries();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBeneficiaries();
  }

  onPageSizeChange() {
    this.currentPage = 1; // Reset to first page when changing page size
    this.loadBeneficiaries();
  }

  deleteBeneficiary(beneficiary: Beneficiary) {
    if (confirm(`Are you sure you want to delete beneficiary ${beneficiary.fullName}? This will also remove their payment history.`)) {
      this.clientUserService.deleteBeneficiary(beneficiary.beneficiaryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBeneficiaries(); // Reload current page after deletion
          }
        },
        error: (error) => console.error('Error deleting beneficiary:', error)
      });
    }
  }

  getBeneficiaryInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  formatAccountNumber(accountNumber: number): string {
    const accStr = accountNumber.toString();
    return 'XXXX' + accStr.slice(-4);
  }

  getPaymentCountText(count: number): string {
    return count === 1 ? '1 payment' : `${count} payments`;
  }

  getTotalPayments(): number {
    return this.beneficiaries.reduce((total, beneficiary) => total + beneficiary.totalPayments, 0);
  }

  getUniqueBanksCount(): number {
    const banks = new Set(this.beneficiaries.map(b => b.bankName));
    return banks.size;
  }

  getMostActivePayments(): number {
    return Math.max(...this.beneficiaries.map(b => b.totalPayments), 0);
  }

  getTopBanks(): { name: string; count: number }[] {
    const bankCounts = this.beneficiaries.reduce((acc, beneficiary) => {
      acc[beneficiary.bankName] = (acc[beneficiary.bankName] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(bankCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  getAveragePayments(): string {
    const total = this.getTotalPayments();
    const count = this.beneficiaries.length;
    return count > 0 ? (total / count).toFixed(1) : '0';
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
