import { Component, Output, EventEmitter, OnInit, OnDestroy, input, viewChild, ElementRef } from '@angular/core';
import { RecaptchaService } from '../../../core/services/recaptcha.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recaptcha',
  imports: [CommonModule],
  templateUrl: './recaptcha.component.html',
})
export class RecaptchaComponent implements OnInit, OnDestroy {
  @Output() verified = new EventEmitter<string>();
  @Output() errored = new EventEmitter<string>();
  @Output() expired = new EventEmitter<void>();

  // Input properties for customization
  size = input<'normal' | 'compact'>('normal');
  theme = input<'light' | 'dark'>('light');
  tabindex = input<number>(0);
  
  // Component state
  error: string = '';
  isLoading: boolean = true;
  private widgetId: number | null = null;

  // Template reference
  recaptchaContainer = viewChild.required<ElementRef<HTMLDivElement>>('recaptchaContainer');

  constructor(private recaptchaService: RecaptchaService) {}

  async ngOnInit() {
    await this.initializeRecaptcha();
  }

  ngOnDestroy() {
    this.cleanupRecaptcha();
  }

  private async initializeRecaptcha() {
    try {
      await this.recaptchaService.loadRecaptchaScript();
      this.renderRecaptchaWidget();
    } catch (error) {
      this.handleError('Failed to load security verification');
    }
  }

  private renderRecaptchaWidget() {
    const grecaptcha = (window as any).grecaptcha;
    
    if (!grecaptcha) {
      this.handleError('Security service not available');
      return;
    }

    // Use grecaptcha.ready to ensure API is fully loaded
    grecaptcha.ready(() => {
      try {
        this.widgetId = this.recaptchaService.renderWidget(
          this.recaptchaContainer().nativeElement,
          {
            size: this.size(),
            theme: this.theme(),
            tabindex: this.tabindex(),
            callback: (token: string) => this.onVerify(token),
            'expired-callback': () => this.onExpired(),
            'error-callback': () => this.onError()
          }
        );
        this.isLoading = false;
        console.log('reCAPTCHA v2 widget rendered with ID:', this.widgetId);
      } catch (error) {
        console.error('Error rendering reCAPTCHA widget:', error);
        this.handleError('Failed to initialize security verification');
      }
    });
  }

  private onVerify(token: string) {
    console.log('reCAPTCHA verified with token:', token);
    this.error = '';
    this.verified.emit(token);
  }

  private onExpired() {
    console.log('reCAPTCHA verification expired');
    this.error = 'Security verification expired. Please verify again.';
    this.expired.emit();
  }

  private onError() {
    console.error('reCAPTCHA verification error');
    this.handleError('Security verification failed. Please try again.');
  }

  private handleError(errorMessage: string) {
    this.error = errorMessage;
    this.errored.emit(this.error);
    this.isLoading = false;
  }

  /**
   * Execute reCAPTCHA verification
   * For v2, this checks if the user has completed the challenge
   */
  async execute(): Promise<string> {
    if (this.widgetId === null) {
      throw new Error('Security verification not ready');
    }

    try {
      const token = this.recaptchaService.getResponse(this.widgetId);
      
      if (token) {
        console.log('reCAPTCHA token retrieved:', token);
        return token;
      } else {
        this.error = 'Please complete the security verification by clicking "I\'m not a robot"';
        throw new Error(this.error);
      }
    } catch (error) {
      console.error('Error executing reCAPTCHA:', error);
      this.handleError('Security verification failed');
      throw error;
    }
  }

  /**
   * Reset the reCAPTCHA widget
   */
  reset() {
    this.error = '';
    if (this.widgetId !== null) {
      this.recaptchaService.reset(this.widgetId);
      console.log('reCAPTCHA widget reset');
    }
  }

  /**
   * Check if reCAPTCHA is verified
   */
  isVerified(): boolean {
    if (this.widgetId === null) return false;
    
    try {
      const token = this.recaptchaService.getResponse(this.widgetId);
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get current verification status
   */
  getStatus(): 'loading' | 'ready' | 'verified' | 'error' {
    if (this.isLoading) return 'loading';
    if (this.error) return 'error';
    if (this.isVerified()) return 'verified';
    return 'ready';
  }

  private cleanupRecaptcha() {
    this.widgetId = null;
  }
}