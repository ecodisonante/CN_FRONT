import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private msalService: MsalService, private router: Router) { }

  canActivate(): boolean {
    const account = this.msalService.instance.getActiveAccount();

    if (account) {
      return true;
    } else {
      console.warn('No active account found, redirecting to login.');
      this.router.navigate(['/']);
      return false;
    }
  }
}
