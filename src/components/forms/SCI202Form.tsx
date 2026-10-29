import React, { useState, useEffect } from 'react';
import { SCI202Data, PeriodoOperacional, PeriodoOperacionalRegistro } from '../../types/sci';
import { SignaturePad } from '../SignaturePad';
import { CruzRojaMexicanaEmblem } from '../CruzRojaMexicanaEmblem';
import {
  Target,
  Plus,
  Trash2,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Layers,
  Edit3,
  Check,
  ArrowRight,
  Flame,
  Sparkles,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';

interface SCI202FormProps {
  data: SCI202Data;
  onChange: (data: SCI202Data) => void;
  periodo: PeriodoOperacional;
  periodos?: PeriodoOperacionalRegistro[];
  onUpdatePeriodo?: (periodoActual: PeriodoOperacional, todosLosPeriodos: PeriodoOperacionalRegistro[]) => void;
  comandante: string;
}

export const SCI202Form: React.FC<SCI202FormProps> = ({
  data,
  onChange,
  periodo,
  periodos,
  onUpdatePeriodo,
  comandante
}) => {
  // Lista de períodos operacionales registrados para el evento
  const [listaPeriodos, setListaPeriodos] = useState<PeriodoOperacionalRegistro[]>(() => {
    if (data.periodosOperacionales && data.periodosOperacionales.length > 0) {
      return data.periodosOperacionales;
    }
    if (periodos && periodos.length > 0) {
      return periodos;
    }
    return [
      {
        id: 'per-1',
        numero: periodo.numero || 1,
        fechaInicio: periodo.fechaInicio || new Date().toISOString().slice(0, 10),
        horaInicio: periodo.horaInicio || '08:00',
        fechaFin: periodo.fechaFin || new Date().toISOString().slice(0, 10),
        horaFin: periodo.horaFin || '20:00',
        descripcion: 'Período 1 - Respuesta Inicial y Evaluación',
        esActivo: true
      }
    ];
  });

  // Campos manuales del período en edición activa
  const [periodoEnEdicionId, setPeriodoEnEdicionId] = useState<string | null>(null);
  const [periodoAEliminar, setPeriodoAEliminar] = useState<PeriodoOperacionalRegistro | null>(null);
  const [numPeriodoManual, setNumPeriodoManual] = useState<number>(periodo.numero || 1);
  const [fechaInicioManual, setFechaInicioManual] = useState<string>(
    periodo.fechaInicio || new Date().toISOString().slice(0, 10)
  );
  const [horaInicioManual, setHoraInicioManual] = useState<string>(periodo.horaInicio || '08:00');
  const [fechaFinManual, setFechaFinManual] = useState<string>(
    periodo.fechaFin || new Date().toISOString().slice(0, 10)
  );
  const [horaFinManual, setHoraFinManual] = useState<string>(periodo.horaFin || '20:00');
  const [descPeriodoManual, setDescPeriodoManual] = useState<string>('Operaciones de Campo');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sincronizar estado local si props de período cambian y NO estamos en edición manual
  useEffect(() => {
    if (periodo && !periodoEnEdicionId) {
      setNumPeriodoManual(periodo.numero || 1);
      if (periodo.fechaInicio) setFechaInicioManual(periodo.fechaInicio);
      if (periodo.horaInicio) setHoraInicioManual(periodo.horaInicio);
      if (periodo.fechaFin) setFechaFinManual(periodo.fechaFin);
      if (periodo.horaFin) setHoraFinManual(periodo.horaFin);
    }
  }, [periodo.numero, periodo.fechaInicio, periodo.horaInicio, periodo.fechaFin, periodo.horaFin, periodoEnEdicionId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const updateField = (field: keyof SCI202Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateClima = (field: keyof SCI202Data['pronosticoMeteorologico'], val: string) => {
    onChange({
      ...data,
      pronosticoMeteorologico: {
        ...data.pronosticoMeteorologico,
        [field]: val
      }
    });
  };

  const addObjetivo = () => {
    const newObj = {
      id: `obj-${Date.now()}`,
      texto: '',
      prioridad: 'Alta' as const,
      estado: 'En progreso' as const
    };
    updateField('objetivos', [...data.objetivos, newObj]);
  };

  const updateObjetivo = (id: string, field: string, val: any) => {
    updateField(
      'objetivos',
      data.objetivos.map((o) => (o.id === id ? { ...o, [field]: val } : o))
    );
  };

  const removeObjetivo = (id: string) => {
    updateField(
      'objetivos',
      data.objetivos.filter((o) => o.id !== id)
    );
  };

  // Cargar un período de la lista al editor manual para corregir errores
  const cargarPeriodoParaEditar = (p: PeriodoOperacionalRegistro) => {
    setPeriodoEnEdicionId(p.id || `per-${p.numero}`);
    setNumPeriodoManual(p.numero);
    setFechaInicioManual(p.fechaInicio);
    setHoraInicioManual(p.horaInicio);
    setFechaFinManual(p.fechaFin);
    setHoraFinManual(p.horaFin);
    setDescPeriodoManual(p.descripcion || `Período Operacional Nº ${p.numero}`);
    showToast(`Cargado Período Nº ${p.numero} en el editor para corregir o modificar.`);
    // Scroll al editor
    const el = document.getElementById('seccion-editor-periodo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancelar la edición activa
  const cancelarEdicion = () => {
    setPeriodoEnEdicionId(null);
    setNumPeriodoManual(periodo.numero || 1);
    setFechaInicioManual(periodo.fechaInicio || new Date().toISOString().slice(0, 10));
    setHoraInicioManual(periodo.horaInicio || '08:00');
    setFechaFinManual(periodo.fechaFin || new Date().toISOString().slice(0, 10));
    setHoraFinManual(periodo.horaFin || '20:00');
    setDescPeriodoManual('Operaciones de Campo');
    showToast('Modificación cancelada.');
  };

  // Guardar y sincronizar el período operacional editado o corregido
  const guardarPeriodoManual = () => {
    const num = Math.max(1, Number(numPeriodoManual) || 1);
    const periodoActualizado: PeriodoOperacional = {
      numero: num,
      fechaInicio: fechaInicioManual,
      horaInicio: horaInicioManual,
      fechaFin: fechaFinManual,
      horaFin: horaFinManual
    };

    let nuevosPeriodos: PeriodoOperacionalRegistro[];
    const esModificacion = !!periodoEnEdicionId;
    const existe = listaPeriodos.find((p) => p.id === periodoEnEdicionId || p.numero === num);

    if (existe) {
      nuevosPeriodos = listaPeriodos.map((p) => {
        if (p.id === existe.id || (esModificacion && p.id === periodoEnEdicionId) || p.numero === num) {
          return {
            ...p,
            numero: num,
            fechaInicio: fechaInicioManual,
            horaInicio: horaInicioManual,
            fechaFin: fechaFinManual,
            horaFin: horaFinManual,
            descripcion: descPeriodoManual || p.descripcion || `Período Operacional Nº ${num}`,
            esActivo: true
          };
        }
        return { ...p, esActivo: false };
      });
    } else {
      const nuevoReg: PeriodoOperacionalRegistro = {
        id: `per-${Date.now()}`,
        numero: num,
        fechaInicio: fechaInicioManual,
        horaInicio: horaInicioManual,
        fechaFin: fechaFinManual,
        horaFin: horaFinManual,
        descripcion: descPeriodoManual || `Período Operacional Nº ${num}`,
        esActivo: true
      };
      nuevosPeriodos = [
        ...listaPeriodos.map((p) => ({ ...p, esActivo: false })),
        nuevoReg
      ];
    }

    setListaPeriodos(nuevosPeriodos);
    updateField('periodosOperacionales', nuevosPeriodos);

    if (onUpdatePeriodo) {
      onUpdatePeriodo(periodoActualizado, nuevosPeriodos);
    }
    setPeriodoEnEdicionId(null);
    showToast(
      esModificacion
        ? `Período Operacional Nº ${num} modificado y actualizado exitosamente.`
        : `Período Operacional Nº ${num} guardado y establecido como activo.`
    );
  };

  // Registrar un período consecutivo nuevo que abarque el evento
  const agregarSiguientePeriodo = () => {
    const maxNum = listaPeriodos.reduce((max, p) => Math.max(max, p.numero || 1), 0);
    const ultimoPeriodo = listaPeriodos[listaPeriodos.length - 1];

    const sigNum = maxNum + 1;
    const nuevaFechaInicio = ultimoPeriodo ? ultimoPeriodo.fechaFin : new Date().toISOString().slice(0, 10);
    const nuevaHoraInicio = ultimoPeriodo ? ultimoPeriodo.horaFin : '20:00';

    const fechaObj = new Date(`${nuevaFechaInicio}T${nuevaHoraInicio}:00`);
    const finObj = new Date(fechaObj.getTime() + 12 * 60 * 60 * 1000);
    const nuevaFechaFin = !isNaN(finObj.getTime()) ? finObj.toISOString().slice(0, 10) : nuevaFechaInicio;
    const nuevaHoraFin = !isNaN(finObj.getTime())
      ? finObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
      : '08:00';

    const nuevo: PeriodoOperacionalRegistro = {
      id: `per-${Date.now()}`,
      numero: sigNum,
      fechaInicio: nuevaFechaInicio,
      horaInicio: nuevaHoraInicio,
      fechaFin: nuevaFechaFin,
      horaFin: nuevaHoraFin,
      descripcion: `Período ${sigNum} - Continuidad de Operaciones`,
      esActivo: false
    };

    const nuevaLista = [...listaPeriodos, nuevo];
    setListaPeriodos(nuevaLista);
    updateField('periodosOperacionales', nuevaLista);
    showToast(`Período Nº ${sigNum} agregado a la lista del evento.`);
    cargarPeriodoParaEditar(nuevo);
  };

  // Activar un período operacional de la lista
  const activarPeriodo = (p: PeriodoOperacionalRegistro) => {
    const periodoActualizado: PeriodoOperacional = {
      numero: p.numero,
      fechaInicio: p.fechaInicio,
      horaInicio: p.horaInicio,
      fechaFin: p.fechaFin,
      horaFin: p.horaFin
    };

    const nuevaLista = listaPeriodos.map((item) => ({
      ...item,
      esActivo: item.numero === p.numero
    }));

    setListaPeriodos(nuevaLista);
    setPeriodoEnEdicionId(null);
    setNumPeriodoManual(p.numero);
    setFechaInicioManual(p.fechaInicio);
    setHoraInicioManual(p.horaInicio);
    setFechaFinManual(p.fechaFin);
    setHoraFinManual(p.horaFin);
    setDescPeriodoManual(p.descripcion || `Período Operacional Nº ${p.numero}`);
    updateField('periodosOperacionales', nuevaLista);

    if (onUpdatePeriodo) {
      onUpdatePeriodo(periodoActualizado, nuevaLista);
    }
    showToast(`Período Operacional Nº ${p.numero} activado como período vigente.`);
  };

  // Confirmar y ejecutar eliminación definitiva de un período
  const confirmarEliminarDefinitivo = () => {
    if (!periodoAEliminar) return;
    const target = periodoAEliminar;

    if (listaPeriodos.length <= 1) {
      // Reiniciar a Período 1 limpio
      const periodoLimpio: PeriodoOperacionalRegistro = {
        id: `per-${Date.now()}`,
        numero: 1,
        fechaInicio: new Date().toISOString().slice(0, 10),
        horaInicio: '08:00',
        fechaFin: new Date().toISOString().slice(0, 10),
        horaFin: '20:00',
        descripcion: 'Período 1 - Restablecido',
        esActivo: true
      };
      setListaPeriodos([periodoLimpio]);
      updateField('periodosOperacionales', [periodoLimpio]);
      if (onUpdatePeriodo) {
        onUpdatePeriodo(
          {
            numero: 1,
            fechaInicio: periodoLimpio.fechaInicio,
            horaInicio: periodoLimpio.horaInicio,
            fechaFin: periodoLimpio.fechaFin,
            horaFin: periodoLimpio.horaFin
          },
          [periodoLimpio]
        );
      }
      setPeriodoEnEdicionId(null);
      setNumPeriodoManual(1);
      setFechaInicioManual(periodoLimpio.fechaInicio);
      setHoraInicioManual('08:00');
      setFechaFinManual(periodoLimpio.fechaFin);
      setHoraFinManual('20:00');
      setDescPeriodoManual(periodoLimpio.descripcion || 'Período 1 - Restablecido');
      setPeriodoAEliminar(null);
      showToast('Período eliminado definitivamente. Restablecido Período 1 en blanco.');
      return;
    }

    const nuevos = listaPeriodos.filter((p) => p.id !== target.id && p.numero !== target.numero);
    setListaPeriodos(nuevos);
    updateField('periodosOperacionales', nuevos);

    // Si el eliminado era el activo, activar el primero disponible
    const eraActivo = target.esActivo || target.numero === periodo.numero;
    if (eraActivo && nuevos.length > 0) {
      const nuevoActivo = { ...nuevos[0], esActivo: true };
      const conNuevoActivo = nuevos.map((p, idx) => ({ ...p, esActivo: idx === 0 }));
      setListaPeriodos(conNuevoActivo);
      updateField('periodosOperacionales', conNuevoActivo);
      if (onUpdatePeriodo) {
        onUpdatePeriodo(
          {
            numero: nuevoActivo.numero,
            fechaInicio: nuevoActivo.fechaInicio,
            horaInicio: nuevoActivo.horaInicio,
            fechaFin: nuevoActivo.fechaFin,
            horaFin: nuevoActivo.horaFin
          },
          conNuevoActivo
        );
      }
    } else if (onUpdatePeriodo) {
      onUpdatePeriodo(periodo, nuevos);
    }

    if (periodoEnEdicionId === target.id) {
      setPeriodoEnEdicionId(null);
    }

    setPeriodoAEliminar(null);
    showToast(`Período Operacional Nº ${target.numero} eliminado definitivamente.`);
  };

  // Cálculo estimativo de horas del período
  const duracionHoras = () => {
    try {
      const inicio = new Date(`${fechaInicioManual}T${horaInicioManual}:00`);
      const fin = new Date(`${fechaFinManual}T${horaFinManual}:00`);
      const diffMs = fin.getTime() - inicio.getTime();
      if (diffMs > 0) {
        const horas = (diffMs / (1000 * 60 * 60)).toFixed(1);
        return `${horas} horas`;
      }
      return 'Horario en curso';
    } catch (e) {
      return 'Vigencia definida';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast de confirmación táctica */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-xl border border-emerald-400 flex items-center gap-2 animate-bounce text-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header SCI-202 */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CruzRojaMexicanaEmblem size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
                  SCI-202
                </span>
                <h2 className="text-lg font-bold text-white">Objetivos del Incidente</h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase">
                  Núcleo del PAI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Cruz Roja Mexicana Delegación Tepatitlán · Períodos operacionales y prioridades tácticas aprobadas por el Comandante.
              </p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-mono flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Período Operacional Activo:</span>
              <span className="text-amber-400 font-bold text-sm">Nº {periodo.numero}</span>
            </div>
            <div className="border-l border-slate-800 pl-3 text-[11px] text-slate-300">
              <div>{periodo.fechaInicio} {periodo.horaInicio}</div>
              <div className="text-slate-500">hasta {periodo.fechaFin} {periodo.horaFin}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN SOLICITADA: REGISTRO Y MODIFICACIÓN MANUAL DE PERÍODOS */}
      {/* ======================================================== */}
      <div id="seccion-editor-periodo" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-5">
        {/* Banner de Modo Edición / Corrección de Errores */}
        {periodoEnEdicionId && (
          <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-2 border-amber-500/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Edit3 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Modo Edición y Corrección Activo
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                    Período Nº {numPeriodoManual}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Modifique las fechas, horas o descripción para corregir errores de registro y guarde los cambios.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={cancelarEdicion}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer transition"
              >
                Cancelar Edición
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = listaPeriodos.find((p) => p.id === periodoEnEdicionId || p.numero === numPeriodoManual);
                  if (target) setPeriodoAEliminar(target);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/40 flex items-center gap-1 cursor-pointer transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Registro y Control de Períodos Operacionales
              </h3>
              <p className="text-xs text-slate-400">
                Cree, modifique errores o elimine definitivamente períodos operacionales que cubran la evolución del incidente.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={agregarSiguientePeriodo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              title="Registrar automáticamente el siguiente período correlativo"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Siguiente Período
            </button>
          </div>
        </div>

        {/* Formulario de Entrada y Modificación del Período */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${periodoEnEdicionId ? 'bg-amber-400 animate-ping' : 'bg-blue-400'}`} />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {periodoEnEdicionId ? `Modificando Período Nº ${numPeriodoManual}:` : 'Entrada de Período Operacional:'}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
              Duración Estimada: {duracionHoras()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Número de Período */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Nº de Período: *
              </label>
              <input
                type="number"
                min="1"
                value={numPeriodoManual}
                onChange={(e) => setNumPeriodoManual(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm outline-none"
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Fecha Inicio: *
              </label>
              <input
                type="date"
                value={fechaInicioManual}
                onChange={(e) => setFechaInicioManual(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
              />
            </div>

            {/* Hora Inicio */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Hora Inicio: *
              </label>
              <input
                type="time"
                value={horaInicioManual}
                onChange={(e) => setHoraInicioManual(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Fecha Fin: *
              </label>
              <input
                type="date"
                value={fechaFinManual}
                onChange={(e) => setFechaFinManual(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
              />
            </div>

            {/* Hora Fin */}
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Hora Fin: *
              </label>
              <input
                type="time"
                value={horaFinManual}
                onChange={(e) => setHoraFinManual(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none"
              />
            </div>
          </div>

          {/* Descripción / Turno Operacional */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <div className="flex-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Descripción / Turno del Período (Opcional):
              </label>
              <input
                type="text"
                value={descPeriodoManual}
                onChange={(e) => setDescPeriodoManual(e.target.value)}
                placeholder="ej. Turno Diurno - Búsqueda y Evaluación, Turno Nocturno - Enfriamiento y Resguardo"
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-slate-200 text-xs outline-none"
              />
            </div>

            <div className="sm:self-end flex items-center gap-2">
              {periodoEnEdicionId && (
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                onClick={guardarPeriodoManual}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                {periodoEnEdicionId ? 'Guardar Modificaciones' : 'Guardar y Activar Período'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Períodos Registrados que Abarcan el Evento */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Períodos Registrados para este Evento ({listaPeriodos.length}):
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Utilice "Modificar" para corregir errores o "Eliminar" para borrar definitivamente.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {listaPeriodos.map((p) => {
              const esActivo = p.numero === periodo.numero;
              const estaEnEdicion = periodoEnEdicionId === (p.id || `per-${p.numero}`);
              return (
                <div
                  key={p.id || `per-${p.numero}`}
                  className={`rounded-2xl p-4 border transition-all ${
                    estaEnEdicion
                      ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20'
                      : esActivo
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 font-mono font-black text-xs flex items-center justify-center">
                        #{p.numero}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Período Operacional {p.numero}</span>
                          {estaEnEdicion && (
                            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              Editando
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                          {p.descripcion || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                    {esActivo ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                        Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => activarPeriodo(p)}
                        className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 text-[10px] font-bold transition cursor-pointer"
                        title="Establecer como período activo actual del incidente"
                      >
                        Activar
                      </button>
                    )}
                  </div>

                  {/* Horarios */}
                  <div className="bg-slate-900/80 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 space-y-1 border border-slate-800/60">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans text-[10px]">Inicio:</span>
                      <span className="text-white font-semibold">{p.fechaInicio} · {p.horaInicio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans text-[10px]">Fin:</span>
                      <span className="text-amber-400 font-semibold">{p.fechaFin} · {p.horaFin}</span>
                    </div>
                  </div>

                  {/* Acciones de Modificación y Eliminación Definitiva */}
                  <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => cargarPeriodoParaEditar(p)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition ${
                        estaEnEdicion
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                          : 'bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-500/40 text-amber-300 border border-slate-700/60'
                      }`}
                      title="Modificar fecha, horas o descripción para corregir errores"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{estaEnEdicion ? 'Editando...' : 'Modificar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPeriodoAEliminar(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-900/40 hover:border-rose-500/50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                      title="Eliminar este período operacional definitivamente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación Definitiva */}
      {periodoAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-rose-950/50 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-white">
                  ¿Eliminar Período Operacional Nº {periodoAEliminar.numero}?
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Esta acción eliminará de manera definitiva el período de las planificaciones del evento.
                </p>
                {listaPeriodos.length === 1 ? (
                  <div className="mt-2 text-[11px] bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-amber-300 font-medium">
                    ⚠️ Nota: Este es el único período registrado. Al eliminarlo, se restablecerá un Período 1 limpio por defecto.
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] bg-slate-800/80 rounded-xl p-2.5 text-slate-400 font-mono">
                    Período: {periodoAEliminar.fechaInicio} {periodoAEliminar.horaInicio} – {periodoAEliminar.fechaFin} {periodoAEliminar.horaFin}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPeriodoAEliminar(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminarDefinitivo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Lista de Objetivos del Incidente (SMART) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              1. Objetivos del Período Operacional (Específicos y Medibles)
            </h3>
          </div>
          <button
            type="button"
            onClick={addObjetivo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Objetivo
          </button>
        </div>

        <div className="space-y-3">
          {data.objetivos.map((obj, idx) => (
            <div key={obj.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-mono text-xs flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={obj.texto}
                onChange={(e) => updateObjetivo(obj.id, 'texto', e.target.value)}
                placeholder="Ej: Contener flanco norte en las próximas 6 horas salvaguardando viviendas..."
                className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-100 outline-none focus:border-amber-400"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <select
                  value={obj.prioridad}
                  onChange={(e) => updateObjetivo(obj.id, 'prioridad', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-300 outline-none"
                >
                  <option value="Alta">Prioridad: Alta</option>
                  <option value="Media">Prioridad: Media</option>
                  <option value="Baja">Prioridad: Baja</option>
                </select>
                <select
                  value={obj.estado}
                  onChange={(e) => updateObjetivo(obj.id, 'estado', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1.5 text-slate-300 outline-none"
                >
                  <option value="En progreso">En progreso</option>
                  <option value="Cumplido">Cumplido</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeObjetivo(obj.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {data.objetivos.length === 0 && (
            <p className="text-xs text-slate-500 italic text-center py-2">No hay objetivos redactados para este período.</p>
          )}
        </div>
      </div>

      {/* 2. Estrategias Tácticas y Directrices Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
            2. Estrategias y Tácticas Operacionales
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            El cómo se cumplirán los objetivos (métodos de ataque, sectorización, aislamiento).
          </p>
          <textarea
            rows={4}
            value={data.estrategiasTácticas}
            onChange={(e) => updateField('estrategiasTácticas', e.target.value)}
            placeholder="Describa la estrategia táctica..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-amber-400 outline-none"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2">
            3. Directrices y Mensaje General de Seguridad
          </h3>
          <p className="text-xs text-slate-400 mb-2">
            Énfasis en la seguridad física del personal según el Oficial de Seguridad.
          </p>
          <textarea
            rows={4}
            value={data.directricesSeguridad}
            onChange={(e) => updateField('directricesSeguridad', e.target.value)}
            placeholder="Medidas obligatorias de seguridad en la escena..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-amber-400 outline-none"
          />
        </div>
      </div>

      {/* 4. Pronóstico Meteorológico */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            4. Pronóstico Meteorológico en Escena
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Condición Cielo:</label>
            <input
              type="text"
              value={data.pronosticoMeteorologico.condicion}
              onChange={(e) => updateClima('condicion', e.target.value)}
              placeholder="Despejado / Lluvia"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Temperatura:</label>
            <input
              type="text"
              value={data.pronosticoMeteorologico.temperatura}
              onChange={(e) => updateClima('temperatura', e.target.value)}
              placeholder="26°C"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Viento / Dirección:</label>
            <input
              type="text"
              value={data.pronosticoMeteorologico.viento}
              onChange={(e) => updateClima('viento', e.target.value)}
              placeholder="15 km/h del NE"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Humedad:</label>
            <input
              type="text"
              value={data.pronosticoMeteorologico.humedad}
              onChange={(e) => updateClima('humedad', e.target.value)}
              placeholder="45%"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* 5. Aprobación Oficial y Firma Digital Táctil del CI */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            5. Aprobación y Visto Bueno del Comandante del Incidente (CI)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Aprobado Por (Nombre y Cargo):</label>
              <input
                type="text"
                value={data.aprobadoPorCI || comandante}
                onChange={(e) => updateField('aprobadoPorCI', e.target.value)}
                placeholder="Nombre del Comandante del Incidente"
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Fecha y Hora de Aprobación:</label>
              <input
                type="text"
                value={data.fechaAprobacion || new Date().toISOString().replace('T', ' ').slice(0, 16)}
                onChange={(e) => updateField('fechaAprobacion', e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300"
              />
            </div>
            <p className="text-xs text-slate-400 italic">
              Conforme a la NOM-010, el Plan de Acción del Incidente entra en vigor una vez firmado por el CI.
            </p>
          </div>

          <div>
            <SignaturePad
              title="Firma Digital Táctil (Apple Pencil / Touch)"
              initialDataUrl={data.firmaCIData}
              onSave={(dataUrl) => updateField('firmaCIData', dataUrl)}
              signerName={data.aprobadoPorCI || comandante}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
