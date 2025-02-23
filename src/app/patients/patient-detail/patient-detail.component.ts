import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../services/patient.service';
import { MeasurementService, MeasurementDTO } from '../../services/measurement.service';
import { SignalType, SIGNAL_THRESHOLDS } from '../../interfaces/medical-types';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">
            <i class="bi bi-person-lines-fill me-2"></i>
            Signos Vitales en Tiempo Real - {{patient?.name}}
          </h5>
          <button type="button" class="btn-close btn-close-white" (click)="close()"></button>
        </div>
        <div class="modal-body">
          <!-- Filtros -->
          <div class="row mb-3">
            <div class="col-md-4">
              <select class="form-select" [(ngModel)]="selectedSignal" (ngModelChange)="applyFilters()">
                <option [ngValue]="null">Todos los signos vitales</option>
                <option *ngFor="let signal of signalTypes" [value]="signal">
                  {{getSignalDescription(signal)}}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Buscar..." 
                       [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()">
              </div>
            </div>
            <div class="col-md-4 text-end">
              <small class="text-muted">
                Última actualización: {{lastUpdate | date:'medium'}}
                <br>
                Próxima actualización en {{nextUpdateIn}} segundos
              </small>
            </div>
          </div>

          <!-- Tabla de mediciones -->
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Tipo de Señal</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let measurement of filteredMeasurements">
                  <td>{{getSignalDescription(measurement.idSing)}}</td>
                  <td>
                    {{measurement.measurementValue}} {{getSignalUnit(measurement.idSing)}}
                  </td>
                  <td>
                    <span [class]="getAlertClass(measurement)">
                      {{getAlertStatus(measurement)}}
                    </span>
                  </td>
                  <td>{{measurement.dateTime | date:'medium'}}</td>
                </tr>
                <tr *ngIf="filteredMeasurements.length === 0">
                  <td colspan="4" class="text-center">
                    No hay mediciones disponibles
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Resumen de Alertas -->
          <div class="row mt-4">
            <div class="col-12">
              <h6>Resumen de Alertas</h6>
              <div class="d-flex flex-wrap gap-2">
                <div *ngFor="let signal of signalTypes" 
                     class="card" 
                     [class.border-danger]="getAlertCount(signal) > 0">
                  <div class="card-body p-2">
                    <h6 class="card-title">{{getSignalDescription(signal)}}</h6>
                    <p class="card-text">
                      <small [class.text-danger]="getAlertCount(signal) > 0">
                        {{getAlertCount(signal)}} alertas
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-badge {
      padding: 0.25em 0.6em;
      border-radius: 12px;
      font-size: 0.8rem;
    }
    .normal { background-color: #28a745; color: white; }
    .warning { background-color: #ffc107; color: black; }
    .danger { background-color: #dc3545; color: white; }
  `]
})
export class PatientDetailComponent implements OnInit, OnDestroy {
  @Input() patient?: Patient;
  @Output() closeModal = new EventEmitter<void>();

  currentMeasurements: MeasurementDTO[] = [];
  filteredMeasurements: MeasurementDTO[] = [];
  signalTypes = Object.values(SignalType).filter(value => typeof value === 'number');
  selectedSignal: number | null = null;
  searchTerm: string = '';
  lastUpdate: Date = new Date();
  nextUpdateIn: number = 5; // Cambiado a 5 segundos
  private destroy$ = new Subject<void>();

  constructor(private measurementService: MeasurementService) {}

  ngOnInit() {
    this.loadMeasurements();
    this.startAutoUpdate();
  }
  


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startAutoUpdate() {
  interval(1000).pipe(
    takeUntil(this.destroy$)
  ).subscribe(() => {
    this.nextUpdateIn--;
    if (this.nextUpdateIn <= 0) {
      this.loadMeasurements();
      this.nextUpdateIn = 5; // Reset a 5 segundos
    }
  });
}


loadMeasurements() {
  if (!this.patient?.id) return;

  this.measurementService.getLatestMeasurements().subscribe({
    next: (allMeasurements) => {
      // Solo filtramos las mediciones del paciente actual
      this.currentMeasurements = allMeasurements
        .filter(m => m.idPatient === this.patient?.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
      
      this.applyFilters();
      this.lastUpdate = new Date();
    },
    error: (error) => console.error('Error loading measurements:', error)
  });
}
applyFilters() {
  this.filteredMeasurements = this.currentMeasurements.filter(m => {
    const matchesSignal = !this.selectedSignal || m.idSing === this.selectedSignal;
    const matchesSearch = !this.searchTerm || 
      this.getSignalDescription(m.idSing).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      m.measurementValue.toString().includes(this.searchTerm);
    return matchesSignal && matchesSearch;
  });
}

  getSignalDescription(signalId: number): string {
    return SIGNAL_THRESHOLDS[signalId as SignalType]?.description || 'Desconocido';
  }

  getSignalUnit(signalId: number): string {
    return SIGNAL_THRESHOLDS[signalId as SignalType]?.unit || '';
  }

  getAlertStatus(measurement: MeasurementDTO): string {
    const thresholds = SIGNAL_THRESHOLDS[measurement.idSing as SignalType];
    if (!thresholds) return 'Desconocido';

    if (measurement.measurementValue < thresholds.min) return 'Bajo';
    if (measurement.measurementValue > thresholds.max) return 'Alto';
    return 'Normal';
  }

  getAlertClass(measurement: MeasurementDTO): string {
    const status = this.getAlertStatus(measurement);
    switch (status) {
      case 'Bajo': return 'alert-badge warning';
      case 'Alto': return 'alert-badge danger';
      case 'Normal': return 'alert-badge normal';
      default: return '';
    }
  }

  getAlertCount(signalId: number): number {
    return this.currentMeasurements.filter(m => 
      m.idSing === signalId && this.getAlertStatus(m) !== 'Normal'
    ).length;
  }

  close() {
    this.closeModal.emit();
  }
}