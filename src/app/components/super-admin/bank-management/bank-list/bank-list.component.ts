
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { Bank } from '../../../../shared/models/Bank.interface';

@Component({
  selector: 'app-bank-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bank-list.component.html',
  styleUrls: ['./bank-list.component.css']
})
export class BankListComponent implements OnInit {
  allBanks: Bank[] = [];
  filteredBanks: Bank[] = [];
  isLoading = true;

  // Filters
  searchTerm = '';
  sortBy = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Modal states
  showDeleteModal = false;
  bankToDelete: Bank | null = null;
  isDeletingBank = false;

  // Statistics
  totalClients = 0;
  totalUsers = 0;
  averageClientsPerBank = 0;

  constructor(private superAdminService: SuperAdminService) { }

  ngOnInit(): void {
    this.loadBanks();
  }

  loadBanks(): void {
    this.isLoading = true;
    this.superAdminService.getAllBanks().subscribe({
      next: (response) => {
        if (response.success) {
          this.allBanks = response.data;
          this.calculateStatistics();
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading banks:', error);
        this.isLoading = false;
      }
    });
  }

  calculateStatistics(): void {
    this.totalClients = this.allBanks.reduce((sum, bank) => sum + bank.totalClients, 0);
    this.totalUsers = this.allBanks.reduce((sum, bank) => sum + bank.totalUsers, 0);
    this.averageClientsPerBank = this.allBanks.length > 0
      ? Math.round(this.totalClients / this.allBanks.length)
      : 0;
  }

  applyFilters(): void {
    let filtered = [...this.allBanks];

    // Search filter
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(bank =>
        bank.bankName.toLowerCase().includes(search) ||
        bank.contactEmail.toLowerCase().includes(search) ||
        bank.adminUsername.toLowerCase().includes(search) ||
        bank.address.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a?.bankName?.toLowerCase();
          bValue = b?.bankName?.toLowerCase();
          break;
        case 'totalClients':
          aValue = a?.totalClients;
          bValue = b?.totalClients;
          break;
        case 'totalUsers':
          aValue = a?.totalUsers;
          bValue = b?.totalUsers;
          break;
        case 'adminUsername':
          aValue = a?.adminUsername?.toLowerCase();
          bValue = b?.adminUsername?.toLowerCase();
          break;
        default:
          aValue = a?.bankId;
          bValue = b?.bankId;
      }

      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    this.filteredBanks = filtered;
  }

  sortBanks(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'swap-vertical-outline';
    return this.sortDirection === 'asc' ? 'chevron-up-outline' : 'chevron-down-outline';
  }

  getBankInitials(name: string): string {
    return name?.split(' ')?.map(word => word[0])?.join('')?.toUpperCase()?.substring(0, 2);
  }

  deleteBank(bank: Bank): void {
    this.bankToDelete = bank;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.bankToDelete) return;

    this.isDeletingBank = true;
    this.superAdminService.deleteBank(this.bankToDelete.bankId).subscribe({
      next: (response) => {
        if (response.success) {
          this.allBanks = this.allBanks.filter(b => b.bankId !== this.bankToDelete!.bankId);
          this.calculateStatistics();
          this.applyFilters();
          this.closeDeleteModal();
        }
        this.isDeletingBank = false;
      },
      error: (error) => {
        console.error('Error deleting bank:', error);
        this.isDeletingBank = false;
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.bankToDelete = null;
    this.isDeletingBank = false;
  }

  trackByBankId(index: number, bank: Bank): number {
    return bank.bankId;
  }

  refreshData(): void {
    this.loadBanks();
  }

  getPerformanceIndicator(bank: Bank): { label: string; class: string } {
    const clientsPerUser = bank.totalUsers > 0 ? bank.totalClients / bank.totalUsers : 0;

    if (clientsPerUser >= 5) {
      return { label: 'High', class: 'text-green-600 bg-green-100' };
    } else if (clientsPerUser >= 2) {
      return { label: 'Medium', class: 'text-orange-600 bg-orange-100' };
    } else {
      return { label: 'Low', class: 'text-red-600 bg-red-100' };
    }
  }
}
