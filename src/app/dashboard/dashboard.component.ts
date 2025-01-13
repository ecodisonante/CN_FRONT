import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';

interface Doctor {
  id: number;
  name: string;
  speciality: string;
  email: string;
  isAdmin: boolean;
}

interface Patient {
  id: number;
  idDoctor: number;
  name: string;
  state: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  currentDate: string = new Date().toLocaleString();
  loading: boolean = true;
  error: string | null = null;
  private dateInterval: any;
  private dataLoadAttempts = 0;
  private maxAttempts = 3;

  constructor(
    private http: HttpClient,
    private router: Router,
    private msalService: MsalService
  ) {}

  ngOnInit() {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      console.log('No hay cuenta activa, redirigiendo a login...');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Cuenta activa encontrada:', account);
    console.log('Token en localStorage:', localStorage.getItem('access_token'));

    this.loadData();
    
    // Actualizar fecha
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date().toLocaleString();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
  }

  loadData() {
    if (this.dataLoadAttempts >= this.maxAttempts) {
      this.error = 'Error al cargar los datos después de varios intentos';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;
    this.dataLoadAttempts++;

    console.log(`Intento ${this.dataLoadAttempts} de cargar datos`);

    // Cargar doctores
    this.http.get<Doctor[]>('http://localhost:8084/doctor/getAll').subscribe({
      next: (doctors) => {
        console.log('Doctores cargados:', doctors);
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar doctores:', error);
        if (error.status === 401) {
          console.log('Error de autenticación, redirigiendo a login...');
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error al cargar la información de doctores';
          this.loading = false;
        }
      }
    });

    // Cargar pacientes
    this.http.get<Patient[]>('http://localhost:8084/patient/getAll').subscribe({
      next: (patients) => {
        console.log('Pacientes cargados:', patients);
        this.patients = patients;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        if (error.status === 401) {
          console.log('Error de autenticación, redirigiendo a login...');
          this.router.navigate(['/login']);
        } else {
          this.error = 'Error al cargar la información de pacientes';
          this.loading = false;
        }
      }
    });
  }

  getPatientsByDoctor(doctorId: number): Patient[] {
    return this.patients.filter(patient => patient.idDoctor === doctorId);
  }

  logout() {
    localStorage.removeItem('access_token');
    this.msalService.logoutPopup().subscribe({
      next: () => {
        console.log('Logout exitoso');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en logout:', error);
      }
    });
  }
  get criticalPatientsCount(): number {
    return this.patients.filter(p => p.state === 'CRITICAL').length;
  }
  refreshData() {
    this.dataLoadAttempts = 0; // Reset intentos
    this.loadData();
  }
}