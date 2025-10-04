import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { ClientUserService } from '../services/client-user.service';
import { UserStateService } from '../services/user-state.service';
import { VerificationStatus } from '../../shared/enums/Verification-status.enum';

@Injectable({
  providedIn: 'root'
})
export class ClientVerificationGuard implements CanActivate {

  constructor(
    private clientUserService: ClientUserService,
    private userStateService: UserStateService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean> {
    const currentUser = this.userStateService.currentUser;

    if (!currentUser || !currentUser.clientId) {
      this.router.navigate(['/login']);
      return of(false);
    }

    return this.clientUserService.getClientById(currentUser.clientId).pipe(
      map(response => {
        if (response.success && response.data) {
          const client = response.data;

          if (client.verificationStatus === VerificationStatus.Verified) {
            return true;
          } else {
            // Redirect to documents if not verified
            this.router.navigate(['/client-user/documents']);
            return false;
          }
        }
        this.router.navigate(['/login']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
