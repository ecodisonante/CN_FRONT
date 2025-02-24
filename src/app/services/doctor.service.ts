// src/app/services/doctor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Doctor {
  id?: number;
  name: string;
  speciality: string;
  email: string;
  isAdmin?: boolean; // Hacemos isAdmin opcional
}

// Interfaz específica para la creación de doctores
export interface CreateDoctorDTO {
  name: string;
  speciality: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctor/getAll`);
  }

  getDoctorByEmail(email: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/doctor/getDoctor/${email}`);
  }

  addDoctor(doctor: CreateDoctorDTO): Observable<Doctor> {
    return this.http.post<Doctor>(`${this.apiUrl}/doctor/add`, doctor);
  }

  deleteDoctor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/doctor/delete/${id}`);
  }
}