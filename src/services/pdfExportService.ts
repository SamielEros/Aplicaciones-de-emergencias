import { jsPDF } from 'jspdf';
import { IncidentData } from '../types/sci';

export interface ShareResult {
  success: boolean;
  method: 'native_share' | 'download';
  fileName: string;
  error?: string;
}

/**
 * Genera el documento oficial en PDF del Plan de Acción del Incidente (PAI)
 * conforme a los lineamientos del PROY-NOM-010-SEGOB-2016 y de la
 * Coordinación de Socorros de la Cruz Roja Mexicana, y lo comparte
 * mediante la API nativa de iPad/navegador o mediante descarga directa.
 */
export async function generateAndSharePAIPdf(incident: IncidentData): Promise<ShareResult> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;

    const brandOrange = [234, 88, 12]; // #ea580c (Naranja oficial Socorros)
    const brandNavy = [10, 25, 47];    // #0a192f (Azul marino institucional)
    const brandGold = [202, 138, 4];   // #ca8a04
    const darkSlate = [15, 23, 42];
    const lightBg = [248, 250, 252];
    const borderGray = [203, 213, 225];

    let y = margin;

    // Helper: draw page header
    const drawPageHeader = (pageNumber: number, totalPages: number) => {
      // Top header band
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, margin - 6, contentWidth, 14, 'F');

      // Top title text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('COORDINACIÓN DE SOCORROS · CRUZ ROJA MEXICANA', margin + 3, margin + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(234, 179, 8);
      doc.text(`SCI · PROY-NOM-010-SEGOB-2016 | FOLIO: ${incident.folio}`, margin + 3, margin + 6);

      // Page counter
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - margin - 3, margin + 4, { align: 'right' });

      // Bottom footer band
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, pageHeight - margin + 2, contentWidth, 7, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.text(
        `Expediente Oficial SCI · Coordinación de Socorros Cruz Roja Mexicana · Generado: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        margin + 2,
        pageHeight - margin + 6
      );
      doc.text(
        'Documento Táctico Oficial para Comando y Control',
        pageWidth - margin - 2,
        pageHeight - margin + 6,
        { align: 'right' }
      );
    };

    // ==========================================
    // PÁGINA 1: PORTADA Y RESUMEN GENERAL (PAI / SCI-201 / SCI-202)
    // ==========================================
    y = margin + 12;

    // Header Emblem and Main Title Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.setLineWidth(0.8);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    // Orange Accent Bar
    doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.rect(margin, y, 4, 34, 'F');

    // Title text
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PLAN DE ACCIÓN DEL INCIDENTE (PAI)', margin + 8, y + 8);

    doc.setFontSize(9);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('COORDINACIÓN DE SOCORROS — SISTEMA DE COMANDO DE INCIDENTES', margin + 8, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(incident.nombre, margin + 8, y + 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Ubicación: ${incident.lugar} · Municipio/Estado: ${incident.municipioEstado} | Tipo: ${incident.tipoIncidente}`,
      margin + 8,
      y + 28
    );

    y += 37;

    // Grid: Metadatos Operacionales del PAI
    const metaBoxHeight = 16;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, metaBoxHeight, 1.5, 1.5, 'FD');

    const colW = contentWidth / 4;
    const metaItems = [
      { label: 'FOLIO DEL INCIDENTE', val: incident.folio },
      { label: 'PERÍODO OPERACIONAL', val: `Nº ${incident.periodoOperacional.numero}` },
      { label: 'HORARIO DE VIGENCIA', val: `${incident.periodoOperacional.horaInicio} - ${incident.periodoOperacional.horaFin}` },
      { label: 'COMANDANTE DEL INCIDENTE', val: incident.comandanteIncidente || 'Por designar' }
    ];

    metaItems.forEach((item, idx) => {
      const cx = margin + idx * colW + 3;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label, cx, y + 5);

      doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(item.val, cx, y + 11, { maxWidth: colW - 6 });
    });

    y += metaBoxHeight + 5;

    // GEORREFERENCIACIÓN Y COORDENADAS GPS
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GEORREFERENCIACIÓN Y CONEXIÓN CON MAPA SATELITAL (SCI-201)', margin + 3, y + 4);

    y += 5.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 14, 'FD');

    const latStr = incident.sci201?.coordenadasLat !== undefined ? `${incident.sci201.coordenadasLat}° N` : '19.4195° N';
    const lngStr = incident.sci201?.coordenadasLng !== undefined ? `${incident.sci201.coordenadasLng}° O` : '-99.1628° O';
    const coordsText = incident.sci201?.coordenadasTexto || `${latStr}, ${lngStr}`;

    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Coordenadas Oficiales de la Escena: `, margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text(coordsText, margin + 55, y + 5);

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Enlace de Verificación Satelital: https://www.google.com/maps/search/?api=1&query=${incident.sci201?.coordenadasLat || 19.4195},${incident.sci201?.coordenadasLng || -99.1628}`,
      margin + 3,
      y + 10,
      { maxWidth: contentWidth - 6 }
    );

    y += 18;

    // SCI-201: INSTALACIONES DEL SCI GEORREFERENCIADAS
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTALACIONES DEL SCI EN LA ESCENA (CROQUIS TÁCTICO CONECTADO)', margin + 3, y + 4);

    y += 5.5;

    const pines = incident.sci201?.croquisPines || [];
    if (pines.length > 0) {
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('SÍMBOLO', margin + 3, y + 3.5);
      doc.text('INSTALACIÓN / DESCRIPCIÓN', margin + 22, y + 3.5);
      doc.text('COORDENADAS GPS', margin + 95, y + 3.5);
      doc.text('UBICACIÓN RELATIVA', margin + 145, y + 3.5);

      y += 5;

      pines.slice(0, 5).forEach((pin) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, contentWidth, 5.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(pin.tipo, margin + 3, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(pin.label || pin.tipo, margin + 22, y + 4, { maxWidth: 70 });

        doc.setTextColor(100, 116, 139);
        doc.setFontSize(6.5);
        doc.text(pin.coordenadas || coordsText, margin + 95, y + 4);
        doc.text(`X: ${pin.x}% | Y: ${pin.y}%`, margin + 145, y + 4);

        y += 5.5;
      });
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 6, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6.5);
      doc.text('Instalaciones tácticas estándar establecidas: Puesto de Comando (PC) y Área de Espera (E) georreferenciadas.', margin + 3, y + 4);
      y += 6;
    }

    y += 4;

    // SCI-202: OBJETIVOS DEL INCIDENTE
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`FORMULARIO SCI-202 · OBJETIVOS DEL PERÍODO OPERACIONAL (Nº ${incident.periodoOperacional.numero})`, margin + 3, y + 4);

    y += 5.5;

    const objetivos = incident.sci202?.objetivos || [];
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    const objBoxHeight = Math.max(22, objetivos.length * 6 + 6);
    doc.rect(margin, y, contentWidth, objBoxHeight, 'FD');

    let objY = y + 4;
    objetivos.forEach((obj, idx) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
      doc.text(`${idx + 1}.`, margin + 3, objY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(obj.texto, margin + 8, objY, { maxWidth: contentWidth - 30 });

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.text(`[${obj.prioridad}]`, margin + contentWidth - 20, objY);

      objY += 6;
    });

    y += objBoxHeight + 4;

    // Resumen de Estrategia y Seguridad (SCI-202)
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 16, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('ESTRATEGIAS TÁCTICAS OPERACIONALES:', margin + 3, y + 4);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(incident.sci202?.estrategiasTácticas || 'Operaciones directas de soporte vital y rescate.', margin + 3, y + 8, { maxWidth: contentWidth - 6 });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('DIRECTRICES GENERALES DE SEGURIDAD:', margin + 3, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(incident.sci202?.directricesSeguridad || 'Uso irrestricto de EPP completo y sistema de compañeros.', margin + 55, y + 12, { maxWidth: contentWidth - 58 });

    // ==========================================
    // PÁGINA 2: ESTRUCTURA ORGANIZACIONAL (SCI-203), ASIGNACIONES (SCI-204) Y COMUNICACIONES (SCI-205)
    // ==========================================
    doc.addPage();
    y = margin + 12;

    // SCI-203: ORGANIZACIÓN
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULARIO SCI-203 · ORGANIZACIÓN DEL COMANDO DE INCIDENTES', margin + 3, y + 4);

    y += 5.5;

    const orgH = 28;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, orgH, 'FD');

    // 2-column org table
    const halfW = contentWidth / 2;
    const orgLeft = [
      { cargo: 'Comandante del Incidente (CI):', nombre: incident.sci203?.mando?.comandante || incident.comandanteIncidente },
      { cargo: 'Oficial de Seguridad:', nombre: incident.sci203?.mando?.oficialSeguridad || 'Pendiente' },
      { cargo: 'Oficial de Información Pública (OIP):', nombre: incident.sci203?.mando?.oficialInformacion || 'Pendiente' },
      { cargo: 'Oficial de Enlace:', nombre: incident.sci203?.mando?.oficialEnlace || 'Pendiente' }
    ];

    const orgRight = [
      { cargo: 'Jefe Sección Operaciones (JSO):', nombre: incident.sci203?.operaciones?.jefe || 'Pendiente' },
      { cargo: 'Jefe Sección Planificación (JSP):', nombre: incident.sci203?.planificacion?.jefe || 'Pendiente' },
      { cargo: 'Jefe Sección Logística (JSL):', nombre: incident.sci203?.logistica?.jefe || 'Pendiente' },
      { cargo: 'Jefe Sección Administración/Finanzas (JSAF):', nombre: incident.sci203?.administracion?.jefe || 'Pendiente' }
    ];

    orgLeft.forEach((row, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(row.cargo, margin + 3, y + 5 + i * 5.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(row.nombre, margin + 45, y + 5 + i * 5.5, { maxWidth: halfW - 48 });
    });

    orgRight.forEach((row, i) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(row.cargo, margin + halfW + 3, y + 5 + i * 5.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(row.nombre, margin + halfW + 55, y + 5 + i * 5.5, { maxWidth: halfW - 58 });
    });

    y += orgH + 5;

    // SCI-205: PLAN DE COMUNICACIONES
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULARIO SCI-205 · PLAN DE COMUNICACIONES RADIALES', margin + 3, y + 4);

    y += 5.5;

    const canales = incident.sci205?.canales || [];
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('CH #', margin + 3, y + 3.5);
    doc.text('FUNCIÓN / USO TÁCTICO', margin + 14, y + 3.5);
    doc.text('NOMBRE CANAL', margin + 65, y + 3.5);
    doc.text('FREQ RX / TX', margin + 115, y + 3.5);
    doc.text('TONO CTCSS', margin + 160, y + 3.5);

    y += 5;

    canales.forEach((ch) => {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.line(margin, y + 5.5, margin + contentWidth, y + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
      doc.text(String(ch.canal), margin + 3, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.text(ch.funcion, margin + 14, y + 4, { maxWidth: 48 });

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(ch.asignadoA || ch.canal, margin + 65, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.text(`${ch.frecuenciaRX} / ${ch.frecuenciaTX}`, margin + 115, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.text(ch.tono || '100.0 Hz', margin + 160, y + 4);

      y += 5.5;
    });

    y += 5;

    // SCI-206: PLAN MÉDICO Y PUESTOS DE ATENCIÓN
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULARIO SCI-206 · PLAN MÉDICO (PUESTOS MÉDICOS Y AMBULANCIAS)', margin + 3, y + 4);

    y += 5.5;

    const puestos = incident.sci206?.puestosMedicos || [];
    const ambulancias = incident.sci206?.ambulancias || [];

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 24, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text('PUESTOS MÉDICOS DE ATENCIÓN:', margin + 3, y + 4);

    let pmY = y + 8;
    puestos.slice(0, 3).forEach((pm) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${pm.nombre} (${pm.ubicacion}) · Personal: ${pm.paramedicos || 'Paramédicos Socorros'} · Contacto: ${pm.contacto}`, margin + 5, pmY);
      pmY += 4.5;
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('AMBULANCIAS ASIGNADAS:', margin + 3, pmY + 1);

    const ambText = ambulancias.map((a) => `${a.unidad} (${a.tipo}) [${a.institucion}]`).join(' · ');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(ambText || 'Ambulancias de Cruz Roja Mexicana en sitio.', margin + 42, pmY + 1, { maxWidth: contentWidth - 46 });

    // ==========================================
    // PÁGINA 3: REGISTRO OFICIAL DE PERSONAS ATENDIDAS (SCI-207)
    // ==========================================
    doc.addPage();
    y = margin + 12;

    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULARIO SCI-207 · REGISTRO OFICIAL DE PERSONAS ATENDIDAS', margin + 3, y + 5);

    y += 7;

    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 8, 'FD');
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('COORDINACIÓN DE SOCORROS · CRUZ ROJA MEXICANA', margin + 3, y + 5);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text('Registro Nominal Obligatorio: Nombre, Edad, Motivo, C.P. y Unidad Asistencial conforme a Norma Oficial.', margin + 75, y + 5);

    y += 8;

    const pacientes = incident.sci207?.pacientesAtendidos || [];

    // Table header
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('#', margin + 2, y + 4);
    doc.text('NOMBRE COMPLETO', margin + 8, y + 4);
    doc.text('EDAD', margin + 56, y + 4);
    doc.text('MOTIVO DE ATENCIÓN', margin + 68, y + 4);
    doc.text('C.P.', margin + 116, y + 4);
    doc.text('UNIDAD ATENDIÓ', margin + 128, y + 4);
    doc.text('TRIAGE', margin + 158, y + 4);
    doc.text('DESTINO', margin + 173, y + 4);

    y += 6;

    if (pacientes.length > 0) {
      pacientes.forEach((p, index) => {
        const rowBg = index % 2 === 0 ? 255 : 248;
        doc.setFillColor(rowBg, rowBg, rowBg);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
        doc.text(String(index + 1), margin + 2, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.text(p.nombre, margin + 8, y + 4.5, { maxWidth: 46 });

        doc.setFont('helvetica', 'normal');
        doc.text(String(p.edad || '-'), margin + 56, y + 4.5);

        doc.text(p.motivoAtencion, margin + 68, y + 4.5, { maxWidth: 46 });
        doc.text(p.codigoPostal || 'N/D', margin + 116, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
        doc.text(p.unidadAtendio, margin + 128, y + 4.5, { maxWidth: 28 });

        // Triage badge color
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        if (p.triage.startsWith('Rojo')) doc.setTextColor(220, 38, 38);
        else if (p.triage.startsWith('Amarillo')) doc.setTextColor(202, 138, 4);
        else if (p.triage.startsWith('Verde')) doc.setTextColor(16, 185, 129);
        else doc.setTextColor(71, 85, 105);
        doc.text(p.triage, margin + 158, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(p.destinoHospital || 'En sitio', margin + 173, y + 4.5, { maxWidth: 18 });

        y += 6.5;
      });
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 10, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text('Sin registros de atención médica reportados para este período.', margin + 5, y + 6);
      y += 10;
    }

    y += 6;

    // SCI-208: PLAN Y MENSAJE DE SEGURIDAD
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMULARIO SCI-208 · PLAN Y MENSAJE DE SEGURIDAD OPERACIONAL', margin + 3, y + 4);

    y += 5.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('MENSAJE GENERAL DE SEGURIDAD DEL OFICIAL DE SEGURIDAD:', margin + 3, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(
      incident.sci208?.mensajeSeguridadGeneral ||
        'Se reitera la obligatoriedad del uso de Equipo de Protección Personal completo según la tarea. Respetar áreas de exclusión táctica y rutas de escape.',
      margin + 3,
      y + 8,
      { maxWidth: contentWidth - 6 }
    );

    y += 24;

    // ==========================================
    // BLOQUE DE APROBACIÓN Y FIRMAS OFICIALES
    // ==========================================
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('VALIDACIÓN Y FIRMAS DE APROBACIÓN DEL PLAN DE ACCIÓN DEL INCIDENTE (PAI)', margin + 3, y + 4);

    y += 5.5;

    const signatureH = 26;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, signatureH, 'FD');

    const signColW = contentWidth / 3;

    // Firmante 1: Comandante
    doc.line(margin + 6, y + 17, margin + signColW - 6, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(incident.comandanteIncidente || 'Comandante del Incidente', margin + signColW / 2, y + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('COMANDANTE DEL INCIDENTE (CI)', margin + signColW / 2, y + 23, { align: 'center' });

    // Firmante 2: Jefe de Planificación
    const col2X = margin + signColW;
    doc.line(col2X + 6, y + 17, col2X + signColW - 6, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(incident.sci203?.planificacion?.jefe || 'Jefe de Planificación', col2X + signColW / 2, y + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('JEFE SECCIÓN PLANIFICACIÓN (JSP)', col2X + signColW / 2, y + 23, { align: 'center' });

    // Firmante 3: Oficial de Seguridad / Coordinación de Socorros
    const col3X = margin + signColW * 2;
    doc.line(col3X + 6, y + 17, col3X + signColW - 6, y + 17);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('Coordinación de Socorros', col3X + signColW / 2, y + 20, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('CRUZ ROJA MEXICANA', col3X + signColW / 2, y + 23, { align: 'center' });

    // ==========================================
    // PÁGINA 5+: ANEXO FINANCIERO Y CONTROL DE HORAS-HOMBRE
    // ==========================================
    doc.addPage();
    y = margin + 12;

    // Header Box
    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ANEXO FINANCIERO: CENTRO DE COSTOS Y ESTADO DE CUENTA OPERATIVO', margin + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(234, 179, 8);
    doc.text('INFORME CONSOLIDADO DE GASTOS, ADQUISICIONES, INVERSIONES, GANANCIAS E INSUMOS REGISTRADOS', margin + 4, y + 9.5);

    y += 15;

    // Cálculos Financieros
    const centroCostos = incident.centroCostos || {
      presupuestoAsignado: 0,
      fondoCajaChica: 0,
      responsableFinanzas: 'N/A',
      moneda: 'MXN',
      items: [],
      observacionesFinancieras: ''
    };

    let totalGastos = 0;
    let cantGastos = 0;
    let totalAdquisiciones = 0;
    let cantAdquisiciones = 0;
    let totalInversiones = 0;
    let cantInversiones = 0;
    let totalGanancias = 0;
    let cantGanancias = 0;
    let totalInsumosGastados = 0;
    let cantInsumos = 0;

    (centroCostos.items || []).forEach((item) => {
      const imp = Number(item.montoTotal) || 0;
      if (item.tipo === 'Gasto') { totalGastos += imp; cantGastos++; }
      else if (item.tipo === 'Adquisición') { totalAdquisiciones += imp; cantAdquisiciones++; }
      else if (item.tipo === 'Inversión') { totalInversiones += imp; cantInversiones++; }
      else if (item.tipo === 'Ganancia') { totalGanancias += imp; cantGanancias++; }
      else if (item.tipo === 'Insumo Gastado') { totalInsumosGastados += imp; cantInsumos++; }
    });

    const egresoTotal = totalGastos + totalAdquisiciones + totalInversiones + totalInsumosGastados;
    const balanceNeto = totalGanancias - egresoTotal;
    const presupuestoTotal = (Number(centroCostos.presupuestoAsignado) || 0) + (Number(centroCostos.fondoCajaChica) || 0);

    // Metadata band for Centro de Costos
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, 7, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    doc.text('Responsable de Finanzas (JAF): ', margin + 3, y + 4.8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${centroCostos.responsableFinanzas || 'Por Designar'}`, margin + 38, y + 4.8);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Moneda Operativa: ', margin + 95, y + 4.8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${centroCostos.moneda || 'MXN'}`, margin + 118, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.text('Partidas Registradas: ', margin + 140, y + 4.8);
    doc.setFont('helvetica', 'bold');
    doc.text(`${(centroCostos.items || []).length} registros`, margin + 165, y + 4.8);

    y += 9;

    // Métricas Financieras (5 tarjetas)
    const cardW = (contentWidth - 8) / 5;
    const cardH = 13;
    const cards = [
      { label: 'Presupuesto Total', val: `$${presupuestoTotal.toLocaleString()}`, color: [30, 41, 59] },
      { label: `Gastos (${cantGastos})`, val: `$${totalGastos.toLocaleString()}`, color: [220, 38, 38] },
      { label: `Adquis./Inv. (${cantAdquisiciones + cantInversiones})`, val: `$${(totalAdquisiciones + totalInversiones).toLocaleString()}`, color: [217, 119, 6] },
      { label: `Insumos Gast. (${cantInsumos})`, val: `$${totalInsumosGastados.toLocaleString()}`, color: [147, 51, 234] },
      { label: `Ganancias (${cantGanancias}) / Bal.`, val: `$${balanceNeto >= 0 ? '+' : ''}${balanceNeto.toLocaleString()}`, color: balanceNeto >= 0 ? [16, 185, 129] : [220, 38, 38] }
    ];

    cards.forEach((c, idx) => {
      const cx = margin + idx * (cardW + 2);
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(cx, y, cardW, cardH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, cx + 2, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.text(c.val, cx + 2, y + 9.5);
    });

    y += cardH + 4;

    // Render Financial Table Header
    const renderFinancialTableHeader = (continuation = false) => {
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text(
        continuation
          ? 'REGISTRO DE PARTIDAS FINANCIERAS (CONTINUACIÓN)'
          : 'REGISTRO COMPLETO DE PARTIDAS FINANCIERAS DE CONFORMIDAD A LAS LISTAS REGISTRADAS',
        margin + 3,
        y + 3.5
      );

      y += 5;

      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 4.5, 'F');
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.text('FECHA', margin + 2, y + 3.2);
      doc.text('TIPO', margin + 19, y + 3.2);
      doc.text('CONCEPTO / DETALLE', margin + 42, y + 3.2);
      doc.text('CATEGORÍA / PROVEEDOR', margin + 98, y + 3.2);
      doc.text('CANT / P.UNIT', margin + 132, y + 3.2);
      doc.text('ESTADO', margin + 154, y + 3.2);
      doc.text('TOTAL (MXN)', margin + contentWidth - 2, y + 3.2, { align: 'right' });

      y += 4.5;
    };

    renderFinancialTableHeader(false);

    // Render ALL items without any truncation
    const allFinancialItems = centroCostos.items || [];
    if (allFinancialItems.length > 0) {
      allFinancialItems.forEach((it, idx) => {
        if (y + 5.5 > pageHeight - margin - 10) {
          doc.addPage();
          y = margin + 12;
          renderFinancialTableHeader(true);
        }

        const rowBg = idx % 2 === 0 ? [255, 255, 255] : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        doc.setTextColor(51, 65, 85);

        doc.text(it.fecha || '-', margin + 2, y + 3.4);

        doc.setFont('helvetica', 'bold');
        if (it.tipo === 'Ganancia') doc.setTextColor(16, 185, 129);
        else if (it.tipo === 'Insumo Gastado') doc.setTextColor(147, 51, 234);
        else if (it.tipo === 'Adquisición') doc.setTextColor(217, 119, 6);
        else if (it.tipo === 'Inversión') doc.setTextColor(37, 99, 235);
        else doc.setTextColor(220, 38, 38);
        doc.text(it.tipo, margin + 19, y + 3.4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        const conceptoText = it.numComprobante ? `${it.concepto} [${it.numComprobante}]` : it.concepto;
        doc.text(conceptoText, margin + 42, y + 3.4, { maxWidth: 54 });

        const provCatText = it.proveedorBeneficiario ? `${it.proveedorBeneficiario} (${it.categoria || '-'})` : (it.categoria || '-');
        doc.text(provCatText, margin + 98, y + 3.4, { maxWidth: 32 });

        const cantUnitText = `${it.cantidad || 1} ${it.unidadMedida || 'pza'} @ $${Number(it.costoUnitario || 0).toLocaleString()}`;
        doc.text(cantUnitText, margin + 132, y + 3.4, { maxWidth: 21 });

        doc.text(it.estadoPago || 'Pagado', margin + 154, y + 3.4);

        doc.setFont('helvetica', 'bold');
        if (it.tipo === 'Ganancia') doc.setTextColor(16, 185, 129);
        else doc.setTextColor(30, 41, 59);
        doc.text(`$${Number(it.montoTotal).toLocaleString()}`, margin + contentWidth - 2, y + 3.4, { align: 'right' });

        y += 5;
      });

      // Total summary row for Financial Items
      if (y + 6 > pageHeight - margin - 10) {
        doc.addPage();
        y = margin + 12;
      }
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`TOTAL PARTIDAS REGISTRADAS: ${allFinancialItems.length}`, margin + 3, y + 3.7);
      doc.text(`EGRESOS TOTALES: $${egresoTotal.toLocaleString()}`, margin + 70, y + 3.7);
      doc.setTextColor(balanceNeto >= 0 ? 16 : 220, balanceNeto >= 0 ? 185 : 38, balanceNeto >= 0 ? 129 : 38);
      doc.text(`BALANCE NETO OPERATIVO: $${balanceNeto >= 0 ? '+' : ''}${balanceNeto.toLocaleString()} MXN`, margin + contentWidth - 2, y + 3.7, { align: 'right' });
      y += 8;
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 6, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.text('Sin transacciones financieras registradas de conformidad a las listas operativas.', margin + 3, y + 4);
      y += 8;
    }

    if (centroCostos.observacionesFinancieras) {
      if (y + 12 > pageHeight - margin - 10) {
        doc.addPage();
        y = margin + 12;
      }
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(margin, y, contentWidth, 10, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text('OBSERVACIONES Y NOTAS DE FINANZAS:', margin + 2, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(15, 23, 42);
      doc.text(centroCostos.observacionesFinancieras, margin + 2, y + 7, { maxWidth: contentWidth - 4 });
      y += 12;
    }

    // ==========================================
    // SECCIÓN 2: CONTROL DE HORAS-HOMBRE Y FUERZA DE TAREA
    // ==========================================
    const controlHH = incident.controlHorasHombre || {
      coordinadorPersonal: 'N/A',
      limiteHorasTurno: 8,
      registros: [],
      observaciones: ''
    };

    let totalHorasHombre = 0;
    let totalEfectivos = 0;
    let costoTotalManoObra = 0;
    let alertasFatiga = 0;

    (controlHH.registros || []).forEach((r) => {
      const efectivos = Number(r.numeroEfectivos) || 0;
      const horasTurno = Number(r.horasPorPersona) || 0;
      const horasExtra = Number(r.horasExtraordinarias) || 0;
      const hh = Number(r.totalHorasHombre) || (efectivos * (horasTurno + horasExtra));
      const cuota = Number(r.tasaHorariaEstimada) || 0;

      totalHorasHombre += hh;
      totalEfectivos += efectivos;
      costoTotalManoObra += (Number(r.costoTotalPersonal) || (hh * cuota));
      if (horasTurno + horasExtra > 12 || r.condicionFatiga === 'Relevo Requerido') alertasFatiga++;
    });

    // If remaining space on page is small, open new page for man-hours
    if (y + 35 > pageHeight - margin - 15) {
      doc.addPage();
      y = margin + 12;
    } else {
      y += 4;
    }

    doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('REGISTRO Y CONTROL DE FUERZA DE TAREA / HORAS-HOMBRE (HH)', margin + 3, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(234, 179, 8);
    doc.text(`COORDINADOR: ${controlHH.coordinadorPersonal || 'N/A'} · LÍMITE DE TURNO: ${controlHH.limiteHorasTurno || 8} HRS CONFORME NOM-010-SEGOB`, margin + 3, y + 8);

    y += 13;

    // Tarjetas Métricas Horas-Hombre (4 tarjetas)
    const hhCardW = (contentWidth - 6) / 4;
    const hhCardH = 12;
    const hhCards = [
      { label: 'Fuerza Desplegada', val: `${totalEfectivos} Efectivos`, color: [30, 41, 59] },
      { label: 'Horas-Hombre Totales', val: `${totalHorasHombre.toFixed(1)} HH`, color: [147, 51, 234] },
      { label: 'Costo Estimado M.O.', val: `$${costoTotalManoObra.toLocaleString()}`, color: [37, 99, 235] },
      { label: 'Alertas de Fatiga NOM-010', val: `${alertasFatiga} Brigadas`, color: alertasFatiga > 0 ? [220, 38, 38] : [16, 185, 129] }
    ];

    hhCards.forEach((c, idx) => {
      const cx = margin + idx * (hhCardW + 2);
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(cx, y, hhCardW, hhCardH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, cx + 2, y + 3.8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.text(c.val, cx + 2, y + 9);
    });

    y += hhCardH + 4;

    // Render HH Table Header
    const renderHHTableHeader = (continuation = false) => {
      doc.setFillColor(brandNavy[0], brandNavy[1], brandNavy[2]);
      doc.rect(margin, y, contentWidth, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text(
        continuation
          ? 'REGISTRO DE BRIGADAS Y HORAS-HOMBRE (CONTINUACIÓN)'
          : 'LISTA COMPLETA DE BRIGADAS, PERSONAL DESPLEGADO Y JORNADAS DE CONFORMIDAD A LA FUERZA REGISTRADA',
        margin + 3,
        y + 3.5
      );

      y += 5;

      doc.setFillColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, 4.5, 'F');
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.text('FECHA / HORARIO', margin + 2, y + 3.2);
      doc.text('BRIGADA / FUERZA DE TAREA', margin + 26, y + 3.2);
      doc.text('ESPECIALIDAD', margin + 68, y + 3.2);
      doc.text('LÍDER / RESPONSABLE', margin + 106, y + 3.2);
      doc.text('EFECT.', margin + 140, y + 3.2);
      doc.text('CONDICIÓN', margin + 152, y + 3.2);
      doc.text('TOTAL HH', margin + contentWidth - 2, y + 3.2, { align: 'right' });

      y += 4.5;
    };

    renderHHTableHeader(false);

    // Render ALL HH records without slicing
    const allHHRegistros = controlHH.registros || [];
    if (allHHRegistros.length > 0) {
      allHHRegistros.forEach((reg, idx) => {
        if (y + 5.5 > pageHeight - margin - 10) {
          doc.addPage();
          y = margin + 12;
          renderHHTableHeader(true);
        }

        const rowBg = idx % 2 === 0 ? [255, 255, 255] : lightBg;
        doc.setFillColor(rowBg[0], rowBg[1], rowBg[2]);
        doc.rect(margin, y, contentWidth, 5, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.2);
        doc.setTextColor(51, 65, 85);

        const fechaHorario = `${reg.fecha || '-'} ${reg.horaInicio || ''}-${reg.horaFin || ''}`;
        doc.text(fechaHorario, margin + 2, y + 3.4, { maxWidth: 23 });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(reg.brigadaUnidad, margin + 26, y + 3.4, { maxWidth: 40 });

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(reg.especialidad, margin + 68, y + 3.4, { maxWidth: 36 });

        doc.text(reg.responsableLider, margin + 106, y + 3.4, { maxWidth: 32 });

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${reg.numeroEfectivos} ef.`, margin + 140, y + 3.4);

        if (reg.condicionFatiga === 'Relevo Requerido') {
          doc.setTextColor(220, 38, 38);
          doc.text('RELEVO', margin + 152, y + 3.4);
        } else if (reg.condicionFatiga === 'Moderada') {
          doc.setTextColor(217, 119, 6);
          doc.text('Moderada', margin + 152, y + 3.4);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.text('Óptima', margin + 152, y + 3.4);
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(147, 51, 234);
        const hhVal = reg.totalHorasHombre || (reg.numeroEfectivos * (reg.horasPorPersona + (reg.horasExtraordinarias || 0)));
        doc.text(`${hhVal.toFixed(1)} HH`, margin + contentWidth - 2, y + 3.4, { align: 'right' });

        y += 5;
      });

      // Total summary row for HH
      if (y + 6 > pageHeight - margin - 10) {
        doc.addPage();
        y = margin + 12;
      }
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, 5.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`TOTAL BRIGADAS REGISTRADAS: ${allHHRegistros.length}`, margin + 3, y + 3.7);
      doc.text(`EFECTIVOS EN CAMPO: ${totalEfectivos}`, margin + 65, y + 3.7);
      doc.setTextColor(147, 51, 234);
      doc.text(`TOTAL FUERZA / HORAS-HOMBRE: ${totalHorasHombre.toFixed(1)} HH ($${costoTotalManoObra.toLocaleString()} MXN)`, margin + contentWidth - 2, y + 3.7, { align: 'right' });
      y += 8;
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 6, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.text('Sin registros de personal u horas-hombre capturados de conformidad a las listas.', margin + 3, y + 4);
      y += 8;
    }

    if (controlHH.observaciones) {
      if (y + 12 > pageHeight - margin - 10) {
        doc.addPage();
        y = margin + 12;
      }
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(margin, y, contentWidth, 10, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text('OBSERVACIONES DE RECURSOS HUMANOS Y FATIGA:', margin + 2, y + 3.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(15, 23, 42);
      doc.text(controlHH.observaciones, margin + 2, y + 7, { maxWidth: contentWidth - 4 });
      y += 12;
    }

    // Firmas de Finanzas, Recursos Humanos y Comando del Incidente
    const signFinH = 22;
    if (y + signFinH + 4 > pageHeight - margin - 10) {
      doc.addPage();
      y = margin + 12;
    }

    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.rect(margin, y, contentWidth, signFinH, 'FD');

    const finSignW = contentWidth / 3;

    // Firmante 1: Finanzas
    doc.line(margin + 8, y + 14, margin + finSignW - 8, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(centroCostos.responsableFinanzas || 'Responsable de Finanzas', margin + finSignW / 2, y + 17, { align: 'center', maxWidth: finSignW - 10 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text('JEFE SECCIÓN ADMÓN. Y FINANZAS (JAF)', margin + finSignW / 2, y + 20, { align: 'center' });

    // Firmante 2: Horas-Hombre / Recursos
    const finCol2X = margin + finSignW;
    doc.line(finCol2X + 8, y + 14, finCol2X + finSignW - 8, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandNavy[0], brandNavy[1], brandNavy[2]);
    doc.text(controlHH.coordinadorPersonal || 'Coordinador de Personal', finCol2X + finSignW / 2, y + 17, { align: 'center', maxWidth: finSignW - 10 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text('COORDINADOR FUERZA DE TAREA / RRHH', finCol2X + finSignW / 2, y + 20, { align: 'center' });

    // Firmante 3: Comandante del Incidente
    const finCol3X = margin + finSignW * 2;
    doc.line(finCol3X + 8, y + 14, finCol3X + finSignW - 8, y + 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text(incident.comandanteIncidente || 'Comandante del Incidente', finCol3X + finSignW / 2, y + 17, { align: 'center', maxWidth: finSignW - 10 });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(100, 116, 139);
    doc.text('COMANDANTE DEL INCIDENTE / SOCORROS', finCol3X + finSignW / 2, y + 20, { align: 'center' });

    // Draw header/footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      drawPageHeader(p, totalPages);
    }

    // Generate PDF Blob
    const pdfBlob = doc.output('blob');
    const safeName = incident.nombre.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const fileName = `${incident.folio}_PAI_Socorros_CruzRoja_${safeName}.pdf`;

    // Create File for Native Web Share API
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

    // Check Web Share API capability
    if (
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      try {
        await navigator.share({
          title: `PAI ${incident.folio} - Coordinación de Socorros Cruz Roja Mexicana`,
          text: `Expediente oficial del Plan de Acción del Incidente: ${incident.nombre} (Período Operacional Nº ${incident.periodoOperacional.numero})`,
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
        console.warn('Error en navigator.share, procediendo a descarga:', shareErr);
      }
    }

    // Direct Download Fallback
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
      fileName: 'error.pdf',
      error: err?.message || 'Error desconocido al procesar el PDF'
    };
  }
}
