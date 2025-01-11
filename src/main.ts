import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// MSAL
import { MsalModule } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';

(async () => {
  // 1) Creas tu instancia de MSAL:
  const pca = new PublicClientApplication({
    auth: {
      clientId: '0f3e837c-a515-4143-a08c-9bc776fdc0a4',
      authority: 'https://duocazurenative.b2clogin.com/duocazurenative.onmicrosoft.com/B2C_1_login_native',
      redirectUri: 'http://localhost:4200',
      knownAuthorities: ['duocazurenative.b2clogin.com']
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  });

  // 2) Esperas su inicialización
  await pca.initialize();

  // 3) Ahora sí importas MsalModule con esa instancia
  bootstrapApplication(AppComponent, {
    providers: [
      ...appConfig.providers,
      provideHttpClient(),
      importProvidersFrom(
        BrowserModule,
        MsalModule.forRoot(
          pca,
          {
            interactionType: InteractionType.Redirect, // Cambiado a Redirect
            authRequest: { 
              scopes: ['openid', 'profile']
            },
          },
          {
            interactionType: InteractionType.Redirect,
            protectedResourceMap: new Map([
              ['https://graph.microsoft.com/v1.0/me', ['user.read']],
            ]),
          }
        )
      ),
    ]
  })
    .catch(err => console.error(err));
})();