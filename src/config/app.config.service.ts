import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private apiUrl: string;

  constructor() {
    // Intentar obtener la URL del objeto ENV, si no existe usar el valor por defecto
    const envApiUrl = (window as any)?.ENV?.apiUrl;
    this.apiUrl = envApiUrl && envApiUrl !== '/* @echo API_URL */' ? envApiUrl : 'http://localhost:8084';
    console.log('API URL configurada:', this.apiUrl);
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}