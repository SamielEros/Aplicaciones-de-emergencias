import React from 'react';
import { SCI214Data, EntradaBitacoraSCI214 } from '../../types/sci';
import { BookOpen, Plus, Trash2, Clock, CheckCircle, Zap } from 'lucide-react';

interface SCI214FormProps {
  data: SCI214Data;
  onChange: (data: SCI214Data) => void;
}

export const SCI214Form: React.FC<SCI214FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI214Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addEntrada = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntrada: EntradaBitacoraSCI214 = {
      id: `bt-${Date.now()}`,
      hora: timeStr,
      actividadEvento: '',
      observaciones: ''
    };
    updateField('entradas', [...data.entradas, newEntrada]);
  };

  const updateEntrada = (id: string, field: keyof EntradaBitacoraSCI214, val: string) => {
    updateField(
      'entradas',
      data.entradas.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    );
  };

  const removeEntrada = (id: string) => {
    updateField(
      'entradas',
      data.entradas.filter((e) => e.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-214
            </span>
            <h2 className="text-lg font-bold text-white">Registro de Actividades (Bitácora de la Unidad)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bitácora cronológica individual de eventos notables, decisiones y transferencias en la escena (NOM-010).
          </p>
        </div>
        <button
          type="button"
          onClick={addEntrada}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" /> Registrar Evento Ahora
        </button>
      </div>

      {/* Unit Identification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold">Nombre de la Unidad / Puesto:</label>
          <input
            type="text"
            value={data.unidadNombre}
            onChange={(e) => updateField('unidadNombre', e.target.value)}
            placeholder="Ej: Puesto de Comando (PC) / Sección de Operaciones"
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 uppercase font-semibold">Responsable de la Bitácora:</label>
          <input
            type="text"
            value={data.responsableBitacora}
            onChange={(e) => updateField('responsableBitacora', e.target.value)}
            placeholder="Nombre y cargo del documentador"
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Timeline entries list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
          Línea de Tiempo Operacional (Eventos y Decisiones)
        </h3>

        <div className="space-y-3">
          {data.entradas.map((item, idx) => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-24 shrink-0 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <input
                  type="text"
                  value={item.hora}
                  onChange={(e) => updateEntrada(item.id, 'hora', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-amber-300 font-bold"
                />
              </div>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={item.actividadEvento}
                  onChange={(e) => updateEntrada(item.id, 'actividadEvento', e.target.value)}
                  placeholder="Descripción de la actividad o decisión crítica..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 outline-none focus:border-amber-400"
                />
              </div>

              <div className="w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  value={item.observaciones}
                  onChange={(e) => updateEntrada(item.id, 'observaciones', e.target.value)}
                  placeholder="Observaciones / Relevos"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => removeEntrada(item.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded self-end sm:self-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {data.entradas.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs italic">
              No hay registros en la bitácora. Toque el botón "Registrar Evento Ahora" para agregar una entrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
