import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SuperAdminService } from '../../../../core/services/super-admin.service';
import { Bank } from '../../../../shared/models/Bank.interface';


@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css']
})
export class BankDetailsComponent implements OnInit {
  bank: Bank | null = null;
  isLoading = true;
  errorMessage = '';

  activeTab = 'overview';
  showDeleteModal = false;
  isDeletingBank = false;

  tabs = [
    { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
    { id: 'clients', label: 'Clients', icon: 'people-outline' },
    { id: 'users', label: 'Users', icon: 'person-outline' },
    { id: 'settings', label: 'Settings', icon: 'settings-outline' }
  ];

  constructor(
    private superAdminService: SuperAdminService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const bankId = +params['id'];
      if (bankId) {
        this.loadBankDetails(bankId);
      }
    });
  }

  loadBankDetails(bankId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.superAdminService.getBankById(bankId).subscribe({
      next: (response) => {
        if (response.success) {
          this.bank = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load bank details';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bank details:', error);
        this.errorMessage = 'An error occurred while loading bank details';
        this.isLoading = false;
      }
    });
  }

  deleteBank(): void {
    if (!this.bank) return;

    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.bank) return;

    this.isDeletingBank = true;
    this.superAdminService.deleteBank(this.bank.bankId).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/super-admin/banks']);
        } else {
          this.errorMessage = response.message || 'Failed to delete bank';
        }
        this.isDeletingBank = false;
        this.showDeleteModal = false;
      },
      error: (error) => {
        console.error('Error deleting bank:', error);
        this.errorMessage = 'An error occurred while deleting the bank';
        this.isDeletingBank = false;
        this.showDeleteModal = false;
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  getPerformanceIndicator(totalClients: number, totalUsers: number): { label: string; class: string } {
    const clientsPerUser = totalUsers > 0 ? totalClients / totalUsers : 0;

    if (clientsPerUser >= 5) {
      return { label: 'High Performance', class: 'bg-green-100 text-green-800' };
    } else if (clientsPerUser >= 2) {
      return { label: 'Medium Performance', class: 'bg-orange-100 text-orange-800' };
    } else {
      return { label: 'Low Performance', class: 'bg-red-100 text-red-800' };
    }
  }

  getBankInitials(name: string): string {
    return name?.split(' ')?.map(word => word[0])?.join('')?.toUpperCase()?.substring(0, 2) || 'BN';
  }

  refreshData(): void {
    if (this.bank) {
      this.loadBankDetails(this.bank.bankId);
    }
  }
}
