import React from 'react';
import { SCI206Data, PuestoMedico, Ambulancia, HospitalReceptor } from '../../types/sci';
import { HeartPulse, Plus, Trash2, Hospital, Ambulance, ShieldAlert, Phone } from 'lucide-react';

interface SCI206FormProps {
  data: SCI206Data;
  onChange: (data: SCI206Data) => void;
}

export const SCI206Form: React.FC<SCI206FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI206Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addPuestoMedico = () => {
    const newPm: PuestoMedico = {
      id: `pm-${Date.now()}`,
      nombre: `Puesto Médico ${data.puestosMedicos.length + 1}`,
      ubicacion: '',
      contacto: '',
      paramedicos: ''
    };
    updateField('puestosMedicos', [...data.puestosMedicos, newPm]);
  };

  const addAmbulancia = () => {
    const newAmb: Ambulancia = {
      id: `amb-${Date.now()}`,
      unidad: `Ambulancia ${data.ambulancias.length + 1}`,
      institucion: 'Cruz Roja / CRUM',
      tipo: 'Soporte Vital Avanzado (SVA)',
      contacto: '',
      ubicacion: 'Área de Espera (E)'
    };
    updateField('ambulancias', [...data.ambulancias, newAmb]);
  };

  const addHospital = () => {
    const newHosp: HospitalReceptor = {
      id: `hosp-${Date.now()}`,
      nombre: 'Hospital Regional',
      direccion: '',
      telefono: '',
      tiempoTrasladoMin: 15,
      helipuerto: false,
      quemados: false,
      traumaShock: true
    };
    updateField('hospitales', [...data.hospitales, newHosp]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-206
            </span>
            <h2 className="text-lg font-bold text-white">Plan Médico del Incidente</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Red de atención médica prehospitalaria, ambulancias de guardia y hospitales receptores (NOM-010).
          </p>
        </div>
      </div>

      {/* 1. Puestos Médicos en Escena */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              1. Puestos de Atención Prehospitalaria / ACV en Escena
            </h3>
          </div>
          <button
            type="button"
            onClick={addPuestoMedico}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Puesto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.puestosMedicos.map((pm) => (
            <div key={pm.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={pm.nombre}
                  onChange={(e) =>
                    updateField(
                      'puestosMedicos',
                      data.puestosMedicos.map((p) => (p.id === pm.id ? { ...p, nombre: e.target.value } : p))
                    )
                  }
                  placeholder="Nombre de la instalación médica"
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white outline-none w-3/4"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      'puestosMedicos',
                      data.puestosMedicos.filter((p) => p.id !== pm.id)
                    )
                  }
                  className="text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block">Ubicación:</label>
                  <input
                    type="text"
                    value={pm.ubicacion}
                    onChange={(e) =>
                      updateField(
                        'puestosMedicos',
                        data.puestosMedicos.map((p) => (p.id === pm.id ? { ...p, ubicacion: e.target.value } : p))
                      )
                    }
                    placeholder="Ej: Costado Puesto de Comando"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block">Contacto / Radio:</label>
                  <input
                    type="text"
                    value={pm.contacto}
                    onChange={(e) =>
                      updateField(
                        'puestosMedicos',
                        data.puestosMedicos.map((p) => (p.id === pm.id ? { ...p, contacto: e.target.value } : p))
                      )
                    }
                    placeholder="Ch. 4 / Dr. López"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Ambulancias Asignadas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ambulance className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              2. Servicios de Ambulancia en Alerta
            </h3>
          </div>
          <button
            type="button"
            onClick={addAmbulancia}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Ambulancia
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Unidad / Móvil</th>
                <th className="p-2.5">Institución</th>
                <th className="p-2.5">Tipo de Soporte</th>
                <th className="p-2.5">Ubicación Actual</th>
                <th className="p-2.5">Contacto / Tel</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.ambulancias.map((amb) => (
                <tr key={amb.id}>
                  <td className="p-2">
                    <input
                      type="text"
                      value={amb.unidad}
                      onChange={(e) =>
                        updateField(
                          'ambulancias',
                          data.ambulancias.map((a) => (a.id === amb.id ? { ...a, unidad: e.target.value } : a))
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={amb.institucion}
                      onChange={(e) =>
                        updateField(
                          'ambulancias',
                          data.ambulancias.map((a) => (a.id === amb.id ? { ...a, institucion: e.target.value } : a))
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={amb.tipo}
                      onChange={(e) =>
                        updateField(
                          'ambulancias',
                          data.ambulancias.map((a) => (a.id === amb.id ? { ...a, tipo: e.target.value as any } : a))
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="Soporte Vital Básico (SVB)">Soporte Vital Básico (SVB)</option>
                      <option value="Soporte Vital Avanzado (SVA)">Soporte Vital Avanzado (SVA)</option>
                      <option value="Rescate">Unidad de Rescate</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={amb.ubicacion}
                      onChange={(e) =>
                        updateField(
                          'ambulancias',
                          data.ambulancias.map((a) => (a.id === amb.id ? { ...a, ubicacion: e.target.value } : a))
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={amb.contacto}
                      onChange={(e) =>
                        updateField(
                          'ambulancias',
                          data.ambulancias.map((a) => (a.id === amb.id ? { ...a, contacto: e.target.value } : a))
                        )
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'ambulancias',
                          data.ambulancias.filter((a) => a.id !== amb.id)
                        )
                      }
                      className="text-slate-500 hover:text-rose-400"
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

      {/* 3. Hospitales Receptores */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Hospitales Receptores Designados
            </h3>
          </div>
          <button
            type="button"
            onClick={addHospital}
            className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Hospital
          </button>
        </div>

        <div className="space-y-3">
          {data.hospitales.map((hosp) => (
            <div key={hosp.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <input
                  type="text"
                  value={hosp.nombre}
                  onChange={(e) =>
                    updateField(
                      'hospitales',
                      data.hospitales.map((h) => (h.id === hosp.id ? { ...h, nombre: e.target.value } : h))
                    )
                  }
                  placeholder="Nombre del Hospital"
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white outline-none w-full sm:w-80"
                />
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={hosp.helipuerto}
                      onChange={(e) =>
                        updateField(
                          'hospitales',
                          data.hospitales.map((h) => (h.id === hosp.id ? { ...h, helipuerto: e.target.checked } : h))
                        )
                      }
                      className="rounded text-amber-500"
                    />
                    Helipuerto
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={hosp.quemados}
                      onChange={(e) =>
                        updateField(
                          'hospitales',
                          data.hospitales.map((h) => (h.id === hosp.id ? { ...h, quemados: e.target.checked } : h))
                        )
                      }
                      className="rounded text-amber-500"
                    />
                    Quemados
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={hosp.traumaShock}
                      onChange={(e) =>
                        updateField(
                          'hospitales',
                          data.hospitales.map((h) => (h.id === hosp.id ? { ...h, traumaShock: e.target.checked } : h))
                        )
                      }
                      className="rounded text-amber-500"
                    />
                    Trauma/Shock
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'hospitales',
                        data.hospitales.filter((h) => h.id !== hosp.id)
                      )
                    }
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Dirección:</span>
                  <input
                    type="text"
                    value={hosp.direccion}
                    onChange={(e) =>
                      updateField(
                        'hospitales',
                        data.hospitales.map((h) => (h.id === hosp.id ? { ...h, direccion: e.target.value } : h))
                      )
                    }
                    placeholder="Calle, Colonia, Municipio"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Teléfono de Urgencias:</span>
                  <input
                    type="text"
                    value={hosp.telefono}
                    onChange={(e) =>
                      updateField(
                        'hospitales',
                        data.hospitales.map((h) => (h.id === hosp.id ? { ...h, telefono: e.target.value } : h))
                      )
                    }
                    placeholder="Teléfono directo"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tiempo Traslado (min):</span>
                  <input
                    type="number"
                    value={hosp.tiempoTrasladoMin}
                    onChange={(e) =>
                      updateField(
                        'hospitales',
                        data.hospitales.map((h) =>
                          h.id === hosp.id ? { ...h, tiempoTrasladoMin: parseInt(e.target.value) || 0 } : h
                        )
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Procedimiento de Evacuación Médica de Rescatistas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
          4. Procedimiento de Evacuación Médica para Personal Lesionado en Operación
        </h3>
        <textarea
          rows={3}
          value={data.procedimientoEvacuacionMedica}
          onChange={(e) => updateField('procedimientoEvacuacionMedica', e.target.value)}
          placeholder="Pasos a seguir si un bombero o rescatista sufre un accidente en la escena..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-amber-400 outline-none"
        />
      </div>
    </div>
  );
};
