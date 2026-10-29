import { IncidentData, SCI209Data } from '../types/sci';

export function consolidateSCI209Data(
  incident: IncidentData,
  currentSCI209?: Partial<SCI209Data>
): SCI209Data {
  const current = currentSCI209 || incident.sci209 || ({} as Partial<SCI209Data>);

  const triaje = incident.sci207?.triajeVictimas || {
    rojoInmediato: 0,
    amarilloDiferido: 0,
    verdeLeve: 0,
    negroFallecido: 0,
    trasladados: 0
  };

  const totalLesionadosCiviles =
    (triaje.rojoInmediato || 0) +
    (triaje.amarilloDiferido || 0) +
    (triaje.verdeLeve || 0);

  const fallecidosCalculados = triaje.negroFallecido || 0;

  const lesionadosCiviles = Math.max(
    totalLesionadosCiviles,
    current.danosHumanos?.lesionadosCiviles || 0
  );
  const fallecidos = Math.max(
    fallecidosCalculados,
    current.danosHumanos?.fallecidos || 0
  );
  const lesionadosRescatistas = current.danosHumanos?.lesionadosRescatistas || 0;
  const evacuados = current.danosHumanos?.evacuados || 0;
  const albergados = current.danosHumanos?.albergados || 0;

  const ingresos = incident.sci211?.ingresos || [];
  const totalEfectivosCheckIn = ingresos.reduce(
    (acc, it) => acc + (Number(it.numEfectivos) || 0),
    0
  );
  const totalVehiculos = ingresos.length;
  const agenciasUnicas = Array.from(
    new Set(ingresos.map((it) => it.agenciaInstitucion).filter(Boolean))
  );

  const pines = incident.sci201?.croquisPines || [];
  const pcCount = pines.filter((p) => p.tipo === 'PC').length;
  const acvCount = pines.filter((p) => p.tipo === 'ACV').length;
  const esperaCount = pines.filter((p) => p.tipo === 'E').length;
  const baseCount = pines.filter((p) => p.tipo === 'B').length;
  const helibaseCount = pines.filter((p) => p.tipo === 'H' || p.tipo === 'H1').length;

  const periodoNum = incident.periodoOperacional?.numero || 1;
  const periodoInicio = `${incident.periodoOperacional?.fechaInicio || ''} ${incident.periodoOperacional?.horaInicio || ''}`.trim();
  const periodoFin = `${incident.periodoOperacional?.fechaFin || ''} ${incident.periodoOperacional?.horaFin || ''}`.trim();
  const clima = incident.sci202?.pronosticoMeteorologico;
  const climaResumen = clima
    ? `Clima: ${clima.temperatura || 'N/D'}, Viento: ${clima.viento || 'N/D'}, ${clima.condicion || clima.observaciones || ''}`.trim()
    : '';

  const objetivos = incident.sci202?.objetivos || [];
  const objetivosTexto = objetivos
    .slice(0, 3)
    .map((o, idx) => `${idx + 1}. ${o.texto} [${o.estado}]`)
    .join('; ');

  const asignaciones = incident.sci204?.asignaciones || [];
  const asignacionesTexto = asignaciones
    .slice(0, 3)
    .map((a) => `${a.divisionGrupo}: ${a.funcionOperacional}`)
    .join('; ');

  const partesResumen: string[] = [];
  partesResumen.push(
    `[INCIDENTE]: ${incident.nombre || 'Sin nombre'} (${incident.tipoIncidente}) en ${incident.lugar || 'N/D'}, ${incident.municipioEstado || 'Tepatitlán de Morelos, Jalisco'}.`
  );
  partesResumen.push(
    `[PERÍODO OPERACIONAL Nº ${periodoNum}]: Vigencia de ${periodoInicio || 'N/D'} a ${periodoFin || 'N/D'}. Nivel de Complejidad: ${incident.nivelComplejidad}. Porcentaje de control estimado: ${current.porcentajeControl || 0}%.`
  );
  if (climaResumen) {
    partesResumen.push(`[CONDICIONES METEOROLÓGICAS]: ${climaResumen}.`);
  }
  if (agenciasUnicas.length > 0 || totalEfectivosCheckIn > 0) {
    partesResumen.push(
      `[FUERZAS EN ESCENA]: ${totalEfectivosCheckIn} efectivos y ${totalVehiculos} unidades de ${agenciasUnicas.join(', ') || 'Cruz Roja Mexicana Delegación Tepatitlan'}.`
    );
  }
  if (pines.length > 0) {
    partesResumen.push(
      `[INSTALACIONES SCI ACTIVAS]: ${pines.length} instalaciones desplegadas (${pcCount} PC, ${esperaCount} Área de Espera, ${acvCount} ACV, ${baseCount} Base, ${helibaseCount} Helibases/Helipuntos).`
    );
  }
  if (totalLesionadosCiviles > 0 || triaje.trasladados > 0 || fallecidosCalculados > 0) {
    partesResumen.push(
      `[EVALUACIÓN MÉDICA CRM]: ${totalLesionadosCiviles} lesionados civiles (Rojo: ${triaje.rojoInmediato}, Amarillo: ${triaje.amarilloDiferido}, Verde: ${triaje.verdeLeve}), ${fallecidosCalculados} fallecidos, ${triaje.trasladados} traslados hospitalarios realizados.`
    );
  }
  if (objetivosTexto) {
    partesResumen.push(`[OBJETIVOS EN EJECUCIÓN]: ${objetivosTexto}.`);
  }
  if (incident.comandanteIncidente) {
    partesResumen.push(
      `[COMANDO]: Mando a cargo de ${incident.comandanteIncidente} (${incident.institucionComando || 'Cruz Roja Mexicana Delegación Tepatitlan'}).`
    );
  }

  const resumenGenerado = partesResumen.join('\n\n');

  const riesgos = incident.sci208?.riesgos || [];
  const riesgosTexto = riesgos
    .slice(0, 3)
    .map((r) => `• ${r.riesgo} (Severidad: ${r.severidad})`)
    .join('\n');

  const danosEstructuralesGenerado = riesgosTexto
    ? `Riesgos estructurales y perimetrales identificados en zona cero:\n${riesgosTexto}`
    : current.danosEstructuralesInfraestructura ||
      'Evaluación estructural en curso. Sin colapso de vías críticas reportado.';

  const accionesGeneradas = asignacionesTexto
    ? `Continuidad táctica para el siguiente turno:\n• Operaciones: ${asignacionesTexto}\n• Relevos de brigadistas y continuidad de abastecimiento logístico.`
    : current.accionesSiguientes24Horas ||
      'Mantener objetivos de contención, rotación de personal y aseguramiento perimetral.';

  return {
    porcentajeControl: current.porcentajeControl ?? 35,
    resumenSituacion: current.resumenSituacion ? current.resumenSituacion : resumenGenerado,
    danosHumanos: {
      lesionadosRescatistas,
      lesionadosCiviles,
      fallecidos,
      evacuados,
      albergados
    },
    danosEstructuralesInfraestructura: current.danosEstructuralesInfraestructura || danosEstructuralesGenerado,
    accionesSiguientes24Horas: current.accionesSiguientes24Horas || accionesGeneradas,
    elaboradoPor:
      current.elaboradoPor ||
      incident.sci203?.planificacion?.jefe ||
      'Oficial de Planificación y Situación',
    autorizadoPorCI: current.autorizadoPorCI || incident.comandanteIncidente || 'Comandante del Incidente'
  };
}

export function getCrossFormMetrics(incident: IncidentData) {
  const triaje = incident.sci207?.triajeVictimas || {
    rojoInmediato: 0,
    amarilloDiferido: 0,
    verdeLeve: 0,
    negroFallecido: 0,
    trasladados: 0
  };

  const pacientesCount = incident.sci207?.pacientesAtendidos?.length || 0;

  const ingresos = incident.sci211?.ingresos || [];
  const totalEfectivos = ingresos.reduce(
    (acc, it) => acc + (Number(it.numEfectivos) || 0),
    0
  );
  const totalVehiculos = ingresos.length;
  const agencias = Array.from(
    new Set(ingresos.map((it) => it.agenciaInstitucion).filter(Boolean))
  );

  const instalaciones = incident.sci201?.croquisPines || [];
  const zonas = incident.sci201?.croquisZonas || [];
  const ambulancias = incident.sci206?.ambulancias?.length || 0;
  const hospitales = incident.sci206?.hospitales?.length || 0;
  const canales = incident.sci205?.canales?.length || 0;
  const objetivosCount = incident.sci202?.objetivos?.length || 0;
  const divisionesCount = incident.sci204?.asignaciones?.length || 0;
  const riesgosCount = incident.sci208?.riesgos?.length || 0;

  const itemsFinancieros = incident.centroCostos?.items || [];
  let gastosTotal = 0;
  let gananciasTotal = 0;
  itemsFinancieros.forEach((it) => {
    const monto = Number(it.montoTotal) || 0;
    if (it.tipo === 'Ganancia') gananciasTotal += monto;
    else gastosTotal += monto;
  });

  const registrosHH = incident.controlHorasHombre?.registros || [];
  let totalHH = 0;
  registrosHH.forEach((r) => {
    totalHH += Number(r.totalHorasHombre) || 0;
  });

  return {
    totalEfectivos,
    totalVehiculos,
    agenciasCount: agencias.length,
    agencias,
    instalacionesCount: instalaciones.length,
    zonasCount: zonas.length,
    pacientesCount,
    triaje,
    ambulancias,
    hospitales,
    canales,
    objetivosCount,
    divisionesCount,
    riesgosCount,
    gastosTotal,
    gananciasTotal,
    balanceFinanciero: gananciasTotal - gastosTotal,
    totalHH,
    periodoActivo: incident.periodoOperacional?.numero || 1
  };
}
