import { IncidentData } from '../types/sci';

export const PRESET_INCIDENTS: IncidentData[] = [
  {
    id: 'inc-sismo-01',
    folio: 'SCI-MX-2026-0089',
    nombre: 'Sismo M 7.2 - Colapso Estructural Multifamiliar',
    lugar: 'Col. Roma Norte, Alcaldía Cuauhtémoc',
    municipioEstado: 'Ciudad de México, CDMX',
    coordenadasGPS: '19.4195° N, 99.1628° O',
    tipoIncidente: 'Sismo / Terremoto',
    nivelComplejidad: 'Tipo 2',
    estadoIncidente: 'Activo',
    comandanteIncidente: 'Cmte. Alejandro Morales (Protección Civil CDMX)',
    institucionComando: 'Coordinación Nacional de Protección Civil / SEDENA / Bomberos',
    periodoOperacional: {
      numero: 1,
      fechaInicio: '2026-10-07',
      horaInicio: '08:00',
      fechaFin: '2026-10-07',
      horaFin: '20:00',
    },
    fechaCreacion: '2026-10-07 07:15',
    ultimaModificacion: '2026-10-07 09:30',

    sci201: {
      evaluacionInicial:
        'Colapso parcial tipo sándwich en edificio habitacional de 5 niveles. Posibles 14 personas atrapadas bajo escombros. Fuga de gas LP controlada por Bomberos. Red eléctrica suspendida en 3 manzanas a la redonda. Se establece perímetro de exclusión de 150 metros.',
      croquisPines: [
        { id: 'p1', tipo: 'PC', label: 'Puesto de Comando (Parque Río de Janeiro)', x: 18, y: 30, color: '#f97316', coordenadas: '19.4192, -99.1620' },
        { id: 'p2', tipo: 'E', label: 'Área de Espera (Av. Álvaro Obregón)', x: 75, y: 22, color: '#eab308', coordenadas: '19.4180, -99.1610' },
        { id: 'p3', tipo: 'ACV', label: 'Área Concentración Víctimas / Triage', x: 28, y: 68, color: '#ef4444', coordenadas: '19.4188, -99.1631' },
        { id: 'p4', tipo: 'H1', label: 'Helipunto (Campo Deportivo)', x: 82, y: 78, color: '#3b82f6', coordenadas: '19.4150, -99.1600' },
        { id: 'p5', tipo: 'PELIGRO', label: 'Edificio Colapsado - Zona Caliente', x: 50, y: 48, color: '#dc2626', coordenadas: '19.4195, -99.1628' },
        { id: 'p6', tipo: 'BOMBEROS', label: 'Corte de Líneas / Bomberos CDMX', x: 42, y: 38, color: '#ea580c' },
      ],
      croquisNotas: 'Vientos calmos del NE. Rutas de evacuación despejadas por Av. Insurgentes y Av. Cuauhtémoc.',
      objetivosIniciales: [
        'Asegurar y delimitar perímetro caliente a 150 metros con apoyo de Secretaría de Seguridad Ciudadana.',
        'Efectuar búsqueda técnica canina y acústica USAR en cuadrante frontal del inmueble.',
        'Establecer Puesto de Comando unificado y canal de enlace con el C5.',
        'Brindar atención médica prehospitalaria y traslado expedito a hospitales de tercer nivel.'
      ],
      resumenAcciones: [
        { id: 'a1', hora: '07:20', accion: 'Arribo de primeros respondientes y asunción de mando inicial.', responsable: 'Policía Sector Roma' },
        { id: 'a2', hora: '07:35', accion: 'Establecimiento formal de Puesto de Comando (PC) en Glorieta Río de Janeiro.', responsable: 'Cmte. Alejandro Morales' },
        { id: 'a3', hora: '08:00', accion: 'Ingreso de brigada canina K9 K-SAR para marcaje de vidas probables.', responsable: 'Cap. Ruiz (SEDENA / USAR)' },
        { id: 'a4', hora: '08:45', accion: 'Rescate exitoso de 2 personas con politraumatismo leve, canalizadas a ACV.', responsable: 'ERUM / Protección Civil' }
      ],
      recursosAsignadosIniciales: [
        { id: 'r1', recurso: 'Fuerza de Tarea USAR México-1', tipoClase: 'Tipo I Pesado', cantidad: 45, responsable: 'Cap. Ruiz', ubicacion: 'Zona de Colapso', horaArribo: '07:40' },
        { id: 'r2', recurso: 'Unidad de Rescate Urbano Bomberos', tipoClase: 'Autobomba / Escala', cantidad: 12, responsable: 'Of. Mendoza', ubicacion: 'Calle Durango esq. Orizaba', horaArribo: '07:30' },
        { id: 'r3', recurso: 'Ambulancias de Soporte Avanzado (CRUM/ERUM)', tipoClase: 'Tipo II', cantidad: 6, responsable: 'Dr. Valenzuela', ubicacion: 'ACV Río de Janeiro', horaArribo: '07:35' },
        { id: 'r4', recurso: 'Agrupamiento de Control de Tránsito SSC', tipoClase: 'Fuerza de Seguridad', cantidad: 30, responsable: 'Insp. Aguilar', ubicacion: 'Perímetro Externo', horaArribo: '07:25' }
      ],
      organizacionInicial: {
        comandante: 'Cmte. Alejandro Morales (PC CDMX)',
        seguridad: 'Lic. Claudia Nava (Oficial de Seguridad)',
        informacion: 'Mtro. Gabriel Ocampo (Vocería Protección Civil)',
        enlace: 'Cap. Fernando Soto (SEDENA Plan DN-III-E)',
        operaciones: 'Mtro. Héctor Cordero (Jefe de Operaciones)',
        planificacion: 'Ing. Sandra Lozano (Jefa de Planificación)',
        logistica: 'Lic. Roberto Durán (Jefe de Logística)',
        administracion: 'C.P. Mónica Arriaga (Administración y Finanzas)'
      }
    },

    sci202: {
      objetivos: [
        { id: 'ob1', texto: 'Localizar y extraer con vida a personas atrapadas en cuadrantes Alpha y Bravo en las próximas 6 horas.', prioridad: 'Alta', estado: 'En progreso' },
        { id: 'ob2', texto: 'Garantizar la seguridad física y estructural del personal de rescate apuntalando la losa nivel 2.', prioridad: 'Alta', estado: 'En progreso' },
        { id: 'ob3', texto: 'Mantener corredor de emergencia médica libre de tráfico sobre Av. Álvaro Obregón hacia Hospital Ángeles Roma.', prioridad: 'Media', estado: 'Cumplido' },
        { id: 'ob4', texto: 'Realizar censo oficial de residentes con familiares en el centro de atención a víctimas del Parque Río de Janeiro.', prioridad: 'Media', estado: 'En progreso' }
      ],
      estrategiasTácticas:
        'Aislamiento de la zona caliente; apuntalamiento neumático e hidráulico en zona de acceso; penetración horizontal por fachada este con equipo de corte de hormigón; rotación de cuadrillas cada 45 minutos para evitar fatiga térmica y estrés.',
      directricesSeguridad:
        'Uso irrestricto de casco dieléctrico clase E, guantes de rescate, googles y mascarilla N95/P100 contra polvo de sílice. Silbatazo de alarma: 3 toques largos significa EVACUACIÓN INMEDIATA por riesgo de derrumbe secundario.',
      pronosticoMeteorologico: {
        condicion: 'Parcialmente nublado, probabilidad de lluvia ligera 30% a partir de las 18:00',
        temperatura: '23°C max / 14°C min',
        viento: 'Viento del Norte a 12 km/h con rachas de 20 km/h',
        humedad: '55%',
        observaciones: 'Monitorear posible humedecimiento de escombros por llovizna vespertina.'
      },
      aprobadoPorCI: 'Cmte. Alejandro Morales',
      fechaAprobacion: '2026-10-07 08:30',
      firmaCIData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10, 90 35 T 180 20" stroke="%232563eb" stroke-width="3" fill="none"/></svg>'
    },

    sci203: {
      mando: {
        comandante: 'Cmte. Alejandro Morales (Comandante del Incidente)',
        comandanteAdjunto: 'Mayor Rodrigo Salgado (SEDENA / Adjunto)',
        oficialSeguridad: 'Lic. Claudia Nava (Oficial de Seguridad)',
        oficialInformacion: 'Mtro. Gabriel Ocampo (Información Pública)',
        oficialEnlace: 'Cap. Fernando Soto (Enlace Interinstitucional)'
      },
      operaciones: {
        jefe: 'Mtro. Héctor Cordero (Jefe de Operaciones)',
        directorRama1: 'Comandante Jefe de Bomberos Juan Carlos Reyes',
        divisionesGrupos: [
          { id: 'dg1', nombre: 'División Rescate Alpha (Frente)', responsable: 'Subinspector Damián Vega', recursosAsignados: 'USAR 1, K9 K-SAR, Cortadores hidráulicos', contacto: 'Radio Táctica 1 / Tel. 55-2341-9871' },
          { id: 'dg2', nombre: 'División Apuntalamiento Bravo (Trasera)', responsable: 'Ing. Estructural Tomás Garza', recursosAsignados: 'Brigada de Obras CDMX, Puntales Holmatro', contacto: 'Radio Táctica 2' },
          { id: 'dg3', nombre: 'Grupo Atención Prehospitalaria', responsable: 'Dra. Verónica Méndez (CRUM)', recursosAsignados: '4 Ambulancias Triage, Carpa Médica Avanzada', contacto: 'Radio Médica / 55-1290-4433' }
        ]
      },
      planificacion: {
        jefe: 'Ing. Sandra Lozano (Jefa de Planificación)',
        unidadRecursos: 'Lic. Karen Benítez (Control Check-in)',
        unidadSituacion: 'Arq. Mario Zepeda (Mapeo y Drones C5)',
        unidadDocumentacion: 'Lic. Brenda Ortiz (Actas y Bitácoras)',
        unidadDesmovilizacion: 'Lic. Arturo Galindo'
      },
      logistica: {
        jefe: 'Lic. Roberto Durán (Jefe de Logística)',
        unidadComunicaciones: 'Ing. Telmex / Red Nacional Radiocomunicación',
        unidadMedica: 'Dra. Andrea Cuevas',
        unidadAlimentacion: 'Cocina Comunitaria SEDENA DN-III',
        unidadSuministros: 'Lic. Omar Villalobos (Herramientas y Combustible)',
        unidadInstalaciones: 'Ing. Felipe Castro'
      },
      administracion: {
        jefe: 'C.P. Mónica Arriaga (Jefa de Administración y Finanzas)',
        unidadTiempo: 'Lic. Diana Ramos (Control de Horas Hombre)',
        unidadCostos: 'C.P. Luis Enrique Solís',
        unidadAdquisiciones: 'Lic. Paola Estrada',
        unidadCompensaciones: 'Lic. Jorge Treviño'
      }
    },

    sci204: {
      asignaciones: [
        {
          id: 'as1',
          divisionGrupo: 'División Alpha - Búsqueda y Rescate USAR',
          supervisor: 'Subinspector Damián Vega',
          funcionOperacional: 'Penetración y remoción controlada en colapso nivel 1 y 2 para extracción de 3 personas marcadas por canino.',
          recursosAsignados: 'Fuerza USAR México (18 elementos), Equipo de cámaras de fibra óptica, Gatos hidráulicos de 20 toneladas.',
          instruccionesEspeciales: 'Cero uso de maquinaria pesada mientras se mantenga hipótesis de sobrevivientes. Rotación estricta cada 40 minutos.',
          canalComunicaciones: 'Canal 2 (Táctica Operaciones 1 - 460.125 MHz)'
        },
        {
          id: 'as2',
          divisionGrupo: 'Grupo Médico y Triage en Escena',
          supervisor: 'Dra. Verónica Méndez (CRUM)',
          funcionOperacional: 'Recepción, estabilización hemodinámica y triage START de personas extraídas. Asignación inmediata de traslados.',
          recursosAsignados: '8 Médicos urgenciólogos, 14 Técnicos en Urgencias Médicas (TUM), 6 Ambulancias terapia intensiva.',
          instruccionesEspeciales: 'Priorizar traslados de trauma cráneo-encefálico a Hospital Balbuena y traumatología Lomas Verdes.',
          canalComunicaciones: 'Canal 4 (Médico y Triage - 460.375 MHz)'
        },
        {
          id: 'as3',
          divisionGrupo: 'Grupo Seguridad y Acordonamiento Perimetral',
          supervisor: 'Insp. Armando Aguilar (SSC CDMX)',
          funcionOperacional: 'Control de multitudes, cierre vial total en perímetro de 200m y custodia de pertenencias rescatadas.',
          recursosAsignados: '60 Elementos de la Policía Metropolitana, 8 Motopatrullas, vallas metálicas de contención.',
          instruccionesEspeciales: 'Permitir paso exclusivo a personal acreditado con chaleco SCI o brazalete oficial.',
          canalComunicaciones: 'Canal 5 (Seguridad y Tránsito - 460.500 MHz)'
        }
      ]
    },

    sci205: {
      canales: [
        { id: 'c1', canal: 'Canal 1 (MANDO)', funcion: 'Comando del Incidente y Staff', frecuenciaRX: '460.025 MHz', frecuenciaTX: '465.025 MHz', tono: '127.3 Hz', asignadoA: 'CI, Jefes de Sección y C5', observaciones: 'Uso exclusivo de coordinación general' },
        { id: 'c2', canal: 'Canal 2 (TÁCTICA 1)', funcion: 'Operaciones USAR y Rescate', frecuenciaRX: '460.125 MHz', frecuenciaTX: '465.125 MHz', tono: '127.3 Hz', asignadoA: 'División Alpha y Bomberos', observaciones: 'Canal prioritario de búsqueda' },
        { id: 'c3', canal: 'Canal 3 (TÁCTICA 2)', funcion: 'Apuntalamiento e Ingeniería', frecuenciaRX: '460.250 MHz', frecuenciaTX: '465.250 MHz', tono: '127.3 Hz', asignadoA: 'División Bravo y Estructuristas', observaciones: 'Canal de seguridad técnica' },
        { id: 'c4', canal: 'Canal 4 (MÉDICO)', funcion: 'Triage, ACV y Traslados', frecuenciaRX: '460.375 MHz', frecuenciaTX: '465.375 MHz', tono: '100.0 Hz', asignadoA: 'Ambulancias, CRUM y Hospitales', observaciones: 'Reporte de signos vitales' },
        { id: 'c5', canal: 'Canal 5 (LOGÍSTICA)', funcion: 'Abastecimiento y Suministros', frecuenciaRX: '460.500 MHz', frecuenciaTX: '465.500 MHz', tono: '100.0 Hz', asignadoA: 'Sección Logística y Área Espera', observaciones: 'Solicitud de relevos y comida' }
      ],
      directricesComunicaciones:
        'Todo el personal debe utilizar lenguaje claro, conciso y terminología SCI estándar. Queda estrictamente prohibido el uso de códigos policiales (código 10 u otros). En caso de MAYDAY o Silbatazo, silenciar canal inmediatamente.',
      elaboradoPor: 'Ing. Carlos Montes (Unidad de Comunicaciones SCI)'
    },

    sci206: {
      puestosMedicos: [
        { id: 'pm1', nombre: 'Área de Concentración de Víctimas (ACV) Río de Janeiro', ubicacion: 'Costado poniente del parque, sombra arbolada', contacto: 'Dra. Verónica Méndez - Ch. 4', paramedicos: '8 Médicos urgenciólogos + 12 TUMs' },
        { id: 'pm2', nombre: 'Puesto de Hidratación y Primeros Auxilios a Rescatistas', ubicacion: 'Junto al Puesto de Comando (PC)', contacto: 'Dra. Andrea Cuevas (Logística Médica)', paramedicos: '4 Paramédicos' }
      ],
      ambulancias: [
        { id: 'amb1', unidad: 'ERUM-321', institucion: 'Escuadrón de Rescate y Urgencias Médicas', tipo: 'Soporte Vital Avanzado (SVA)', contacto: '55-4321-1122', ubicacion: 'Área de Espera E-1' },
        { id: 'amb2', unidad: 'AMB-PROTECCION-CIVIL-04', institucion: 'Protección Civil Sistema Estatal', tipo: 'Soporte Vital Avanzado (SVA)', contacto: '55-5557-5757', ubicacion: 'Área de Espera E-1' },
        { id: 'amb3', unidad: 'CRUM-12', institucion: 'Centro Regulador de Urgencias Médicas', tipo: 'Soporte Vital Básico (SVB)', contacto: '55-9123-4567', ubicacion: 'Perímetro Alpha' },
        { id: 'amb4', unidad: 'PC-CDMX-09', institucion: 'Protección Civil CDMX', tipo: 'Soporte Vital Básico (SVB)', contacto: '55-5683-2222', ubicacion: 'Área de Espera E-2' }
      ],
      hospitales: [
        { id: 'h1', nombre: 'Hospital General de México "Dr. Eduardo Liceaga"', direccion: 'Dr. Balmis 148, Doctores, Cuauhtémoc', telefono: '55-2789-2000', tiempoTrasladoMin: 8, helipuerto: true, quemados: true, traumaShock: true },
        { id: 'h2', nombre: 'Hospital Ángeles Roma', direccion: 'Calle Querétaro 58, Roma Nte., Cuauhtémoc', telefono: '55-5574-0350', tiempoTrasladoMin: 4, helipuerto: false, quemados: false, traumaShock: true },
        { id: 'h3', nombre: 'Hospital de Traumatología y Ortopedia Magdalena de las Salinas', direccion: 'Colector 15 s/n, Gustavo A. Madero', telefono: '55-5754-6800', tiempoTrasladoMin: 22, helipuerto: true, quemados: true, traumaShock: true }
      ],
      procedimientoEvacuacionMedica:
        'Si un rescatista resulta lesionado dentro de la estructura colapsada, se emitirá señal de alarma MAYDAY por radio Canal 2. El equipo de RIT (Equipo de Intervención Rápida) ingresará de inmediato con camilla sked y equipo de extracción rápida.',
      elaboradoPor: 'Dra. Verónica Méndez (Líder Plan Médico)'
    },

    sci207: {
      recursos: [
        { id: 'rc1', recurso: 'Fuerza USAR México-1 (45 efectivos)', categoria: 'Búsqueda y Rescate Urbano', institucion: 'SEDENA / CNPC', estado: 'Asignado', ubicacionActual: 'Cuadrante Alpha de colapso', contacto: 'Cap. Ruiz' },
        { id: 'rc2', recurso: 'Escala Telescópica 30m', categoria: 'Vehículo de Bomberos', institucion: 'Heroico Cuerpo de Bomberos', estado: 'Asignado', ubicacionActual: 'Calle Durango', contacto: 'Of. Mendoza' },
        { id: 'rc3', recurso: 'Brigada Canina K9 (4 binomios)', categoria: 'Búsqueda Biológica', institucion: 'Protección Civil Estatal', estado: 'Disponible', ubicacionActual: 'Área de Espera (E)', contacto: 'Guía Sandra P.' },
        { id: 'rc4', recurso: 'Generador Móvil 50kVA e Iluminación Torre', categoria: 'Soporte Logístico', institucion: 'CFE Emergencias', estado: 'Asignado', ubicacionActual: 'Puesto de Comando', contacto: 'Ing. Morales' },
        { id: 'rc5', recurso: 'Módulo de Potabilización y Alimentación', categoria: 'Logística Humanitaria', institucion: 'DIF CDMX', estado: 'Disponible', ubicacionActual: 'Área de Espera (E)', contacto: 'Lic. Laura G.' },
        { id: 'rc6', recurso: 'Grúa Pluma 80 Toneladas', categoria: 'Maquinaria Especializada', institucion: 'Secretaría de Obras SOBSE', estado: 'Fuera de Servicio', ubicacionActual: 'En traslado sobre Viaducto', contacto: 'Ing. Pacheco' }
      ],
      triajeVictimas: {
        rojoInmediato: 3,
        amarilloDiferido: 5,
        verdeLeve: 11,
        negroFallecido: 1,
        trasladados: 7
      },
      pacientesAtendidos: [
        {
          id: 'pac-01',
          nombre: 'María Elena Torres Morales',
          edad: '42',
          motivoAtencion: 'Politraumatismo por aplastamiento en extremidad inferior derecha',
          codigoPostal: '06700',
          unidadAtendio: 'Ambulancia CRM-044 SVA',
          triage: 'Rojo (Inmediato)',
          destinoHospital: 'Hospital General de México',
          horaAtencion: '08:15'
        },
        {
          id: 'pac-02',
          nombre: 'Santiago Mendoza Rivas',
          edad: '9',
          motivoAtencion: 'Crisis asmática e inhalación de polvo de sílice',
          codigoPostal: '06700',
          unidadAtendio: 'Ambulancia CRM-12 SVB',
          triage: 'Amarillo (Diferido)',
          destinoHospital: 'Hospital Pediátrico Legaria',
          horaAtencion: '08:35'
        },
        {
          id: 'pac-03',
          nombre: 'Guillermo Vázquez Hernández',
          edad: '68',
          motivoAtencion: 'Crisis hipertensiva y contusión occipital leve',
          codigoPostal: '06700',
          unidadAtendio: 'TUM Módulo ACV Río de Janeiro',
          triage: 'Verde (Leve)',
          destinoHospital: 'Estabilizado en ACV / Alta',
          horaAtencion: '08:50'
        },
        {
          id: 'pac-04',
          nombre: 'Laura Patricia Gómez Fuentes',
          edad: '27',
          motivoAtencion: 'Herida cortante de 8cm en antebrazo izquierdo con sangrado activo',
          codigoPostal: '06760',
          unidadAtendio: 'Ambulancia CRM-044 SVA',
          triage: 'Amarillo (Diferido)',
          destinoHospital: 'Hospital Ángeles Roma',
          horaAtencion: '09:05'
        }
      ]
    },

    sci208: {
      mensajeSeguridadGeneral:
        '¡LA VIDA DEL RESCATISTA ES PRIMERO! Ningún rescate justifica la pérdida de personal de emergencia. Trabajo en binomios o trinomios inseparables en todo momento.',
      riesgos: [
        { id: 'rs1', riesgo: 'Colapso secundario de losa por réplicas sísmicas', probabilidad: 'Alta', severidad: 'Crítica', medidasMitigacion: 'Colocación de vigas de madera de pino 4x4 y puntales hidráulicos telescópicos antes de penetrar.' },
        { id: 'rs2', riesgo: 'Inhalación de polvos finos con partículas de asbesto/sílice', probabilidad: 'Alta', severidad: 'Grave', medidasMitigacion: 'Obligatoriedad de mascarillas elastoméricas con filtros P100. Humectación controlada del escombro.' },
        { id: 'rs3', riesgo: 'Golpe de calor y deshidratación severa en socorristas', probabilidad: 'Media', severidad: 'Moderada', medidasMitigacion: 'Descansos obligatorios de 15 min con hidratación electrolítica en Puesto de Salud tras 45 min de labor continua.' },
        { id: 'rs4', riesgo: 'Líneas eléctricas subterráneas energizadas remanentes', probabilidad: 'Baja', severidad: 'Crítica', medidasMitigacion: 'Verificación y corte total con técnico CFE certificado con detector de campo eléctrico Hotstick.' }
      ],
      equipoProteccionPersonal: [
        'Casco de rescate normado NFPA 1951 con barboquejo de 3 puntos',
        'Gafas herméticas de protección ocular contra impactos',
        'Respirador media cara con cartuchos para material particulado P100',
        'Guantes de cuero de carnaza o rescate técnico de alta destreza',
        'Botas de seguridad con casquillo dieléctrico y suela antipunzonamiento',
        'Linterna intrínsecamente segura para espacios confinados'
      ],
      alarmaEvacuacionEmergencia:
        '3 pitidos largos continuos de bocina de aire / silbato (duración 3 segundos cada uno). Al escuchar la señal: SOLTAR HERRAMIENTAS Y RETIRARSE DE INMEDIATO hacia la zona verde de la glorieta.',
      elaboradoPor: 'Lic. Claudia Nava (Oficial de Seguridad SCI)'
    },

    sci209: {
      porcentajeControl: 45,
      resumenSituacion:
        'Operaciones de rescate en pleno desarrollo. Área frontal asegurada. Dos sectores de escombro procesados con K9. Contacto vocal establecido con 2 personas atrapadas en cavidad estructural del segundo piso.',
      danosHumanos: {
        lesionadosRescatistas: 1,
        lesionadosCiviles: 19,
        fallecidos: 1,
        evacuados: 120,
        albergados: 45
      },
      danosEstructuralesInfraestructura:
        '1 Edificio colapsado al 70%. 2 Edificios colindantes con grietas en muros de carga (acordonados). Red de agua potable suspendida preventivamente.',
      accionesSiguientes24Horas:
        'Completar penetración y rescate de cavidad nivel 2 antes del anochecer; instalar reflectores tipo globo CFE para labores nocturnas; realizar cambio de período operacional a las 20:00.',
      elaboradoPor: 'Ing. Sandra Lozano (Jefa de Planificación)',
      autorizadoPorCI: 'Cmte. Alejandro Morales (Comandante del Incidente)'
    },

    sci211: {
      lugarRegistroCheckIn: 'Módulo de Registro Área de Espera (Av. Álvaro Obregón)',
      encargadoCheckIn: 'Lic. Karen Benítez (Unidad de Recursos)',
      ingresos: [
        { id: 'ck1', fechaHora: '2026-10-07 07:22', recursoVehiculo: 'Pickup Rápida PC-02', agenciaInstitucion: 'Protección Civil Cuauhtémoc', nombreLider: 'TUM Gerardo Ponce', numEfectivos: 3, clasificacionTipo: 'Evaluación de Daños', puntoIngreso: 'Acceso Norte', asignadoA: 'Puesto de Comando' },
        { id: 'ck2', fechaHora: '2026-10-07 07:40', recursoVehiculo: 'Camión USAR Camuflaje', agenciaInstitucion: 'SEDENA Primer Batallón Rescate', nombreLider: 'Cap. Ruiz Gómez', numEfectivos: 45, clasificacionTipo: 'USAR Pesado', puntoIngreso: 'Acceso Insurgentes', asignadoA: 'División Alpha' },
        { id: 'ck3', fechaHora: '2026-10-07 07:48', recursoVehiculo: 'Autobomba B-19', agenciaInstitucion: 'Heroico Cuerpo de Bomberos CDMX', nombreLider: 'Subtte. David Mendoza', numEfectivos: 8, clasificacionTipo: 'Incendios / Rescate', puntoIngreso: 'Acceso Orizaba', asignadoA: 'División Bravo' },
        { id: 'ck4', fechaHora: '2026-10-07 08:15', recursoVehiculo: 'Van de Apoyo K9', agenciaInstitucion: 'Protección Civil Estatal - Unidad K9', nombreLider: 'Sandra Pantoja', numEfectivos: 6, clasificacionTipo: 'Binomios Caninos', puntoIngreso: 'Acceso Obregón', asignadoA: 'Área de Espera' }
      ]
    },

    sci214: {
      unidadNombre: 'Puesto de Comando Central (PC)',
      responsableBitacora: 'Lic. Brenda Ortiz (Documentación)',
      entradas: [
        { id: 'bt1', hora: '07:15', actividadEvento: 'Notificación C5 por sismo con colapso registrado en cámara urbana C5.', observaciones: 'Activación de protocolo Plan Popocatépetl / Terremoto' },
        { id: 'bt2', hora: '07:35', actividadEvento: 'Se declara formalmente Puesto de Comando (PC) en Glorieta Río de Janeiro.', observaciones: 'Comandante: Alejandro Morales' },
        { id: 'bt3', hora: '08:00', actividadEvento: 'Primera reunión táctica de staff. Se definen objetivos del SCI-202.', observaciones: 'Presentes: SEDENA, Bomberos, SSC, CRUM' },
        { id: 'bt4', hora: '08:30', actividadEvento: 'Marcaje positivo de canino Athos-2 en cuadrante Alpha.', observaciones: 'Se suspende ruido en toda la manzana para escucha acústica' },
        { id: 'bt5', hora: '09:10', actividadEvento: 'Extracción de la primera persona con signos vitales estables.', observaciones: 'Trasladada de inmediato a carpa ACV' }
      ]
    },

    sci221: {
      fechaInicioDesmovilizacion: '2026-10-08 18:00',
      prioridadesDesmovilizacion:
        '1. Unidades de apoyo logístico voluntario no especializado; 2. Maquinaria pesada externa; 3. Recursos de seguridad vial una vez normalizada la circulación; 4. Brigadas USAR al finalizar fase de búsqueda.',
      elaboradoPor: 'Lic. Arturo Galindo (Unidad de Desmovilización)',
      recursos: [
        { id: 'dm1', recurso: 'Motopatrullas de Cierre Vial', agencia: 'Policía Metropolitana', inspeccionEquipo: true, informeEntregado: true, comunicacionesDevueltas: true, aprobadoPorCI: true, horaSalida: '2026-10-08 19:30' },
        { id: 'dm2', recurso: 'Generadores Portátiles CFE', agencia: 'CFE Emergencias', inspeccionEquipo: true, informeEntregado: true, comunicacionesDevueltas: true, aprobadoPorCI: false, horaSalida: 'Pendiente' }
      ]
    },

    centroCostos: {
      presupuestoAsignado: 850000,
      fondoCajaChica: 45000,
      responsableFinanzas: 'Lic. Roberto Valdés (Oficial de Finanzas SCI)',
      moneda: 'MXN',
      items: [
        { id: 'fin-1', tipo: 'Inversión', fecha: '2026-10-07', concepto: 'Instalación de Carpa Táctica de Comando Móvil y Sistema Satelital Starlink', categoria: 'Infraestructura de Puesto de Mando', cantidad: 1, unidadMedida: 'Kit', costoUnitario: 120000, montoTotal: 120000, responsable: 'Jefe de Logística', proveedorBeneficiario: 'Telecomunicaciones Tácticas SA', numComprobante: 'FAC-2026-881', estadoPago: 'Pagado', notas: 'Puesto de comando unificado en Río de Janeiro' },
        { id: 'fin-2', tipo: 'Adquisición', fecha: '2026-10-07', concepto: 'Puntales hidráulicos Paratech para estabilización de losas colapsadas', categoria: 'Herramientas Tácticas', cantidad: 4, unidadMedida: 'Pza', costoUnitario: 45000, montoTotal: 180000, responsable: 'Cap. Ruiz (USAR)', proveedorBeneficiario: 'Equipos de Rescate Industrial', numComprobante: 'FAC-4412', estadoPago: 'Pagado', notas: 'Equipo de apuntalamiento pesado para zona cero' },
        { id: 'fin-3', tipo: 'Insumo Gastado', fecha: '2026-10-07', concepto: 'Diésel ultra bajo azufre para generadores y compresores de rescate', categoria: 'Combustible (Gasolina/Diésel)', cantidad: 1200, unidadMedida: 'Litros', costoUnitario: 24.5, montoTotal: 29400, responsable: 'Unidad de Suministros', proveedorBeneficiario: 'Gasolinera Insurgentes Sur', numComprobante: 'REM-9921', estadoPago: 'Pagado', notas: 'Consumo continuo 24 horas para 4 generadores' },
        { id: 'fin-4', tipo: 'Insumo Gastado', fecha: '2026-10-07', concepto: 'Kits de insumos médicos para trauma mayor, collarines y apósitos hemostáticos', categoria: 'Insumos Médicos Desechables', cantidad: 60, unidadMedida: 'Kits', costoUnitario: 850, montoTotal: 51000, responsable: 'Dr. Valenzuela (ACV)', proveedorBeneficiario: 'Distribuidora Médica Hospitalaria', numComprobante: 'FAC-10023', estadoPago: 'Pagado', notas: 'Atención prehospitalaria en ACV' },
        { id: 'fin-5', tipo: 'Gasto', fecha: '2026-10-07', concepto: 'Raciones calientes y desayunos para 120 rescatistas y personal operativo', categoria: 'Alimentación/Raciones', cantidad: 240, unidadMedida: 'Raciones', costoUnitario: 120, montoTotal: 28800, responsable: 'Unidad de Alimentación', proveedorBeneficiario: 'Cocina Comunitaria / Proveedor Local', numComprobante: 'TKT-551', estadoPago: 'Pagado', notas: 'Raciones turnos matutino y vespertino' },
        { id: 'fin-6', tipo: 'Gasto', fecha: '2026-10-07', concepto: 'Renta de 6 sanitarios portátiles y estaciones de lavado de manos para campamento', categoria: 'Servicios Especializados', cantidad: 6, unidadMedida: 'Día', costoUnitario: 1800, montoTotal: 10800, responsable: 'Unidad de Instalaciones', proveedorBeneficiario: 'Sanitarios SanitRent', numComprobante: 'FAC-7819', estadoPago: 'Comprometido', notas: 'Instalados en Parque Río de Janeiro' },
        { id: 'fin-7', tipo: 'Ganancia', fecha: '2026-10-07', concepto: 'Asignación Extraordinaria del Fondo de Atención a Emergencias (FOEN)', categoria: 'Fondo de Emergencia Gubernamental', cantidad: 1, unidadMedida: 'Fondo', costoUnitario: 600000, montoTotal: 600000, responsable: 'Oficial de Finanzas', proveedorBeneficiario: 'Gobierno de la Ciudad de México', numComprobante: 'OFIC-GCM-2026-091', estadoPago: 'Recibido', notas: 'Recurso depositado para cobertura de la emergencia' },
        { id: 'fin-8', tipo: 'Ganancia', fecha: '2026-10-07', concepto: 'Aportación de contingencia municipal y donaciones de víveres valorizadas', categoria: 'Aportación Municipal/Estatal', cantidad: 1, unidadMedida: 'Fondo', costoUnitario: 75000, montoTotal: 75000, responsable: 'Oficial de Enlace', proveedorBeneficiario: 'Alcaldía Cuauhtémoc', numComprobante: 'ACTA-APORT-02', estadoPago: 'Recibido', notas: 'Fondo valorizado para logística' }
      ],
      observacionesFinancieras: 'El balance financiero es favorable (+ $255,000 MXN de saldo operativo disponible). Los fondos extraordinarios cubren plenamente las necesidades de la fase crítica de rescate.'
    },

    controlHorasHombre: {
      coordinadorPersonal: 'Lic. Mario Santillán (Unidad de Tiempo SCI)',
      limiteHorasTurno: 12,
      registros: [
        { id: 'hh-1', fecha: '2026-10-07', brigadaUnidad: 'Fuerza de Tarea USAR México-1', responsableLider: 'Cap. Ruiz', especialidad: 'Búsqueda y Rescate (USAR)', numeroEfectivos: 25, horaInicio: '07:30', horaFin: '15:30', horasPorPersona: 8, horasExtraordinarias: 2, totalHorasHombre: 250, tasaHorariaEstimada: 180, costoTotalPersonal: 45000, areaOperacion: 'Zona Caliente - Edificio Colapsado', actividadDesempenada: 'Búsqueda acústica, corte de losas con disco diamantado y apuntalamiento', condicionFatiga: 'Moderada', notas: 'Relevo programado a las 16:00' },
        { id: 'hh-2', fecha: '2026-10-07', brigadaUnidad: 'Célula Médica Prehospitalaria Triage', responsableLider: 'Dr. Valenzuela', especialidad: 'Atención Médica / Triage', numeroEfectivos: 12, horaInicio: '07:35', horaFin: '15:35', horasPorPersona: 8, horasExtraordinarias: 0, totalHorasHombre: 96, tasaHorariaEstimada: 220, costoTotalPersonal: 21120, areaOperacion: 'ACV Parque Río de Janeiro', actividadDesempenada: 'Estabilización hemodinámica y coordinación de traslados críticos', condicionFatiga: 'Óptima', notas: 'Atención a víctimas' },
        { id: 'hh-3', fecha: '2026-10-07', brigadaUnidad: 'Cuerpo de Bomberos - Cuadrilla HazMat / Corte', responsableLider: 'Of. Mendoza', especialidad: 'Materiales Peligrosos (HazMat)', numeroEfectivos: 10, horaInicio: '07:20', horaFin: '15:20', horasPorPersona: 8, horasExtraordinarias: 1, totalHorasHombre: 90, tasaHorariaEstimada: 190, costoTotalPersonal: 17100, areaOperacion: 'Perímetro Gas LP y Estructura', actividadDesempenada: 'Monitoreo de atmósferas explosivas con multidetector y corte de gas', condicionFatiga: 'Moderada', notas: 'Líneas presurizadas listas' },
        { id: 'hh-4', fecha: '2026-10-07', brigadaUnidad: 'Staff de Comando y Enlace Interinstitucional', responsableLider: 'Cmte. Alejandro Morales', especialidad: 'Mando y Planificación', numeroEfectivos: 8, horaInicio: '07:00', horaFin: '17:00', horasPorPersona: 10, horasExtraordinarias: 2, totalHorasHombre: 96, tasaHorariaEstimada: 250, costoTotalPersonal: 24000, areaOperacion: 'Puesto de Comando (PC)', actividadDesempenada: 'Conducción del SCI, elaboración del PAI y enlace con C5/autoridades', condicionFatiga: 'Moderada', notas: 'Periodo 1 en marcha' }
      ],
      observaciones: 'Total de 532 Horas-Hombre acumuladas en el período. Cuadrillas USAR con rotación programada a las 16:00 para prevenir fatiga extrema conforme a NOM-010.'
    }
  },

  {
    id: 'inc-incendio-02',
    folio: 'SCI-MX-2026-0142',
    nombre: 'Incendio Forestal "Cerro de la Campana"',
    lugar: 'Parque Nacional Cumbres, Sierra Madre Oriental',
    municipioEstado: 'Santiago, Nuevo León',
    coordenadasGPS: '25.4241° N, 100.1534° O',
    tipoIncidente: 'Incendio Forestal',
    nivelComplejidad: 'Tipo 1',
    estadoIncidente: 'Activo',
    comandanteIncidente: 'Ing. Erik Cavazos (Protección Civil Nuevo León)',
    institucionComando: 'CONAFOR / SEDENA / Protección Civil NL / CONANP',
    periodoOperacional: {
      numero: 3,
      fechaInicio: '2026-10-07',
      horaInicio: '06:00',
      fechaFin: '2026-10-07',
      horaFin: '18:00',
    },
    fechaCreacion: '2026-10-05 14:00',
    ultimaModificacion: '2026-10-07 06:30',

    sci201: {
      evaluacionInicial:
        'Incendio de copa y sotobosque afectando 850 hectáreas de pino-encino en terreno escarpado con pendientes mayores a 45 grados. Dos helicópteros MI-17 de la Fuerza Aérea equipados con helibalde operando desde la Helibase San Antonio. 180 brigadistas en línea de fuego.',
      croquisPines: [
        { id: 'fp1', tipo: 'PC', label: 'Puesto de Comando (Laguna de Sánchez)', x: 22, y: 35, color: '#f97316' },
        { id: 'fp2', tipo: 'H', label: 'Helibase Principal San Antonio', x: 78, y: 30, color: '#3b82f6' },
        { id: 'fp3', tipo: 'B', label: 'Base Operacional y Abastecimiento', x: 15, y: 65, color: '#10b981' },
        { id: 'fp4', tipo: 'C', label: 'Campamento Brigadistas', x: 25, y: 78, color: '#8b5cf6' },
        { id: 'fp5', tipo: 'PELIGRO', label: 'Frente Activo de Fuego Cañón del Huajuco', x: 60, y: 55, color: '#dc2626' }
      ],
      croquisNotas: 'Helibase con capacidad para 3 aeronaves simultáneas. Tanques cisterna de 20,000L de agua con retardante.',
      objetivosIniciales: [
        'Contener el flanco izquierdo antes de que alcance la zona de cabañas en Puerto Genovevo.',
        'Apertura de 4.5 km de brecha cortafuego en cresta norte.',
        'Operaciones aéreas continuas de descarga de agua y retardante Phos-Chek.',
        'Mantener 0% accidentes y deshidratación severa en combatientes forestales.'
      ],
      resumenAcciones: [
        { id: 'fa1', hora: '06:15', accion: 'Despacho de brigadas hacia línea de control norte con relevo fresco.', responsable: 'Jefe Operaciones' },
        { id: 'fa2', hora: '07:30', accion: 'Despegue de helicópteros MI-17 para primer ciclo de 12 descargas.', responsable: 'Coordinador Aéreo' },
        { id: 'fa3', hora: '09:00', accion: 'Brecha cortafuego completada en 60% por brigada CONAFOR Sierra.', responsable: 'Brigada CONAFOR' }
      ],
      recursosAsignadosIniciales: [
        { id: 'fr1', recurso: 'Brigadas Oficiales CONAFOR (6 brigadas)', tipoClase: 'Tipo II Combatientes', cantidad: 60, responsable: 'Ing. Villarreal', ubicacion: 'Flanco Izquierdo', horaArribo: '05:45' },
        { id: 'fr2', recurso: 'Helicóptero MI-17 FAM con Bambi Bucket 2500L', tipoClase: 'Helicóptero Pesado', cantidad: 2, responsable: 'Cor. Piloto Pantoja', ubicacion: 'Helibase', horaArribo: '06:00' },
        { id: 'fr3', recurso: 'Pipas Cisterna 20,000L Agua y Bomba', tipoClase: 'Nodriza', cantidad: 5, responsable: 'Servicios de Agua NL', ubicacion: 'Base San Antonio', horaArribo: '05:30' }
      ],
      organizacionInicial: {
        comandante: 'Ing. Erik Cavazos (PC Nuevo León)',
        seguridad: 'Cmdte. Miguel Ángel Perales',
        informacion: 'Lic. Lorena Morales',
        enlace: 'Myr. Gilberto Garza (SEDENA)',
        operaciones: 'Ing. Rogelio Villarreal (CONAFOR)',
        planificacion: 'Ing. Mapeo GIS Sandra Beltrán',
        logistica: 'Lic. Jorge Camacho',
        administracion: 'Lic. Teresa Treviño'
      }
    },

    sci202: {
      objetivos: [
        { id: 'fob1', texto: 'Lograr 75% de contención del perímetro este y norte al final del período operacional.', prioridad: 'Alta', estado: 'En progreso' },
        { id: 'fob2', texto: 'Realizar 40 descargas aéreas de retardante en el Cañón del Huajuco.', prioridad: 'Alta', estado: 'En progreso' },
        { id: 'fob3', texto: 'Proteger 100% de las 42 viviendas rurales dispersas sin daños a infraestructura.', prioridad: 'Alta', estado: 'Cumplido' }
      ],
      estrategiasTácticas:
        'Ataque directo en flancos fríos con línea negra controlada; ataque indirecto mediante brechas de 3 metros y contrafuego en cresta norte; apoyo aéreo concentrado en puntos calientes inaccesibles.',
      directricesSeguridad:
        'Estricto cumplimiento de las 18 Situaciones que Gritan ¡Cuidado! y las 10 Normas de Seguridad Forestal. Zona de seguridad y ruta de escape designada para cada combatiente antes de iniciar faena.',
      pronosticoMeteorologico: {
        condicion: 'Despejado con radiación solar intensa',
        temperatura: '34°C max / 18°C min',
        viento: 'Viento del Poniente a 25 km/h con rachas de 40 km/h al mediodía (Efecto Föhn)',
        humedad: '18% (Alerta de comportamiento extremo del fuego)',
        observaciones: 'Condiciones de la regla 30-30-30 presentes (Temp > 30°C, Humedad < 30%, Viento > 30 km/h).'
      },
      aprobadoPorCI: 'Ing. Erik Cavazos',
      fechaAprobacion: '2026-10-07 06:15',
      firmaCIData: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 30 Q 60 5, 120 40 T 190 25" stroke="%23ea580c" stroke-width="3" fill="none"/></svg>'
    },

    sci203: {
      mando: {
        comandante: 'Ing. Erik Cavazos (PC Nuevo León)',
        comandanteAdjunto: 'Ing. Roberto Hernández (CONAFOR Delegación)',
        oficialSeguridad: 'Cmdte. Miguel Ángel Perales',
        oficialInformacion: 'Lic. Lorena Morales',
        oficialEnlace: 'Myr. Gilberto Garza (SEDENA)'
      },
      operaciones: {
        jefe: 'Ing. Rogelio Villarreal (Jefe de Operaciones)',
        directorRama1: 'Cap. Piloto Pantoja (Director Rama Aérea)',
        divisionesGrupos: [
          { id: 'fdg1', nombre: 'División Flanco Norte (Cresta)', responsable: 'Líder Brigada CONAFOR 01', recursosAsignados: '40 Combatientes + Herramienta Pulaski/McLeod', contacto: 'Radio Canal 2' },
          { id: 'fdg2', nombre: 'División Flanco Sur (Cañón)', responsable: 'Líder Bomberos NL', recursosAsignados: 'Pipas + Motobombas forestales Mark-3', contacto: 'Radio Canal 3' },
          { id: 'fdg3', nombre: 'Rama Operaciones Aéreas', responsable: 'Cap. Pantoja', recursosAsignados: '2 MI-17 + 1 Bell 206 Reconocimiento', contacto: 'Frecuencia Banda Aérea 123.025 MHz' }
        ]
      },
      planificacion: {
        jefe: 'Ing. Sandra Beltrán (Planificación y SIG)',
        unidadRecursos: 'Lic. Daniel Saldaña',
        unidadSituacion: 'Biól. Ernesto Galindo (Comportamiento del fuego)',
        unidadDocumentacion: 'Lic. Marcela Cruz',
        unidadDesmovilizacion: 'Lic. Ramón Soto'
      },
      logistica: {
        jefe: 'Lic. Jorge Camacho (Logística)',
        unidadComunicaciones: 'Ing. Red Repetidoras Sierra',
        unidadMedica: 'Dr. Alejandro Téllez',
        unidadAlimentacion: 'Comedor Campamento La Ciénega',
        unidadSuministros: 'Lic. Rodolfo Garza (Combustible turbosina y gasolina)',
        unidadInstalaciones: 'Ing. Alberto Silva'
      },
      administracion: {
        jefe: 'Lic. Teresa Treviño (Administración)',
        unidadTiempo: 'Lic. Adriana Cantú',
        unidadCostos: 'C.P. Bernardo Morales',
        unidadAdquisiciones: 'Lic. Karla Ruiz',
        unidadCompensaciones: 'Lic. Manuel Lozano'
      }
    },

    sci204: {
      asignaciones: [
        {
          id: 'fas1',
          divisionGrupo: 'División Norte - Brecha Cortafuego',
          supervisor: 'Ing. David Salinas',
          funcionOperacional: 'Apertura de línea de defensa con motosierras y rastrillos McLeod en 2.8 km de cresta.',
          recursosAsignados: 'Brigadas CONAFOR 1, 2 y 3 (45 elementos con equipo de protección forestal).',
          instruccionesEspeciales: 'Vigilar chispas que brinquen la brecha cortafuego por las rachas de viento vespertino.',
          canalComunicaciones: 'Canal 2 (Táctica 1 - 154.200 MHz)'
        },
        {
          id: 'fas2',
          divisionGrupo: 'Rama Aérea - Descargas Bambi Bucket',
          supervisor: 'Cap. Piloto Pantoja',
          funcionOperacional: 'Ataque aéreo en focos secundarios del Cañón del Huajuco en coordinación con guía terrestre.',
          recursosAsignados: '2 Helicópteros MI-17 FAM, 1 Tanque Nodriza Turbosina Jet A-1.',
          instruccionesEspeciales: 'Suspender operaciones de vuelo si ráfagas superan 45 km/h o visibilidad cae a < 1 km por humo.',
          canalComunicaciones: 'Banda Aérea VHF 123.025 MHz / Canal 4 Táctico'
        }
      ]
    },

    sci205: {
      canales: [
        { id: 'fc1', canal: 'Canal 1 (MANDO FORESTAL)', funcion: 'Comando y Coordinación General', frecuenciaRX: '154.100 MHz', frecuenciaTX: '159.100 MHz', tono: '110.9 Hz', asignadoA: 'CI y Jefes de Sección', observaciones: 'Repetidor Cerro La Viga' },
        { id: 'fc2', canal: 'Canal 2 (LÍNEA NORTE)', funcion: 'Operaciones Terrestres de Brecha', frecuenciaRX: '154.200 MHz', frecuenciaTX: '154.200 MHz', tono: 'Directo', asignadoA: 'Brigadas CONAFOR', observaciones: 'Simplex táctico' },
        { id: 'fc3', canal: 'Canal 3 (LÍNEA SUR)', funcion: 'Operaciones Mecanizadas y Pipas', frecuenciaRX: '154.300 MHz', frecuenciaTX: '154.300 MHz', tono: 'Directo', asignadoA: 'Bomberos y Pipas', observaciones: 'Simplex' },
        { id: 'fc4', canal: 'Canal AÉREO (123.025)', funcion: 'Coordinación Aire-Tierra', frecuenciaRX: '123.025 MHz AM', frecuenciaTX: '123.025 MHz AM', tono: 'N/A', asignadoA: 'Helicópteros y Guías en tierra', observaciones: 'Frecuencia aeronáutica civil' }
      ],
      directricesComunicaciones:
        'Palabras claras. Ante cambio súbito de dirección de viento, se emitirá alerta meteorológica de emergencia con clave ¡BANDERA ROJA!.',
      elaboradoPor: 'Ing. Red Repetidoras Sierra'
    },

    sci206: {
      puestosMedicos: [
        { id: 'fpm1', nombre: 'Puesto de Salud y Desintoxicación Laguna de Sánchez', ubicacion: 'A un costado del Campamento C', contacto: 'Dr. Alejandro Téllez - Ch 1', paramedicos: '3 Médicos + 6 Camilleros' }
      ],
      ambulancias: [
        { id: 'famb1', unidad: 'PC-NL-Unidad 4x4 Rescate', institucion: 'Protección Civil NL', tipo: 'Rescate', contacto: '81-8344-0050', ubicacion: 'Helibase' },
        { id: 'famb2', unidad: 'AMB-SANTIAGO-MUNICIPAL-02', institucion: 'Servicios Médicos de Emergencia Santiago', tipo: 'Soporte Vital Básico (SVB)', contacto: '81-2285-0010', ubicacion: 'Base Operacional' }
      ],
      hospitales: [
        { id: 'fh1', nombre: 'Hospital General de Montemorelos', direccion: 'Carr. Nacional Km 220, Montemorelos', telefono: '826-263-2000', tiempoTrasladoMin: 35, helipuerto: true, quemados: false, traumaShock: true },
        { id: 'fh2', nombre: 'Hospital Universitario de Monterrey Dr. José Eleuterio González', direccion: 'Madero y Gonzalitos, Monterrey', telefono: '81-8389-1111', tiempoTrasladoMin: 55, helipuerto: true, quemados: true, traumaShock: true }
      ],
      procedimientoEvacuacionMedica:
        'Evacuación aeromédica inmediata en helicóptero Bell 206 en caso de quemaduras de segundo/tercer grado o atrapamiento por fuego.',
      elaboradoPor: 'Dr. Alejandro Téllez'
    },

    sci207: {
      recursos: [
        { id: 'frc1', recurso: 'Brigada CONAFOR 01 (15 combatientes)', categoria: 'Combatientes Forestales', institucion: 'CONAFOR', estado: 'Asignado', ubicacionActual: 'Cresta Norte', contacto: 'Líder Salinas' },
        { id: 'frc2', recurso: 'Helicóptero MI-17 FAM', categoria: 'Aeronave Ala Rotativa', institucion: 'Fuerza Aérea Mexicana', estado: 'Asignado', ubicacionActual: 'En vuelo - Descargas', contacto: 'Cap. Pantoja' },
        { id: 'frc3', recurso: 'Bulldozer D6 Oruga', categoria: 'Maquinaria Brechas', institucion: 'SCT / Obras Públicas', estado: 'Asignado', ubicacionActual: 'Acceso Camino a Ciénega', contacto: 'Operador Jaime' },
        { id: 'frc4', recurso: 'Carro Cisterna Bomberos 10,000L', categoria: 'Vehículo Contraincendio', institucion: 'Bomberos NL', estado: 'Disponible', ubicacionActual: 'Área de Espera', contacto: 'Of. Lozano' }
      ],
      triajeVictimas: {
        rojoInmediato: 0,
        amarilloDiferido: 2,
        verdeLeve: 6,
        negroFallecido: 0,
        trasladados: 2
      }
    },

    sci208: {
      mensajeSeguridadGeneral:
        'CUIDADO CON EL EFECTO CHIMENEA EN CAÑADAS. Si el fuego se corona en copas, repliéguese de inmediato a la zona quemada fría.',
      riesgos: [
        { id: 'frs1', riesgo: 'Comportamiento extremo del fuego por viento Föhn', probabilidad: 'Alta', severidad: 'Crítica', medidasMitigacion: 'No combatir en pendientes ascendentes con fuego debajo; mantener vigilantes activos.' },
        { id: 'frs2', riesgo: 'Caída de piedras y rodamiento de troncos encendidos colina abajo', probabilidad: 'Alta', severidad: 'Grave', medidasMitigacion: 'Prohibido trabajar en línea vertical unos debajo de otros.' }
      ],
      equipoProteccionPersonal: [
        'Camisola y pantalón de Nomex amarillo brillante retardante al fuego',
        'Casco forestal Bullard con monja de nomex y gafas antiflama',
        'Botas de cuero de caña alta con suela Vibram cosida (sin casquillo metálico térmico)',
        'Guantes de vaqueta forestal',
        'Refugio de protección personal (Fire Shelter) obligatorio en cintura'
      ],
      alarmaEvacuacionEmergencia:
        'Sirena continua de unidad nodriza y aviso radial de BANDERA ROJA. Correr con calma al Fire Shelter o zona de seguridad asignada.',
      elaboradoPor: 'Cmdte. Miguel Ángel Perales (Oficial de Seguridad)'
    },

    sci209: {
      porcentajeControl: 65,
      resumenSituacion:
        '850 hectáreas siniestradas. Flanco norte contenido en un 70%. Flanco sur activo pero con avance lento gracias a 28 descargas de helibalde realizadas en la mañana.',
      danosHumanos: {
        lesionadosRescatistas: 2,
        lesionadosCiviles: 0,
        fallecidos: 0,
        evacuados: 35,
        albergados: 12
      },
      danosEstructuralesInfraestructura:
        'Cero viviendas consumidas. Daño en 1 puente rústico de madera y tendido eléctrico rural local.',
      accionesSiguientes24Horas:
        'Continuar liquidación y enfriamiento de puntos calientes en perímetro norte; monitoreo satelital nocturno con cámaras térmicas.',
      elaboradoPor: 'Ing. Sandra Beltrán (Planificación)',
      autorizadoPorCI: 'Ing. Erik Cavazos (Comandante del Incidente)'
    },

    sci211: {
      lugarRegistroCheckIn: 'Punto de Control Puerto Genovevo',
      encargadoCheckIn: 'Lic. Daniel Saldaña',
      ingresos: [
        { id: 'fck1', fechaHora: '2026-10-07 05:30', recursoVehiculo: 'Camión Transporte 4x4 CONAFOR', agenciaInstitucion: 'CONAFOR Región II', nombreLider: 'David Salinas', numEfectivos: 20, clasificacionTipo: 'Combatientes', puntoIngreso: 'Acceso Carretera Santiago', asignadoA: 'División Norte' },
        { id: 'fck2', fechaHora: '2026-10-07 05:50', recursoVehiculo: 'Pickup Rápida Amigos de la Sierra', agenciaInstitucion: 'Voluntarios Capacitados', nombreLider: 'Héctor Guerra', numEfectivos: 8, clasificacionTipo: 'Logística Terrestre', puntoIngreso: 'Acceso Laguna', asignadoA: 'Base Operacional' }
      ]
    },

    sci214: {
      unidadNombre: 'Sección de Operaciones Forestales',
      responsableBitacora: 'Lic. Marcela Cruz',
      entradas: [
        { id: 'fbt1', hora: '06:00', actividadEvento: 'Reunión matutina (Briefing) de asignación táctica a líderes de brigada.', observaciones: 'Se entrega copia de SCI-204 a cada jefe' },
        { id: 'fbt2', hora: '07:15', actividadEvento: 'Helicóptero MI-17 reporta primer cargamento de retardante en represa.', observaciones: 'Tiempo de ciclo: 8 minutos por descarga' },
        { id: 'fbt3', hora: '09:30', actividadEvento: 'Racha de viento de 38 km/h activa foco secundario en cañada.', observaciones: 'Se redirige descarga de helicóptero con éxito' }
      ]
    },

    sci221: {
      fechaInicioDesmovilizacion: '2026-10-09 12:00',
      prioridadesDesmovilizacion:
        'Maquinaria pesada externa primero; helicópteros de Fuerza Aérea cuando el fuego alcance 90% de control; brigadas voluntarias.',
      elaboradoPor: 'Lic. Ramón Soto',
      recursos: [
        { id: 'fdm1', recurso: 'Bulldozer D6 SCT', agencia: 'SCT Obras', inspeccionEquipo: true, informeEntregado: true, comunicacionesDevueltas: true, aprobadoPorCI: false, horaSalida: 'Pendiente' }
      ]
    },

    centroCostos: {
      presupuestoAsignado: 1250000,
      fondoCajaChica: 60000,
      responsableFinanzas: 'C.P. Daniela Ríos (Logística y Finanzas PCNL)',
      moneda: 'MXN',
      items: [
        { id: 'f-fin1', tipo: 'Inversión', fecha: '2026-10-07', concepto: 'Acondicionamiento de Helibase San Antonio con tanque nodriza y mangas de viento', categoria: 'Infraestructura de Puesto de Mando', cantidad: 1, unidadMedida: 'Servicio', costoUnitario: 145000, montoTotal: 145000, responsable: 'Coordinador Aéreo', proveedorBeneficiario: 'Infraestructura del Norte SA', numComprobante: 'FAC-9912', estadoPago: 'Pagado', notas: 'Base operativa aérea' },
        { id: 'f-fin2', tipo: 'Adquisición', fecha: '2026-10-07', concepto: 'Herramienta McLeod, pulaskis y antorchas de goteo para combatientes forestales', categoria: 'Herramientas Tácticas', cantidad: 45, unidadMedida: 'Kit', costoUnitario: 3200, montoTotal: 144000, responsable: 'Jefe de Operaciones Forestales', proveedorBeneficiario: 'Equipo Forestal ForestMaster', numComprobante: 'FAC-1234', estadoPago: 'Pagado', notas: 'Equipamiento de relevos' },
        { id: 'f-fin3', tipo: 'Insumo Gastado', fecha: '2026-10-07', concepto: 'Biológico retardante de fuego Phos-Chek para helicópteros FAM', categoria: 'Agentes Extintores / Espuma', cantidad: 3500, unidadMedida: 'Litros', costoUnitario: 42.0, montoTotal: 147000, responsable: 'Coordinador Aéreo', proveedorBeneficiario: 'Química Forestal Internacional', numComprobante: 'REM-3312', estadoPago: 'Pagado', notas: 'Descargas en línea de control norte' },
        { id: 'f-fin4', tipo: 'Insumo Gastado', fecha: '2026-10-07', concepto: 'Turbosina y combustible para helicópteros y vehículos 4x4', categoria: 'Combustible (Gasolina/Diésel)', cantidad: 4000, unidadMedida: 'Litros', costoUnitario: 28.5, montoTotal: 114000, responsable: 'Unidad de Suministros', proveedorBeneficiario: 'Servicios Aeroportuarios del Norte', numComprobante: 'FAC-5520', estadoPago: 'Pagado', notas: 'Suministro en helibase' },
        { id: 'f-fin5', tipo: 'Gasto', fecha: '2026-10-07', concepto: 'Servicio de ambulancia aérea y apoyo médico en helibase', categoria: 'Servicios Especializados', cantidad: 1, unidadMedida: 'Día', costoUnitario: 25000, montoTotal: 25000, responsable: 'Unidad Médica', proveedorBeneficiario: 'Ambulancias Aéreas de NL', numComprobante: 'FAC-7701', estadoPago: 'Comprometido', notas: 'Guardia activa para combatientes' },
        { id: 'f-fin6', tipo: 'Ganancia', fecha: '2026-10-07', concepto: 'Fondo Estatal de Contingencias Ambientales y Protección Civil NL', categoria: 'Aportación Municipal/Estatal', cantidad: 1, unidadMedida: 'Fondo', costoUnitario: 800000, montoTotal: 800000, responsable: 'Oficial de Finanzas', proveedorBeneficiario: 'Gobierno del Estado de Nuevo León', numComprobante: 'OFIC-NL-2026-44', estadoPago: 'Recibido', notas: 'Ministración de emergencia autorizada' }
      ],
      observacionesFinancieras: 'El operativo cuenta con cobertura financiera garantizada por el Estado de Nuevo León y CONAFOR.'
    },

    controlHorasHombre: {
      coordinadorPersonal: 'Ing. Carlos Elizondo (Unidad de Recursos)',
      limiteHorasTurno: 10,
      registros: [
        { id: 'f-hh1', fecha: '2026-10-07', brigadaUnidad: 'Brigada CONAFOR Sierra 01', responsableLider: 'David Salinas', especialidad: 'Combate de Incendios', numeroEfectivos: 20, horaInicio: '06:00', horaFin: '14:00', horasPorPersona: 8, horasExtraordinarias: 0, totalHorasHombre: 160, tasaHorariaEstimada: 175, costoTotalPersonal: 28000, areaOperacion: 'Cresta Norte - Brecha Cortafuego', actividadDesempenada: 'Apertura de brecha y contrafuego táctico', condicionFatiga: 'Moderada', notas: 'Relevo efectuado a las 14:00' },
        { id: 'f-hh2', fecha: '2026-10-07', brigadaUnidad: 'Tripulación Aérea MI-17 FAM y Helibase', responsableLider: 'Cap. Pantoja', especialidad: 'Operación de Maquinaria', numeroEfectivos: 6, horaInicio: '06:30', horaFin: '14:30', horasPorPersona: 8, horasExtraordinarias: 1, totalHorasHombre: 54, tasaHorariaEstimada: 350, costoTotalPersonal: 18900, areaOperacion: 'Helibase San Antonio y espacio aéreo', actividadDesempenada: 'Descargas de agua con helibalde y coordinación aerotáctica', condicionFatiga: 'Óptima', notas: '18 ciclos completados' },
        { id: 'f-hh3', fecha: '2026-10-07', brigadaUnidad: 'Brigada Logística y Abastecimiento de Agua', responsableLider: 'Héctor Guerra', especialidad: 'Logística y Abastecimiento', numeroEfectivos: 12, horaInicio: '05:30', horaFin: '15:30', horasPorPersona: 10, horasExtraordinarias: 0, totalHorasHombre: 120, tasaHorariaEstimada: 160, costoTotalPersonal: 19200, areaOperacion: 'Pipas Base Laguna y Puesto de Mando', actividadDesempenada: 'Suministro continuo de agua e hidratación con electrolitos', condicionFatiga: 'Óptima', notas: 'Abastecimiento al 100%' }
      ],
      observaciones: 'Total de 334 Horas-Hombre trabajadas. Rotación estricta a 8 horas en línea de fuego para evitar golpe de calor.'
    }
  }
];

export const BLANK_INCIDENT_TEMPLATE: IncidentData = {
  id: 'inc-nuevo',
  folio: `SCI-MX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  nombre: 'Incidente Operativo Nuevo',
  lugar: 'Ubicación de la Escena / Dirección',
  municipioEstado: 'Municipio, Estado',
  coordenadasGPS: '',
  tipoIncidente: 'Sismo / Terremoto',
  nivelComplejidad: 'Tipo 3',
  estadoIncidente: 'Activo',
  comandanteIncidente: 'Comandante del Incidente (Nombre y Agencia)',
  institucionComando: 'Coordinación Municipal / Estatal de Protección Civil',
  periodoOperacional: {
    numero: 1,
    fechaInicio: new Date().toISOString().slice(0, 10),
    horaInicio: '08:00',
    fechaFin: new Date().toISOString().slice(0, 10),
    horaFin: '20:00',
  },
  fechaCreacion: new Date().toISOString().replace('T', ' ').slice(0, 16),
  ultimaModificacion: new Date().toISOString().replace('T', ' ').slice(0, 16),

  sci201: {
    evaluacionInicial: '',
    croquisPines: [
      { id: 'bp1', tipo: 'PC', label: 'Puesto de Comando (PC)', x: 30, y: 35, color: '#f97316' },
      { id: 'bp2', tipo: 'E', label: 'Área de Espera (E)', x: 70, y: 30, color: '#eab308' },
      { id: 'bp3', tipo: 'ACV', label: 'Área Concentración Víctimas (ACV)', x: 35, y: 70, color: '#ef4444' }
    ],
    croquisNotas: '',
    objetivosIniciales: [
      'Establecer y señalizar el Puesto de Comando (PC).',
      'Evaluar la seguridad de la escena y determinar áreas de riesgo (Zona caliente, tibia y fría).',
      'Determinar necesidades de recursos y solicitar apoyos iniciales.'
    ],
    resumenAcciones: [
      { id: 'ba1', hora: '08:00', accion: 'Arribo de primer respondiente y asunción del mando SCI.', responsable: 'Primer Respondiente' }
    ],
    recursosAsignadosIniciales: [],
    organizacionInicial: {
      comandante: '',
      seguridad: '',
      informacion: '',
      enlace: '',
      operaciones: '',
      planificacion: '',
      logistica: '',
      administracion: ''
    }
  },

  sci202: {
    objetivos: [
      { id: 'bob1', texto: 'Garantizar la seguridad y protección de la vida de los rescatistas y la población.', prioridad: 'Alta', estado: 'En progreso' },
      { id: 'bob2', texto: 'Aislar y controlar la zona del incidente en el período operacional actual.', prioridad: 'Alta', estado: 'En progreso' }
    ],
    estrategiasTácticas: '',
    directricesSeguridad: 'Uso obligatorio del Equipo de Protección Personal (EPP). Mantener alcance de control de 3 a 7 personas.',
    pronosticoMeteorologico: {
      condicion: 'Despejado',
      temperatura: '24°C',
      viento: 'Calmo',
      humedad: '50%',
      observaciones: ''
    },
    aprobadoPorCI: '',
    fechaAprobacion: '',
    firmaCIData: ''
  },

  sci203: {
    mando: {
      comandante: '',
      comandanteAdjunto: '',
      oficialSeguridad: '',
      oficialInformacion: '',
      oficialEnlace: ''
    },
    operaciones: {
      jefe: '',
      directorRama1: '',
      divisionesGrupos: []
    },
    planificacion: {
      jefe: '',
      unidadRecursos: '',
      unidadSituacion: '',
      unidadDocumentacion: '',
      unidadDesmovilizacion: ''
    },
    logistica: {
      jefe: '',
      unidadComunicaciones: '',
      unidadMedica: '',
      unidadAlimentacion: '',
      unidadSuministros: '',
      unidadInstalaciones: ''
    },
    administracion: {
      jefe: '',
      unidadTiempo: '',
      unidadCostos: '',
      unidadAdquisiciones: '',
      unidadCompensaciones: ''
    }
  },

  sci204: {
    asignaciones: []
  },

  sci205: {
    canales: [
      { id: 'bc1', canal: 'Canal 1 (MANDO)', funcion: 'Comando y Coordinación General', frecuenciaRX: '154.000 MHz', frecuenciaTX: '159.000 MHz', tono: '100.0 Hz', asignadoA: 'Staff de Mando', observaciones: 'Uso exclusivo' },
      { id: 'bc2', canal: 'Canal 2 (OPERACIONES)', funcion: 'Táctico y Operaciones en Escena', frecuenciaRX: '154.100 MHz', frecuenciaTX: '154.100 MHz', tono: 'Directo', asignadoA: 'Sección de Operaciones', observaciones: 'Simplex' }
    ],
    directricesComunicaciones: 'Utilizar lenguaje claro, evitar códigos y apodos. Brevedad y concisión.',
    elaboradoPor: ''
  },

  sci206: {
    puestosMedicos: [],
    ambulancias: [],
    hospitales: [],
    procedimientoEvacuacionMedica: 'En caso de socorrista lesionado, notificar de inmediato por canal de mando con clave MAYDAY.',
    elaboradoPor: ''
  },

  sci207: {
    recursos: [],
    triajeVictimas: {
      rojoInmediato: 0,
      amarilloDiferido: 0,
      verdeLeve: 0,
      negroFallecido: 0,
      trasladados: 0
    },
    pacientesAtendidos: []
  },

  sci208: {
    mensajeSeguridadGeneral: 'La seguridad es prioridad número uno en todas las maniobras.',
    riesgos: [],
    equipoProteccionPersonal: [
      'Casco de protección normado con barboquejo',
      'Protección ocular (goggles o lentes de seguridad)',
      'Guantes de trabajo específicos para la tarea',
      'Calzado de seguridad industrial con suela antideslizante',
      'Chaleco de alta visibilidad con identificación SCI'
    ],
    alarmaEvacuacionEmergencia: 'Tres señales acústicas prolongadas (3 segundos cada una).',
    elaboradoPor: ''
  },

  sci209: {
    porcentajeControl: 10,
    resumenSituacion: '',
    danosHumanos: {
      lesionadosRescatistas: 0,
      lesionadosCiviles: 0,
      fallecidos: 0,
      evacuados: 0,
      albergados: 0
    },
    danosEstructuralesInfraestructura: '',
    accionesSiguientes24Horas: '',
    elaboradoPor: '',
    autorizadoPorCI: ''
  },

  sci211: {
    lugarRegistroCheckIn: 'Área de Espera (E)',
    encargadoCheckIn: '',
    ingresos: []
  },

  sci214: {
    unidadNombre: 'Puesto de Comando',
    responsableBitacora: '',
    entradas: []
  },

  sci221: {
    fechaInicioDesmovilizacion: '',
    prioridadesDesmovilizacion: 'Desmovilizar recursos en orden inverso a su arribo cuando sus funciones hayan concluido satisfactoriamente.',
    elaboradoPor: '',
    recursos: []
  },

  centroCostos: {
    presupuestoAsignado: 0,
    fondoCajaChica: 0,
    responsableFinanzas: '',
    moneda: 'MXN',
    items: [],
    observacionesFinancieras: ''
  },

  controlHorasHombre: {
    coordinadorPersonal: '',
    limiteHorasTurno: 8,
    registros: [],
    observaciones: ''
  }
};
