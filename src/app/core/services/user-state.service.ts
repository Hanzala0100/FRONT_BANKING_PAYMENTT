import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../shared/models/User.interface';
import { PersistenceService } from './persistence.service';

@Injectable({
    providedIn: 'root'
})
export class UserStateService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

    constructor(private persistenceService: PersistenceService) {
        this.initializeUserState();
    }

    // Observable for components to subscribe to user changes
    get currentUser$(): Observable<User | null> {
        return this.currentUserSubject.asObservable();
    }

    // Observable for authentication state
    get isAuthenticated$(): Observable<boolean> {
        return this.isAuthenticatedSubject.asObservable();
    }

    // Get current user synchronously
    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    // Get authentication state synchronously
    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    // Initialize user state from localStorage
    private initializeUserState(): void {
        const userData = this.persistenceService.get('user') as User;
        const token = this.persistenceService.get('token') as string;

        if (userData && token) {
            this.setUser(userData);
            this.setAuthenticated(true);
        } else {
            this.clearUser();
        }
    }

    // Set user data and notify all subscribers
    setUser(user: User): void {
        this.currentUserSubject.next(user);
        this.persistenceService.set('user', user);
    }

    // Clear user data and notify all subscribers
    clearUser(): void {
        this.currentUserSubject.next(null);
        this.setAuthenticated(false);
        this.persistenceService.delete('user');
        this.persistenceService.delete('token');
        this.persistenceService.delete('tokenExpiry');
    }

    // Set authentication state
    setAuthenticated(isAuthenticated: boolean): void {
        this.isAuthenticatedSubject.next(isAuthenticated);
    }

    // Update user data (useful for profile updates)
    updateUser(updatedUser: Partial<User>): void {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
            const newUser = { ...currentUser, ...updatedUser };
            this.setUser(newUser);
        }
    }

    // Method to refresh user state from localStorage
    refreshUserState(): void {
        this.initializeUserState();
    }

    // Check if user has specific role
    hasRole(role: string): boolean {
        return this.currentUser?.role === role;
    }

    // Check if user belongs to a bank
    hasBankAccess(): boolean {
        return !!(this.currentUser?.bankId && this.currentUser?.bankName);
    }

    // Check if user belongs to a client
    hasClientAccess(): boolean {
        return !!(this.currentUser?.clientId && this.currentUser?.clientName);
    }
}