import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationResult } from '@azure/msal-browser';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  title = 'Sistema - Alertas';
  isLoggedIn = false;
  loginError: string = '';

  constructor(private msalService: MsalService, private router: Router) { }

  ngOnInit(): void {
    this.checkAccount();
  }

  private checkAccount(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    this.isLoggedIn = accounts.length > 0;
    
    if (this.isLoggedIn) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    const loginRequest = {
      scopes: ['openid', 'profile'],
      authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_login_native'
    };

    this.msalService.loginPopup(loginRequest)
      .subscribe({
        next: (response: AuthenticationResult) => {
          console.log('Login successful:', response);
          this.msalService.instance.setActiveAccount(response.account);
          this.isLoggedIn = true;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          // Manejo específico para recuperación de contraseña
          if (error.errorMessage.includes('AADB2C90118')) {
            // Redirigir al flujo de recuperación de contraseña
            this.resetPassword();
          } else {
            this.loginError = 'Error al iniciar sesión. Por favor, intente nuevamente.';
          }
        }
      });
  }

  resetPassword() {
    const passwordResetRequest = {
      scopes: ['openid', 'profile'],
      authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_password_reset' 
    };

    this.msalService.loginPopup(passwordResetRequest)
      .subscribe({
        next: () => {
          // Después de resetear la contraseña, volver al flujo normal de login
          this.login();
        },
        error: (error) => {
          console.error('Password reset error:', error);
          this.loginError = 'Error en la recuperación de contraseña.';
        }
      });
  }

  logout() {
    this.msalService.logoutPopup().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }
}