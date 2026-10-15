/**
 * Tipos oficiales para el Sistema de Comando de Incidentes (SCI)
 * Basado en el PROYECTO de Norma Oficial Mexicana PROY-NOM-010-SEGOB-2016
 * (Requisitos básicos para la implementación del Sistema de Comando de Incidentes)
 */

export type FormId =
  | 'SCI-201'
  | 'SCI-202'
  | 'SCI-203'
  | 'SCI-204'
  | 'SCI-205'
  | 'SCI-206'
  | 'SCI-207'
  | 'SCI-208'
  | 'SCI-209'
  | 'SCI-211'
  | 'SCI-214'
  | 'SCI-221'
  | 'SCI-COSTOS'
  | 'SCI-HORAS';

export type RecursoEstado = 'Disponible' | 'Asignado' | 'Fuera de Servicio';
export type TipoIncidente =
  | 'Sismo / Terremoto'
  | 'Incendio Forestal'
  | 'Incendio Estructural'
  | 'Materiales Peligrosos (HazMat)'
  | 'Inundación / Hidrometeorológico'
  | 'Deslizamiento / Derrumbe'
  | 'Accidente Masivo'
  | 'Evento Socio-Organizativo'
  | 'Búsqueda y Rescate (USAR)';

export interface PeriodoOperacional {
  numero: number;
  fechaInicio: string;
  horaInicio: string;
  fechaFin: string;
  horaFin: string;
}

export interface PeriodoOperacionalRegistro extends PeriodoOperacional {
  id?: string;
  descripcion?: string;
  esActivo?: boolean;
}

export interface TacticalPin {
  id: string;
  tipo: 'PC' | 'E' | 'ACV' | 'B' | 'C' | 'H' | 'H1' | 'M' | 'PELIGRO' | 'BOMBEROS' | 'POLICIA';
  label: string;
  x: number; // 0-100%
  y: number; // 0-100%
  color: string;
  coordenadas?: string;
}

export interface SCI201Data {
  evaluacionInicial: string;
  coordenadasLat?: number | string;
  coordenadasLng?: number | string;
  coordenadasTexto?: string;
  croquisPines: TacticalPin[];
  croquisDrawing?: string;
  croquisNotas: string;
  objetivosIniciales: string[];
  resumenAcciones: Array<{
    id: string;
    hora: string;
    accion: string;
    responsable: string;
  }>;
  recursosAsignadosIniciales: Array<{
    id: string;
    recurso: string;
    tipoClase: string;
    cantidad: number;
    responsable: string;
    ubicacion: string;
    horaArribo: string;
  }>;
  organizacionInicial: {
    comandante: string;
    seguridad: string;
    informacion: string;
    enlace: string;
    operaciones: string;
    planificacion: string;
    logistica: string;
    administracion: string;
  };
}

export interface SCI202Data {
  objetivos: Array<{
    id: string;
    texto: string;
    prioridad: 'Alta' | 'Media' | 'Baja';
    estado: 'En progreso' | 'Cumplido' | 'Pendiente';
  }>;
  estrategiasTácticas: string;
  directricesSeguridad: string;
  pronosticoMeteorologico: {
    condicion: string;
    temperatura: string;
    viento: string;
    humedad: string;
    observaciones: string;
  };
  aprobadoPorCI: string;
  fechaAprobacion: string;
  firmaCIData?: string;
  periodosOperacionales?: PeriodoOperacionalRegistro[];
}

export interface DivisionGrupo {
  id: string;
  nombre: string;
  responsable: string;
  recursosAsignados: string;
  contacto: string;
}

export interface SCI203Data {
  mando: {
    comandante: string;
    comandanteAdjunto: string;
    oficialSeguridad: string;
    oficialInformacion: string;
    oficialEnlace: string;
  };
  operaciones: {
    jefe: string;
    directorRama1: string;
    divisionesGrupos: DivisionGrupo[];
  };
  planificacion: {
    jefe: string;
    unidadRecursos: string;
    unidadSituacion: string;
    unidadDocumentacion: string;
    unidadDesmovilizacion: string;
  };
  logistica: {
    jefe: string;
    unidadComunicaciones: string;
    unidadMedica: string;
    unidadAlimentacion: string;
    unidadSuministros: string;
    unidadInstalaciones: string;
  };
  administracion: {
    jefe: string;
    unidadTiempo: string;
    unidadCostos: string;
    unidadAdquisiciones: string;
    unidadCompensaciones: string;
  };
}

export interface AsignacionTactico {
  id: string;
  divisionGrupo: string;
  supervisor: string;
  funcionOperacional: string;
  recursosAsignados: string;
  instruccionesEspeciales: string;
  canalComunicaciones: string;
}

export interface SCI204Data {
  asignaciones: AsignacionTactico[];
}

export interface CanalRadio {
  id: string;
  canal: string;
  funcion: string;
  frecuenciaRX: string;
  frecuenciaTX: string;
  tono: string;
  asignadoA: string;
  observaciones: string;
}

export interface SCI205Data {
  canales: CanalRadio[];
  directricesComunicaciones: string;
  elaboradoPor: string;
}

export interface PuestoMedico {
  id: string;
  nombre: string;
  ubicacion: string;
  contacto: string;
  paramedicos: string;
}

export interface Ambulancia {
  id: string;
  unidad: string;
  institucion: string;
  tipo: 'Soporte Vital Básico (SVB)' | 'Soporte Vital Avanzado (SVA)' | 'Rescate';
  contacto: string;
  ubicacion: string;
}

export interface HospitalReceptor {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  tiempoTrasladoMin: number;
  helipuerto: boolean;
  quemados: boolean;
  traumaShock: boolean;
}

export interface SCI206Data {
  puestosMedicos: PuestoMedico[];
  ambulancias: Ambulancia[];
  hospitales: HospitalReceptor[];
  procedimientoEvacuacionMedica: string;
  elaboradoPor: string;
}

export interface RecursoSCI207 {
  id: string;
  recurso: string;
  categoria: string;
  institucion: string;
  estado: RecursoEstado;
  ubicacionActual: string;
  contacto: string;
}

export interface PacienteAtendidoCRM {
  id: string;
  nombre: string;
  edad: number | string;
  motivoAtencion: string;
  codigoPostal: string;
  unidadAtendio: string;
  triage: 'Rojo (Inmediato)' | 'Amarillo (Diferido)' | 'Verde (Leve)' | 'Negro (Fallecido)';
  destinoHospital?: string;
  horaAtencion?: string;
}

export interface SCI207Data {
  recursos: RecursoSCI207[];
  triajeVictimas: {
    rojoInmediato: number;
    amarilloDiferido: number;
    verdeLeve: number;
    negroFallecido: number;
    trasladados: number;
  };
  pacientesAtendidos?: PacienteAtendidoCRM[];
}

export interface RiesgoSeguridad {
  id: string;
  riesgo: string;
  probabilidad: 'Alta' | 'Media' | 'Baja';
  severidad: 'Crítica' | 'Grave' | 'Moderada';
  medidasMitigacion: string;
}

export interface SCI208Data {
  mensajeSeguridadGeneral: string;
  riesgos: RiesgoSeguridad[];
  equipoProteccionPersonal: string[];
  alarmaEvacuacionEmergencia: string;
  elaboradoPor: string;
}

export interface SCI209Data {
  porcentajeControl: number;
  resumenSituacion: string;
  danosHumanos: {
    lesionadosRescatistas: number;
    lesionadosCiviles: number;
    fallecidos: number;
    evacuados: number;
    albergados: number;
  };
  danosEstructuralesInfraestructura: string;
  accionesSiguientes24Horas: string;
  elaboradoPor: string;
  autorizadoPorCI: string;
}

export interface RegistroIngresoSCI211 {
  id: string;
  fechaHora: string;
  recursoVehiculo: string;
  agenciaInstitucion: string;
  nombreLider: string;
  numEfectivos: number;
  clasificacionTipo: string;
  puntoIngreso: string;
  asignadoA: string;
}

export interface SCI211Data {
  ingresos: RegistroIngresoSCI211[];
  lugarRegistroCheckIn: string;
  encargadoCheckIn: string;
}

export interface EntradaBitacoraSCI214 {
  id: string;
  hora: string;
  actividadEvento: string;
  observaciones: string;
}

export interface SCI214Data {
  unidadNombre: string;
  responsableBitacora: string;
  entradas: EntradaBitacoraSCI214[];
}

export interface ItemDesmovilizacionSCI221 {
  id: string;
  recurso: string;
  agencia: string;
  fechaDesmovilizacion?: string;
  inspeccionEquipo: boolean;
  informeEntregado: boolean;
  comunicacionesDevueltas: boolean;
  aprobadoPorCI: boolean;
  horaSalida: string;
  observaciones?: string;
}

export interface SCI221Data {
  fechaInicioDesmovilizacion: string;
  prioridadesDesmovilizacion: string;
  recursos: ItemDesmovilizacionSCI221[];
  elaboradoPor: string;
}

// ==========================================
// CENTRO DE COSTOS Y CONTROL FINANCIERO
// ==========================================
export type TipoTransaccionFinanciera =
  | 'Gasto'
  | 'Adquisición'
  | 'Inversión'
  | 'Ganancia'
  | 'Insumo Gastado';

export type EstadoPago = 'Pagado' | 'Comprometido' | 'Pendiente' | 'Recibido';

export interface ItemFinanciero {
  id: string;
  tipo: TipoTransaccionFinanciera;
  fecha: string; // YYYY-MM-DD
  concepto: string;
  categoria: string;
  cantidad: number;
  unidadMedida: string; // ej. Pza, Litros, Horas, Cajas, Lote, Servicio
  costoUnitario: number;
  montoTotal: number;
  responsable: string;
  proveedorBeneficiario?: string;
  numComprobante?: string;
  estadoPago: EstadoPago;
  notas?: string;
}

export interface CentroCostosData {
  presupuestoAsignado: number;
  fondoCajaChica: number;
  responsableFinanzas: string;
  moneda: string; // ej. MXN
  items: ItemFinanciero[];
  observacionesFinancieras: string;
}

// ==========================================
// REGISTRO Y CONTROL DE HORAS HOMBRE
// ==========================================
export type EspecialidadPersonal =
  | 'Búsqueda y Rescate (USAR)'
  | 'Atención Médica / Triage'
  | 'Combate de Incendios'
  | 'Materiales Peligrosos (HazMat)'
  | 'Logística y Abastecimiento'
  | 'Seguridad y Perímetro'
  | 'Mando y Planificación'
  | 'Operación de Maquinaria';

export type CondicionFatiga = 'Óptima' | 'Moderada' | 'Relevo Requerido';

export interface RegistroHorasHombre {
  id: string;
  fecha: string;
  brigadaUnidad: string;
  responsableLider: string;
  especialidad: EspecialidadPersonal;
  numeroEfectivos: number;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  horasPorPersona: number;
  horasExtraordinarias: number;
  totalHorasHombre: number; // numeroEfectivos * (horasPorPersona + horasExtraordinarias)
  tasaHorariaEstimada: number; // Costo por HH en MXN
  costoTotalPersonal: number; // totalHorasHombre * tasaHorariaEstimada
  areaOperacion: string;
  actividadDesempenada: string;
  condicionFatiga: CondicionFatiga;
  notas?: string;
}

export interface ControlHorasHombreData {
  coordinadorPersonal: string;
  limiteHorasTurno: number; // default 8 o 12 hrs
  registros: RegistroHorasHombre[];
  observaciones: string;
}

export interface IncidentData {
  id: string;
  folio: string;
  nombre: string;
  lugar: string;
  municipioEstado: string;
  coordenadasGPS: string;
  tipoIncidente: TipoIncidente;
  nivelComplejidad: 'Tipo 5' | 'Tipo 4' | 'Tipo 3' | 'Tipo 2' | 'Tipo 1';
  estadoIncidente: 'Activo' | 'Bajo Control' | 'En Desmovilización' | 'Cerrado';
  comandanteIncidente: string;
  institucionComando: string;
  periodoOperacional: PeriodoOperacional;
  periodosOperacionales?: PeriodoOperacionalRegistro[];
  fechaCreacion: string;
  ultimaModificacion: string;

  // Formularios Oficiales PROY-NOM-010-SEGOB-2016
  sci201: SCI201Data;
  sci202: SCI202Data;
  sci203: SCI203Data;
  sci204: SCI204Data;
  sci205: SCI205Data;
  sci206: SCI206Data;
  sci207: SCI207Data;
  sci208: SCI208Data;
  sci209: SCI209Data;
  sci211: SCI211Data;
  sci214: SCI214Data;
  sci221: SCI221Data;

  // Apartados Solicitados de Control Financiero y Personal
  centroCostos: CentroCostosData;
  controlHorasHombre: ControlHorasHombreData;
}
