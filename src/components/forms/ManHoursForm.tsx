import React, { useState, useMemo } from 'react';
import {
  ControlHorasHombreData,
  RegistroHorasHombre,
  EspecialidadPersonal,
  CondicionFatiga,
  IncidentData
} from '../../types/sci';
import {
  Clock,
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Search,
  FileSpreadsheet,
  BarChart2,
  Sparkles,
  HeartPulse,
  Flame,
  HardHat,
  Radio,
  FileText,
  Check,
  X
} from 'lucide-react';

interface ManHoursFormProps {
  data: ControlHorasHombreData;
  onChange: (data: ControlHorasHombreData) => void;
  incident?: IncidentData;
}

const ESPECIALIDADES: EspecialidadPersonal[] = [
  'Búsqueda y Rescate (USAR)',
  'Atención Médica / Triage',
  'Combate de Incendios',
  'Materiales Peligrosos (HazMat)',
  'Logística y Abastecimiento',
  'Seguridad y Perímetro',
  'Mando y Planificación',
  'Operación de Maquinaria'
];

export const ManHoursForm: React.FC<ManHoursFormProps> = ({ data, onChange, incident }) => {
  const [activeTab, setActiveTab] = useState<'turnos' | 'graficas'>('turnos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState<string>('todas');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<RegistroHorasHombre | null>(null);
  const [registroAEliminar, setRegistroAEliminar] = useState<RegistroHorasHombre | null>(null);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Estados del modal
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formBrigada, setFormBrigada] = useState<string>('');
  const [formResponsable, setFormResponsable] = useState<string>('');
  const [formEspecialidad, setFormEspecialidad] = useState<EspecialidadPersonal>('Búsqueda y Rescate (USAR)');
  const [formNumEfectivos, setFormNumEfectivos] = useState<number>(4);
  const [formHoraInicio, setFormHoraInicio] = useState<string>('08:00');
  const [formHoraFin, setFormHoraFin] = useState<string>('16:00');
  const [formHorasPersona, setFormHorasPersona] = useState<number>(8);
  const [formHorasExtra, setFormHorasExtra] = useState<number>(0);
  const [formTasaHoraria, setFormTasaHoraria] = useState<number>(180);
  const [formArea, setFormArea] = useState<string>('');
  const [formActividad, setFormActividad] = useState<string>('');
  const [formFatiga, setFormFatiga] = useState<CondicionFatiga>('Óptima');
  const [formNotas, setFormNotas] = useState<string>('');

  // Métricas consolidadas
  const metricas = useMemo(() => {
    const registros = data.registros || [];
    let totalHorasHombre = 0;
    let totalPersonalDesplegado = 0;
    let totalCostoPersonal = 0;
    let brigadasFatigaAlerta = 0;

    const horasPorEspecialidad: Record<string, number> = {};
    ESPECIALIDADES.forEach((esp) => {
      horasPorEspecialidad[esp] = 0;
    });

    registros.forEach((r) => {
      totalHorasHombre += r.totalHorasHombre || 0;
      totalPersonalDesplegado += r.numeroEfectivos || 0;
      totalCostoPersonal += r.costoTotalPersonal || 0;

      if (r.condicionFatiga === 'Relevo Requerido') {
        brigadasFatigaAlerta++;
      }

      if (horasPorEspecialidad[r.especialidad] !== undefined) {
        horasPorEspecialidad[r.especialidad] += r.totalHorasHombre || 0;
      }
    });

    const promedioHorasPorTurno =
      registros.length > 0 ? (totalHorasHombre / registros.length).toFixed(1) : '0';

    return {
      totalHorasHombre,
      totalPersonalDesplegado,
      totalCostoPersonal,
      brigadasFatigaAlerta,
      horasPorEspecialidad,
      promedioHorasPorTurno
    };
  }, [data.registros]);

  // Registros filtrados
  const registrosFiltrados = useMemo(() => {
    return (data.registros || []).filter((r) => {
      const cumpleEsp = filtroEspecialidad === 'todas' || r.especialidad === filtroEspecialidad;
      const q = busqueda.toLowerCase().trim();
      const cumpleQ =
        !q ||
        r.brigadaUnidad.toLowerCase().includes(q) ||
        r.responsableLider.toLowerCase().includes(q) ||
        r.areaOperacion.toLowerCase().includes(q) ||
        r.actividadDesempenada.toLowerCase().includes(q);
      return cumpleEsp && cumpleQ;
    });
  }, [data.registros, filtroEspecialidad, busqueda]);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const abrirCrearModal = () => {
    setRegistroEnEdicion(null);
    setFormError(null);
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormBrigada('');
    setFormResponsable('');
    setFormEspecialidad('Búsqueda y Rescate (USAR)');
    setFormNumEfectivos(4);
    setFormHoraInicio('08:00');
    setFormHoraFin('16:00');
    setFormHorasPersona(8);
    setFormHorasExtra(0);
    setFormTasaHoraria(180);
    setFormArea('Zona Operativa Principal');
    setFormActividad('');
    setFormFatiga('Óptima');
    setFormNotas('');
    setModalAbierto(true);
  };

  const abrirEditarModal = (r: RegistroHorasHombre) => {
    setRegistroEnEdicion(r);
    setFormError(null);
    setFormFecha(r.fecha);
    setFormBrigada(r.brigadaUnidad);
    setFormResponsable(r.responsableLider);
    setFormEspecialidad(r.especialidad);
    setFormNumEfectivos(r.numeroEfectivos);
    setFormHoraInicio(r.horaInicio);
    setFormHoraFin(r.horaFin);
    setFormHorasPersona(r.horasPorPersona);
    setFormHorasExtra(r.horasExtraordinarias);
    setFormTasaHoraria(r.tasaHorariaEstimada);
    setFormArea(r.areaOperacion);
    setFormActividad(r.actividadDesempenada);
    setFormFatiga(r.condicionFatiga);
    setFormNotas(r.notas || '');
    setModalAbierto(true);
  };

  const duplicarParaNuevoTurno = (r: RegistroHorasHombre) => {
    setRegistroEnEdicion(null);
    setFormError(null);
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormBrigada(`${r.brigadaUnidad} (Turno 2)`);
    setFormResponsable(r.responsableLider);
    setFormEspecialidad(r.especialidad);
    setFormNumEfectivos(r.numeroEfectivos);
    setFormHoraInicio(r.horaFin || '16:00');
    setFormHoraFin('00:00');
    setFormHorasPersona(r.horasPorPersona);
    setFormHorasExtra(0);
    setFormTasaHoraria(r.tasaHorariaEstimada);
    setFormArea(r.areaOperacion);
    setFormActividad(r.actividadDesempenada);
    setFormFatiga('Óptima');
    setFormNotas(`Relevo derivado del turno anterior`);
    setModalAbierto(true);
  };

  const guardarRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrigada.trim()) {
      setFormError('Por favor especifique el nombre de la brigada o cuadrilla.');
      return;
    }
    setFormError(null);

    const efectivos = Math.max(1, Number(formNumEfectivos) || 1);
    const horasNorm = Math.max(0, Number(formHorasPersona) || 0);
    const horasExt = Math.max(0, Number(formHorasExtra) || 0);
    const totalHH = efectivos * (horasNorm + horasExt);
    const tasa = Math.max(0, Number(formTasaHoraria) || 0);
    const costoTotal = totalHH * tasa;

    const registroGuardar: RegistroHorasHombre = {
      id: registroEnEdicion ? registroEnEdicion.id : `hh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fecha: formFecha,
      brigadaUnidad: formBrigada.trim(),
      responsableLider: formResponsable.trim() || 'Líder de Cuadrilla',
      especialidad: formEspecialidad,
      numeroEfectivos: efectivos,
      horaInicio: formHoraInicio,
      horaFin: formHoraFin,
      horasPorPersona: horasNorm,
      horasExtraordinarias: horasExt,
      totalHorasHombre: totalHH,
      tasaHorariaEstimada: tasa,
      costoTotalPersonal: costoTotal,
      areaOperacion: formArea.trim() || 'Área de Asignación',
      actividadDesempenada: formActividad.trim(),
      condicionFatiga: formFatiga,
      notas: formNotas.trim()
    };

    let nuevos: RegistroHorasHombre[];
    const esEdicion = !!registroEnEdicion;
    if (registroEnEdicion) {
      nuevos = (data.registros || []).map((r) => (r.id === registroEnEdicion.id ? registroGuardar : r));
    } else {
      nuevos = [registroGuardar, ...(data.registros || [])];
    }

    onChange({
      ...data,
      registros: nuevos
    });

    setModalAbierto(false);
    setRegistroEnEdicion(null);
    mostrarToast(esEdicion ? 'Registro modificado y actualizado correctamente' : 'Nueva cuadrilla registrada con éxito');
  };

  const confirmarEliminarRegistro = (registro: RegistroHorasHombre) => {
    setRegistroAEliminar(registro);
  };

  const ejecutarEliminacion = () => {
    if (!registroAEliminar) return;
    const idAEliminar = registroAEliminar.id;
    const nuevos = (data.registros || []).filter((r) => r.id !== idAEliminar);
    onChange({
      ...data,
      registros: nuevos
    });
    setRegistroAEliminar(null);
    if (modalAbierto && registroEnEdicion?.id === idAEliminar) {
      setModalAbierto(false);
      setRegistroEnEdicion(null);
    }
    mostrarToast('Registro eliminado de manera definitiva');
  };

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(monto);
  };

  const exportarCSV = () => {
    const headers = [
      'ID',
      'Fecha',
      'Brigada/Cuadrilla',
      'Líder Responsable',
      'Especialidad',
      'No. Efectivos',
      'Hora Inicio',
      'Hora Fin',
      'Horas Turno',
      'Horas Extra',
      'Total Horas-Hombre',
      'Tasa Horaria (MXN)',
      'Costo Total Personal',
      'Área de Operación',
      'Actividad Desempeñada',
      'Condición Fatiga',
      'Notas'
    ];

    const rows = (data.registros || []).map((r) => [
      r.id,
      r.fecha,
      `"${r.brigadaUnidad.replace(/"/g, '""')}"`,
      `"${r.responsableLider.replace(/"/g, '""')}"`,
      `"${r.especialidad.replace(/"/g, '""')}"`,
      r.numeroEfectivos,
      r.horaInicio,
      r.horaFin,
      r.horasPorPersona,
      r.horasExtraordinarias,
      r.totalHorasHombre,
      r.tasaHorariaEstimada,
      r.costoTotalPersonal,
      `"${r.areaOperacion.replace(/"/g, '""')}"`,
      `"${r.actividadDesempenada.replace(/"/g, '""')}"`,
      r.condicionFatiga,
      `"${(r.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Registro_Horas_Hombre_SCI_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-black rounded-lg border border-amber-500/30 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              SCI-HORAS
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">Registro y Control de Horas-Hombre</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Monitoreo táctico del esfuerzo laboral, fatiga de rescatistas, cómputo de turnos y valoración financiera del personal en el Sistema de Comando de Incidentes (NOM-010-SEGOB).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            title="Exportar a CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={abrirCrearModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Turno / Cuadrilla</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Horas Hombre */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Horas-Hombre</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {metricas.totalHorasHombre.toLocaleString('es-MX')} <span className="text-xs font-sans text-slate-400">HH</span>
            </div>
            <div className="text-[10px] text-slate-500">Esfuerzo acumulado</div>
          </div>
        </div>

        {/* Total Personal Desplegado */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Efectivos Desplegados</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {metricas.totalPersonalDesplegado} <span className="text-xs font-sans text-slate-400">elementos</span>
            </div>
            <div className="text-[10px] text-slate-500">En {(data.registros || []).length} cuadrillas/turnos</div>
          </div>
        </div>

        {/* Costo Operativo de Fuerza de Tarea */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Costo Fuerza de Tarea</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatearDinero(metricas.totalCostoPersonal)}
            </div>
            <div className="text-[10px] text-slate-500">Valoración económica</div>
          </div>
        </div>

        {/* Alerta de Fatiga NOM-010 */}
        <div className={`border rounded-2xl p-4 flex flex-col justify-between ${
          metricas.brigadasFatigaAlerta > 0
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider">Control de Fatiga</span>
            {metricas.brigadasFatigaAlerta > 0 ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="mt-2">
            <div className={`text-xl sm:text-2xl font-black font-mono ${
              metricas.brigadasFatigaAlerta > 0 ? 'text-rose-400' : 'text-slate-200'
            }`}>
              {metricas.brigadasFatigaAlerta} <span className="text-xs font-sans text-slate-400">alerta(s)</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {metricas.brigadasFatigaAlerta > 0 ? 'Relevo urgente requerido' : 'Rotación adecuada'}
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Pestaña */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('turnos')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'turnos'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Bitácora de Cuadrillas ({(data.registros || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('graficas')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'graficas'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Gráfica de Esfuerzo por Especialidad</span>
        </button>
      </div>

      {/* TAB 1: BITÁCORA DE CUADRILLAS */}
      {activeTab === 'turnos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Controles de Búsqueda y Filtro */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar brigada, responsable, área o actividad..."
                className="w-full bg-transparent text-xs text-white outline-none"
              />
              {busqueda && (
                <button type="button" onClick={() => setBusqueda('')} className="text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="todas">Todas las especialidades</option>
                {ESPECIALIDADES.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Horas Hombre */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Brigada / Especialidad</th>
                  <th className="py-3 px-3">Fecha & Horario</th>
                  <th className="py-3 px-3 text-center">Efectivos</th>
                  <th className="py-3 px-3 text-right">Horas Turno + Extra</th>
                  <th className="py-3 px-3 text-right">Total HH</th>
                  <th className="py-3 px-3 text-right">Costo Operativo</th>
                  <th className="py-3 px-3">Frente & Tarea</th>
                  <th className="py-3 px-3 text-center">Fatiga</th>
                  <th className="py-3 px-3 text-center min-w-[200px]">Acciones (Modificar / Eliminar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 text-xs font-sans">
                      No hay cuadrillas registradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  registrosFiltrados.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 font-sans min-w-[180px]">
                        <div className="font-bold text-slate-200">{r.brigadaUnidad}</div>
                        <div className="text-[10px] text-amber-400 font-semibold">{r.especialidad}</div>
                        <div className="text-[10px] text-slate-500">Líder: {r.responsableLider}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{r.fecha}</div>
                        <div className="text-slate-500 text-[10px]">{r.horaInicio} - {r.horaFin}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs">
                          {r.numeroEfectivos}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-300">
                        {r.horasPorPersona}h {r.horasExtraordinarias > 0 && <span className="text-rose-400 font-bold">+{r.horasExtraordinarias}h</span>}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-black text-amber-400">
                        {r.totalHorasHombre} HH
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-emerald-400">
                        {formatearDinero(r.costoTotalPersonal)}
                      </td>

                      <td className="py-2.5 px-3 font-sans max-w-[200px]">
                        <div className="text-slate-300 truncate font-medium">{r.areaOperacion}</div>
                        <div className="text-[10px] text-slate-500 truncate">{r.actividadDesempenada}</div>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.condicionFatiga === 'Relevo Requerido'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : r.condicionFatiga === 'Moderada'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {r.condicionFatiga}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => abrirEditarModal(r)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Modificar, corregir o actualizar este registro de horas hombre"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Modificar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmarEliminarRegistro(r)}
                            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-all cursor-pointer active:scale-95"
                            title="Eliminar de manera definitiva este registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicarParaNuevoTurno(r)}
                            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors cursor-pointer"
                            title="Duplicar para nuevo turno o relevo"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Configuración general de turnos */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Límite de Horas Recomendado por Turno (NOM-010 para prevención de fatiga):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="4"
                  max="24"
                  value={data.limiteHorasTurno || 8}
                  onChange={(e) => onChange({ ...data, limiteHorasTurno: parseInt(e.target.value) || 8 })}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-center outline-none focus:border-amber-400"
                />
                <span className="text-slate-400 text-xs">horas máximas por ciclo operativo</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Coordinador / Oficial de Control de Personal (SCI):
              </label>
              <input
                type="text"
                value={data.coordinadorPersonal || ''}
                onChange={(e) => onChange({ ...data, coordinadorPersonal: e.target.value })}
                placeholder="Nombre del responsable de registro y relevos"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRÁFICAS DE ESFUERZO */}
      {activeTab === 'graficas' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Distribución de Horas-Hombre por Especialidad Táctica
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total Acumulado: {metricas.totalHorasHombre} HH
            </span>
          </div>

          {metricas.totalHorasHombre === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No hay turnos registrados aún para generar estadísticas.
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {ESPECIALIDADES.map((esp) => {
                const hh = metricas.horasPorEspecialidad[esp] || 0;
                const pct = metricas.totalHorasHombre > 0 ? ((hh / metricas.totalHorasHombre) * 100).toFixed(1) : '0';
                return (
                  <div key={esp} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {esp}
                      </span>
                      <span className="font-mono font-bold text-white">
                        {hh} HH <span className="text-slate-500 font-normal">({pct}%)</span>
                      </span>
                    </div>

                    <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(hh > 0 ? 3 : 0, Number(pct)))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resumen de Recomendaciones */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Directriz NOM-010-SEGOB para Descanso y Seguridad</div>
              <p className="text-slate-400 mt-0.5 leading-relaxed">
                Ningún rescatista o combatiente debe exceder 12 horas consecutivas de labor física pesada sin un período de descanso e hidratación de al menos 8 horas. El oficial de seguridad y la unidad médica deben validar los relevos en la bitácora.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR TURNO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${registroEnEdicion ? 'bg-amber-400' : 'bg-sky-400'} animate-pulse shrink-0`} />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {registroEnEdicion ? 'Modificar / Corregir Registro de Horas-Hombre' : 'Registrar Turno y Horas Hombre'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {registroEnEdicion
                      ? 'Actualice, corrija o elimine cualquier dato registrado de forma errónea'
                      : 'Registre una nueva cuadrilla y sus horas de labor táctica'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-4 sm:mx-5 mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={guardarRegistro} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Brigada y Especialidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Nombre de Brigada / Cuadrilla: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBrigada}
                    onChange={(e) => setFormBrigada(e.target.value)}
                    placeholder="ej. Fuerza USAR Alfa, Brigada K9, Cuadrilla Bomberos"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Especialidad:</label>
                  <select
                    value={formEspecialidad}
                    onChange={(e) => setFormEspecialidad(e.target.value as EspecialidadPersonal)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  >
                    {ESPECIALIDADES.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Responsable y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Líder o Responsable de la Cuadrilla:
                  </label>
                  <input
                    type="text"
                    value={formResponsable}
                    onChange={(e) => setFormResponsable(e.target.value)}
                    placeholder="Nombre del líder o jefe de cuadrilla"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fecha del Turno:</label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={(e) => setFormFecha(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Horas y Efectivos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">No. Efectivos:</label>
                  <input
                    type="number"
                    min="1"
                    value={formNumEfectivos}
                    onChange={(e) => setFormNumEfectivos(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Horas Turno:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formHorasPersona}
                    onChange={(e) => setFormHorasPersona(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Horas Extra:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formHorasExtra}
                    onChange={(e) => setFormHorasExtra(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-amber-400 uppercase font-black block mb-1">Total HH:</label>
                  <div className="w-full bg-amber-950/40 border border-amber-500/30 rounded-lg px-2 py-1.5 text-amber-400 font-mono font-black text-center truncate">
                    {(formNumEfectivos || 0) * ((formHorasPersona || 0) + (formHorasExtra || 0))} HH
                  </div>
                </div>
              </div>

              {/* Horario y Tasa Horaria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Hora Inicio:</label>
                  <input
                    type="time"
                    value={formHoraInicio}
                    onChange={(e) => setFormHoraInicio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Hora Fin:</label>
                  <input
                    type="time"
                    value={formHoraFin}
                    onChange={(e) => setFormHoraFin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Tasa Horaria ($ MXN):</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formTasaHoraria}
                    onChange={(e) => setFormTasaHoraria(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Área y Condición de Fatiga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Área o Frente Asignado:
                  </label>
                  <input
                    type="text"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    placeholder="ej. Zona Caliente, Flanco Norte, Triage ACV"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Condición de Fatiga / Rotación:
                  </label>
                  <select
                    value={formFatiga}
                    onChange={(e) => setFormFatiga(e.target.value as CondicionFatiga)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                  >
                    <option value="Óptima">Óptima (En condiciones plenas)</option>
                    <option value="Moderada">Moderada (Requiere hidratación)</option>
                    <option value="Relevo Requerido">Relevo Requerido (Fatiga límite NOM-010)</option>
                  </select>
                </div>
              </div>

              {/* Tareas Desempeñadas */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Tareas y Actividades Desempeñadas:
                </label>
                <textarea
                  rows={2}
                  value={formActividad}
                  onChange={(e) => setFormActividad(e.target.value)}
                  placeholder="Descripción concisa de las maniobras realizadas..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                {registroEnEdicion ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRegistroAEliminar(registroEnEdicion);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 text-xs font-bold cursor-pointer transition active:scale-95"
                    title="Eliminar este registro erróneo de manera definitiva"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Registro</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer text-xs active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    {registroEnEdicion ? 'Actualizar / Guardar Correcciones' : 'Registrar Cuadrilla'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de Confirmación Táctica */}
      {toastMensaje && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-bounce text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMensaje}</span>
        </div>
      )}

      {/* MODAL IN-APP PARA CONFIRMAR ELIMINACIÓN DE REGISTRO */}
      {registroAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Eliminar Registro de Horas-Hombre?</h3>
                <p className="text-xs text-rose-300">Esta acción removerá definitivamente la cuadrilla del control.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Brigada:</span>
                <span className="text-white font-bold">{registroAEliminar.brigadaUnidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Especialidad:</span>
                <span className="text-amber-400">{registroAEliminar.especialidad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Fecha y Horario:</span>
                <span className="text-slate-300">{registroAEliminar.fecha} ({registroAEliminar.horaInicio} - {registroAEliminar.horaFin})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Efectivos y Horas:</span>
                <span className="text-sky-300">{registroAEliminar.numeroEfectivos} pers. · {registroAEliminar.totalHorasHombre} HH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Costo Calculado:</span>
                <span className="text-emerald-400 font-bold">{formatearDinero(registroAEliminar.costoTotalPersonal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRegistroAEliminar(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarEliminacion}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/20 cursor-pointer active:scale-95"
              >
                Sí, Eliminar de Manera Definitiva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
