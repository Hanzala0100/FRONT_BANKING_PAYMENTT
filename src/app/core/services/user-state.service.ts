import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PersistenceService } from './persistence.service';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentUser$: Observable<any> = this.currentUserSubject.asObservable();

  constructor(private persistenceService: PersistenceService) {
    this.loadUserFromStorage();
  }

  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: any): void {
    this.currentUserSubject.next(user);
    this.persistenceService.set('user', user);
  }

  clearUser(): void {
    this.currentUserSubject.next(null);
    this.persistenceService.remove('user');
    this.persistenceService.remove('token');
    this.persistenceService.remove('tokenExpiry');
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    this.persistenceService.remove('user');
  }

  private loadUserFromStorage(): void {
    const user = this.persistenceService.get('user');
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  // Method to refresh user data (useful after profile updates)
  refreshUser(): void {
    this.loadUserFromStorage();
  }

  refreshUserState(): void {
    this.loadUserFromStorage();
  }

  // Helper method to check if user has a specific role
  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user && user.role === role;
  }

  // Helper method to check if user belongs to a bank
  hasBankAccess(): boolean {
    const user = this.currentUser;
    return user && (user.bankName || user.bankId || user.role === 'BankAdmin');
  }

  // Helper method to check if user belongs to a client
  hasClientAccess(): boolean {
    const user = this.currentUser;
    return user && (user.clientName || user.clientId || user.role === 'Client');
  }
}
