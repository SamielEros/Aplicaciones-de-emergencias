import React from 'react';
import { SCI221Data, ItemDesmovilizacionSCI221 } from '../../types/sci';
import { LogOut, Plus, Trash2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface SCI221FormProps {
  data: SCI221Data;
  onChange: (data: SCI221Data) => void;
}

export const SCI221Form: React.FC<SCI221FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI221Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addRecurso = () => {
    const newRec: ItemDesmovilizacionSCI221 = {
      id: `dm-${Date.now()}`,
      recurso: '',
      agencia: '',
      fechaDesmovilizacion: new Date().toISOString().slice(0, 10),
      inspeccionEquipo: true,
      informeEntregado: true,
      comunicacionesDevueltas: true,
      aprobadoPorCI: false,
      horaSalida: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    updateField('recursos', [...data.recursos, newRec]);
  };

  const updateRecurso = (id: string, field: keyof ItemDesmovilizacionSCI221, val: any) => {
    updateField(
      'recursos',
      data.recursos.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const removeRecurso = (id: string) => {
    updateField(
      'recursos',
      data.recursos.filter((r) => r.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-221
            </span>
            <h2 className="text-lg font-bold text-white">Plan de Desmovilización de Recursos</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proceso ordenado y seguro de repliegue, verificación de inventarios y cierre administrativo (NOM-010).
          </p>
        </div>
        <button
          type="button"
          onClick={addRecurso}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Recurso a Desmovilizar
        </button>
      </div>

      {/* Guidelines and Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Fecha Programada de Inicio de Desmovilización:
          </label>
          <input
            type="text"
            value={data.fechaInicioDesmovilizacion}
            onChange={(e) => updateField('fechaInicioDesmovilizacion', e.target.value)}
            placeholder="YYYY-MM-DD HH:MM"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 outline-none focus:border-amber-400"
          />

          <label className="text-[10px] text-slate-400 uppercase font-semibold block mt-4 mb-1">
            Prioridades y Secuencia de Desmovilización:
          </label>
          <textarea
            rows={3}
            value={data.prioridadesDesmovilizacion}
            onChange={(e) => updateField('prioridadesDesmovilizacion', e.target.value)}
            placeholder="Orden de repliegue de unidades..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-400"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Requisitos de Salida Obligatorios (Check-Out)
            </h3>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Inspección de daños a equipo y vehículos de la corporación.</li>
              <li>Entrega completa de bitácoras (SCI-214) e informes a Planificación.</li>
              <li>Devolución física de radios portátiles y baterías a Logística.</li>
              <li>Autorización final y firma del Comandante del Incidente.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-semibold block">
              Elaborado Por (Unidad de Desmovilización):
            </label>
            <input
              type="text"
              value={data.elaboradoPor}
              onChange={(e) => updateField('elaboradoPor', e.target.value)}
              placeholder="Nombre del oficial responsable"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Check-Out Verification Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
          Lista de Control de Salida (Check-Out)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Recurso / Unidad</th>
                <th className="p-2.5">Agencia</th>
                <th className="p-2.5 min-w-[130px]">Fecha Desmovilización</th>
                <th className="p-2.5 min-w-[100px]">Hora Salida</th>
                <th className="p-2.5 text-center">Equipo Revisado</th>
                <th className="p-2.5 text-center">Informe Entregado</th>
                <th className="p-2.5 text-center">Radios Devueltos</th>
                <th className="p-2.5 text-center">Visto Bueno CI</th>
                <th className="p-2.5 w-10 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {data.recursos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-2 min-w-[160px]">
                    <input
                      type="text"
                      value={item.recurso}
                      onChange={(e) => updateRecurso(item.id, 'recurso', e.target.value)}
                      placeholder="Nombre del recurso"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs text-white outline-none"
                    />
                  </td>
                  <td className="p-2 min-w-[130px]">
                    <input
                      type="text"
                      value={item.agencia}
                      onChange={(e) => updateRecurso(item.id, 'agencia', e.target.value)}
                      placeholder="Agencia"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs text-slate-200 outline-none"
                    />
                  </td>
                  <td className="p-2 min-w-[130px]">
                    <input
                      type="date"
                      value={item.fechaDesmovilizacion || ''}
                      onChange={(e) => updateRecurso(item.id, 'fechaDesmovilizacion', e.target.value)}
                      title="Fecha programada o ejecutada de desmovilización del recurso"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs font-mono text-amber-300 outline-none"
                    />
                  </td>
                  <td className="p-2 min-w-[100px]">
                    <input
                      type="text"
                      value={item.horaSalida}
                      onChange={(e) => updateRecurso(item.id, 'horaSalida', e.target.value)}
                      placeholder="Pendiente / 18:00"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded px-2 py-1 text-xs font-mono text-amber-300 outline-none"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.inspeccionEquipo}
                      onChange={(e) => updateRecurso(item.id, 'inspeccionEquipo', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.informeEntregado}
                      onChange={(e) => updateRecurso(item.id, 'informeEntregado', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.comunicacionesDevueltas}
                      onChange={(e) => updateRecurso(item.id, 'comunicacionesDevueltas', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.aprobadoPorCI}
                      onChange={(e) => updateRecurso(item.id, 'aprobadoPorCI', e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRecurso(item.id)}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Eliminar recurso de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.recursos.length === 0 && (
            <p className="text-xs text-slate-500 italic text-center py-4">No hay recursos en lista de desmovilización.</p>
          )}
        </div>
      </div>
    </div>
  );
};
