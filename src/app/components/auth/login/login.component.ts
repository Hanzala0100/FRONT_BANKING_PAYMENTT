import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PersistenceService } from '../../../core/services/persistence.service';
import { UserStateService } from '../../../core/services/user-state.service';
import { RecaptchaService, BaseResponseDTO } from '../../../core/services/recaptcha.service';
import { RecaptchaComponent } from '../../auth/recaptcha/recaptcha.component';
import { LoginRequest } from '../../../shared/models/Auth.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, RecaptchaComponent]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  recaptchaError = '';
  recaptchaToken: string | null = null;

  @ViewChild(RecaptchaComponent) recaptchaComponent!: RecaptchaComponent;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private persistenceService: PersistenceService,
    private userStateService: UserStateService,
    private recaptchaService: RecaptchaService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    const token = this.persistenceService.get('token');
    if (token) {
      this.redirectBasedOnRole();
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';
    this.recaptchaError = '';

    // Validate form
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    // For v2, we check if reCAPTCHA is verified
    if (!this.recaptchaComponent.isVerified()) {
      this.recaptchaError = 'Please complete the security verification by clicking "I\'m not a robot"';
      return;
    }

    if (!this.isLoading) {
      await this.performLogin();
    }
  }

  private async performLogin(): Promise<void> {
    this.isLoading = true;

    try {
      // Get the reCAPTCHA token
      const recaptchaToken = await this.recaptchaComponent.execute();
      this.recaptchaToken = recaptchaToken;
      
      // Verify reCAPTCHA with backend - now using BaseResponseDTO
      const recaptchaResult = await this.recaptchaService.verifyToken(recaptchaToken).toPromise();
      
      // Check both the response success and the data (which is the actual verification result)
      if (!recaptchaResult?.success || !recaptchaResult.data) {
        this.recaptchaError = recaptchaResult?.message || 'Security verification failed. Please try again.';
        this.resetRecaptcha();
        this.isLoading = false;
        return;
      }

      // Proceed with login
      const loginRequest: LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value,
        recaptchaToken: recaptchaToken
      };

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          if (response.success) {
            console.log(response.data.user.role, " role after login");
            this.persistenceService.set('token', response.data.token.accessToken);
            this.persistenceService.set('user', response.data.user);
            this.persistenceService.set('tokenExpiry', response.data.token.expiry);
            this.userStateService.setCurrentUser(response.data.user);
            this.redirectBasedOnRole(response.data.user.role);
          } else {
            this.errorMessage = response.message || 'Login failed. Please try again.';
            this.resetRecaptcha();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = this.getErrorMessageFromResponse(error);
          this.resetRecaptcha();
          this.isLoading = false;
        }
      });

    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      this.recaptchaError = 'Security verification failed. Please try again.';
      this.isLoading = false;
    }
  }

  // reCAPTCHA Event Handlers
  onRecaptchaVerified(token: string): void {
    console.log('reCAPTCHA verified in login component');
    this.recaptchaToken = token;
    this.recaptchaError = '';
    this.errorMessage = '';
    
    // Auto-submit form if credentials are valid and reCAPTCHA is verified
    if (this.loginForm.valid && !this.isLoading) {
      this.performLogin();
    }
  }

  onRecaptchaError(error: string): void {
    this.recaptchaToken = null;
    this.recaptchaError = error;
  }

  onRecaptchaExpired(): void {
    this.recaptchaToken = null;
    this.recaptchaError = 'Security verification expired. Please verify again.';
  }

  private resetRecaptcha(): void {
    this.recaptchaToken = null;
    if (this.recaptchaComponent) {
      this.recaptchaComponent.reset();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private redirectBasedOnRole(role?: string): void {
    const user = this.persistenceService.get('user') as any;
    const userRole = role || user?.role;

    switch (userRole) {
      case 'SuperAdmin':
        this.router.navigate(['/super-admin']);
        break;
      case 'BankUser':
        this.router.navigate(['/bank-user']);
        break;
      case 'ClientUser':
        this.router.navigate(['/client-user']);
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  // Helper method to extract error message from different response formats
  private getErrorMessageFromResponse(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.errors && error.error.errors.length > 0) {
      return error.error.errors[0];
    }
    if (error.message) {
      return error.message;
    }
    return 'An error occurred during login. Please try again.';
  }
}