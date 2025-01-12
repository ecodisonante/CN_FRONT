import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, lastValueFrom, Observable } from 'rxjs';
import { MsalService } from '@azure/msal-angular';

export interface AlertaMedica {
  idAlerta?: number; // Opcional, ya que se genera en el backend
  nombrePaciente: string;
  tipoAlerta: string;
  nivelAlerta: string;
  fechaAlerta: string;
}

@Injectable({
  providedIn: 'root',
})
export class AlertaService {
  private readonly apiUrl = 'http://localhost:8080/api/alertas';


  constructor(private readonly http: HttpClient) { }

  getToken() {
    return localStorage.getItem('access_token');
  }


  obtenerAlertas(): Observable<AlertaMedica[]> {
    return this.http.get<AlertaMedica[]>(this.apiUrl);
  }

  guardarAlerta(alerta: AlertaMedica): Observable<AlertaMedica> {
    return this.http.post<AlertaMedica>(this.apiUrl, alerta);
  }

  actualizarAlerta(id: number, alerta: AlertaMedica): Observable<AlertaMedica> {
    return this.http.put<AlertaMedica>(`${this.apiUrl}/${id}`, alerta);
  }

  eliminarAlerta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}



