import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';
import { MsalModule } from '@azure/msal-angular'; // MSAL
import {
  PublicClientApplication,
  InteractionType,
  BrowserCacheLocation,
  LogLevel
} from '@azure/msal-browser';

const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

(async () => {
  const msalConfig = {
    auth: {
      clientId: '0f3e837c-a515-4143-a08c-9bc776fdc0a4',
      authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_login_native',
      // redirectUri: window.location.origin, // Esto tomará la URL base automáticamente
      redirectUri: environment.azureRedirectUri,

      knownAuthorities: ['duocazurenative.b2clogin.com'],
      postLogoutRedirectUri: environment.azureRedirectUri,
      navigateToLoginRequestUrl: true
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: isIE
    },
    system: {
      loggerOptions: {
        loggerCallback: (level: LogLevel, message: string) => {
          console.log(message);
        },
        logLevel: LogLevel.Verbose,
        piiLoggingEnabled: false
      }
    }
  };

  // Inicializar MSAL
  const pca = new PublicClientApplication(msalConfig);
  await pca.initialize();

  // Importar MsalModule con la configuración
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      provideHttpClient(),
      importProvidersFrom(
        BrowserModule,
        MsalModule.forRoot(
          pca,
          {
            interactionType: InteractionType.Popup,
            authRequest: {
              scopes: ['openid', 'profile', 'offline_access']
            }
          },
          {
            interactionType: InteractionType.Popup,
            protectedResourceMap: new Map([
              [environment.apiUrl, ['openid', 'profile']]
            ])
          }
        )
      )
    ]
  }).catch(err => console.error(err));
})();
