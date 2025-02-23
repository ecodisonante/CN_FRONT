import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, takeUntil, catchError } from 'rxjs/operators';
import { Subject, interval, of } from 'rxjs';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../environments/environment.prod';
import { MeasurementService, MeasurementDTO } from '../services/measurement.service';

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
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  measurements: MeasurementDTO[] = [];
  currentDate: string = new Date().toLocaleString();
  loading: boolean = true;
  error: string | null = null;
  selectedPatient?: Patient;
  showPatientDetail = false;
  lastUpdate: Date = new Date();
  nextUpdateIn: number = 10;
  measurementError: string | null = null;
  hasKafkaError = false;
  organizedMeasurements: Map<number, MeasurementDTO[]> = new Map();
  
  private dateInterval: any;
  private destroy$ = new Subject<void>();
  private dataLoadAttempts = 0;
  private readonly maxAttempts = 3;
  isMainDashboard = true;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly msalService: MsalService,
    private readonly measurementService: MeasurementService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isMainDashboard = event.url === '/dashboard';
    });
  }

  ngOnInit() {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadData();
    this.startAutoUpdate();
    
    this.dateInterval = setInterval(() => {
      this.currentDate = new Date().toLocaleString();
    }, 60000);
  }

  ngOnDestroy() {
    if (this.dateInterval) {
      clearInterval(this.dateInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startAutoUpdate() {
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.nextUpdateIn--;
      if (this.nextUpdateIn <= 0) {
        this.refreshData();
        this.nextUpdateIn = 10;
      }
    });
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

    const apiUrl = environment.apiUrl;
    
    // Cargar doctores
    this.http.get<Doctor[]>(`${apiUrl}/doctor/getAll`).subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });

    // Cargar pacientes
    this.http.get<Patient[]>(`${apiUrl}/patient/getAll`).subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loading = false;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  loadMeasurements() {
    if (!this.selectedPatient) return;
    
    this.measurementService.getMeasurementsByPatient(this.selectedPatient.id)
      .pipe(
        catchError(error => {
          console.error('Error al cargar mediciones:', error);
          this.measurementError = 'No se pudieron cargar las mediciones del paciente';
          return of([]);
        })
      )
      .subscribe({
        next: (measurements) => {
          this.measurements = measurements;
          this.lastUpdate = new Date();
          this.hasKafkaError = false;
          this.measurementError = null;
          
          // Organizar mediciones por tipo
          this.organizedMeasurements = this.organizeMeasurementsByType(measurements);
        }
      });
  }

  private organizeMeasurementsByType(measurements: MeasurementDTO[]): Map<number, MeasurementDTO[]> {
    const organized = new Map<number, MeasurementDTO[]>();
    
    measurements.forEach(measurement => {
      if (!organized.has(measurement.idSing)) {
        organized.set(measurement.idSing, []);
      }
      organized.get(measurement.idSing)?.push(measurement);
    });

    // Ordenar cada grupo por fecha, más reciente primero
    organized.forEach(measurementList => {
      measurementList.sort((a, b) => 
        new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
    });

    return organized;
  }

  getSignalMeasurements(signalId: number): MeasurementDTO[] {
    return this.organizedMeasurements?.get(signalId) || [];
  }
  closePatientDetail() {
    this.showPatientDetail = false;
    this.selectedPatient = undefined;
    document.body.classList.remove('modal-open');  // Importante: eliminar la clase del body
  }
  
  showPatientDetails(patient: Patient) {
    this.selectedPatient = patient;
    this.showPatientDetail = true;
    document.body.classList.add('modal-open');  // Importante: agregar la clase al body
    this.loadMeasurements();
  }

  handleError(error: any) {
    console.error('Error:', error);
    if (error.status === 401) {
      this.router.navigate(['/login']);
    } else {
      this.error = 'Error al cargar la información';
      this.loading = false;
    }
  }

  getPatientsByDoctor(doctorId: number): Patient[] {
    return this.patients.filter(patient => patient.idDoctor === doctorId);
  }

  getDoctorName(doctorId: number): string {
    const doctor = this.doctors.find(d => d.id === doctorId);
    return doctor ? doctor.name : 'No asignado';
  }

  getSignalLabel(signalId: number): string {
    switch(signalId) {
      case 1: return 'Temperatura';
      case 2: return 'Frecuencia Cardíaca';
      case 3: return 'Presión Arterial';
      case 4: return 'Frecuencia Respiratoria';
      case 5: return 'Saturación de Oxígeno';
      default: return 'Desconocido';
    }
  }

  getSignalUnit(signalId: number): string {
    switch(signalId) {
      case 1: return '°C';
      case 2: return 'bpm';
      case 3: return 'mmHg';
      case 4: return 'rpm';
      case 5: return '%';
      default: return '';
    }
  }

  isAlertValue(measurement: MeasurementDTO): boolean {
    const { value, threshold } = this.getThresholdForSignal(measurement.idSing);
    return Math.abs(measurement.measurementValue - value) > threshold;
  }

  private getThresholdForSignal(signalId: number): { value: number, threshold: number } {
    switch(signalId) {
      case 1: return { value: 37, threshold: 1.5 }; // Temperatura
      case 2: return { value: 80, threshold: 20 }; // Frecuencia Cardíaca
      case 3: return { value: 120, threshold: 20 }; // Presión Arterial
      case 4: return { value: 16, threshold: 4 }; // Frecuencia Respiratoria
      case 5: return { value: 95, threshold: 8 }; // Saturación de Oxígeno
      default: return { value: 0, threshold: 5 };
    }
  }

  get criticalPatientsCount(): number {
    return this.patients.filter(p => p.state === 'Crítico').length;
  }

  get criticalMeasurementsCount(): number {
    return this.measurements.filter(m => this.isAlertValue(m)).length;
  }

  refreshData() {
    this.dataLoadAttempts = 0;
    this.loadData();
  }

  logout() {
    localStorage.removeItem('access_token');
    this.msalService.logoutPopup().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error en logout:', error);
      }
    });
  }
}