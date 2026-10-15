import React from 'react';
import { SCI208Data, RiesgoSeguridad } from '../../types/sci';
import { ShieldAlert, Plus, Trash2, HardHat, BellRing, CheckSquare } from 'lucide-react';

interface SCI208FormProps {
  data: SCI208Data;
  onChange: (data: SCI208Data) => void;
}

export const SCI208Form: React.FC<SCI208FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI208Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addRiesgo = () => {
    const newRiesgo: RiesgoSeguridad = {
      id: `rs-${Date.now()}`,
      riesgo: '',
      probabilidad: 'Media',
      severidad: 'Grave',
      medidasMitigacion: ''
    };
    updateField('riesgos', [...data.riesgos, newRiesgo]);
  };

  const updateRiesgo = (id: string, field: keyof RiesgoSeguridad, val: any) => {
    updateField(
      'riesgos',
      data.riesgos.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const removeRiesgo = (id: string) => {
    updateField(
      'riesgos',
      data.riesgos.filter((r) => r.id !== id)
    );
  };

  const addEpp = () => {
    updateField('equipoProteccionPersonal', [...data.equipoProteccionPersonal, '']);
  };

  const updateEpp = (idx: number, val: string) => {
    const list = [...data.equipoProteccionPersonal];
    list[idx] = val;
    updateField('equipoProteccionPersonal', list);
  };

  const removeEpp = (idx: number) => {
    updateField(
      'equipoProteccionPersonal',
      data.equipoProteccionPersonal.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-208
            </span>
            <h2 className="text-lg font-bold text-white">Plan y Mensaje de Seguridad</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluación de riesgos en escena, mitigación y EPP normado preparado por el Oficial de Seguridad (NOM-010).
          </p>
        </div>
      </div>

      {/* 1. Mensaje General de Seguridad */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Mensaje General de Seguridad y Directriz Operativa
          </h3>
        </div>
        <textarea
          rows={3}
          value={data.mensajeSeguridadGeneral}
          onChange={(e) => updateField('mensajeSeguridadGeneral', e.target.value)}
          placeholder="Mensaje de concienciación y reglas de oro de seguridad en la escena..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-amber-400 outline-none"
        />
      </div>

      {/* 2. Matriz de Riesgos Identificados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Análisis y Mitigación de Riesgos en Escena
          </h3>
          <button
            type="button"
            onClick={addRiesgo}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Riesgo
          </button>
        </div>

        <div className="space-y-3">
          {data.riesgos.map((item) => (
            <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.riesgo}
                  onChange={(e) => updateRiesgo(item.id, 'riesgo', e.target.value)}
                  placeholder="Peligro detectado (ej: Colapso secundario, fuga de gas...)"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white outline-none flex-1"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={item.probabilidad}
                    onChange={(e) => updateRiesgo(item.id, 'probabilidad', e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-300"
                  >
                    <option value="Alta">Probabilidad: Alta</option>
                    <option value="Media">Probabilidad: Media</option>
                    <option value="Baja">Probabilidad: Baja</option>
                  </select>
                  <select
                    value={item.severidad}
                    onChange={(e) => updateRiesgo(item.id, 'severidad', e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-300"
                  >
                    <option value="Crítica">Severidad: Crítica</option>
                    <option value="Grave">Severidad: Grave</option>
                    <option value="Moderada">Severidad: Moderada</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRiesgo(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Medidas de Control / Mitigación:</label>
                <input
                  type="text"
                  value={item.medidasMitigacion}
                  onChange={(e) => updateRiesgo(item.id, 'medidasMitigacion', e.target.value)}
                  placeholder="Acciones preventivas para neutralizar o minimizar el riesgo"
                  className="w-full mt-0.5 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Equipo de Protección Personal (EPP) y Alarma de Evacuación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EPP List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                3. EPP Obligatorio en la Escena
              </h3>
            </div>
            <button
              type="button"
              onClick={addEpp}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Añadir
            </button>
          </div>

          <div className="space-y-2">
            {data.equipoProteccionPersonal.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateEpp(idx, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeEpp(idx)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Alarma de Evacuación */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BellRing className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                4. Protocolo y Señal Sonora de Evacuación
              </h3>
            </div>
            <textarea
              rows={3}
              value={data.alarmaEvacuacionEmergencia}
              onChange={(e) => updateField('alarmaEvacuacionEmergencia', e.target.value)}
              placeholder="Ej: Tres toques largos continuos de corneta o silbato..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-amber-400"
            />
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">
              Elaborado Por (Oficial de Seguridad):
            </label>
            <input
              type="text"
              value={data.elaboradoPor}
              onChange={(e) => updateField('elaboradoPor', e.target.value)}
              placeholder="Nombre del Oficial de Seguridad"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
