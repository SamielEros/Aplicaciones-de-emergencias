import React from 'react';
import { SCI207Data, RecursoSCI207, RecursoEstado, PacienteAtendidoCRM } from '../../types/sci';
import {
  Layers,
  Plus,
  Trash2,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  HeartPulse,
  User,
  Ambulance,
  Download,
  FileSpreadsheet,
  Clock,
  MapPin
} from 'lucide-react';

interface SCI207FormProps {
  data: SCI207Data;
  onChange: (data: SCI207Data) => void;
}

export const SCI207Form: React.FC<SCI207FormProps> = ({ data, onChange }) => {
  const updateField = (field: keyof SCI207Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const addRecurso = () => {
    const newRec: RecursoSCI207 = {
      id: `rc-${Date.now()}`,
      recurso: '',
      categoria: 'Personal Táctico',
      institucion: 'Cruz Roja Mexicana',
      estado: 'Disponible',
      ubicacionActual: 'Área de Espera (E)',
      contacto: ''
    };
    updateField('recursos', [...data.recursos, newRec]);
  };

  const updateRecurso = (id: string, field: keyof RecursoSCI207, val: any) => {
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

  const updateTriaje = (field: keyof SCI207Data['triajeVictimas'], val: number) => {
    updateField('triajeVictimas', {
      ...data.triajeVictimas,
      [field]: Math.max(0, val)
    });
  };

  // Pacientes Cruz Roja Mexicana
  const pacientes = data.pacientesAtendidos || [];

  const addPaciente = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newPaciente: PacienteAtendidoCRM = {
      id: `pac-${Date.now()}`,
      nombre: '',
      edad: '',
      motivoAtencion: 'Evaluación y Primeros Auxilios',
      codigoPostal: '',
      unidadAtendio: 'Ambulancia CRM-01',
      triage: 'Verde (Leve)',
      destinoHospital: 'Atención en escena',
      fechaRegistro: dateStr,
      horaAtencion: timeStr
    };
    updateField('pacientesAtendidos', [...pacientes, newPaciente]);
  };

  const updatePaciente = (id: string, field: keyof PacienteAtendidoCRM, val: any) => {
    const updated = pacientes.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateField('pacientesAtendidos', updated);
  };

  const removePaciente = (id: string) => {
    const updated = pacientes.filter((p) => p.id !== id);
    updateField('pacientesAtendidos', updated);
  };

  const syncTriajeWithPacientes = () => {
    let r = 0;
    let a = 0;
    let v = 0;
    let n = 0;
    pacientes.forEach((p) => {
      if (p.triage.startsWith('Rojo')) r++;
      else if (p.triage.startsWith('Amarillo')) a++;
      else if (p.triage.startsWith('Verde')) v++;
      else if (p.triage.startsWith('Negro')) n++;
    });
    updateField('triajeVictimas', {
      ...data.triajeVictimas,
      rojoInmediato: r,
      amarilloDiferido: a,
      verdeLeve: v,
      negroFallecido: n
    });
  };

  const exportPatientsCSV = () => {
    if (pacientes.length === 0) {
      alert('No hay pacientes en el listado para exportar.');
      return;
    }
    const headers = ['Fecha Registro', 'Hora', 'Nombre Completo', 'Edad', 'Motivo Atencion', 'Codigo Postal', 'Unidad Que Atendio', 'Triage', 'Destino / Hospital'];
    const rows = pacientes.map((p) => [
      p.fechaRegistro || p.fechaAtencion || '',
      p.horaAtencion || '',
      `"${p.nombre.replace(/"/g, '""')}"`,
      p.edad,
      `"${p.motivoAtencion.replace(/"/g, '""')}"`,
      p.codigoPostal,
      `"${p.unidadAtendio.replace(/"/g, '""')}"`,
      p.triage,
      `"${(p.destinoHospital || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `CRUZ_ROJA_PACIENTES_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const conteoDisponibles = data.recursos.filter((r) => r.estado === 'Disponible').length;
  const conteoAsignados = data.recursos.filter((r) => r.estado === 'Asignado').length;
  const conteoFuera = data.recursos.filter((r) => r.estado === 'Fuera de Servicio').length;

  return (
    <div className="space-y-6">
      {/* Official Form Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
                SCI-207
              </span>
              <h2 className="text-lg font-bold text-white">Registro de Recursos y Pacientes Atendidos</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Control de Triage, Atención Prehospitalaria y Estatus Operacional de Unidades (NOM-010).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addRecurso}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Recurso
        </button>
      </div>

      {/* ============================================================== */}
      {/* SECCIÓN NUEVA REQUERIDA: LISTADO DE PACIENTES / PERSONAS ATENDIDAS */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border-2 border-red-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px] tracking-wider uppercase">
                Triage & Pacientes
              </span>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-500" />
                Listado de Personas Atendidas y Pacientes en Escena
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registro nominal obligatorio para Cruz Roja Mexicana: Nombre, Edad, Motivo de atención, Código Postal y Unidad asistencial.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={exportPatientsCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Descargar lista en formato Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={addPaciente}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Paciente</span>
            </button>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5 w-32">Fecha Reg.</th>
                <th className="p-2.5 min-w-[160px]">Nombre Completo</th>
                <th className="p-2.5 w-16 text-center">Edad</th>
                <th className="p-2.5 min-w-[170px]">Motivo de Atención</th>
                <th className="p-2.5 w-24">C. Postal</th>
                <th className="p-2.5 min-w-[130px]">Unidad que Atendió</th>
                <th className="p-2.5 min-w-[130px]">Triage START</th>
                <th className="p-2.5 min-w-[130px]">Destino / Hospital</th>
                <th className="p-2.5 w-20">Hora</th>
                <th className="p-2.5 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pacientes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                  {/* Fecha Registro */}
                  <td className="p-2">
                    <input
                      type="date"
                      value={p.fechaRegistro || p.fechaAtencion || ''}
                      onChange={(e) => updatePaciente(p.id, 'fechaRegistro', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-cyan-300 outline-none focus:border-red-400"
                    />
                  </td>

                  {/* Nombre */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.nombre}
                      onChange={(e) => updatePaciente(p.id, 'nombre', e.target.value)}
                      placeholder="Nombre del lesionado"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-medium outline-none focus:border-red-400"
                    />
                  </td>

                  {/* Edad */}
                  <td className="p-2 text-center">
                    <input
                      type="text"
                      value={p.edad}
                      onChange={(e) => updatePaciente(p.id, 'edad', e.target.value)}
                      placeholder="35"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 text-xs text-center text-white font-mono outline-none focus:border-red-400"
                    />
                  </td>

                  {/* Motivo de Atención */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.motivoAtencion}
                      onChange={(e) => updatePaciente(p.id, 'motivoAtencion', e.target.value)}
                      placeholder="Ej: Politraumatismo, intoxicación"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-red-400"
                    />
                  </td>

                  {/* Código Postal */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.codigoPostal}
                      onChange={(e) => updatePaciente(p.id, 'codigoPostal', e.target.value)}
                      placeholder="06700"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono outline-none focus:border-red-400"
                    />
                  </td>

                  {/* Unidad que Atendió */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.unidadAtendio}
                      onChange={(e) => updatePaciente(p.id, 'unidadAtendio', e.target.value)}
                      placeholder="Ambulancia CRM-044 / TUM"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none focus:border-red-400"
                    />
                  </td>

                  {/* Triage */}
                  <td className="p-2">
                    <select
                      value={p.triage}
                      onChange={(e) => updatePaciente(p.id, 'triage', e.target.value as any)}
                      className={`w-full rounded-lg px-1.5 py-1 text-xs font-bold border outline-none ${
                        p.triage.startsWith('Rojo')
                          ? 'bg-red-950 text-red-300 border-red-500/50'
                          : p.triage.startsWith('Amarillo')
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : p.triage.startsWith('Verde')
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-700'
                      }`}
                    >
                      <option value="Rojo (Inmediato)">Rojo (Inmediato)</option>
                      <option value="Amarillo (Diferido)">Amarillo (Diferido)</option>
                      <option value="Verde (Leve)">Verde (Leve)</option>
                      <option value="Negro (Fallecido)">Negro (Fallecido)</option>
                    </select>
                  </td>

                  {/* Destino Hospital */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.destinoHospital || ''}
                      onChange={(e) => updatePaciente(p.id, 'destinoHospital', e.target.value)}
                      placeholder="Hosp. General / En escena"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none"
                    />
                  </td>

                  {/* Hora */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={p.horaAtencion || ''}
                      onChange={(e) => updatePaciente(p.id, 'horaAtencion', e.target.value)}
                      placeholder="08:30"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1 py-1 text-xs font-mono text-slate-300 text-center outline-none"
                    />
                  </td>

                  {/* Delete */}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removePaciente(p.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      title="Eliminar paciente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pacientes.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs italic space-y-1">
              <div>No hay personas atendidas registradas todavía.</div>
              <button
                type="button"
                onClick={addPaciente}
                className="text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
              >
                + Registrar primera persona atendida
              </button>
            </div>
          )}
        </div>

        {/* Patient Summary Footer */}
        {pacientes.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>Total atendidos: <strong className="text-white font-mono">{pacientes.length}</strong></span>
              <span>·</span>
              <button
                type="button"
                onClick={syncTriajeWithPacientes}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                Sincronizar totales con Triage START
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-red-400">R: {pacientes.filter(p => p.triage.startsWith('Rojo')).length}</span>
              <span className="text-amber-400">A: {pacientes.filter(p => p.triage.startsWith('Amarillo')).length}</span>
              <span className="text-emerald-400">V: {pacientes.filter(p => p.triage.startsWith('Verde')).length}</span>
              <span className="text-slate-400">N: {pacientes.filter(p => p.triage.startsWith('Negro')).length}</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Status Summary of Resources */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Recursos</div>
          <div className="text-2xl font-black text-white mt-1">{data.recursos.length}</div>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Disponibles
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{conteoDisponibles}</div>
        </div>
        <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
            <Activity className="w-3 h-3" /> Asignados
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">{conteoAsignados}</div>
        </div>
        <div className="bg-rose-950/30 border border-rose-500/30 p-3.5 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Fuera de Servicio
          </div>
          <div className="text-2xl font-black text-rose-300 mt-1">{conteoFuera}</div>
        </div>
      </div>

      {/* Resource Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Inventario y Estado Operacional de Recursos
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Recurso / Equipo</th>
                <th className="p-2.5">Categoría</th>
                <th className="p-2.5">Institución</th>
                <th className="p-2.5">Condición / Estado</th>
                <th className="p-2.5">Ubicación Actual</th>
                <th className="p-2.5">Contacto</th>
                <th className="p-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.recursos.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-950/50">
                  <td className="p-2">
                    <input
                      type="text"
                      value={rec.recurso}
                      onChange={(e) => updateRecurso(rec.id, 'recurso', e.target.value)}
                      placeholder="Nombre del recurso"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={rec.categoria}
                      onChange={(e) => updateRecurso(rec.id, 'categoria', e.target.value)}
                      placeholder="Categoría"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={rec.institucion}
                      onChange={(e) => updateRecurso(rec.id, 'institucion', e.target.value)}
                      placeholder="Institución"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2">
                    <select
                      value={rec.estado}
                      onChange={(e) => updateRecurso(rec.id, 'estado', e.target.value as RecursoEstado)}
                      className={`w-full border rounded px-2 py-1 text-xs font-bold ${
                        rec.estado === 'Disponible'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : rec.estado === 'Asignado'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : 'bg-rose-950 text-rose-300 border-rose-500/50'
                      }`}
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Asignado">Asignado</option>
                      <option value="Fuera de Servicio">Fuera de Servicio</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={rec.ubicacionActual}
                      onChange={(e) => updateRecurso(rec.id, 'ubicacionActual', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={rec.contacto}
                      onChange={(e) => updateRecurso(rec.id, 'contacto', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRecurso(rec.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control de Víctimas / Sistema de Triage START en Escena */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
          Control Acumulado de Triage en Escena (Método START)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Conteo acumulado de pacientes evaluados en el Área de Concentración de Víctimas (ACV).
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Rojo */}
          <div className="bg-red-950/40 border border-red-500/50 p-3 rounded-xl text-center">
            <div className="text-[11px] font-bold text-red-400 uppercase">Rojo (Inmediato)</div>
            <div className="text-2xl font-black text-white mt-1">
              <input
                type="number"
                value={data.triajeVictimas.rojoInmediato}
                onChange={(e) => updateTriaje('rojoInmediato', parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent text-center text-red-300 font-black text-2xl outline-none"
              />
            </div>
            <span className="text-[10px] text-red-400/80">Prioridad 1</span>
          </div>

          {/* Amarillo */}
          <div className="bg-amber-950/40 border border-amber-500/50 p-3 rounded-xl text-center">
            <div className="text-[11px] font-bold text-amber-400 uppercase">Amarillo (Diferido)</div>
            <div className="text-2xl font-black text-white mt-1">
              <input
                type="number"
                value={data.triajeVictimas.amarilloDiferido}
                onChange={(e) => updateTriaje('amarilloDiferido', parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent text-center text-amber-300 font-black text-2xl outline-none"
              />
            </div>
            <span className="text-[10px] text-amber-400/80">Prioridad 2</span>
          </div>

          {/* Verde */}
          <div className="bg-emerald-950/40 border border-emerald-500/50 p-3 rounded-xl text-center">
            <div className="text-[11px] font-bold text-emerald-400 uppercase">Verde (Leve)</div>
            <div className="text-2xl font-black text-white mt-1">
              <input
                type="number"
                value={data.triajeVictimas.verdeLeve}
                onChange={(e) => updateTriaje('verdeLeve', parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent text-center text-emerald-300 font-black text-2xl outline-none"
              />
            </div>
            <span className="text-[10px] text-emerald-400/80">Prioridad 3</span>
          </div>

          {/* Negro */}
          <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Negro (Fallecido)</div>
            <div className="text-2xl font-black text-white mt-1">
              <input
                type="number"
                value={data.triajeVictimas.negroFallecido}
                onChange={(e) => updateTriaje('negroFallecido', parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent text-center text-slate-300 font-black text-2xl outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-500">Sin signos</span>
          </div>

          {/* Trasladados */}
          <div className="bg-sky-950/40 border border-sky-500/50 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
            <div className="text-[11px] font-bold text-sky-400 uppercase">Trasladados</div>
            <div className="text-2xl font-black text-white mt-1">
              <input
                type="number"
                value={data.triajeVictimas.trasladados}
                onChange={(e) => updateTriaje('trasladados', parseInt(e.target.value) || 0)}
                className="w-16 bg-transparent text-center text-sky-300 font-black text-2xl outline-none"
              />
            </div>
            <span className="text-[10px] text-sky-400/80">A Hospitales</span>
          </div>
        </div>
      </div>
    </div>
  );
};
