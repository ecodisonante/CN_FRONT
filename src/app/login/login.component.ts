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
    console.log('Iniciando componente de login...');
    this.checkAccount();
  }

  private checkAccount(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    console.log('Cuentas encontradas:', accounts);
    this.isLoggedIn = accounts.length > 0;
    
    if (this.isLoggedIn) {
      console.log('Usuario ya está logueado, redirigiendo a dashboard...');
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.router.navigate(['/dashboard']);
    }
  }

  async login() {
    console.log('Iniciando proceso de login...');
    
    try {
      // 1. Primero hacemos el login para obtener el idToken
      const loginRequest = {
        scopes: ['openid', 'profile', 'offline_access'],
        authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_login_native'
      };

      const loginResponse = await this.msalService.loginPopup(loginRequest).toPromise();
      console.log('Login inicial exitoso:', loginResponse);

      if (loginResponse) {
        // 2. Después solicitamos el token de acceso específicamente
        const silentRequest = {
          account: loginResponse.account,
          scopes: ['https://duocazurenative.onmicrosoft.com/api/user.read'],
          authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_login_native'
        };

        try {
          const silentResult = await this.msalService.acquireTokenSilent(silentRequest).toPromise();
          console.log('Token de acceso obtenido:', silentResult);
          
          if (silentResult?.accessToken) {
            localStorage.setItem('access_token', silentResult.accessToken);
            console.log('Token guardado en localStorage');
          }
        } catch (error) {
          console.error('Error obteniendo token silencioso:', error);
          // Si falla el silent, intentamos con popup
          const popupResult = await this.msalService.acquireTokenPopup(silentRequest).toPromise();
          if (popupResult?.accessToken) {
            localStorage.setItem('access_token', popupResult.accessToken);
          }
        }

        this.msalService.instance.setActiveAccount(loginResponse.account);
        this.isLoggedIn = true;
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage = (error as any)?.errorMessage;

      if (errorMessage?.includes('AADB2C90118')) {
        this.resetPassword();
      } else {
        this.loginError = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      }
    }
  }

  resetPassword() {
    console.log('Iniciando proceso de reset de contraseña...');
    const passwordResetRequest = {
      scopes: ['openid', 'profile'],
      authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_password_reset'
    };

    this.msalService.loginPopup(passwordResetRequest)
      .subscribe({
        next: () => {
          console.log('Reset de contraseña exitoso, redirigiendo al login normal...');
          this.login();
        },
        error: (error) => {
          console.error('Error en reset de contraseña:', error);
          this.loginError = 'Error en la recuperación de contraseña.';
        }
      });
  }

  logout() {
    console.log('Iniciando proceso de logout...');
    localStorage.removeItem('access_token');
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout exitoso');
        this.isLoggedIn = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en logout:', error);
      }
    });
  }
}