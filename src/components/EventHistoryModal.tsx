import React, { useState, useEffect } from 'react';
import { IncidentData } from '../types/sci';
import {
  Archive,
  Save,
  Download,
  Upload,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  FolderOpen,
  FileCheck2,
  FileSpreadsheet,
  X,
  Plus,
  Share2,
  Loader2
} from 'lucide-react';
import { generateAndSharePAIPdf } from '../services/pdfExportService';

interface EventHistoryModalProps {
  currentIncident: IncidentData;
  onLoadIncident: (incident: IncidentData) => void;
  onClose: () => void;
}

export interface ArchivedEventRecord {
  id: string;
  folio: string;
  nombre: string;
  fechaGuardado: string;
  municipioEstado: string;
  tipoIncidente: string;
  pacientesCount: number;
  data: IncidentData;
}

const ARCHIVE_STORAGE_KEY = 'sci_cruz_roja_event_archive_v1';

export const EventHistoryModal: React.FC<EventHistoryModalProps> = ({
  currentIncident,
  onLoadIncident,
  onClose
}) => {
  const [archivedEvents, setArchivedEvents] = useState<ArchivedEventRecord[]>(() => {
    try {
      const saved = localStorage.getItem(ARCHIVE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  const handleShareIncidentPdf = async (targetIncident: IncidentData) => {
    setIsSharingPdf(true);
    try {
      const res = await generateAndSharePAIPdf(targetIncident);
      if (res.success) {
        setSaveSuccessMsg(res.method === 'native_share' ? '¡PDF compartido con éxito!' : `¡PDF descargado: ${res.fileName}!`);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      }
    } catch (e) {
      console.error(e);
      alert('Error al generar el PDF del expediente.');
    } finally {
      setIsSharingPdf(false);
    }
  };

  const saveCurrentEventToArchive = () => {
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newRecord: ArchivedEventRecord = {
      id: `arch-${Date.now()}`,
      folio: currentIncident.folio,
      nombre: currentIncident.nombre,
      fechaGuardado: dateFormatted,
      municipioEstado: currentIncident.municipioEstado,
      tipoIncidente: currentIncident.tipoIncidente,
      pacientesCount: currentIncident.sci207?.pacientesAtendidos?.length || 0,
      data: JSON.parse(JSON.stringify(currentIncident))
    };

    const updated = [newRecord, ...archivedEvents.filter((e) => e.data.id !== currentIncident.id)];
    setArchivedEvents(updated);
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
    setSaveSuccessMsg('¡Evento guardado exitosamente en el registro histórico!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const deleteArchivedEvent = (id: string) => {
    const updated = archivedEvents.filter((e) => e.id !== id);
    setArchivedEvents(updated);
    localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(updated));
  };

  const exportCurrentJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentIncident, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `EXPEDIENTE_SCI_${currentIncident.folio}_${currentIncident.nombre.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportPatientsCSV = () => {
    const patients = currentIncident.sci207?.pacientesAtendidos || [];
    if (patients.length === 0) {
      alert('No hay pacientes registrados en el formulario SCI-207 para exportar.');
      return;
    }

    const headers = ['Folio Incidente', 'Nombre Paciente', 'Edad', 'Motivo Atencion', 'Codigo Postal', 'Unidad Atendio', 'Triage', 'Destino Hospital', 'Hora Atencion'];
    const rows = patients.map((p) => [
      currentIncident.folio,
      `"${p.nombre.replace(/"/g, '""')}"`,
      p.edad,
      `"${p.motivoAtencion.replace(/"/g, '""')}"`,
      p.codigoPostal,
      `"${p.unidadAtendio.replace(/"/g, '""')}"`,
      p.triage,
      `"${(p.destinoHospital || '').replace(/"/g, '""')}"`,
      p.horaAtencion || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `CRUZ_ROJA_PACIENTES_${currentIncident.folio}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5">
                Registro y Archivo Histórico de Eventos
              </h2>
              <p className="text-[11px] text-slate-400">
                Guarda y mantén el registro permanente de los incidentes y traslados
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Quick Actions for Current Event */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Evento en Edición Actual:</span>
                <span className="text-white font-bold text-sm">{currentIncident.nombre}</span>
              </div>
              <span className="text-amber-400 font-mono text-xs font-bold">{currentIncident.folio}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={saveCurrentEventToArchive}
                className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl transition-all shadow-md cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>Guardar en Archivo</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareIncidentPdf(currentIncident)}
                disabled={isSharingPdf}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer text-xs disabled:opacity-50"
                title="Convertir el expediente a PDF oficial y compartirlo"
              >
                {isSharingPdf ? (
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
                onClick={exportCurrentJSON}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer text-xs"
                title="Descargar archivo JSON completo del evento"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>Exportar JSON</span>
              </button>

              <button
                type="button"
                onClick={exportPatientsCSV}
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2 rounded-xl border border-slate-700 transition-all cursor-pointer text-xs"
                title="Exportar base de datos de pacientes de Cruz Roja a Excel / CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar CSV Pacientes</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="text-center font-bold text-emerald-400 text-xs py-1">
                {saveSuccessMsg}
              </div>
            )}
          </div>

          {/* List of Archived Events */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Historial de Eventos Guardados ({archivedEvents.length})
              </span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {archivedEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-400 text-[11px] font-bold">{evt.folio}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-white font-bold text-xs">{evt.nombre}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{evt.municipioEstado}</span>
                      <span>·</span>
                      <span className="text-emerald-400">{evt.pacientesCount} pacientes atendidos</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Guardado: {evt.fechaGuardado}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleShareIncidentPdf(evt.data)}
                      className="px-2.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Convertir a PDF y compartir este evento"
                    >
                      <Share2 className="w-3.5 h-3.5 text-orange-400" />
                      <span>PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLoadIncident(evt.data);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-bold cursor-pointer"
                    >
                      Cargar Evento
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteArchivedEvent(evt.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg"
                      title="Eliminar de historial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {archivedEvents.length === 0 && (
                <div className="text-center py-8 text-slate-500 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                  No hay eventos archivados en este dispositivo.
                  <div className="text-[11px] text-slate-600 mt-1">
                    Usa el botón "Guardar en Archivo" para crear el primer registro histórico.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
