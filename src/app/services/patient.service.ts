// src/app/services/patient.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Patient {
  id?: number;
  idDoctor: number;
  name: string;
  state: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = `${environment.apiUrl}/patient`;

  constructor(private http: HttpClient) {}

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/getAll`);
  }

  getPatientsByDoctor(doctorId: number): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/getpatients/${doctorId}`);
  }

  addPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/add`, patient);
  }

  updatePatient(patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/update`, patient);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}