import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MsalService } from '@azure/msal-angular';
import { AlertaService } from '../services/alerta.service';

interface Alerta {
  idPaciente: string;
  nombrePaciente: string;
  tipo: string;
  tipoAlerta: string;
  nivelAlerta: string;
  prioridad: string;
  fechaAlerta: string;
  ultimaActualizacion: Date;
  doctorAsignado: string;
  estado: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DashboardComponent implements OnInit {
  // Propiedades para estadísticas
  userName: string = '';
  totalPacientes: number = 0;
  alertasActivas: number = 0;
  doctoresGuardia: number = 0;
  monitoreando: boolean = false;
  escaneando: boolean = false;

  // Filtros
  filtroTipoAlerta: string = '';
  filtroPrioridad: string = '';
  searchTerm: string = '';
  alertasFiltradas: Alerta[] = [];
  alertas: Alerta[] = [];

  constructor(
    private msalService: MsalService,
    private router: Router,
    private alertaService: AlertaService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
    this.obtenerNombreUsuario();
  }

  obtenerNombreUsuario() {
    const account = this.msalService.instance.getActiveAccount();
    if (account) {
      this.userName = account.name || account.username;
    }
  }

  cargarDatosIniciales() {
    this.alertaService.obtenerAlertas().subscribe({
      next: (alertas) => {
        // Mapear los datos recibidos al formato que necesitamos
        this.alertas = alertas.map(alerta => ({
          idPaciente: alerta.idAlerta?.toString() || '',
          nombrePaciente: alerta.nombrePaciente,
          tipo: alerta.tipoAlerta,
          tipoAlerta: alerta.tipoAlerta,
          nivelAlerta: alerta.nivelAlerta,
          prioridad: this.mapearPrioridad(alerta.nivelAlerta),
          fechaAlerta: alerta.fechaAlerta,
          ultimaActualizacion: new Date(alerta.fechaAlerta),
          doctorAsignado: 'Sin asignar', // Valor por defecto
          estado: 'activa' // Valor por defecto
        }));
        this.alertasFiltradas = [...this.alertas];
        this.actualizarEstadisticas();
      },
      error: (error) => {
        console.error('Error al cargar alertas:', error);
      }
    });
  }

  private mapearPrioridad(nivelAlerta: string): string {
    switch (nivelAlerta.toLowerCase()) {
      case 'alto':
        return 'alta';
      case 'medio':
        return 'media';
      default:
        return 'baja';
    }
  }

  actualizarEstadisticas() {
    this.totalPacientes = new Set(this.alertasFiltradas.map(a => a.idPaciente)).size;
    this.alertasActivas = this.alertasFiltradas.filter(a => a.estado === 'activa').length;
    this.doctoresGuardia = new Set(this.alertasFiltradas.filter(a => a.doctorAsignado !== 'Sin asignar')
      .map(a => a.doctorAsignado)).size;
  }

  iniciarEscaner() {
    this.escaneando = true;
    // Implementar lógica de escaneo
  }

  detenerEscaner() {
    this.escaneando = false;
  }

  iniciarMonitoreo() {
    this.monitoreando = true;
    // Implementar lógica de monitoreo en tiempo real
  }

  detenerMonitoreo() {
    this.monitoreando = false;
  }

  aplicarFiltros() {
    this.alertasFiltradas = this.alertas.filter(alerta => {
      const cumpleTipo = !this.filtroTipoAlerta || alerta.tipo.toLowerCase() === this.filtroTipoAlerta.toLowerCase();
      const cumplePrioridad = !this.filtroPrioridad || alerta.prioridad.toLowerCase() === this.filtroPrioridad.toLowerCase();
      const cumpleBusqueda = !this.searchTerm || 
        alerta.nombrePaciente.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return cumpleTipo && cumplePrioridad && cumpleBusqueda;
    });
    this.actualizarEstadisticas();
  }
  getBadgeClass(tipo: string): string {
    type TipoAlerta = 'vitales' | 'medicacion' | 'emergencia';
    const clases: Record<TipoAlerta, string> = {
      'vitales': 'bg-danger',
      'medicacion': 'bg-warning',
      'emergencia': 'bg-info'
    };
    return clases[tipo.toLowerCase() as TipoAlerta] || 'bg-secondary';
  }
  
  getPrioridadClass(prioridad: string): string {
    type NivelPrioridad = 'alta' | 'media' | 'baja';
    const clases: Record<NivelPrioridad, string> = {
      'alta': 'bg-danger',
      'media': 'bg-warning',
      'baja': 'bg-success'
    };
    return clases[prioridad.toLowerCase() as NivelPrioridad] || 'bg-secondary';
  }
  
  getEstadoClass(estado: string): string {
    type EstadoAlerta = 'activa' | 'pendiente' | 'atendida';
    const clases: Record<EstadoAlerta, string> = {
      'activa': 'bg-success',
      'pendiente': 'bg-warning',
      'atendida': 'bg-secondary'
    };
    return clases[estado.toLowerCase() as EstadoAlerta] || 'bg-secondary';
  }
  editarAlerta(indice: number) {
    // Implementar lógica de edición
    console.log('Editando alerta:', this.alertasFiltradas[indice]);
  }

  eliminarAlerta(indice: number) {
    const alerta = this.alertasFiltradas[indice];
    const idAlerta = parseInt(alerta.idPaciente);
    
    if (!isNaN(idAlerta)) {
      this.alertaService.eliminarAlerta(idAlerta).subscribe({
        next: () => {
          this.alertasFiltradas = this.alertasFiltradas.filter((_, i) => i !== indice);
          this.actualizarEstadisticas();
        },
        error: (error) => {
          console.error('Error al eliminar alerta:', error);
        }
      });
    }
  }

  verDetalles(alerta: Alerta) {
    // Implementar vista detallada
    console.log('Ver detalles de:', alerta);
  }

  asignarDoctor(alerta: Alerta) {
    // Implementar asignación de doctor
    console.log('Asignar doctor a:', alerta);
  }

  marcarAtendida(alerta: Alerta) {
    const alertaActualizada = {
      ...alerta,
      estado: 'atendida'
    };
    
    const idAlerta = parseInt(alerta.idPaciente);
    if (!isNaN(idAlerta)) {
      this.alertaService.actualizarAlerta(idAlerta, alertaActualizada).subscribe({
        next: () => {
          const index = this.alertasFiltradas.findIndex(a => a.idPaciente === alerta.idPaciente);
          if (index !== -1) {
            this.alertasFiltradas[index] = alertaActualizada;
            this.actualizarEstadisticas();
          }
        },
        error: (error) => {
          console.error('Error al marcar como atendida:', error);
        }
      });
    }
  }

  logout() {
    this.msalService.logoutPopup().subscribe({
      next: () => this.router.navigate(['/login']),
      error: error => console.error('Error al cerrar sesión:', error)
    });
  }
}