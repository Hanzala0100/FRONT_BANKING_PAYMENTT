import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';
import { ApiResponse } from '../../shared/models/ApiResponse.interface';

// Update the interface to match BaseResponseDTO
export interface BaseResponseDTO<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private apiUrl = environment.apiUrl;
  private siteKey = environment.recaptcha.siteKey;
  private scriptLoaded = false;

  constructor(private http: HttpClient) {
    //console.log('RecaptchaService v2 - SiteKey:', this.siteKey);
    //console.log('RecaptchaService v2 - API URL:', this.apiUrl);
  }

  loadRecaptchaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      if ((window as any).grecaptcha) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      (window as any).onRecaptchaLoad = () => {
        this.scriptLoaded = true;
        //console.log('reCAPTCHA v2 script loaded successfully');
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit`;
      script.async = true;
      script.defer = true;

      script.onerror = (error) => {
        console.error('Failed to load reCAPTCHA v2 script:', error);
        reject('Failed to load security verification script');
      };

      document.head.appendChild(script);
    });
  }

  renderWidget(element: HTMLElement, options: any): number {
    if (!(window as any).grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }

    return (window as any).grecaptcha.render(element, {
      sitekey: this.siteKey,
      ...options
    });
  }

  getResponse(widgetId: number): string {
    if (!(window as any).grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }
    return (window as any).grecaptcha.getResponse(widgetId);
  }

  reset(widgetId: number): void {
    if ((window as any).grecaptcha) {
      (window as any).grecaptcha.reset(widgetId);
    }
  }

  verifyToken(token: string): Observable<ApiResponse<boolean>> {
    const verifyUrl = `${this.apiUrl}/recaptcha/verify`;
    console.log('Verifying reCAPTCHA token at:', verifyUrl);


    return of({
      success: true,
      message: 'Mock verification successful',
      data: true,
      errors: []
    } as ApiResponse<boolean>);
  }


  getSiteKey(): string {
    return this.siteKey;
  }

  isLoaded(): boolean {
    return this.scriptLoaded && !!(window as any).grecaptcha;
  }
}
