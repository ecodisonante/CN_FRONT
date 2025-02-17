import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment';

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
  imports: [CommonModule, RouterModule]  // Añade RouterModule aquí
})
export class DashboardComponent implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  currentDate: string = new Date().toLocaleString();
  loading: boolean = true;
  error: string | null = null;
  private dateInterval: any;
  private dataLoadAttempts = 0;
  private readonly maxAttempts = 3;
  isMainDashboard = true;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly msalService: MsalService,

  ) {


    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Actualizar isMainDashboard basado en la ruta actual
      this.isMainDashboard = event.url === '/dashboard';
    });
  
  }

  ngOnInit() {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      console.log('No hay cuenta activa, redirigiendo a login...');
      this.router.navigate(['/login']);
      return;
    }
    // Añade estas líneas para depuración
    console.log('Cuenta activa:', account);
    console.log('ID Token:', account.idToken);
    console.log('Access Token en localStorage:', localStorage.getItem('access_token'));
    // También puedes obtener el token actual así:
    this.msalService.instance.acquireTokenSilent({
      scopes: ['openid', 'profile'],
      account: account
    }).then(response => {
      console.log('Token actual:', response.accessToken);
    });

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
    const apiUrl = environment.apiUrl;
    // Cargar doctores
    this.http.get<Doctor[]>(`${apiUrl}/doctor/getAll`).subscribe({
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
    this.http.get<Patient[]>(`${apiUrl}/patient/getAll`).subscribe({
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
    return this.patients.filter(p => p.state === 'Crítico').length;
  }
  refreshData() {
    this.dataLoadAttempts = 0; // Reset intentos
    this.loadData();
  }
}