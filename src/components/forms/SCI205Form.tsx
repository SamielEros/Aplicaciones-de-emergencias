import React from 'react';
import { SCI205Data, CanalRadio } from '../../types/sci';
import { Radio, Plus, Trash2, ShieldAlert, Volume2 } from 'lucide-react';

interface SCI205FormProps {
  data: SCI205Data;
  onChange: (data: SCI205Data) => void;
}

export const SCI205Form: React.FC<SCI205FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI205Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addCanal = () => {
    const newCanal: CanalRadio = {
      id: `ch-${Date.now()}`,
      canal: `Canal ${data.canales.length + 1}`,
      funcion: 'Operaciones',
      frecuenciaRX: '154.000 MHz',
      frecuenciaTX: '154.000 MHz',
      tono: '100.0 Hz',
      asignadoA: '',
      observaciones: ''
    };
    updateField('canales', [...data.canales, newCanal]);
  };

  const updateCanal = (id: string, field: keyof CanalRadio, value: string) => {
    updateField(
      'canales',
      data.canales.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCanal = (id: string) => {
    updateField(
      'canales',
      data.canales.filter((c) => c.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-205
            </span>
            <h2 className="text-lg font-bold text-white">Plan de Radio-Comunicaciones del Incidente</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Matriz de frecuencias, canales tácticos y enlace interinstitucional según la NOM-010.
          </p>
        </div>
        <button
          type="button"
          onClick={addCanal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Canal
        </button>
      </div>

      {/* Communications Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Canal / Nombre</th>
                <th className="p-2.5">Función Operativa</th>
                <th className="p-2.5">Frecuencia RX</th>
                <th className="p-2.5">Frecuencia TX</th>
                <th className="p-2.5">Tono / Código</th>
                <th className="p-2.5">Asignado A</th>
                <th className="p-2.5">Observaciones</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {data.canales.map((c) => (
                <tr key={c.id} className="hover:bg-slate-950/60 transition-colors">
                  <td className="p-2 font-sans font-semibold text-white min-w-[130px]">
                    <input
                      type="text"
                      value={c.canal}
                      onChange={(e) => updateCanal(c.id, 'canal', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-bold"
                    />
                  </td>
                  <td className="p-2 min-w-[130px]">
                    <input
                      type="text"
                      value={c.funcion}
                      onChange={(e) => updateCanal(c.id, 'funcion', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 min-w-[110px]">
                    <input
                      type="text"
                      value={c.frecuenciaRX}
                      onChange={(e) => updateCanal(c.id, 'frecuenciaRX', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400"
                    />
                  </td>
                  <td className="p-2 min-w-[110px]">
                    <input
                      type="text"
                      value={c.frecuenciaTX}
                      onChange={(e) => updateCanal(c.id, 'frecuenciaTX', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-emerald-400"
                    />
                  </td>
                  <td className="p-2 min-w-[90px]">
                    <input
                      type="text"
                      value={c.tono}
                      onChange={(e) => updateCanal(c.id, 'tono', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300"
                    />
                  </td>
                  <td className="p-2 min-w-[140px] font-sans">
                    <input
                      type="text"
                      value={c.asignadoA}
                      onChange={(e) => updateCanal(c.id, 'asignadoA', e.target.value)}
                      placeholder="Oficiales / Área"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 min-w-[140px] font-sans">
                    <input
                      type="text"
                      value={c.observaciones}
                      onChange={(e) => updateCanal(c.id, 'observaciones', e.target.value)}
                      placeholder="Notas"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-400"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeCanal(c.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidelines and Elaborated By */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Directrices y Disciplina de Comunicaciones (Terminología Común NOM-010)
            </h3>
          </div>
          <textarea
            rows={3}
            value={data.directricesComunicaciones}
            onChange={(e) => updateField('directricesComunicaciones', e.target.value)}
            placeholder="Ej: Uso estricto de texto claro. Queda prohibido el uso de códigos policiales o claves internas no homologadas..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-amber-400 outline-none"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Responsable de Elaboración
            </h3>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">
              Líder Unidad de Comunicaciones:
            </label>
            <input
              type="text"
              value={data.elaboradoPor}
              onChange={(e) => updateField('elaboradoPor', e.target.value)}
              placeholder="Nombre del Responsable"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            En caso de emergencia con vidas en peligro, use la llamada de socorro estandarizada <strong>MAYDAY</strong>.
          </div>
        </div>
      </div>
    </div>
  );
};
