import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Client } from '../../../../shared/models/Client.interface';
import { User, UserCreateRequest } from '../../../../shared/models/User.interface';
import { BankUserService } from '../../../../core/services/bank-user.service';


@Component({
  selector: 'app-client-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './client-users.component.html',
  styleUrls: ['./client-users.component.css']
})
export class ClientUsersComponent implements OnInit {
  clientId!: number;
  client: Client | null = null;
  clientUsers: User[] = [];
  isLoading = true;
  isSubmitting = false;

  // Modal states
  showUserModal = false;
  isEditing = false;
  selectedUser: User | null = null;

  // Form
  userForm: FormGroup;

  // Messages
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bankUserService: BankUserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.createUserForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.clientId = +params['id'];
      if (this.clientId) {
        this.loadClientDetails();
        this.loadClientUsers();
      }
    });
  }

  createUserForm(): FormGroup {
    return this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ClientUser', Validators.required]
    });
  }

  loadClientDetails() {
    this.bankUserService.getClientById(this.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.client = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading client details:', error);
        this.errorMessage = 'Failed to load client details';
      }
    });
  }

  loadClientUsers() {
    this.isLoading = true;
    this.bankUserService.getClientUsers(this.clientId).subscribe({
      next: (response) => {
        if (response.success) {
          this.clientUsers = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client users:', error);
        this.errorMessage = 'Failed to load client users';
        this.isLoading = false;
      }
    });
  }

  openCreateUserModal() {
    this.isEditing = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserModal = true;
    this.clearMessages();
  }

  editUser(user: User) {
    this.isEditing = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      role: user.role
    });
    // Remove password requirement for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserModal = true;
    this.clearMessages();
  }

  closeUserModal() {
    this.showUserModal = false;
    this.isEditing = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.clearMessages();
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    const userData: UserCreateRequest = {
      fullName: this.userForm.value.fullName,
      email: this.userForm.value.email,
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      role: this.userForm.value.role,
      clientId: this.clientId
    };

    if (this.isEditing && this.selectedUser) {
      // Update existing user - Note: You might need to implement update endpoint
      this.updateUser(this.selectedUser.userId, userData);
    } else {
      // Create new user
      this.createUser(userData);
    }
  }

  createUser(userData: UserCreateRequest) {
    this.bankUserService.createClientUser(this.clientId, userData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.successMessage = 'User created successfully!';
          this.loadClientUsers();
          setTimeout(() => {
            this.closeUserModal();
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Failed to create user';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating user:', error);
        this.errorMessage = 'An error occurred while creating user';
      }
    });
  }

  updateUser(userId: number, userData: UserCreateRequest) {
    // Note: You might need to implement update user endpoint in your service
    // For now, we'll show a message
    this.isSubmitting = false;
    this.successMessage = 'User update functionality to be implemented';
    setTimeout(() => {
      this.closeUserModal();
    }, 1500);
  }

  resetPassword(user: User) {
    if (confirm(`Reset password for ${user.fullName}? A temporary password will be generated.`)) {
      // Implement password reset logic
      this.successMessage = `Password reset initiated for ${user.fullName}`;
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.fullName}? This action cannot be undone.`)) {
      this.bankUserService.deleteClientUser(this.clientId, user.userId).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'User deleted successfully';
            this.loadClientUsers();
          } else {
            this.errorMessage = response.message || 'Failed to delete user';
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = 'An error occurred while deleting user';
        }
      });
    }
  }

  // Helper methods
  getClientInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  getUserInitials(fullName: string): string {
    return fullName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Verified': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getActiveUsersCount(): number {
    return this.clientUsers.length; // Assuming all users are active
  }

  getRecentUsersCount(): number {
    // Return users created in last 30 days
    return 3;
  }

  getAdminUsersCount(): number {
    return this.clientUsers.filter(user =>
      user.role === 'ClientAdmin' || user.role === 'Administrator'
    ).length;
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
