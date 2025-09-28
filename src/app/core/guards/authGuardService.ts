import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { PersistenceService } from '../services/persistence.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private persistenceService: PersistenceService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    const token = this.persistenceService.get('token') as string;

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }


    if (this.isTokenExpired(token)) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);


      return payload.exp < currentTime;
    } catch (error) {

      console.error('Error decoding token:', error);
      return true;
    }
  }


}
