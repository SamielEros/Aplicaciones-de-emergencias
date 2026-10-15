import React from 'react';
import { SCI211Data, RegistroIngresoSCI211 } from '../../types/sci';
import { UserCheck, Plus, Trash2, Clock, MapPin, Building2 } from 'lucide-react';

interface SCI211FormProps {
  data: SCI211Data;
  onChange: (data: SCI211Data) => void;
}

export const SCI211Form: React.FC<SCI211FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI211Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addIngreso = () => {
    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const newReg: RegistroIngresoSCI211 = {
      id: `ck-${Date.now()}`,
      fechaHora: dateStr,
      recursoVehiculo: '',
      agenciaInstitucion: '',
      nombreLider: '',
      numEfectivos: 1,
      clasificacionTipo: 'Tipo II',
      puntoIngreso: 'Acceso Principal',
      asignadoA: 'Área de Espera (E)'
    };
    updateField('ingresos', [...data.ingresos, newReg]);
  };

  const updateIngreso = (id: string, field: keyof RegistroIngresoSCI211, val: any) => {
    updateField(
      'ingresos',
      data.ingresos.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const removeIngreso = (id: string) => {
    updateField(
      'ingresos',
      data.ingresos.filter((item) => item.id !== id)
    );
  };

  const totalPersonal = data.ingresos.reduce((acc, curr) => acc + (curr.numEfectivos || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-211
            </span>
            <h2 className="text-lg font-bold text-white">Registro y Control de Recursos (Check-In)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Registro estricto de entrada de todo personal, brigadas, vehículos y maquinaria al llegar a la escena.
          </p>
        </div>
        <button
          type="button"
          onClick={addIngreso}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Ingreso (Check-In)
        </button>
      </div>

      {/* Point of Check-In and Total Count */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <label className="text-[10px] text-slate-400 uppercase font-semibold block">Lugar del Check-In:</label>
          <input
            type="text"
            value={data.lugarRegistroCheckIn}
            onChange={(e) => updateField('lugarRegistroCheckIn', e.target.value)}
            placeholder="Ej: Módulo de Registro Área de Espera"
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <label className="text-[10px] text-slate-400 uppercase font-semibold block">Encargado del Check-In:</label>
          <input
            type="text"
            value={data.encargadoCheckIn}
            onChange={(e) => updateField('encargadoCheckIn', e.target.value)}
            placeholder="Oficial de la Unidad de Recursos"
            className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400"
          />
        </div>

        <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Total Efectivos Registrados</span>
            <span className="text-2xl font-black text-amber-200">{totalPersonal} personas</span>
          </div>
          <UserCheck className="w-8 h-8 text-amber-400 opacity-60" />
        </div>
      </div>

      {/* Table of Inflows */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Fecha y Hora</th>
                <th className="p-2.5">Recurso / Vehículo</th>
                <th className="p-2.5">Agencia / Dependencia</th>
                <th className="p-2.5">Nombre Líder</th>
                <th className="p-2.5 w-16 text-center">Efectivos</th>
                <th className="p-2.5">Clasificación / Tipo</th>
                <th className="p-2.5">Asignado A</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {data.ingresos.map((item) => (
                <tr key={item.id} className="hover:bg-slate-950/50">
                  <td className="p-2 text-amber-300">
                    <input
                      type="text"
                      value={item.fechaHora}
                      onChange={(e) => updateIngreso(item.id, 'fechaHora', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-amber-300"
                    />
                  </td>
                  <td className="p-2 font-sans font-semibold text-white">
                    <input
                      type="text"
                      value={item.recursoVehiculo}
                      onChange={(e) => updateIngreso(item.id, 'recursoVehiculo', e.target.value)}
                      placeholder="Ej: Autobomba B-04"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </td>
                  <td className="p-2 font-sans">
                    <input
                      type="text"
                      value={item.agenciaInstitucion}
                      onChange={(e) => updateIngreso(item.id, 'agenciaInstitucion', e.target.value)}
                      placeholder="Dependencia"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 font-sans">
                    <input
                      type="text"
                      value={item.nombreLider}
                      onChange={(e) => updateIngreso(item.id, 'nombreLider', e.target.value)}
                      placeholder="Líder"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={item.numEfectivos}
                      onChange={(e) => updateIngreso(item.id, 'numEfectivos', parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-1 py-1 text-xs text-center text-white"
                    />
                  </td>
                  <td className="p-2 font-sans">
                    <input
                      type="text"
                      value={item.clasificacionTipo}
                      onChange={(e) => updateIngreso(item.id, 'clasificacionTipo', e.target.value)}
                      placeholder="Tipo I / Pesado"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 font-sans">
                    <input
                      type="text"
                      value={item.asignadoA}
                      onChange={(e) => updateIngreso(item.id, 'asignadoA', e.target.value)}
                      placeholder="División / Área"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeIngreso(item.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.ingresos.length === 0 && (
            <p className="text-xs text-slate-500 italic text-center py-4">No se registran ingresos de recursos aún.</p>
          )}
        </div>
      </div>
    </div>
  );
};
