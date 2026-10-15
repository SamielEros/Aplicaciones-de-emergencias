import React, { useState } from 'react';
import { IncidentData } from '../types/sci';
import { generateAndSharePAIPdf } from '../services/pdfExportService';
import {
  Share2,
  Download,
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  Radio,
  HeartPulse,
  HardHat,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Check,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface PAICompilationModalProps {
  incident: IncidentData;
  onClose: () => void;
  onOpenDrive?: () => void;
}

export const PAICompilationModal: React.FC<PAICompilationModalProps> = ({ incident, onClose, onOpenDrive }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);

  const handleConvertAndSharePDF = async () => {
    setIsGeneratingPdf(true);
    setShareSuccessMsg(null);
    try {
      const result = await generateAndSharePAIPdf(incident);
      if (result.success) {
        if (result.method === 'native_share') {
          setShareSuccessMsg('¡Documento enviado a compartir exitosamente!');
        } else {
          setShareSuccessMsg(`¡PDF generado y descargado con éxito: ${result.fileName}!`);
        }
        setTimeout(() => setShareSuccessMsg(null), 4500);
      } else {
        alert(`Ocurrió un inconveniente al generar el PDF: ${result.error || 'Error'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert('Error al generar el documento PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incident, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${incident.folio}_PAI_Periodo_${incident.periodoOperacional.numero}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-mono text-xs font-bold border border-orange-500/30">
                PAI Consolidado
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Plan de Acción del Incidente (PAI) - Período {incident.periodoOperacional.numero}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Expediente operacional unificado conforme a PROY-NOM-010-SEGOB-2016 · Coordinación de Socorros Cruz Roja Mexicana.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* NUEVO BOTÓN: Convertir a PDF para Compartir (Sustituye imprimir/pdf) */}
            <button
              type="button"
              onClick={handleConvertAndSharePDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Convertir el documento a PDF oficial y compartirlo por AirDrop, WhatsApp, correo o guardar"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-950" />
                  <span>Convertir a PDF y Compartir</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-all cursor-pointer"
              title="Descargar archivo JSON completo del incidente"
            >
              <Download className="w-4 h-4" /> JSON
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {shareSuccessMsg && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-5 py-2 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{shareSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setShareSuccessMsg(null)}
              className="text-emerald-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950 text-slate-100 print-card">
          {/* Official Document Cover */}
          <div className="border-4 border-slate-800 p-6 rounded-2xl text-center space-y-3 bg-slate-900/50 print-header relative">
            <div className="text-xs uppercase tracking-widest font-black text-orange-500">
              SISTEMA DE COMANDO DE INCIDENTES
            </div>
            <div className="text-[11px] text-slate-400">
              PROYECTO DE NORMA OFICIAL MEXICANA PROY-NOM-010-SEGOB-2016 / NOM-010-SSPC-2019
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              PLAN DE ACCIÓN DEL INCIDENTE (PAI)
            </h1>
            <div className="text-base font-bold text-amber-400">{incident.nombre}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs font-mono text-left">
              <div>
                <span className="text-slate-500 block text-[10px]">FOLIO:</span>
                <span className="font-bold text-white">{incident.folio}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PERÍODO:</span>
                <span className="font-bold text-white">Nº {incident.periodoOperacional.numero}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">HORARIO VIGENCIA:</span>
                <span className="font-bold text-white">{incident.periodoOperacional.horaInicio} a {incident.periodoOperacional.horaFin}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">COMANDANTE (CI):</span>
                <span className="font-bold text-white truncate">{incident.comandanteIncidente}</span>
              </div>
            </div>
          </div>

          {/* Form 1: SCI-202 Objetivos */}
          <section className="border border-slate-800 rounded-2xl p-5 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  SCI-202
                </span>
                <h3 className="font-bold text-white text-sm uppercase">Objetivos del Incidente</h3>
              </div>
              <span className="text-xs text-slate-400">Período Nº {incident.periodoOperacional.numero}</span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Objetivos del Período Operacional:</h4>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {incident.sci202.objetivos.map((obj, i) => (
                  <li key={obj.id} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-amber-400">{i + 1}.</span>
                    <span>{obj.texto}</span>
                    <span className="text-[10px] text-slate-500 ml-auto">[{obj.prioridad}]</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase block text-[10px]">Estrategias Tácticas:</span>
                <p className="text-slate-300 mt-1">{incident.sci202.estrategiasTácticas || 'No especificadas'}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase block text-[10px]">Directrices de Seguridad:</span>
                <p className="text-slate-300 mt-1">{incident.sci202.directricesSeguridad || 'Uso obligatorio de EPP'}</p>
              </div>
            </div>
          </section>

          {/* Form 2: SCI-203 Organización */}
          <section className="border border-slate-800 rounded-2xl p-5 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                  SCI-203
                </span>
                <h3 className="font-bold text-white text-sm uppercase">Organización del Incidente</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">COMANDANTE DEL INCIDENTE (CI):</span>
                <span className="font-bold text-white">{incident.comandanteIncidente}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">OFICIAL DE SEGURIDAD:</span>
                <span className="font-bold text-white">{incident.sci203.mando?.oficialSeguridad || 'Pendiente'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">JEFE SECCIÓN OPERACIONES:</span>
                <span className="font-bold text-white">{incident.sci203.operaciones?.jefe || 'Pendiente'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px]">JEFE SECCIÓN PLANIFICACIÓN:</span>
                <span className="font-bold text-white">{incident.sci203.planificacion?.jefe || 'Pendiente'}</span>
              </div>
            </div>
          </section>

          {/* Form 3: SCI-205 Comunicaciones */}
          <section className="border border-slate-800 rounded-2xl p-5 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  SCI-205
                </span>
                <h3 className="font-bold text-white text-sm uppercase">Plan de Comunicaciones Radiales</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {incident.sci205.canales.map((c) => (
                <div key={c.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div className="font-bold text-white">Canal {c.canal}: {c.asignadoA}</div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{c.funcion}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    RX: {c.frecuenciaRX} | TX: {c.frecuenciaTX} | Tono: {c.tono || '100.0'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form 4: SCI-206 Plan Médico */}
          <section className="border border-slate-800 rounded-2xl p-5 bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  SCI-206
                </span>
                <h3 className="font-bold text-white text-sm uppercase">Plan Médico y Ambulancias</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">Ambulancias y Recursos Asignados:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {incident.sci206.ambulancias.map((a) => (
                  <div key={a.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">{a.unidad}</div>
                      <div className="text-[11px] text-slate-400">{a.institucion} ({a.tipo})</div>
                    </div>
                    <span className="text-[10px] text-amber-300 font-mono">{a.ubicacion}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Form 5: SCI-208 Mensaje de Seguridad */}
          <section className="border border-slate-800 rounded-2xl p-5 bg-slate-900/40 space-y-2">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                SCI-208
              </span>
              <h3 className="font-bold text-white text-sm uppercase">Mensaje de Seguridad Operacional</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {incident.sci208.mensajeSeguridadGeneral}
            </p>
            <div className="text-[11px] text-amber-400 font-mono pt-1">
              Alarma Evacuación: {incident.sci208.alarmaEvacuacionEmergencia}
            </div>
          </section>

          {/* Form 6: Registro de Pacientes Coordinación de Socorros Cruz Roja Mexicana */}
          {incident.sci207?.pacientesAtendidos && incident.sci207.pacientesAtendidos.length > 0 && (
            <section className="border border-orange-500/30 rounded-2xl p-5 bg-slate-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm uppercase">
                    Registro de Personas Atendidas en Escena
                  </h3>
                </div>
                <span className="text-xs text-orange-400 font-mono font-bold">
                  {incident.sci207.pacientesAtendidos.length} Pacientes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-1.5">Nombre</th>
                      <th className="p-1.5 w-12 text-center">Edad</th>
                      <th className="p-1.5">Motivo Atención</th>
                      <th className="p-1.5 w-16">C.P.</th>
                      <th className="p-1.5">Unidad</th>
                      <th className="p-1.5">Triage</th>
                      <th className="p-1.5">Destino</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {incident.sci207.pacientesAtendidos.map((p) => (
                      <tr key={p.id}>
                        <td className="p-1.5 font-sans font-semibold text-white">{p.nombre}</td>
                        <td className="p-1.5 text-center">{p.edad}</td>
                        <td className="p-1.5 font-sans text-slate-300">{p.motivoAtencion}</td>
                        <td className="p-1.5 text-amber-300">{p.codigoPostal}</td>
                        <td className="p-1.5 font-sans text-orange-400 font-bold">{p.unidadAtendio}</td>
                        <td className="p-1.5 font-bold">{p.triage}</td>
                        <td className="p-1.5 font-sans text-slate-400">{p.destinoHospital || 'En escena'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Anexo Financiero: Centro de Costos */}
          {incident.centroCostos && (
            <section className="border border-emerald-500/30 rounded-2xl p-5 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">
                      Anexo Financiero · Centro de Costos del Incidente
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Responsable de Finanzas: {incident.centroCostos.responsableFinanzas || 'Por asignar'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {incident.centroCostos.items?.length || 0} Partidas Capturadas
                </span>
              </div>

              {/* Tarjetas resumen */}
              {(() => {
                const items = incident.centroCostos.items || [];
                let gastos = 0;
                let adquisiciones = 0;
                let inversiones = 0;
                let ganancias = 0;
                let insumos = 0;

                items.forEach((it) => {
                  const val = Number(it.montoTotal) || 0;
                  if (it.tipo === 'Gasto') gastos += val;
                  else if (it.tipo === 'Adquisición') adquisiciones += val;
                  else if (it.tipo === 'Inversión') inversiones += val;
                  else if (it.tipo === 'Ganancia') ganancias += val;
                  else if (it.tipo === 'Insumo Gastado') insumos += val;
                });

                const egresos = gastos + adquisiciones + inversiones + insumos;
                const balance = ganancias - egresos;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Gastos</div>
                      <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">${gastos.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Adquisiciones</div>
                      <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">${adquisiciones.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Inversiones</div>
                      <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">${inversiones.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Insumos Gastados</div>
                      <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">${insumos.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-400 uppercase">Balance Neto</div>
                      <div className={`text-sm font-bold font-mono mt-0.5 ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {balance >= 0 ? '+' : ''}${balance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {incident.centroCostos.items && incident.centroCostos.items.length > 0 && (
                <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/90 sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Fecha</th>
                        <th className="p-2">Tipo</th>
                        <th className="p-2">Concepto</th>
                        <th className="p-2">Categoría / Proveedor</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-center">Estado</th>
                        <th className="p-2 text-right">Importe (MXN)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                      {incident.centroCostos.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-800/40">
                          <td className="p-2 text-slate-400 whitespace-nowrap">{it.fecha}</td>
                          <td className="p-2 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              it.tipo === 'Ganancia' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              it.tipo === 'Insumo Gastado' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                              it.tipo === 'Adquisición' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              it.tipo === 'Inversión' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {it.tipo}
                            </span>
                          </td>
                          <td className="p-2 font-sans font-semibold text-white">
                            {it.concepto}
                            {it.numComprobante && (
                              <span className="ml-1 text-[10px] text-slate-400 font-mono">[{it.numComprobante}]</span>
                            )}
                          </td>
                          <td className="p-2 font-sans text-slate-400">{it.proveedorBeneficiario || it.categoria || '-'}</td>
                          <td className="p-2 text-center text-slate-300">{it.cantidad || 1} {it.unidadMedida || 'pza'}</td>
                          <td className="p-2 text-center text-slate-300">{it.estadoPago || 'Pagado'}</td>
                          <td className="p-2 text-right font-bold text-emerald-400 whitespace-nowrap">
                            ${Number(it.montoTotal).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Anexo: Control de Horas-Hombre */}
          {incident.controlHorasHombre && (
            <section className="border border-violet-500/30 rounded-2xl p-5 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase">
                      Control Consolidado de Horas-Hombre y Fuerza de Tarea
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Coordinador de Personal: {incident.controlHorasHombre.coordinadorPersonal || 'Por asignar'} · Límite de Turno: {incident.controlHorasHombre.limiteHorasTurno || 8} hrs (NOM-010-SEGOB)
                    </p>
                  </div>
                </div>
                <span className="text-xs text-violet-400 font-mono font-bold">
                  {incident.controlHorasHombre.registros?.length || 0} Brigadas Registradas
                </span>
              </div>

              {(() => {
                const regs = incident.controlHorasHombre.registros || [];
                let totalEfectivos = 0;
                let totalHH = 0;
                let costoMO = 0;
                let alertasFatiga = 0;

                regs.forEach((r) => {
                  const ef = Number(r.numeroEfectivos) || 0;
                  const ht = Number(r.horasPorPersona) || 0;
                  const he = Number(r.horasExtraordinarias) || 0;
                  const hh = Number(r.totalHorasHombre) || ef * (ht + he);
                  const cuota = Number(r.tasaHorariaEstimada) || 0;

                  totalEfectivos += ef;
                  totalHH += hh;
                  costoMO += (Number(r.costoTotalPersonal) || (hh * cuota));
                  if (ht + he > 12 || r.condicionFatiga === 'Relevo Requerido') alertasFatiga++;
                });

                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Fuerza Total</div>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">{totalEfectivos} Efectivos</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Horas-Hombre Acumuladas</div>
                        <div className="text-sm font-bold text-violet-400 font-mono mt-0.5">{totalHH.toFixed(1)} HH</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Costo Estimado M.O.</div>
                        <div className="text-sm font-bold text-sky-400 font-mono mt-0.5">${costoMO.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase">Alertas Fatiga NOM-010</div>
                        <div className={`text-sm font-bold font-mono mt-0.5 ${alertasFatiga > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {alertasFatiga} Brigadas
                        </div>
                      </div>
                    </div>

                    {regs.length > 0 && (
                      <div className="overflow-x-auto max-h-60 border border-slate-800 rounded-xl">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="text-[10px] text-slate-400 uppercase bg-slate-900/90 sticky top-0 border-b border-slate-800">
                            <tr>
                              <th className="p-2">Brigada / Unidad</th>
                              <th className="p-2">Especialidad</th>
                              <th className="p-2">Responsable</th>
                              <th className="p-2 text-center">Efectivos</th>
                              <th className="p-2 text-center">Horas</th>
                              <th className="p-2 text-center">Condición</th>
                              <th className="p-2 text-right">Total HH</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                            {regs.map((rg) => (
                              <tr key={rg.id} className="hover:bg-slate-800/40">
                                <td className="p-2 font-sans font-bold text-white whitespace-nowrap">{rg.brigadaUnidad}</td>
                                <td className="p-2 font-sans text-slate-400 whitespace-nowrap">{rg.especialidad}</td>
                                <td className="p-2 font-sans text-slate-300">{rg.responsableLider}</td>
                                <td className="p-2 text-center font-bold text-white">{rg.numeroEfectivos}</td>
                                <td className="p-2 text-center text-slate-400">{rg.horasPorPersona}h {rg.horasExtraordinarias ? `(+${rg.horasExtraordinarias}h)` : ''}</td>
                                <td className="p-2 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    rg.condicionFatiga === 'Relevo Requerido' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                                    rg.condicionFatiga === 'Moderada' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  }`}>
                                    {rg.condicionFatiga}
                                  </span>
                                </td>
                                <td className="p-2 text-right font-bold text-violet-400 whitespace-nowrap">
                                  {(rg.totalHorasHombre || rg.numeroEfectivos * (rg.horasPorPersona + (rg.horasExtraordinarias || 0))).toFixed(1)} HH
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </section>
          )}

          {/* Bloque de Firmas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center text-xs">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="h-10 border-b border-slate-700 mb-2" />
              <div className="font-bold text-white">{incident.comandanteIncidente}</div>
              <div className="text-[10px] text-slate-400">COMANDANTE DEL INCIDENTE (CI)</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="h-10 border-b border-slate-700 mb-2" />
              <div className="font-bold text-white">{incident.sci203.planificacion?.jefe || 'Pendiente'}</div>
              <div className="text-[10px] text-slate-400">JEFE SECCIÓN PLANIFICACIÓN (JSP)</div>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="h-10 border-b border-slate-700 mb-2" />
              <div className="font-bold text-orange-400 font-bold">Coordinación de Socorros</div>
              <div className="text-[10px] text-slate-400">CRUZ ROJA MEXICANA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
