// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { DoctorManagementComponent } from './doctors/doctor-management/doctor-management.component';
import { PatientManagementComponent } from './patients/patient-management/patient-management.component';
import { PatientDetailComponent } from './patients/patient-detail/patient-detail.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'patient/:id',
        component: PatientDetailComponent
      },
      {
        path: 'doctors',
        component: DoctorManagementComponent
      },
      {
        path: 'patients',
        component: PatientManagementComponent
      }
    ]
  }
];