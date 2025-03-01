import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private readonly apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private readonly http: HttpClient) { }

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
