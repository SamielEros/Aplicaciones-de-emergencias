import React, { useState } from 'react';
import { SCI203Data, DivisionGrupo } from '../../types/sci';
import { Users, Shield, Radio, Share2, Plus, Trash2, ChevronDown, ChevronRight, Info } from 'lucide-react';

interface SCI203FormProps {
  data: SCI203Data;
  onChange: (data: SCI203Data) => void;
  readOnly?: boolean;
}

export const SCI203Form: React.FC<SCI203FormProps> = ({ data, onChange, readOnly = false }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'detalle'>('visual');

  const updateMando = (key: keyof SCI203Data['mando'], value: string) => {
    onChange({
      ...data,
      mando: {
        ...data.mando,
        [key]: value
      }
    });
  };

  const updateOperaciones = (key: keyof SCI203Data['operaciones'], value: any) => {
    onChange({
      ...data,
      operaciones: {
        ...data.operaciones,
        [key]: value
      }
    });
  };

  const updatePlanificacion = (key: keyof SCI203Data['planificacion'], value: string) => {
    onChange({
      ...data,
      planificacion: {
        ...data.planificacion,
        [key]: value
      }
    });
  };

  const updateLogistica = (key: keyof SCI203Data['logistica'], value: string) => {
    onChange({
      ...data,
      logistica: {
        ...data.logistica,
        [key]: value
      }
    });
  };

  const updateAdministracion = (key: keyof SCI203Data['administracion'], value: string) => {
    onChange({
      ...data,
      administracion: {
        ...data.administracion,
        [key]: value
      }
    });
  };

  const addDivisionGrupo = () => {
    const newDiv: DivisionGrupo = {
      id: `div-${Date.now()}`,
      nombre: `División / Grupo ${data.operaciones.divisionesGrupos.length + 1}`,
      responsable: '',
      recursosAsignados: '',
      contacto: ''
    };
    onChange({
      ...data,
      operaciones: {
        ...data.operaciones,
        divisionesGrupos: [...data.operaciones.divisionesGrupos, newDiv]
      }
    });
  };

  const updateDivision = (id: string, field: keyof DivisionGrupo, val: string) => {
    onChange({
      ...data,
      operaciones: {
        ...data.operaciones,
        divisionesGrupos: data.operaciones.divisionesGrupos.map((d) =>
          d.id === id ? { ...d, [field]: val } : d
        )
      }
    });
  };

  const removeDivision = (id: string) => {
    onChange({
      ...data,
      operaciones: {
        ...data.operaciones,
        divisionesGrupos: data.operaciones.divisionesGrupos.filter((d) => d.id !== id)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Guide Note */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-203
            </span>
            <h2 className="text-lg font-bold text-white">Organización del Incidente</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Estructura modular del SCI conforme al principio de Alcance de Control (3 a 7 subordinados) y Unidad de Mando de la NOM-010.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Organigrama Visual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detalle')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'detalle'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Edición Detallada
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        /* Visual Tree Organigram Optimized for iPad */
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto shadow-inner">
          <div className="min-w-[760px] flex flex-col items-center">
            {/* Top Node: Comandante del Incidente */}
            <div className="w-80 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-3.5 shadow-xl border-2 border-amber-400/60 text-center relative">
              <div className="text-[10px] font-extrabold tracking-wider uppercase text-amber-200">
                Comando del Incidente / Mando Unificado
              </div>
              <input
                type="text"
                placeholder="Nombre del Comandante y Dependencia"
                value={data.mando.comandante}
                onChange={(e) => updateMando('comandante', e.target.value)}
                disabled={readOnly}
                className="w-full mt-1.5 text-center font-bold text-sm bg-black/30 border border-white/20 rounded-lg px-2 py-1 text-white placeholder-amber-200/50 outline-none focus:border-white"
              />
              <div className="mt-1 flex items-center justify-center gap-1">
                <input
                  type="text"
                  placeholder="Adjunto (Opcional)"
                  value={data.mando.comandanteAdjunto}
                  onChange={(e) => updateMando('comandanteAdjunto', e.target.value)}
                  disabled={readOnly}
                  className="w-full text-center text-xs bg-black/20 border border-white/10 rounded px-2 py-0.5 text-amber-100 placeholder-amber-200/40 outline-none"
                />
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-6 bg-slate-700 my-0" />

            {/* Staff de Mando (Seguridad, Información, Enlace) */}
            <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-md">
              <div className="text-center text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                Staff de Mando (Apoyo directo al CI)
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Oficial de Seguridad */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-red-500/30">
                  <div className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Oficial de Seguridad
                  </div>
                  <input
                    type="text"
                    placeholder="Responsable de Seguridad"
                    value={data.mando.oficialSeguridad}
                    onChange={(e) => updateMando('oficialSeguridad', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 outline-none focus:border-red-400"
                  />
                </div>

                {/* Oficial de Información Pública */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-sky-500/30">
                  <div className="text-[10px] font-bold text-sky-400 uppercase flex items-center gap-1">
                    <Radio className="w-3 h-3" /> Inf. Pública (Vocero)
                  </div>
                  <input
                    type="text"
                    placeholder="Responsable de Medios"
                    value={data.mando.oficialInformacion}
                    onChange={(e) => updateMando('oficialInformacion', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 outline-none focus:border-sky-400"
                  />
                </div>

                {/* Oficial de Enlace */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <Share2 className="w-3 h-3" /> Oficial de Enlace
                  </div>
                  <input
                    type="text"
                    placeholder="Enlace Interinstitucional"
                    value={data.mando.oficialEnlace}
                    onChange={(e) => updateMando('oficialEnlace', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-6 bg-slate-700 my-0" />

            {/* Horizontal Branch Line for the 4 Sections */}
            <div className="w-11/12 h-0.5 bg-slate-700" />

            {/* 4 Sections of Staff General */}
            <div className="grid grid-cols-4 gap-4 w-full pt-4">
              {/* 1. SECCIÓN DE OPERACIONES */}
              <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-3 shadow-lg flex flex-col">
                <div className="bg-orange-600 text-white rounded-xl p-2 text-center shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-wider text-orange-200">Sección</div>
                  <div className="font-extrabold text-sm">OPERACIONES</div>
                </div>
                <div className="mt-2.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jefe de Sección:</label>
                  <input
                    type="text"
                    placeholder="Nombre del Jefe"
                    value={data.operaciones.jefe}
                    onChange={(e) => updateOperaciones('jefe', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-0.5 text-xs font-semibold bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white outline-none focus:border-orange-400"
                  />
                </div>

                {/* Divisiones / Grupos tácticos */}
                <div className="mt-3 pt-2 border-t border-slate-800 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-orange-400">Divisiones / Grupos:</span>
                      <span className="text-[10px] text-slate-500">{data.operaciones.divisionesGrupos.length}</span>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {data.operaciones.divisionesGrupos.map((div) => (
                        <div key={div.id} className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
                          <div className="font-bold text-slate-200 text-[11px] truncate">{div.nombre}</div>
                          <div className="text-[10px] text-slate-400 truncate">{div.responsable || 'Sin asignar'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addDivisionGrupo}
                    disabled={readOnly}
                    className="mt-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg py-1.5 w-full cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Agregar División/Grupo
                  </button>
                </div>
              </div>

              {/* 2. SECCIÓN DE PLANIFICACIÓN */}
              <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-3 shadow-lg flex flex-col">
                <div className="bg-blue-600 text-white rounded-xl p-2 text-center shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-wider text-blue-200">Sección</div>
                  <div className="font-extrabold text-sm">PLANIFICACIÓN</div>
                </div>
                <div className="mt-2.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jefe de Sección:</label>
                  <input
                    type="text"
                    placeholder="Nombre del Jefe"
                    value={data.planificacion.jefe}
                    onChange={(e) => updatePlanificacion('jefe', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-0.5 text-xs font-semibold bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white outline-none focus:border-blue-400"
                  />
                </div>
                {/* Unidades de Planificación */}
                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-blue-400">Unidades Básicas:</div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Recursos:</span>
                    <input
                      type="text"
                      placeholder="Líder Recursos"
                      value={data.planificacion.unidadRecursos}
                      onChange={(e) => updatePlanificacion('unidadRecursos', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Situación:</span>
                    <input
                      type="text"
                      placeholder="Líder Situación"
                      value={data.planificacion.unidadSituacion}
                      onChange={(e) => updatePlanificacion('unidadSituacion', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Documentación:</span>
                    <input
                      type="text"
                      placeholder="Líder Documentación"
                      value={data.planificacion.unidadDocumentacion}
                      onChange={(e) => updatePlanificacion('unidadDocumentacion', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. SECCIÓN DE LOGÍSTICA */}
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3 shadow-lg flex flex-col">
                <div className="bg-emerald-600 text-white rounded-xl p-2 text-center shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200">Sección</div>
                  <div className="font-extrabold text-sm">LOGÍSTICA</div>
                </div>
                <div className="mt-2.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jefe de Sección:</label>
                  <input
                    type="text"
                    placeholder="Nombre del Jefe"
                    value={data.logistica.jefe}
                    onChange={(e) => updateLogistica('jefe', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-0.5 text-xs font-semibold bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white outline-none focus:border-emerald-400"
                  />
                </div>
                {/* Unidades de Logística */}
                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Unidades de Apoyo:</div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Comunicaciones:</span>
                    <input
                      type="text"
                      placeholder="Líder Comunicaciones"
                      value={data.logistica.unidadComunicaciones}
                      onChange={(e) => updateLogistica('unidadComunicaciones', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Médica:</span>
                    <input
                      type="text"
                      placeholder="Líder U. Médica"
                      value={data.logistica.unidadMedica}
                      onChange={(e) => updateLogistica('unidadMedica', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Suministros:</span>
                    <input
                      type="text"
                      placeholder="Líder Suministros"
                      value={data.logistica.unidadSuministros}
                      onChange={(e) => updateLogistica('unidadSuministros', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. SECCIÓN DE ADMINISTRACIÓN Y FINANZAS */}
              <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-3 shadow-lg flex flex-col">
                <div className="bg-purple-600 text-white rounded-xl p-2 text-center shadow-md">
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-200">Sección</div>
                  <div className="font-extrabold text-sm truncate">ADMIN. Y FINANZAS</div>
                </div>
                <div className="mt-2.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jefe de Sección:</label>
                  <input
                    type="text"
                    placeholder="Nombre del Jefe"
                    value={data.administracion.jefe}
                    onChange={(e) => updateAdministracion('jefe', e.target.value)}
                    disabled={readOnly}
                    className="w-full mt-0.5 text-xs font-semibold bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white outline-none focus:border-purple-400"
                  />
                </div>
                {/* Unidades de Administración */}
                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
                  <div className="text-[10px] uppercase font-bold text-purple-400">Unidades Financieras:</div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Tiempo (Horas Hombre):</span>
                    <input
                      type="text"
                      placeholder="Líder Control Tiempo"
                      value={data.administracion.unidadTiempo}
                      onChange={(e) => updateAdministracion('unidadTiempo', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Costos:</span>
                    <input
                      type="text"
                      placeholder="Líder Costos"
                      value={data.administracion.unidadCostos}
                      onChange={(e) => updateAdministracion('unidadCostos', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">U. Adquisiciones:</span>
                    <input
                      type="text"
                      placeholder="Líder Compras"
                      value={data.administracion.unidadAdquisiciones}
                      onChange={(e) => updateAdministracion('unidadAdquisiciones', e.target.value)}
                      className="w-full bg-transparent text-slate-200 text-[11px] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Form for Table Editing */
        <div className="space-y-6">
          {/* Operations Divisions Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider">
                  Divisiones, Grupos y Fuerzas de Tarea (Operaciones)
                </h3>
                <p className="text-xs text-slate-400">
                  Desglose geográfico (Divisiones) o funcional (Grupos) conforme a las asignaciones del SCI.
                </p>
              </div>
              <button
                type="button"
                onClick={addDivisionGrupo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-orange-500/20"
              >
                <Plus className="w-3.5 h-3.5" /> Nueva División / Grupo
              </button>
            </div>

            <div className="space-y-3">
              {data.operaciones.divisionesGrupos.map((div, idx) => (
                <div key={div.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Nombre:</label>
                      <input
                        type="text"
                        value={div.nombre}
                        onChange={(e) => updateDivision(div.id, 'nombre', e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Supervisor / Líder:</label>
                      <input
                        type="text"
                        value={div.responsable}
                        onChange={(e) => updateDivision(div.id, 'responsable', e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Recursos Asignados:</label>
                      <input
                        type="text"
                        value={div.recursosAsignados}
                        onChange={(e) => updateDivision(div.id, 'recursosAsignados', e.target.value)}
                        className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDivision(div.id)}
                    className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600 rounded-lg transition-colors cursor-pointer self-end md:self-center"
                    title="Eliminar división"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
