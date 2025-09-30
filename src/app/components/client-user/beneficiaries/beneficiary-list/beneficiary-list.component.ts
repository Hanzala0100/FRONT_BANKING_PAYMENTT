import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Beneficiary } from '../../../../shared/models/Beneficiary.interface';
import { ClientUserService } from '../../../../core/services/client-user.service';

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

  // Filters
  searchTerm = '';
  sortBy = 'name';

  constructor(private clientUserService: ClientUserService) { }

  ngOnInit() {
    this.loadBeneficiaries();
  }

  loadBeneficiaries() {
    this.isLoading = true;
    this.clientUserService.getBeneficiaries().subscribe({
      next: (response) => {
        if (response.success) {
          this.beneficiaries = response.data;
          this.filteredBeneficiaries = [...this.beneficiaries];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading beneficiaries:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.beneficiaries];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(beneficiary =>
        beneficiary.fullName.toLowerCase().includes(search) ||
        beneficiary.accountNumber.toString().includes(search) ||
        beneficiary.bankName.toLowerCase().includes(search) ||
        beneficiary.ifscCode.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name': return a.fullName.localeCompare(b.fullName);
        case 'bank': return a.bankName.localeCompare(b.bankName);
        case 'payments': return b.totalPayments - a.totalPayments;
        default: return 0;
      }
    });

    this.filteredBeneficiaries = filtered;
  }

  deleteBeneficiary(beneficiary: Beneficiary) {
    if (confirm(`Are you sure you want to delete beneficiary ${beneficiary.fullName}? This will also remove their payment history.`)) {
      this.clientUserService.deleteBeneficiary(beneficiary.beneficiaryId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBeneficiaries();
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
}
