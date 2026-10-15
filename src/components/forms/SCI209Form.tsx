import React from 'react';
import { SCI209Data, CentroCostosData, ControlHorasHombreData } from '../../types/sci';
import {
  FileBarChart2,
  Percent,
  Users,
  Home,
  AlertTriangle,
  Building,
  CheckCircle2,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Fuel,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';

interface SCI209FormProps {
  data: SCI209Data;
  onChange: (data: SCI209Data) => void;
  comandante: string;
  centroCostos?: CentroCostosData;
  controlHorasHombre?: ControlHorasHombreData;
}

export const SCI209Form: React.FC<SCI209FormProps> = ({
  data,
  onChange,
  comandante,
  centroCostos,
  controlHorasHombre
}) => {
  const updateField = (field: keyof SCI209Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateDanosHumanos = (field: keyof SCI209Data['danosHumanos'], val: number) => {
    onChange({
      ...data,
      danosHumanos: {
        ...data.danosHumanos,
        [field]: Math.max(0, val)
      }
    });
  };

  // Cálculos financieros para el informe final
  const finanzas = React.useMemo(() => {
    const items = centroCostos?.items || [];
    let gastos = 0;
    let adquisiciones = 0;
    let inversiones = 0;
    let insumos = 0;
    let ganancias = 0;

    items.forEach((it) => {
      const monto = Number(it.montoTotal) || 0;
      if (it.tipo === 'Gasto') gastos += monto;
      else if (it.tipo === 'Adquisición') adquisiciones += monto;
      else if (it.tipo === 'Inversión') inversiones += monto;
      else if (it.tipo === 'Insumo Gastado') insumos += monto;
      else if (it.tipo === 'Ganancia') ganancias += monto;
    });

    const egresosTotales = gastos + adquisiciones + inversiones + insumos;
    const balanceNeto = ganancias - egresosTotales;

    return {
      gastos,
      adquisiciones,
      inversiones,
      insumos,
      ganancias,
      egresosTotales,
      balanceNeto,
      itemsCount: items.length
    };
  }, [centroCostos]);

  // Cálculos de horas hombre para el informe final
  const horasHombre = React.useMemo(() => {
    const registros = controlHorasHombre?.registros || [];
    let totalHH = 0;
    let totalEfectivos = 0;
    let totalCosto = 0;
    let fatigaAlertas = 0;

    registros.forEach((r) => {
      totalHH += r.totalHorasHombre || 0;
      totalEfectivos += r.numeroEfectivos || 0;
      totalCosto += r.costoTotalPersonal || 0;
      if (r.condicionFatiga === 'Relevo Requerido') {
        fatigaAlertas++;
      }
    });

    return {
      totalHH,
      totalEfectivos,
      totalCosto,
      fatigaAlertas,
      registrosCount: registros.length
    };
  }, [controlHorasHombre]);

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(monto);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/30">
              SCI-209
            </span>
            <h2 className="text-lg font-bold text-white">Resumen del Estado del Incidente / Informe Final</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Informe ejecutivo de situación para autoridades superiores, Centro de Operaciones de Emergencia (COE) y prensa. Incluye anexos de Centro de Costos y Control de Horas-Hombre.
          </p>
        </div>
      </div>

      {/* Progress & Percentage of Containment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Porcentaje Estimado de Control / Contención
            </h3>
          </div>
          <span className="text-xl font-black text-amber-400 font-mono">{data.porcentajeControl}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={data.porcentajeControl}
          onChange={(e) => updateField('porcentajeControl', parseInt(e.target.value) || 0)}
          className="w-full h-2.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
          <span>0% Inicio / Crítico</span>
          <span>50% Mitad de Control</span>
          <span>100% Incidente Totalmente Controlado</span>
        </div>
      </div>

      {/* Censo y Afectación Humana */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Evaluación de Afectaciones Humanas en Escena
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Lesionados Civiles</span>
            <input
              type="number"
              value={data.danosHumanos.lesionadosCiviles}
              onChange={(e) => updateDanosHumanos('lesionadosCiviles', parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-black text-white bg-transparent outline-none mt-1"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Lesionados Rescatistas</span>
            <input
              type="number"
              value={data.danosHumanos.lesionadosRescatistas}
              onChange={(e) => updateDanosHumanos('lesionadosRescatistas', parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-black text-white bg-transparent outline-none mt-1"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fallecidos</span>
            <input
              type="number"
              value={data.danosHumanos.fallecidos}
              onChange={(e) => updateDanosHumanos('fallecidos', parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-black text-white bg-transparent outline-none mt-1"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-sky-400 block">Evacuados</span>
            <input
              type="number"
              value={data.danosHumanos.evacuados}
              onChange={(e) => updateDanosHumanos('evacuados', parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-black text-white bg-transparent outline-none mt-1"
            />
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Albergados</span>
            <input
              type="number"
              value={data.danosHumanos.albergados}
              onChange={(e) => updateDanosHumanos('albergados', parseInt(e.target.value) || 0)}
              className="w-full text-center text-2xl font-black text-white bg-transparent outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* Resumen de Situación y Daños Materiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            Resumen General de la Situación y Logros Actuales
          </h3>
          <textarea
            rows={4}
            value={data.resumenSituacion}
            onChange={(e) => updateField('resumenSituacion', e.target.value)}
            placeholder="Resumen del desarrollo de las operaciones..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-amber-400"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
            Daños Estructurales y a Infraestructura
          </h3>
          <textarea
            rows={4}
            value={data.danosEstructuralesInfraestructura}
            onChange={(e) => updateField('danosEstructuralesInfraestructura', e.target.value)}
            placeholder="Edificios, puentes, servicios básicos interrumpidos..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* ANEXO SOLICITADO: CENTRO DE COSTOS Y BALANCE FINANCIERO        */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Anexo Financiero: Centro de Costos del Incidente
              </h3>
              <p className="text-[11px] text-slate-400">
                Consolidado de gastos, adquisiciones, inversiones, insumos consumidos y fondos recibidos.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Movimientos Contables</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{finanzas.itemsCount} registros activos</span>
          </div>
        </div>

        {/* Tarjetas de Resumen Financiero en el Informe Final */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Gastos Corrientes</span>
            <span className="text-sm font-black font-mono text-amber-400 block mt-0.5">
              {formatearDinero(finanzas.gastos)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Adquisiciones</span>
            <span className="text-sm font-black font-mono text-blue-400 block mt-0.5">
              {formatearDinero(finanzas.adquisiciones)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Inversiones</span>
            <span className="text-sm font-black font-mono text-purple-400 block mt-0.5">
              {formatearDinero(finanzas.inversiones)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Insumos Gastados</span>
            <span className="text-sm font-black font-mono text-rose-400 block mt-0.5">
              {formatearDinero(finanzas.insumos)}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Ganancias / Fondos</span>
            <span className="text-sm font-black font-mono text-emerald-400 block mt-0.5">
              {formatearDinero(finanzas.ganancias)}
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            finanzas.balanceNeto >= 0 ? 'bg-emerald-950/40 border-emerald-500/30' : 'bg-rose-950/40 border-rose-500/30'
          }`}>
            <span className="text-[9px] uppercase font-black tracking-wider block text-slate-300">Balance Saldo</span>
            <span className={`text-sm font-black font-mono block mt-0.5 ${
              finanzas.balanceNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatearDinero(finanzas.balanceNeto)}
            </span>
          </div>
        </div>

        {/* Tabla ejecutiva de movimientos en el informe */}
        {centroCostos?.items && centroCostos.items.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/60 text-[10px] text-slate-400 uppercase font-black">
                <tr>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Fecha</th>
                  <th className="py-2 px-3">Concepto</th>
                  <th className="py-2 px-3 text-right">Cant.</th>
                  <th className="py-2 px-3 text-right">Monto (MXN)</th>
                  <th className="py-2 px-3">Doc / Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {centroCostos.items.slice(0, 6).map((it) => (
                  <tr key={it.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 whitespace-nowrap font-sans font-bold">
                      <span className={it.tipo === 'Ganancia' ? 'text-emerald-400' : 'text-slate-300'}>
                        {it.tipo}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{it.fecha}</td>
                    <td className="py-2 px-3 font-sans text-slate-200 truncate max-w-[220px]">
                      {it.concepto}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">{it.cantidad} {it.unidadMedida}</td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      {formatearDinero(it.montoTotal)}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[10px] font-sans truncate max-w-[150px]">
                      {it.numComprobante || it.proveedorBeneficiario || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {centroCostos.items.length > 6 && (
              <div className="py-1.5 px-3 bg-slate-900/40 text-[10px] text-slate-400 text-center font-mono">
                + {centroCostos.items.length - 6} registros adicionales detallados en el expediente financiero del SCI.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ANEXO SOLICITADO: HORAS-HOMBRE Y FUERZA DE TAREA OPERATIVA     */}
      {/* ============================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Anexo de Personal: Control de Horas-Hombre del Operativo
              </h3>
              <p className="text-[11px] text-slate-400">
                Registro de esfuerzo táctico, cuadrillas en terreno y cumplimiento de rotación para prevención de fatiga.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Cuadrillas / Turnos</span>
            <span className="text-xs font-mono font-bold text-amber-400">{horasHombre.registrosCount} turnos computados</span>
          </div>
        </div>

        {/* Tarjetas de Resumen de Horas Hombre en el Informe Final */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Horas-Hombre (HH)</span>
            <span className="text-lg sm:text-xl font-black font-mono text-amber-400 block mt-0.5">
              {horasHombre.totalHH.toLocaleString('es-MX')} HH
            </span>
            <span className="text-[10px] text-slate-500">Esfuerzo global acumulado</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-sky-400 block">Efectivos Desplegados</span>
            <span className="text-lg sm:text-xl font-black font-mono text-white block mt-0.5">
              {horasHombre.totalEfectivos} elementos
            </span>
            <span className="text-[10px] text-slate-500">Personal en líneas de acción</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Costo de Fuerza de Tarea</span>
            <span className="text-lg sm:text-xl font-black font-mono text-emerald-400 block mt-0.5">
              {formatearDinero(horasHombre.totalCosto)}
            </span>
            <span className="text-[10px] text-slate-500">Valoración económica HH</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            horasHombre.fatigaAlertas > 0 ? 'bg-rose-950/40 border-rose-500/40' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className="text-[10px] uppercase font-bold block text-slate-300">Condición de Fatiga</span>
            <span className={`text-lg sm:text-xl font-black font-mono block mt-0.5 ${
              horasHombre.fatigaAlertas > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {horasHombre.fatigaAlertas > 0 ? `${horasHombre.fatigaAlertas} alerta(s)` : 'Rotación Óptima'}
            </span>
            <span className="text-[10px] text-slate-400">NOM-010-SEGOB</span>
          </div>
        </div>

        {/* Tabla resumida de cuadrillas en el informe */}
        {controlHorasHombre?.registros && controlHorasHombre.registros.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900/60 text-[10px] text-slate-400 uppercase font-black">
                <tr>
                  <th className="py-2 px-3">Brigada / Unidad</th>
                  <th className="py-2 px-3">Especialidad</th>
                  <th className="py-2 px-3 text-center">Efectivos</th>
                  <th className="py-2 px-3 text-right">Horas-Hombre</th>
                  <th className="py-2 px-3">Frente Asignado</th>
                  <th className="py-2 px-3 text-center">Fatiga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {controlHorasHombre.registros.slice(0, 5).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-sans font-bold text-slate-200">
                      {r.brigadaUnidad}
                      <span className="text-[10px] text-slate-500 font-normal block font-sans">Líder: {r.responsableLider}</span>
                    </td>
                    <td className="py-2 px-3 text-amber-400 font-sans">{r.especialidad}</td>
                    <td className="py-2 px-3 text-center text-sky-400 font-bold">{r.numeroEfectivos}</td>
                    <td className="py-2 px-3 text-right font-black text-amber-400">{r.totalHorasHombre} HH</td>
                    <td className="py-2 px-3 text-slate-300 font-sans truncate max-w-[180px]">{r.areaOperacion}</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.condicionFatiga === 'Relevo Requerido' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {r.condicionFatiga}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Acciones críticas siguientes 24 horas y Firmas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
          Acciones Críticas Previstas para las Próximas 24 Horas
        </h3>
        <textarea
          rows={3}
          value={data.accionesSiguientes24Horas}
          onChange={(e) => updateField('accionesSiguientes24Horas', e.target.value)}
          placeholder="Prioridades de la siguiente jornada..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-amber-400"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Elaborado Por (Jefe de Planificación):</label>
            <input
              type="text"
              value={data.elaboradoPor}
              onChange={(e) => updateField('elaboradoPor', e.target.value)}
              placeholder="Nombre del responsable"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Autorizado Por (Comandante del Incidente):</label>
            <input
              type="text"
              value={data.autorizadoPorCI || comandante}
              onChange={(e) => updateField('autorizadoPorCI', e.target.value)}
              placeholder="Nombre del CI"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
