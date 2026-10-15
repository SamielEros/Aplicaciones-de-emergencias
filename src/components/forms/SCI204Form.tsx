import React from 'react';
import { SCI204Data, AsignacionTactico } from '../../types/sci';
import { Briefcase, Plus, Trash2, Radio, AlertCircle } from 'lucide-react';

interface SCI204FormProps {
  data: SCI204Data;
  onChange: (data: SCI204Data) => void;
  periodoNumero: number;
}

export const SCI204Form: React.FC<SCI204FormProps> = ({ data, onChange, periodoNumero }) => {
  const addAsignacion = () => {
    const newAsignacion: AsignacionTactico = {
      id: `asig-${Date.now()}`,
      divisionGrupo: `División / Grupo ${data.asignaciones.length + 1}`,
      supervisor: '',
      funcionOperacional: '',
      recursosAsignados: '',
      instruccionesEspeciales: '',
      canalComunicaciones: 'Canal 2 (Táctico)'
    };
    onChange({
      asignaciones: [...data.asignaciones, newAsignacion]
    });
  };

  const updateAsignacion = (id: string, field: keyof AsignacionTactico, value: string) => {
    onChange({
      asignaciones: data.asignaciones.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    });
  };

  const removeAsignacion = (id: string) => {
    onChange({
      asignaciones: data.asignaciones.filter((a) => a.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-204
            </span>
            <h2 className="text-lg font-bold text-white">Lista de Asignaciones de Trabajo (Táctico)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Instrucciones operativas específicas para cada División, Grupo o Fuerza de Tarea en el período actual.
          </p>
        </div>
        <button
          type="button"
          onClick={addAsignacion}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Nueva Asignación
        </button>
      </div>

      {/* Cards List of Assignments */}
      <div className="space-y-4">
        {data.asignaciones.map((item, index) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-slate-700"
          >
            {/* Top Bar of Assignment Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item.divisionGrupo}
                  onChange={(e) => updateAsignacion(item.id, 'divisionGrupo', e.target.value)}
                  placeholder="Nombre de la División o Grupo"
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-amber-400 outline-none w-64 focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-1 text-xs text-slate-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Radio className="w-3.5 h-3.5 text-sky-400" />
                  <input
                    type="text"
                    value={item.canalComunicaciones}
                    onChange={(e) => updateAsignacion(item.id, 'canalComunicaciones', e.target.value)}
                    placeholder="Canal de Radio"
                    className="bg-transparent text-xs text-sky-300 outline-none w-32"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAsignacion(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar asignación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Supervisor / Responsable:</label>
                <input
                  type="text"
                  value={item.supervisor}
                  onChange={(e) => updateAsignacion(item.id, 'supervisor', e.target.value)}
                  placeholder="Nombre y rango del líder"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Recursos Asignados (Personal y Equipos):</label>
                <input
                  type="text"
                  value={item.recursosAsignados}
                  onChange={(e) => updateAsignacion(item.id, 'recursosAsignados', e.target.value)}
                  placeholder="Ej: 15 brigadistas, 2 motobombas, 1 dron"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Función Operacional y Tareas Concretas:</label>
              <textarea
                rows={2}
                value={item.funcionOperacional}
                onChange={(e) => updateAsignacion(item.id, 'funcionOperacional', e.target.value)}
                placeholder="Describa con precisión la labor táctica a desarrollar durante el período..."
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-200 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                Instrucciones Especiales y Seguridad Específica:
              </label>
              <input
                type="text"
                value={item.instruccionesEspeciales}
                onChange={(e) => updateAsignacion(item.id, 'instruccionesEspeciales', e.target.value)}
                placeholder="Ej: Rotación cada 45 minutos, no ingresar sin detector multigas..."
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-200 outline-none focus:border-amber-400"
              />
            </div>
          </div>
        ))}

        {data.asignaciones.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">
            <Briefcase className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="text-sm font-semibold">No se han registrado asignaciones tácticas aún.</p>
            <p className="text-xs text-slate-500 mt-1">Presione el botón "Nueva Asignación" para detallar los frentes de trabajo.</p>
          </div>
        )}
      </div>
    </div>
  );
};
