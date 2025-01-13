// src/app/interceptors/auth.interceptor.ts

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private msalService: MsalService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Interceptando request a:', request.url);
    
    const token = localStorage.getItem('access_token');
    const idToken = this.msalService.instance.getActiveAccount()?.idToken;
    
    // Usar idToken si no hay accessToken (temporalmente)
    const authToken = token || idToken;

    if (authToken) {
      console.log('Token encontrado, añadiendo a la request');
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    } else {
      console.warn('No se encontró token de autenticación');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error en interceptor:', error);
        if (error.status === 401) {
          console.log('Error 401, redirigiendo a login...');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}