// src/app/doctors/doctor-management/doctor-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DoctorService, Doctor, CreateDoctorDTO } from '../../services/doctor.service';
import { RouterModule } from '@angular/router';  // Añade RouterModule

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-management.component.html',
  styleUrls: ['./doctor-management.component.scss']
})
export class DoctorManagementComponent implements OnInit {
  doctors: Doctor[] = [];
  doctorForm: FormGroup;
  loading = false;
  error: string | null = null;
  isEditing = false;
  showForm = false;

  constructor(
    private doctorService: DoctorService,
    private fb: FormBuilder
  ) {
    this.doctorForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      speciality: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      isAdmin: [false]
    });
  }

  ngOnInit(): void {
    this.loadDoctors();
  }
  loadDoctors(): void {
    this.loading = true;
    this.error = null;
    
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('Doctores cargados:', doctors);
        this.doctors = doctors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Error al cargar los doctores. Por favor, intente nuevamente.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.doctorForm.valid) {
      this.loading = true;
      const formData = this.doctorForm.value;
      
      if (this.isEditing) {
        this.error = 'La edición no está disponible en este momento';
        this.loading = false;
      } else {
        // Crear el DTO con solo los campos necesarios
        const newDoctor: CreateDoctorDTO = {
          name: formData.name,
          speciality: formData.speciality,
          email: formData.email
        };
        
        console.log('Enviando datos del doctor:', newDoctor);
        
        this.doctorService.addDoctor(newDoctor).subscribe({
          next: (doctor) => {
            console.log('Doctor creado:', doctor);
            this.doctors.push({...doctor, isAdmin: false}); // Asumimos false por defecto
            this.loading = false;
            this.resetForm();
          },
          error: (error) => {
            console.error('Error adding doctor:', error);
            this.error = 'Error al agregar el doctor. Por favor, intente nuevamente.';
            this.loading = false;
          }
        });
      }
    }
  }

  editDoctor(doctor: Doctor): void {
    this.error = 'La edición no está disponible en este momento';

    this.isEditing = true;
    this.showForm = true;
    this.doctorForm.patchValue(doctor);
  }

  deleteDoctor(id: number): void {
    if (confirm('¿Está seguro de eliminar este doctor?')) {
      this.loading = true;
      this.doctorService.deleteDoctor(id).subscribe({
        next: () => {
          this.doctors = this.doctors.filter(doctor => doctor.id !== id);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
          this.error = 'Error al eliminar el doctor. Por favor, intente nuevamente.';
          this.loading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.doctorForm.reset({
      isAdmin: false
    });
    this.isEditing = false;
    this.showForm = false;
  }
}