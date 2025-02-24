// src/app/interfaces/medical-types.ts
import { MeasurementDTO } from '../services/measurement.service'; // Asegúrate de importar MeasurementDTO

export enum SignalType {
  TEMPERATURA = 1,
  FRECUENCIA_CARDIACA = 2,
  PRESION_ARTERIAL = 3,
  FRECUENCIA_RESPIRATORIA = 4,
  SATURACION_OXIGENO = 5
}

export interface SignalThreshold {
  min: number;
  max: number;
  unit: string;
  description: string;
}

export const SIGNAL_THRESHOLDS: Record<SignalType, SignalThreshold> = {
  [SignalType.TEMPERATURA]: {
    min: 36.0,
    max: 37.5,
    unit: '°C',
    description: 'Temperatura Corporal'
  },
  [SignalType.FRECUENCIA_CARDIACA]: {
    min: 60,
    max: 100,
    unit: 'bpm',
    description: 'Frecuencia Cardíaca'
  },
  [SignalType.PRESION_ARTERIAL]: {
    min: 90,
    max: 120,
    unit: 'mmHg',
    description: 'Presión Arterial'
  },
  [SignalType.FRECUENCIA_RESPIRATORIA]: {
    min: 12,
    max: 20,
    unit: 'rpm',
    description: 'Frecuencia Respiratoria'
  },
  [SignalType.SATURACION_OXIGENO]: {
    min: 95,
    max: 100,
    unit: '%',
    description: 'Saturación de Oxígeno'
  }
};

// Definición de OrganizedMeasurements
export interface OrganizedMeasurements {
  [patientId: number]: {
    [signalType in SignalType]?: MeasurementDTO[];
  };
}