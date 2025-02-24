// src/app/services/measurement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface MeasurementDTO {
  id: number;
  idPatient: number;
  idSing: number;
  measurementValue: number;
  dateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {
  constructor(private http: HttpClient) {}

 /*() getMeasurementsByPatient(patientId: number): Observable<MeasurementDTO[]> {
    
    return this.http.get<MeasurementDTO[]>(`${environment.apiUrl}/measurement/getMeasurements/${patientId}`);
  }*/

    getLatestMeasurements(): Observable<MeasurementDTO[]> {
      return this.http.get<MeasurementDTO[]>(`${environment.apiUrl}/kafka/measurements`);
    }

  saveMeasurement(measurement: Omit<MeasurementDTO, 'id'>): Observable<MeasurementDTO> {
    return this.http.post<MeasurementDTO>(`${environment.apiUrl}/measurement/add`, measurement);
  }
}