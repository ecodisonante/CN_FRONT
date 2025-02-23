// src/app/patients/patient-management/patient-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService, Patient } from '../../services/patient.service';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { RouterModule } from '@angular/router';  // Añade RouterModule

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-management.component.html',
  styleUrls: ['./patient-management.component.scss']
})
export class PatientManagementComponent implements OnInit {
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  patientForm: FormGroup;
  loading = false;
  error: string | null = null;
  isEditing = false;
  showForm = false;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) {
    this.patientForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      state: ['Estable', [Validators.required]],
      idDoctor: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    
    // Cargar doctores primero
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        // Luego cargar pacientes
        this.loadPatients();
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Error al cargar los doctores. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.error = 'Error al cargar los pacientes. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.loading = true;
      const patientData = this.patientForm.value;
      
      if (this.isEditing) {
        this.patientService.updatePatient(patientData).subscribe({
          next: (patient) => {
            const index = this.patients.findIndex(p => p.id === patient.id);
            if (index !== -1) {
              this.patients[index] = patient;
            }
            this.loading = false;
            this.resetForm();
          },
          error: (error) => {
            console.error('Error updating patient:', error);
            this.error = 'Error al actualizar el paciente. Por favor, intente nuevamente.';
            this.loading = false;
          }
        });
      } else {
        const { id, ...newPatient } = patientData;
        this.patientService.addPatient(newPatient).subscribe({
          next: (patient) => {
            this.patients.push(patient);
            this.loading = false;
            this.resetForm();
          },
          error: (error) => {
            console.error('Error adding patient:', error);
            this.error = 'Error al agregar el paciente. Por favor, intente nuevamente.';
            this.loading = false;
          }
        });
      }
    }
  }

  editPatient(patient: Patient): void {
    this.isEditing = true;
    this.showForm = true;
    this.patientForm.patchValue(patient);
  }

  deletePatient(id: number): void {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      this.loading = true;
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.patients = this.patients.filter(patient => patient.id !== id);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.error = 'Error al eliminar el paciente. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.patientForm.reset({
      state: 'Estable'
    });
    this.isEditing = false;
    this.showForm = false;
  }

  getDoctorName(idDoctor: number): string {
    const doctor = this.doctors.find(d => d.id === idDoctor);
    return doctor ? doctor.name : 'Sin asignar';
  }

  getStateClass(state: string): string {
    switch (state) {
      case 'Crítico': return 'bg-danger';
      case 'Grave': return 'bg-warning';
      case 'Estable': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}