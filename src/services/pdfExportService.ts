import { jsPDF } from 'jspdf';
import { IncidentData } from '../types/sci';
import { CRUZ_ROJA_EMBLEM_BASE64 } from '../data/cruzRojaEmblem';

export interface ShareResult {
  success: boolean;
  method: 'native_share' | 'download';
  fileName: string;
  error?: string;
}

/**
 * Genera el informe oficial completo en PDF del Plan de Acción del Incidente (PAI)
 * conforme a los lineamientos del PROY-NOM-010-SEGOB-2016 y de la
 * Coordinación de Socorros de la Cruz Roja Mexicana.
 * 
 * Garantiza:
 * - Inclusión completa e integral de TODOS los formatos (SCI-201, 202, 203, 204, 205, 206, 207, 208, 209, 211, 214, 221)
 * - Anexos Financieros y de Horas-Hombre completos
 * - Cero texto apilado o encimado: medición dinámica de saltos de línea y paginación matemática preventiva
 * - Registro cronológico de la evolución y todos los movimientos del evento
 */
export async function generateAndSharePAIPdf(incident: IncidentData): Promise<ShareResult> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();   // 215.9 mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;          // 187.9 mm
    const bottomBuffer = 14;                              // Espacio seguro antes del pie de página

    // Paleta cromática oficial institucional
    const brandNavy = [10, 25, 47];       // #0a192f Azul marino comando
    const brandOrange = [234, 88, 12];    // #ea580c Naranja oficial Socorros
    const brandGold = [202, 138, 4];      // #ca8a04 Dorado advertencia
    const darkSlate = [15, 23, 42];       // #0f172a Texto principal
    const slateGray = [71, 85, 105];      // #475569 Texto secundario
    const lightBg = [248, 250, 252];      // #f8fafc Fondo suave
    const cardBg = [241, 245, 249];       // #f1f5f9 Fondo tarjetas
    const borderGray = [203, 213, 225];   // #cbd5e1 Bordes
    const white = [255, 255, 255];

    let y = margin + 12;

    // Helper: Salto de página preventivo con margen seguro
    const ensureSpace = (neededMm: number): boolean => {
      if (y + neededMm > pageHeight - margin - bottomBuffer) {
        doc.addPage();
        y = margin + 12; // Inicia debajo del encabezado superior
        return true;
      }
      return false;
    };

    // Helper: Encabezado superior y pie de página en cada hoja
    const drawPageHeaderAndFooter = (pageNumber: number, totalPages: number) => {
      // Banda superior azul marino
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, margin - 6, contentWidth, 14, 'F');

      // Emblema Oficial Cruz Roja Mexicana Socorros en el encabezado
      try {
        doc.addImage(CRUZ_ROJA_EMBLEM_BASE64, 'PNG', margin + 1.8, margin - 5, 9, 12);
      } catch (imgErr) {
        // Fallback sin interrumpir generación
      }

      // Título oficial superior con Delegación Tepatitlán
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.8);
      doc.text('CRUZ ROJA MEXICANA · DELEGACIÓN TEPATITLÁN · COORDINACIÓN DE SOCORROS', margin + 13, margin + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.setTextColor(234, 179, 8); // Ámbar
      doc.text(
        `SISTEMA DE COMANDO DE INCIDENTES (PROY-NOM-010-SEGOB-2016) | CRUZ ROJA MEXICANA DELEGACIÓN TEPATITLAN | FOLIO: ${incident.folio || 'S/F'}`,
        margin + 13,
        margin + 6
      );

      // Contador de páginas a la derecha
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin - 3, margin + 4, { align: 'right' });

      // Banda de pie de página
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, pageHeight - margin + 2, contentWidth, 7, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.8);
      doc.text(
        `Cruz Roja Mexicana Delegación Tepatitlan · Expediente Oficial PAI · Incidente: ${incident.nombre.slice(0, 42)} · Emitido: ${new Date().toLocaleDateString('es-MX')} ${new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
        margin + 3,
        pageHeight - margin + 6.5
      );
      doc.text(
        'Documento Táctico de Mando y Control Operacional',
        pageWidth - margin - 3,
        pageHeight - margin + 6.5,
        { align: 'right' }
      );
    };

    // Helper: Encabezado de sección / formulario
    const drawSectionHeader = (code: string, title: string, subtitle?: string) => {
      const bannerH = subtitle ? 9.5 : 6.5;
      ensureSpace(bannerH + 3);

      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.roundedRect(margin, y, contentWidth, bannerH, 1, 1, 'F');

      // Badge con código de formato
      doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
      doc.roundedRect(margin + 2, y + 1.2, 17, 4.2, 0.8, 0.8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(code, margin + 10.5, y + 4.1, { align: 'center' });

      // Título
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 21, y + 4.1);

      if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(234, 179, 8);
        doc.text(subtitle, margin + 21, y + 7.8, { maxWidth: contentWidth - 24 });
      }

      y += bannerH + 2.5;
    };

    // Helper: Caja de texto descriptivo con altura calculada dinámicamente
    const drawTextBox = (
      title: string,
      content: string,
      options?: {
        titleColor?: number[];
        bgColor?: number[];
        borderColor?: number[];
        fontSize?: number;
      }
    ) => {
      const fontSize = options?.fontSize || 6.5;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'normal');
      const textToRender = content && content.trim() ? content.trim() : 'Sin información registrada en este rubro.';
      const lines = doc.splitTextToSize(textToRender, contentWidth - 8);
      const textH = lines.length * 3.4;
      const boxH = Math.max(11, textH + 8);

      ensureSpace(boxH + 3);

      const bg = options?.bgColor || white;
      const border = options?.borderColor || borderGray;
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.setDrawColor(border[0], border[1], border[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, boxH, 1, 1, 'FD');

      // Título
      const tColor = options?.titleColor || brandNavy;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(tColor[0], tColor[1], tColor[2]);
      doc.text(title, margin + 3, y + 4);

      // Contenido multilínea
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fontSize);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(lines, margin + 3, y + 8);

      y += boxH + 2.5;
    };

    // =========================================================================
    // SECCIÓN 1: CARÁTULA Y RESUMEN GENERAL EJECUTIVO DEL INCIDENTE
    // =========================================================================
    ensureSpace(38);

    // Caja Principal de Carátula
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    // Barra lateral de acento naranja
    doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.rect(margin, y, 4, 34, 'F');

    // Emblema Oficial Institucional en la Carátula (Cruz Roja Mexicana - Socorros)
    try {
      doc.addImage(CRUZ_ROJA_EMBLEM_BASE64, 'PNG', pageWidth - margin - 26, y + 3, 21, 28);
    } catch (e) {
      // Fallback
    }

    // Título Principal
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PLAN DE ACCIÓN DEL INCIDENTE (PAI) · EXPEDIENTE INTEGRAL', margin + 8, y + 7.5, { maxWidth: contentWidth - 36 });

    doc.setFontSize(8.2);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('CRUZ ROJA MEXICANA DELEGACIÓN TEPATITLAN — COORDINACIÓN DE SOCORROS', margin + 8, y + 13.5, { maxWidth: contentWidth - 36 });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(incident.nombre || 'Incidente Operativo', margin + 8, y + 20.5, { maxWidth: contentWidth - 36 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(
      `Entidad: Cruz Roja Mexicana Delegación Tepatitlan · Ubicación: ${incident.lugar || 'N/D'} · Municipio/Estado: ${incident.municipioEstado || 'Tepatitlán de Morelos, Jal.'} | Tipo: ${incident.tipoIncidente} | Complejidad: ${incident.nivelComplejidad}`,
      margin + 8,
      y + 27,
      { maxWidth: contentWidth - 36 }
    );

    y += 37;

    // Cuadrícula de Metadatos Operacionales
    ensureSpace(18);
    const metaBoxHeight = 15;
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, metaBoxHeight, 1.5, 1.5, 'FD');

    // Comandante Activo del Incidente (Prioridad: SCI-203 Organigrama, luego SCI-201, luego raíz)
    const activeComandante =
      incident.sci203?.mando?.comandante?.trim() ||
      incident.sci201?.organizacionInicial?.comandante?.trim() ||
      incident.comandanteIncidente?.trim() ||
      'Comandante del Incidente';

    const colW = contentWidth / 4;
    const metaItems = [
      { label: 'FOLIO DEL INCIDENTE', val: incident.folio || 'N/D' },
      { label: 'PERÍODO OPERACIONAL', val: `Nº ${incident.periodoOperacional.numero}` },
      { label: 'HORARIO DE VIGENCIA', val: `${incident.periodoOperacional.horaInicio} a ${incident.periodoOperacional.horaFin}` },
      { label: 'COMANDANTE DEL INCIDENTE', val: activeComandante }
    ];

    metaItems.forEach((item, idx) => {
      const cx = margin + idx * colW + 3;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, cx, y + 4.5);

      doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.val, cx, y + 10.5, { maxWidth: colW - 6 });
    });

    y += metaBoxHeight + 4;

    // Períodos Operacionales que Abarcan el Evento (Múltiples o Históricos)
    const periodosRegistrados = incident.periodosOperacionales || [
      {
        numero: incident.periodoOperacional.numero,
        fechaInicio: incident.periodoOperacional.fechaInicio,
        horaInicio: incident.periodoOperacional.horaInicio,
        fechaFin: incident.periodoOperacional.fechaFin,
        horaFin: incident.periodoOperacional.horaFin,
        descripcion: 'Período Operacional Activo',
        esActivo: true
      }
    ];

    ensureSpace(16);
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(`COBERTURA TEMPORAL DEL EVENTO (${periodosRegistrados.length} PERÍODO[S] OPERACIONAL[ES] REGISTRADO[S]):`, margin + 3, y + 4);

    y += 7.5;

    periodosRegistrados.forEach((per) => {
      ensureSpace(8);
      const esAct = per.numero === incident.periodoOperacional.numero;
      doc.setFillColor(esAct ? 254 : 255, esAct ? 243 : 255, esAct ? 199 : 255); // amarillo suave si es activo
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(margin, y, contentWidth, 6.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(esAct ? brandOrange[0] : brandNavy[0], esAct ? brandOrange[1] : brandNavy[1], esAct ? brandOrange[2] : brandNavy[2]);
      doc.text(`Período #${per.numero}${esAct ? ' [ACTIVO EN VIGOR]' : ''}:`, margin + 3, y + 4.2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(
        `${per.fechaInicio} ${per.horaInicio} ➔ ${per.fechaFin} ${per.horaFin}  |  ${per.descripcion || 'Sin descripción'}`,
        margin + 42,
        y + 4.2,
        { maxWidth: contentWidth - 45 }
      );

      y += 7;
    });

    y += 2;

    // =========================================================================
    // SECCIÓN 2: FORMULARIO SCI-201 · SITUACIÓN INICIAL, COORDENADAS Y CROQUIS
    // =========================================================================
    drawSectionHeader(
      'SCI-201',
      'RESUMEN DE LA SITUACIÓN INICIAL, GEORREFERENCIACIÓN Y CROQUIS TÁCTICO',
      'Evaluación primaria, coordenadas de la zona cero e instalaciones del SCI'
    );

    drawTextBox(
      'EVALUACIÓN INICIAL DEL INCIDENTE Y ESCENARIO ENCONTRADO:',
      incident.sci201?.evaluacionInicial || 'Evaluación inicial en proceso de consolidación táctica.'
    );

    // Coordenadas oficiales
    ensureSpace(12);
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');

    const latVal = incident.sci201?.coordenadasLat || '19.4195';
    const lngVal = incident.sci201?.coordenadasLng || '-99.1628';
    const coordsStr = incident.sci201?.coordenadasTexto || `${latVal}° N, ${lngVal}° O`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('Coordenadas GPS Escena:', margin + 3, y + 4);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text(coordsStr, margin + 40, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text(
      `Verificación Satelital: https://www.google.com/maps/search/?api=1&query=${latVal},${lngVal}`,
      margin + 3,
      y + 7.8,
      { maxWidth: contentWidth - 6 }
    );

    y += 12.5;

    // Tabla de Instalaciones Tácticas Georreferenciadas (Croquis SCI-201)
    const pines = incident.sci201?.croquisPines || [];
    if (pines.length > 0) {
      ensureSpace(10);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('SÍMBOLO', margin + 3, y + 3.5);
      doc.text('INSTALACIÓN / REFERENCIA TÁCTICA', margin + 24, y + 3.5);
      doc.text('COORDENADAS O UBICACIÓN', margin + 110, y + 3.5);
      doc.text('POSICIÓN', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      pines.forEach((pin, pIdx) => {
        ensureSpace(6);
        const rowBg = pIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(pin.tipo, margin + 3, y + 3.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(pin.label || pin.tipo, margin + 24, y + 3.8, { maxWidth: 84 });

        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.setFontSize(6);
        doc.text(pin.coordenadas || coordsStr, margin + 110, y + 3.8, { maxWidth: 50 });
        doc.text(`X: ${pin.x}% | Y: ${pin.y}%`, margin + contentWidth - 3, y + 3.8, { align: 'right' });

        y += 5.5;
      });
      y += 2.5;
    }

    // Tabla de Zonas y Perímetros Tácticos Tracker (Croquis SCI-201)
    const zonasTracker = incident.sci201?.croquisZonas || [];
    if (zonasTracker.length > 0) {
      ensureSpace(12);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('ZONA / CÍRCULO TRACKER', margin + 3, y + 3.5);
      doc.text('TIPO Y FINALIDAD TÁCTICA', margin + 65, y + 3.5);
      doc.text('RADIO DE COBERTURA', margin + 120, y + 3.5);
      doc.text('CENTRO GEOGRÁFICO', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      zonasTracker.forEach((zone, zIdx) => {
        ensureSpace(6);
        const rowBg = zIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(37, 99, 235);
        doc.text(zone.nombre, margin + 3, y + 3.8, { maxWidth: 58 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(zone.descripcion || zone.tipo, margin + 65, y + 3.8, { maxWidth: 52 });

        doc.setTextColor(202, 138, 4);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.text(zone.radioMetros ? `~${zone.radioMetros}m (${zone.radio}%)` : `Radio: ${zone.radio}%`, margin + 120, y + 3.8);

        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.setFont('helvetica', 'normal');
        doc.text(zone.coordenadasCentro || `X: ${zone.x}% | Y: ${zone.y}%`, margin + contentWidth - 3, y + 3.8, { align: 'right' });

        y += 5.5;
      });
      y += 2.5;
    }

    // Tabla de Trazos y Rutas Tácticas Trazadas en Mapa (SCI-201)
    const rutasTrazadas = incident.sci201?.croquisRutas || [];
    if (rutasTrazadas.length > 0) {
      ensureSpace(12);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('RUTA / TRAZO TÁCTICO TRAZADO', margin + 3, y + 3.5);
      doc.text('TIPO Y FINALIDAD OPERATIVA', margin + 65, y + 3.5);
      doc.text('PUNTOS / VÉRTICES', margin + 120, y + 3.5);
      doc.text('DISTANCIA ESTIMADA', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      rutasTrazadas.forEach((rt, rIdx) => {
        ensureSpace(6);
        const rowBg = rIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(16, 185, 129);
        doc.text(rt.nombre, margin + 3, y + 3.8, { maxWidth: 58 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(rt.descripcion || rt.tipo.replace('_', ' ').toUpperCase(), margin + 65, y + 3.8, { maxWidth: 52 });

        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.setFontSize(6);
        doc.text(`${rt.puntos.length} vértices georreferenciados`, margin + 120, y + 3.8);

        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(rt.distanciaAprox || 'Trazado continuo', margin + contentWidth - 3, y + 3.8, { align: 'right' });

        y += 5.5;
      });
      y += 2.5;
    }

    if (incident.sci201?.croquisNotas) {
      drawTextBox('NOTAS DEL CROQUIS TÁCTICO Y RUTAS DE ACCESO:', incident.sci201.croquisNotas);
    }

    // =========================================================================
    // SECCIÓN 3: FORMULARIO SCI-202 · OBJETIVOS Y ESTRATEGIAS TÁCTICAS
    // =========================================================================
    drawSectionHeader(
      'SCI-202',
      `OBJETIVOS DEL INCIDENTE Y ESTRATEGIAS (PERÍODO Nº ${incident.periodoOperacional.numero})`,
      'Directrices SMART aprobadas por el Comandante y condiciones meteorológicas'
    );

    const objetivos = incident.sci202?.objetivos || [];
    ensureSpace(10);
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text('#', margin + 3, y + 3.5);
    doc.text('OBJETIVO SMART OPERACIONAL', margin + 10, y + 3.5);
    doc.text('PRIORIDAD', margin + 140, y + 3.5);
    doc.text('ESTADO', margin + 165, y + 3.5);
    y += 5;

    if (objetivos.length > 0) {
      objetivos.forEach((obj, idx) => {
        doc.setFontSize(6.5);
        const objLines = doc.splitTextToSize(obj.texto, 126);
        const rowH = Math.max(6, objLines.length * 3.4 + 2.5);

        ensureSpace(rowH);
        const rowBg = idx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, rowH, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(`${idx + 1}.`, margin + 3, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(objLines, margin + 10, y + 4);

        // Prioridad
        doc.setFont('helvetica', 'bold');
        if (obj.prioridad === 'Alta') doc.setTextColor(220, 38, 38);
        else if (obj.prioridad === 'Media') doc.setTextColor(202, 138, 4);
        else doc.setTextColor(16, 185, 129);
        doc.text(obj.prioridad, margin + 140, y + 4);

        // Estado
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(obj.estado, margin + 165, y + 4);

        y += rowH;
      });
    } else {
      ensureSpace(7);
      doc.setFillColor(white[0], white[1], white[2]);
      doc.rect(margin, y, contentWidth, 6, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6.5);
      doc.text('No hay objetivos registrados para este período operacional.', margin + 4, y + 4);
      y += 6;
    }
    y += 2.5;

    drawTextBox(
      'ESTRATEGIAS Y TÁCTICAS OPERACIONALES SELECCIONADAS:',
      incident.sci202?.estrategiasTácticas || 'Operaciones directas de soporte vital y rescate.'
    );

    drawTextBox(
      'DIRECTRICES Y MENSAJE DE SEGURIDAD GENERAL:',
      incident.sci202?.directricesSeguridad || 'Uso irrestricto de EPP completo y sistema de compañeros.'
    );

    // Clima SCI-202
    ensureSpace(12);
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('PRONÓSTICO METEOROLÓGICO EN ESCENA:', margin + 3, y + 4);

    const clima = incident.sci202?.pronosticoMeteorologico || {
      condicion: 'Despejado',
      temperatura: '24°C',
      viento: '10 km/h',
      humedad: '50%',
      observaciones: ''
    };
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(
      `Condición: ${clima.condicion}  |  Temperatura: ${clima.temperatura}  |  Viento: ${clima.viento}  |  Humedad: ${clima.humedad}`,
      margin + 3,
      y + 7.5
    );
    y += 12.5;

    // =========================================================================
    // SECCIÓN 4: FORMULARIO SCI-203 · ORGANIZACIÓN DEL COMANDO DE INCIDENTES
    // =========================================================================
    drawSectionHeader(
      'SCI-203',
      'ORGANIZACIÓN Y ESTRUCTURA DE COMANDO DEL INCIDENTE',
      'Asignación de responsabilidades de mando y jefaturas de las 4 secciones'
    );

    ensureSpace(28);
    const orgH = 26;
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, y, contentWidth, orgH, 1, 1, 'FD');

    const halfW = contentWidth / 2;
    const orgLeft = [
      { cargo: 'Comandante del Incidente (CI):', nombre: incident.sci203?.mando?.comandante || incident.comandanteIncidente || 'N/A' },
      { cargo: 'Oficial de Seguridad:', nombre: incident.sci203?.mando?.oficialSeguridad || 'Pendiente' },
      { cargo: 'Oficial de Información Pública:', nombre: incident.sci203?.mando?.oficialInformacion || 'Pendiente' },
      { cargo: 'Oficial de Enlace:', nombre: incident.sci203?.mando?.oficialEnlace || 'Pendiente' }
    ];

    const orgRight = [
      { cargo: 'Jefe Sección Operaciones (JSO):', nombre: incident.sci203?.operaciones?.jefe || 'Pendiente' },
      { cargo: 'Jefe Sección Planificación (JSP):', nombre: incident.sci203?.planificacion?.jefe || 'Pendiente' },
      { cargo: 'Jefe Sección Logística (JSL):', nombre: incident.sci203?.logistica?.jefe || 'Pendiente' },
      { cargo: 'Jefe Sección Admón. / Finanzas (JAF):', nombre: incident.sci203?.administracion?.jefe || 'Pendiente' }
    ];

    orgLeft.forEach((row, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text(row.cargo, margin + 3, y + 4.5 + i * 5.2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(row.nombre, margin + 46, y + 4.5 + i * 5.2, { maxWidth: halfW - 49 });
    });

    orgRight.forEach((row, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text(row.cargo, margin + halfW + 3, y + 4.5 + i * 5.2);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(row.nombre, margin + halfW + 55, y + 4.5 + i * 5.2, { maxWidth: halfW - 58 });
    });

    y += orgH + 3.5;

    // =========================================================================
    // SECCIÓN 5: FORMULARIO SCI-204 · ASIGNACIONES TÁCTICAS POR DIVISIÓN/GRUPO
    // =========================================================================
    const asignaciones = incident.sci204?.asignaciones || [];
    drawSectionHeader(
      'SCI-204',
      'ASIGNACIONES TÁCTICAS DE TRABAJO POR DIVISIÓN Y GRUPO',
      'Distribución operativa de fuerzas de tarea, supervisores y funciones asignadas'
    );

    if (asignaciones.length > 0) {
      ensureSpace(8);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('DIVISIÓN / GRUPO', margin + 3, y + 3.5);
      doc.text('SUPERVISOR', margin + 42, y + 3.5);
      doc.text('FUNCIÓN OPERACIONAL', margin + 78, y + 3.5);
      doc.text('RECURSOS ASIGNADOS', margin + 130, y + 3.5);
      doc.text('CANAL', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      asignaciones.forEach((asig, aIdx) => {
        doc.setFontSize(6.5);
        const funcLines = doc.splitTextToSize(asig.funcionOperacional || '-', 50);
        const recLines = doc.splitTextToSize(asig.recursosAsignados || '-', 42);
        const linesCount = Math.max(funcLines.length, recLines.length, 1);
        const rowH = Math.max(6.5, linesCount * 3.4 + 2.5);

        ensureSpace(rowH);
        const rowBg = aIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, rowH, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(asig.divisionGrupo, margin + 3, y + 4, { maxWidth: 38 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(asig.supervisor, margin + 42, y + 4, { maxWidth: 34 });

        doc.text(funcLines, margin + 78, y + 4);
        doc.text(recLines, margin + 130, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
        doc.text(asig.canalComunicaciones || '-', margin + contentWidth - 3, y + 4, { align: 'right' });

        y += rowH;
      });
      y += 2.5;
    } else {
      drawTextBox('ASIGNACIONES TÁCTICAS REGISTRADAS:', 'No hay asignaciones de división registradas en este período.');
    }

    // =========================================================================
    // SECCIÓN 6: FORMULARIO SCI-205 · PLAN DE COMUNICACIONES RADIALES
    // =========================================================================
    const canales = incident.sci205?.canales || [];
    drawSectionHeader(
      'SCI-205',
      'PLAN DE COMUNICACIONES RADIALES',
      'Frecuencias tácticas, canales asignados y protocolo de radio de emergencia'
    );

    if (canales.length > 0) {
      ensureSpace(8);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('CH #', margin + 3, y + 3.5);
      doc.text('FUNCIÓN / USO TÁCTICO', margin + 16, y + 3.5);
      doc.text('NOMBRE CANAL', margin + 65, y + 3.5);
      doc.text('FREQ RX / TX', margin + 115, y + 3.5);
      doc.text('TONO CTCSS', margin + 158, y + 3.5);
      y += 5;

      canales.forEach((ch, cIdx) => {
        ensureSpace(6);
        const rowBg = cIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(String(ch.canal), margin + 3, y + 3.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(ch.funcion, margin + 16, y + 3.8, { maxWidth: 46 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(ch.asignadoA || ch.canal, margin + 65, y + 3.8, { maxWidth: 46 });

        doc.setFont('helvetica', 'bold');
        doc.text(`${ch.frecuenciaRX} / ${ch.frecuenciaTX}`, margin + 115, y + 3.8);

        doc.setFont('helvetica', 'normal');
        doc.text(ch.tono || '100.0 Hz', margin + 158, y + 3.8);

        y += 5.5;
      });
      y += 2.5;
    }

    if (incident.sci205?.directricesComunicaciones) {
      drawTextBox('DIRECTRICES DE DISCIPLINA RADIAL:', incident.sci205.directricesComunicaciones);
    }

    // =========================================================================
    // SECCIÓN 7: FORMULARIO SCI-206 · PLAN MÉDICO Y PUESTOS DE ATENCIÓN
    // =========================================================================
    drawSectionHeader(
      'SCI-206',
      'PLAN MÉDICO DE ATENCIÓN Y EVACUACIÓN DE LESIONADOS',
      'Puestos médicos avanzados, ambulancias y red de hospitales de referencia'
    );

    const puestos = incident.sci206?.puestosMedicos || [];
    const ambulancias = incident.sci206?.ambulancias || [];
    const hospitales = incident.sci206?.hospitales || [];

    // Puestos médicos
    if (puestos.length > 0) {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.text('PUESTOS MÉDICOS DE ATENCIÓN EN LA ESCENA:', margin + 3, y + 4);
      y += 5.5;

      puestos.forEach((pm) => {
        ensureSpace(6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(`• ${pm.nombre} (${pm.ubicacion}) · Personal: ${pm.paramedicos || 'Paramédicos Socorros'} · Contacto: ${pm.contacto}`, margin + 5, y + 4);
        y += 5;
      });
      y += 2;
    }

    // Ambulancias
    if (ambulancias.length > 0) {
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
      doc.text('AMBULANCIAS Y UNIDADES DE TRASLADO:', margin + 3, y + 4);
      y += 5.5;

      const ambStr = ambulancias.map((a) => `${a.unidad} (${a.tipo}) [${a.institucion || 'CRM'}]`).join('  ·  ');
      const ambLines = doc.splitTextToSize(ambStr, contentWidth - 8);
      ensureSpace(ambLines.length * 3.5 + 2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(ambLines, margin + 5, y + 4);
      y += ambLines.length * 3.5 + 4;
    }

    // Hospitales
    if (hospitales.length > 0) {
      ensureSpace(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.text('RED HOSPITALARIA DE DERIVACIÓN:', margin + 3, y + 4);
      y += 5.5;

      hospitales.forEach((hosp) => {
        ensureSpace(6);
        const tags = [
          hosp.helipuerto ? 'Helipuerto' : null,
          hosp.quemados ? 'Unidad Quemados' : null,
          hosp.traumaShock ? 'Trauma-Shock' : null
        ].filter(Boolean).join(', ');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.2);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(`• ${hosp.nombre} · ${hosp.direccion} · Tel: ${hosp.telefono} · Traslado: ${hosp.tiempoTrasladoMin} min ${tags ? `[${tags}]` : ''}`, margin + 5, y + 4);
        y += 5;
      });
      y += 2;
    }

    if (incident.sci206?.procedimientoEvacuacionMedica) {
      drawTextBox('PROCEDIMIENTO DE EVACUACIÓN MÉDICA:', incident.sci206.procedimientoEvacuacionMedica);
    }

    // =========================================================================
    // SECCIÓN 8: FORMULARIO SCI-207 · REGISTRO Y TRIAGE DE PERSONAS ATENDIDAS
    // =========================================================================
    drawSectionHeader(
      'SCI-207',
      'REGISTRO OFICIAL DE PERSONAS ATENDIDAS Y CLASIFICACIÓN DE TRIAGE',
      'Padrón nominal de pacientes de la Coordinación de Socorros conforme a Norma Oficial'
    );

    // Resumen de Triage
    const triaje = incident.sci207?.triajeVictimas || { rojoInmediato: 0, amarilloDiferido: 0, verdeLeve: 0, negroFallecido: 0, trasladados: 0 };
    ensureSpace(14);
    const triageBoxW = (contentWidth - 8) / 5;
    const triageCards = [
      { label: 'ROJO (INMEDIATO)', val: triaje.rojoInmediato, color: [220, 38, 38] },
      { label: 'AMARILLO (DIFERIDO)', val: triaje.amarilloDiferido, color: [202, 138, 4] },
      { label: 'VERDE (LEVE)', val: triaje.verdeLeve, color: [16, 185, 129] },
      { label: 'NEGRO (FALLECIDO)', val: triaje.negroFallecido, color: [71, 85, 105] },
      { label: 'TOTAL TRASLADADOS', val: triaje.trasladados, color: [30, 41, 59] }
    ];

    triageCards.forEach((tc, idx) => {
      const cx = margin + idx * (triageBoxW + 2);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(cx, y, triageBoxW, 11, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139);
      doc.text(tc.label, cx + 2, y + 3.8);
      doc.setFontSize(8);
      doc.setTextColor(tc.color[0], tc.color[1], tc.color[2]);
      doc.text(String(tc.val), cx + 2, y + 8.8);
    });

    y += 14;

    // Tabla Nominal de Pacientes Atendidos
    const pacientes = incident.sci207?.pacientesAtendidos || [];
    if (pacientes.length > 0) {
      ensureSpace(8);
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('#', margin + 2, y + 3.5);
      doc.text('FECHA / HORA', margin + 7, y + 3.5);
      doc.text('NOMBRE COMPLETO', margin + 30, y + 3.5);
      doc.text('EDAD', margin + 74, y + 3.5);
      doc.text('MOTIVO DE ATENCIÓN', margin + 84, y + 3.5);
      doc.text('C.P.', margin + 128, y + 3.5);
      doc.text('UNIDAD', margin + 138, y + 3.5);
      doc.text('TRIAGE', margin + 158, y + 3.5);
      doc.text('DESTINO', margin + 176, y + 3.5);
      y += 5;

      pacientes.forEach((p, index) => {
        ensureSpace(6.5);
        const rowBg = index % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 6, margin + contentWidth, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
        doc.text(String(index + 1), margin + 2, y + 4.2);

        // Fecha / Hora de captura de la atención
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        const fechaHoraStr = `${p.fechaRegistro || p.fechaAtencion || ''} ${p.horaAtencion || ''}`.trim() || 'N/D';
        doc.text(fechaHoraStr, margin + 7, y + 4.2, { maxWidth: 22 });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
        doc.text(p.nombre, margin + 30, y + 4.2, { maxWidth: 42 });

        doc.setFont('helvetica', 'normal');
        doc.text(String(p.edad || '-'), margin + 74, y + 4.2);

        doc.text(p.motivoAtencion, margin + 84, y + 4.2, { maxWidth: 42 });
        doc.text(p.codigoPostal || 'N/D', margin + 128, y + 4.2);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(p.unidadAtendio, margin + 138, y + 4.2, { maxWidth: 19 });

        doc.setFont('helvetica', 'bold');
        if (p.triage.startsWith('Rojo')) doc.setTextColor(220, 38, 38);
        else if (p.triage.startsWith('Amarillo')) doc.setTextColor(202, 138, 4);
        else if (p.triage.startsWith('Verde')) doc.setTextColor(16, 185, 129);
        else doc.setTextColor(71, 85, 105);
        doc.text(p.triage.slice(0, 12), margin + 158, y + 4.2);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(p.destinoHospital || 'En sitio', margin + 176, y + 4.2, { maxWidth: 16 });

        y += 6;
      });
      y += 2.5;
    } else {
      drawTextBox('REGISTRO DE PACIENTES:', 'Sin pacientes nominales registrados en este período.');
    }

    // =========================================================================
    // SECCIÓN 9: FORMULARIO SCI-208 · PLAN Y MENSAJE DE SEGURIDAD OPERACIONAL
    // =========================================================================
    drawSectionHeader(
      'SCI-208',
      'PLAN DE SEGURIDAD OPERACIONAL Y MATRIZ DE RIESGOS',
      'Análisis de amenazas, mitigación y directrices de protección al personal'
    );

    drawTextBox(
      'MENSAJE GENERAL DEL OFICIAL DE SEGURIDAD:',
      incident.sci208?.mensajeSeguridadGeneral || 'Uso obligatorio de EPP completo y sistema de compañeros en zona caliente.'
    );

    const riesgos = incident.sci208?.riesgos || [];
    if (riesgos.length > 0) {
      ensureSpace(8);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('RIESGO IDENTIFICADO', margin + 3, y + 3.5);
      doc.text('PROBABILIDAD', margin + 55, y + 3.5);
      doc.text('SEVERIDAD', margin + 78, y + 3.5);
      doc.text('MEDIDAS OBLIGATORIAS DE MITIGACIÓN', margin + 105, y + 3.5);
      y += 5;

      riesgos.forEach((rg, rIdx) => {
        doc.setFontSize(6.2);
        const mitLines = doc.splitTextToSize(rg.medidasMitigacion, 80);
        const rowH = Math.max(6, mitLines.length * 3.3 + 2.5);

        ensureSpace(rowH);
        const rowBg = rIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, rowH, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(rg.riesgo, margin + 3, y + 4, { maxWidth: 50 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(rg.probabilidad, margin + 55, y + 4);

        doc.setFont('helvetica', 'bold');
        if (rg.severidad === 'Crítica') doc.setTextColor(220, 38, 38);
        else if (rg.severidad === 'Grave') doc.setTextColor(202, 138, 4);
        else doc.setTextColor(16, 185, 129);
        doc.text(rg.severidad, margin + 78, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(mitLines, margin + 105, y + 4);

        y += rowH;
      });
      y += 2.5;
    }

    if (incident.sci208?.alarmaEvacuacionEmergencia) {
      drawTextBox('ALARMA Y PROCEDIMIENTO DE EVACUACIÓN DE EMERGENCIA:', incident.sci208.alarmaEvacuacionEmergencia);
    }

    // =========================================================================
    // SECCIÓN 10: FORMULARIO SCI-209 · RESUMEN DE SITUACIÓN Y EVOLUCIÓN
    // =========================================================================
    drawSectionHeader(
      'SCI-209',
      'RESUMEN DE SITUACIÓN Y EVOLUCIÓN DEL EVENTO',
      'Porcentaje de control, balance de daños, afectaciones y acciones en 24 horas'
    );

    // Métrica de Control y Daños
    const danos = incident.sci209?.danosHumanos || { lesionadosRescatistas: 0, lesionadosCiviles: 0, fallecidos: 0, evacuados: 0, albergados: 0 };
    ensureSpace(14);
    const pctW = 38;
    const cardGridW = (contentWidth - pctW - 6) / 5;

    // Tarjeta de porcentaje
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, pctW, 11, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(234, 179, 8);
    doc.text('CONTROL DEL INCIDENTE', margin + 3, y + 4);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`${incident.sci209?.porcentajeControl || 0}%`, margin + 3, y + 9.5);

    // 5 Tarjetas de Daños Humanos
    const danoCards = [
      { label: 'Lesionados Civiles', val: danos.lesionadosCiviles },
      { label: 'Lesionados Rescat.', val: danos.lesionadosRescatistas },
      { label: 'Fallecidos', val: danos.fallecidos },
      { label: 'Evacuados', val: danos.evacuados },
      { label: 'Albergados', val: danos.albergados }
    ];

    danoCards.forEach((dc, dIdx) => {
      const cx = margin + pctW + 2 + dIdx * (cardGridW + 1);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(cx, y, cardGridW, 11, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.8);
      doc.setTextColor(100, 116, 139);
      doc.text(dc.label, cx + 2, y + 3.8);
      doc.setFontSize(7.5);
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(String(dc.val), cx + 2, y + 8.8);
    });

    y += 14;

    drawTextBox(
      'EVOLUCIÓN Y RESUMEN GENERAL DE LA SITUACIÓN:',
      incident.sci209?.resumenSituacion || 'Operaciones en desarrollo conforme a lo planificado.'
    );

    drawTextBox(
      'DAÑOS ESTRUCTURALES E INFRAESTRUCTURA AFECTADA:',
      incident.sci209?.danosEstructuralesInfraestructura || 'Sin daños estructurales significativos reportados.'
    );

    drawTextBox(
      'ACCIONES PLANIFICADAS PARA LAS SIGUIENTES 24 HORAS:',
      incident.sci209?.accionesSiguientes24Horas || 'Continuidad de relevos y consolidación de objetivos.'
    );

    // =========================================================================
    // SECCIÓN 11: FORMULARIO SCI-211 · REGISTRO Y ENTRADA DE RECURSOS (CHECK-IN)
    // =========================================================================
    const ingresos = incident.sci211?.ingresos || [];
    drawSectionHeader(
      'SCI-211',
      'CONTROL DE REGISTRO Y ENTRADA DE RECURSOS (CHECK-IN)',
      `Lugar: ${incident.sci211?.lugarRegistroCheckIn || 'Área de Espera'} · Responsable: ${incident.sci211?.encargadoCheckIn || 'Oficial de Recursos'}`
    );

    if (ingresos.length > 0) {
      ensureSpace(8);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('FECHA/HORA', margin + 3, y + 3.5);
      doc.text('RECURSO / VEHÍCULO', margin + 30, y + 3.5);
      doc.text('AGENCIA / INSTITUCIÓN', margin + 74, y + 3.5);
      doc.text('LÍDER A CARGO', margin + 118, y + 3.5);
      doc.text('EFECT.', margin + 155, y + 3.5);
      doc.text('ASIGNADO A', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      ingresos.forEach((ing, iIdx) => {
        ensureSpace(6);
        const rowBg = iIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(ing.fechaHora, margin + 3, y + 3.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(ing.recursoVehiculo, margin + 30, y + 3.8, { maxWidth: 42 });

        doc.setFont('helvetica', 'normal');
        doc.text(ing.agenciaInstitucion, margin + 74, y + 3.8, { maxWidth: 42 });

        doc.text(ing.nombreLider, margin + 118, y + 3.8, { maxWidth: 35 });

        doc.setFont('helvetica', 'bold');
        doc.text(String(ing.numEfectivos), margin + 155, y + 3.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(ing.asignadoA || 'Área de Espera', margin + contentWidth - 3, y + 3.8, { align: 'right', maxWidth: 26 });

        y += 5.5;
      });
      y += 2.5;
    } else {
      drawTextBox('RECURSOS REGISTRADOS EN CHECK-IN:', 'Sin ingresos de recursos registrados formalmente.');
    }

    // =========================================================================
    // SECCIÓN 12: FORMULARIO SCI-214 · BITÁCORA CRONOLÓGICA DE LA EVOLUCIÓN
    // =========================================================================
    const bitacora = incident.sci214?.entradas || [];
    drawSectionHeader(
      'SCI-214',
      'BITÁCORA CRONOLÓGICA DE SUCESOS Y EVOLUCIÓN DEL EVENTO',
      `Unidad: ${incident.sci214?.unidadNombre || 'Puesto de Comando'} · Responsable: ${incident.sci214?.responsableBitacora || 'Oficial de Documentación'}`
    );

    if (bitacora.length > 0) {
      ensureSpace(8);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('HORA', margin + 3, y + 3.5);
      doc.text('ACTIVIDAD / SUCESO CRONOLÓGICO', margin + 20, y + 3.5);
      doc.text('OBSERVACIONES Y ACCIONES TOMADAS', margin + 105, y + 3.5);
      y += 5;

      bitacora.forEach((bItem, bIdx) => {
        doc.setFontSize(6.2);
        const actLines = doc.splitTextToSize(bItem.actividadEvento, 82);
        const obsLines = doc.splitTextToSize(bItem.observaciones || '-', 80);
        const rowLines = Math.max(actLines.length, obsLines.length, 1);
        const rowH = Math.max(6, rowLines * 3.4 + 2.5);

        ensureSpace(rowH);
        const rowBg = bIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, rowH, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(bItem.hora, margin + 3, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(actLines, margin + 20, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(obsLines, margin + 105, y + 4);

        y += rowH;
      });
      y += 2.5;
    } else {
      drawTextBox('BITÁCORA OPERACIONAL:', 'Sin acontecimientos o sucesos registrados en bitácora.');
    }

    // =========================================================================
    // SECCIÓN 13: FORMULARIO SCI-221 · PLAN DE DESMOVILIZACIÓN DE RECURSOS
    // =========================================================================
    const demobilizacionRecursos = incident.sci221?.recursos || [];
    drawSectionHeader(
      'SCI-221',
      'PLAN DE DESMOVILIZACIÓN Y CHECK-OUT DE RECURSOS',
      `Fecha Inicio: ${incident.sci221?.fechaInicioDesmovilizacion || 'Al concluir fase'} · Elaborado Por: ${incident.sci221?.elaboradoPor || 'Unidad de Desmovilización'}`
    );

    if (incident.sci221?.prioridadesDesmovilizacion) {
      drawTextBox('PRIORIDADES Y SECUENCIA DE DESMOVILIZACIÓN:', incident.sci221.prioridadesDesmovilizacion);
    }

    if (demobilizacionRecursos.length > 0) {
      ensureSpace(8);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
      doc.text('RECURSO / UNIDAD', margin + 3, y + 3.5);
      doc.text('AGENCIA', margin + 42, y + 3.5);
      doc.text('FECHA DESMOV.', margin + 74, y + 3.5);
      doc.text('HORA SALIDA', margin + 104, y + 3.5);
      doc.text('INFORME', margin + 128, y + 3.5);
      doc.text('RADIOS', margin + 148, y + 3.5);
      doc.text('VO.BO. CI', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      demobilizacionRecursos.forEach((dm, dIdx) => {
        ensureSpace(6);
        const rowBg = dIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.2);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(dm.recurso, margin + 3, y + 3.8, { maxWidth: 38 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(dm.agencia, margin + 42, y + 3.8, { maxWidth: 30 });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(dm.fechaDesmovilizacion || 'Pendiente', margin + 74, y + 3.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(dm.horaSalida || 'Pendiente', margin + 104, y + 3.8);

        doc.text(dm.informeEntregado ? 'Sí' : 'No', margin + 128, y + 3.8);
        doc.text(dm.comunicacionesDevueltas ? 'Sí' : 'No', margin + 148, y + 3.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(dm.aprobadoPorCI ? 16 : 220, dm.aprobadoPorCI ? 185 : 38, dm.aprobadoPorCI ? 129 : 38);
        doc.text(dm.aprobadoPorCI ? 'Aprobado' : 'Pendiente', margin + contentWidth - 3, y + 3.8, { align: 'right' });

        y += 5.5;
      });
      y += 2.5;
    } else {
      drawTextBox('CHECK-OUT DE RECURSOS:', 'Sin recursos en proceso de desmovilización.');
    }

    // =========================================================================
    // SECCIÓN 14: ANEXO FINANCIERO Y CONTROL DE COSTOS
    // =========================================================================
    drawSectionHeader(
      'FINANZAS',
      'ANEXO FINANCIERO: CENTRO DE COSTOS Y ESTADO DE CUENTA OPERATIVO',
      'Informe consolidado de egresos, inversiones, compras y balance financiero'
    );

    const centroCostos = incident.centroCostos || {
      presupuestoAsignado: 0,
      fondoCajaChica: 0,
      responsableFinanzas: 'N/A',
      moneda: 'MXN',
      items: [],
      observacionesFinancieras: ''
    };

    let totalGastos = 0;
    let totalAdquisiciones = 0;
    let totalInversiones = 0;
    let totalGanancias = 0;
    let totalInsumosGastados = 0;

    (centroCostos.items || []).forEach((item) => {
      const monto = Number(item.montoTotal) || 0;
      if (item.tipo === 'Gasto') totalGastos += monto;
      else if (item.tipo === 'Adquisición') totalAdquisiciones += monto;
      else if (item.tipo === 'Inversión') totalInversiones += monto;
      else if (item.tipo === 'Ganancia') totalGanancias += monto;
      else if (item.tipo === 'Insumo Gastado') totalInsumosGastados += monto;
    });

    const totalGeneralEgresos = totalGastos + totalAdquisiciones + totalInversiones + totalInsumosGastados;
    const balanceNeto = (Number(centroCostos.presupuestoAsignado) || 0) + totalGanancias - totalGeneralEgresos;

    // Resumen de Presupuesto y Balance (3 tarjetas)
    ensureSpace(14);
    const finCardW = (contentWidth - 4) / 3;
    const finCards = [
      { label: 'Presupuesto Asignado', val: `$${(centroCostos.presupuestoAsignado || 0).toLocaleString()} MXN`, color: [16, 185, 129] },
      { label: 'Total Egresos / Inversiones', val: `$${totalGeneralEgresos.toLocaleString()} MXN`, color: [220, 38, 38] },
      { label: 'Balance Neto Disponible', val: `$${balanceNeto.toLocaleString()} MXN`, color: balanceNeto >= 0 ? [37, 99, 235] : [220, 38, 38] }
    ];

    finCards.forEach((fc, fIdx) => {
      const cx = margin + fIdx * (finCardW + 2);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(cx, y, finCardW, 11, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139);
      doc.text(fc.label, cx + 2, y + 3.8);
      doc.setFontSize(8);
      doc.setTextColor(fc.color[0], fc.color[1], fc.color[2]);
      doc.text(fc.val, cx + 2, y + 8.8);
    });

    y += 14;

    // Tabla Completa de Partidas Financieras sin apilamiento
    const finItems = centroCostos.items || [];
    if (finItems.length > 0) {
      ensureSpace(8);
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.text('FECHA', margin + 3, y + 3.5);
      doc.text('TIPO', margin + 22, y + 3.5);
      doc.text('CONCEPTO / DESCRIPCIÓN', margin + 44, y + 3.5);
      doc.text('PROVEEDOR / CATEGORÍA', margin + 115, y + 3.5);
      doc.text('IMPORTE (MXN)', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      finItems.forEach((fi, fIdx) => {
        doc.setFontSize(6.2);
        const conLines = doc.splitTextToSize(fi.concepto, 68);
        const provLines = doc.splitTextToSize(fi.proveedorBeneficiario || fi.categoria || '-', 38);
        const rowLines = Math.max(conLines.length, provLines.length, 1);
        const rowH = Math.max(6, rowLines * 3.3 + 2.5);

        ensureSpace(rowH);
        const rowBg = fIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, rowH, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + rowH, margin + contentWidth, y + rowH);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(fi.fecha, margin + 3, y + 3.8);

        doc.setFont('helvetica', 'bold');
        if (fi.tipo === 'Ganancia') doc.setTextColor(16, 185, 129);
        else if (fi.tipo === 'Inversión') doc.setTextColor(37, 99, 235);
        else doc.setTextColor(220, 38, 38);
        doc.text(fi.tipo, margin + 22, y + 3.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(conLines, margin + 44, y + 3.8);
        doc.text(provLines, margin + 115, y + 3.8);

        doc.setFont('helvetica', 'bold');
        doc.text(`$${Number(fi.montoTotal || 0).toLocaleString()}`, margin + contentWidth - 3, y + 3.8, { align: 'right' });

        y += rowH;
      });
      y += 2.5;
    } else {
      drawTextBox('ESTADO DE CUENTA FINANCIERO:', 'Sin movimientos financieros registrados.');
    }

    if (centroCostos.observacionesFinancieras) {
      drawTextBox('OBSERVACIONES DE FINANZAS:', centroCostos.observacionesFinancieras);
    }

    // =========================================================================
    // SECCIÓN 15: ANEXO DE FUERZA DE TAREA Y HORAS-HOMBRE (HH)
    // =========================================================================
    drawSectionHeader(
      'FUERZA TÁCTICA',
      'REGISTRO Y CONTROL DE FUERZA DE TAREA Y HORAS-HOMBRE (HH)',
      `Coordinador: ${incident.controlHorasHombre?.coordinadorPersonal || 'N/A'} · Límite por turno: ${incident.controlHorasHombre?.limiteHorasTurno || 8} hrs (NOM-010-SEGOB)`
    );

    const controlHH = incident.controlHorasHombre || {
      limiteHorasTurno: 8,
      coordinadorPersonal: 'N/A',
      registros: [],
      observaciones: ''
    };

    let totalHorasHombre = 0;
    let totalEfectivos = 0;
    let costoTotalManoObra = 0;
    let alertasFatiga = 0;

    (controlHH.registros || []).forEach((r) => {
      totalHorasHombre += r.totalHorasHombre || 0;
      totalEfectivos += r.numeroEfectivos || 0;
      costoTotalManoObra += r.costoTotalPersonal || 0;
      if (r.condicionFatiga === 'Relevo Requerido') alertasFatiga++;
    });

    // 4 Tarjetas de Métricas de Personal
    ensureSpace(14);
    const hhCardW = (contentWidth - 6) / 4;
    const hhCards = [
      { label: 'Fuerza Desplegada', val: `${totalEfectivos} Efectivos`, color: [30, 41, 59] },
      { label: 'Horas-Hombre Acumuladas', val: `${totalHorasHombre.toFixed(1)} HH`, color: [147, 51, 234] },
      { label: 'Costo de Mano de Obra', val: `$${costoTotalManoObra.toLocaleString()} MXN`, color: [37, 99, 235] },
      { label: 'Alertas de Fatiga NOM-010', val: `${alertasFatiga} Brigadas`, color: alertasFatiga > 0 ? [220, 38, 38] : [16, 185, 129] }
    ];

    hhCards.forEach((c, idx) => {
      const cx = margin + idx * (hhCardW + 2);
      doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(cx, y, hhCardW, 11, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, cx + 2, y + 3.8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.text(c.val, cx + 2, y + 8.8);
    });

    y += 14;

    // Tabla Completa de Cuadrillas sin cortes
    const allHH = controlHH.registros || [];
    if (allHH.length > 0) {
      ensureSpace(8);
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.text('FECHA / HORARIO', margin + 3, y + 3.5);
      doc.text('BRIGADA / CUADRILLA', margin + 30, y + 3.5);
      doc.text('ESPECIALIDAD', margin + 74, y + 3.5);
      doc.text('LÍDER RESPONSABLE', margin + 115, y + 3.5);
      doc.text('EFECT.', margin + 148, y + 3.5);
      doc.text('FATIGA', margin + 160, y + 3.5);
      doc.text('TOTAL HH', margin + contentWidth - 3, y + 3.5, { align: 'right' });
      y += 5;

      allHH.forEach((reg, rIdx) => {
        ensureSpace(6);
        const rowBg = rIdx % 2 === 0 ? white : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.8);
        doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
        doc.text(`${reg.fecha} ${reg.horaInicio}-${reg.horaFin}`, margin + 3, y + 3.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(reg.brigadaUnidad, margin + 30, y + 3.8, { maxWidth: 42 });

        doc.setFont('helvetica', 'normal');
        doc.text(reg.especialidad, margin + 74, y + 3.8, { maxWidth: 39 });

        doc.text(reg.responsableLider, margin + 115, y + 3.8, { maxWidth: 31 });

        doc.setFont('helvetica', 'bold');
        doc.text(`${reg.numeroEfectivos}`, margin + 148, y + 3.8);

        if (reg.condicionFatiga === 'Relevo Requerido') {
          doc.setTextColor(220, 38, 38);
          doc.text('Relevo', margin + 160, y + 3.8);
        } else if (reg.condicionFatiga === 'Moderada') {
          doc.setTextColor(202, 138, 4);
          doc.text('Moderada', margin + 160, y + 3.8);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.text('Óptima', margin + 160, y + 3.8);
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 51, 234);
        doc.text(`${(reg.totalHorasHombre || 0).toFixed(1)} HH`, margin + contentWidth - 3, y + 3.8, { align: 'right' });

        y += 5.5;
      });
      y += 2.5;
    } else {
      drawTextBox('CONTROL DE HORAS-HOMBRE:', 'Sin cuadrillas o turnos registrados formalmente.');
    }

    if (controlHH.observaciones) {
      drawTextBox('OBSERVACIONES DE ROTACIÓN Y FATIGA:', controlHH.observaciones);
    }

    // =========================================================================
    // SECCIÓN 16: BLOQUE FORMAL DE VALIDACIÓN Y FIRMAS OFICIALES DEL COMANDO
    // =========================================================================
    drawSectionHeader(
      'MANDO',
      'VALIDACIÓN, APROBACIÓN Y FIRMAS OFICIALES DEL EXPEDIENTE PAI',
      'Ratificación formal de autoridades del Sistema de Comando de Incidentes'
    );

    ensureSpace(28);
    const signBoxH = 26;
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, y, contentWidth, signBoxH, 1.5, 1.5, 'FD');

    const signW = contentWidth / 3;

    // Firmante 1: Comandante del Incidente (determinado por el Organigrama vigente)
    doc.line(margin + 6, y + 15, margin + signW - 6, y + 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text(activeComandante, margin + signW / 2, y + 18.5, { align: 'center', maxWidth: signW - 8 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text('COMANDANTE DEL INCIDENTE (CI)', margin + signW / 2, y + 22, { align: 'center' });

    // Firmante 2: Jefe de Planificación
    const s2X = margin + signW;
    doc.line(s2X + 6, y + 15, s2X + signW - 6, y + 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(incident.sci203?.planificacion?.jefe || 'Jefe de Planificación', s2X + signW / 2, y + 18.5, { align: 'center', maxWidth: signW - 8 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text('JEFE SECCIÓN PLANIFICACIÓN (JSP)', s2X + signW / 2, y + 22, { align: 'center' });

    // Firmante 3: Coordinación de Socorros Cruz Roja Mexicana Delegación Tepatitlan (sin logo según instrucción)
    const s3X = margin + signW * 2;
    doc.line(s3X + 6, y + 15, s3X + signW - 6, y + 15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(
      incident.institucionComando || 'Cruz Roja Mexicana Delegación Tepatitlan',
      s3X + signW / 2,
      y + 18.5,
      { align: 'center', maxWidth: signW - 8 }
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(100, 116, 139);
    doc.text('CRUZ ROJA MEXICANA · DELEGACIÓN TEPATITLAN', s3X + signW / 2, y + 22, { align: 'center' });

    y += signBoxH + 4;

    // =========================================================================
    // SELLADO DE ENCABEZADOS Y PIES DE PÁGINA EN TODAS LAS HOJAS
    // =========================================================================
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawPageHeaderAndFooter(p, totalPages);
    }

    // Generación del archivo PDF final
    const pdfBlob = doc.output('blob');
    const safeName = (incident.nombre || 'Incidente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const fileName = `${incident.folio || 'PAI'}_ExpedienteIntegral_CRM_Tepatitlan_${safeName}.pdf`;

    // Intentar compartir con Web Share API nativa si está soportada
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      try {
        await navigator.share({
          title: `PAI Integral ${incident.folio} - Coordinación de Socorros`,
          text: `Informe oficial y evolución completa del incidente: ${incident.nombre} (Período Operacional Nº ${incident.periodoOperacional.numero})`,
          files: [pdfFile]
        });
        return {
          success: true,
          method: 'native_share',
          fileName
        };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          return { success: true, method: 'native_share', fileName };
        }
        console.warn('Navigator.share declinado, descargando archivo directamente:', shareErr);
      }
    }

    // Descarga directa en navegador/iPad
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

    return {
      success: true,
      method: 'download',
      fileName
    };
  } catch (err: any) {
    console.error('Error al generar el PDF del PAI:', err);
    return {
      success: false,
      method: 'download',
      fileName: 'error_informe.pdf',
      error: err?.message || 'Error al procesar el expediente en PDF'
    };
  }
}
