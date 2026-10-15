import React, { useState, useMemo } from 'react';
import {
  CentroCostosData,
  ItemFinanciero,
  TipoTransaccionFinanciera,
  EstadoPago,
  IncidentData
} from '../../types/sci';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Fuel,
  Building,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  X,
  FileText
} from 'lucide-react';

interface CostCenterFormProps {
  data: CentroCostosData;
  onChange: (data: CentroCostosData) => void;
  incident?: IncidentData;
}

const CATEGORIAS_POR_TIPO: Record<TipoTransaccionFinanciera, string[]> = {
  Gasto: [
    'Alimentación / Raciones',
    'Hospedaje / Campamento',
    'Transporte / Fletes',
    'Combustible Operativo',
    'Servicios Sanitarios y Básicos',
    'Mantenimiento y Reparaciones',
    'Comunicaciones y Radios',
    'Otros Gastos Corrientes'
  ],
  Adquisición: [
    'Equipo de Protección Personal (EPP)',
    'Herramientas Tácticas de Rescate',
    'Equipos de Radiocomunicación',
    'Generadores y Torres de Iluminación',
    'Material Médico de Larga Duración',
    'Equipo de Bombeo y Mangueras',
    'Otras Adquisiciones Tácticas'
  ],
  Inversión: [
    'Infraestructura de Puesto de Mando (PC)',
    'Sistemas Satelitales y Tecnología de Campo',
    'Centros de Acopio y Albergues Temporales',
    'Acondicionamiento de Helibase / Helipunto',
    'Vehículos y Adaptaciones Móviles',
    'Fondos de Capitalización de Emergencia'
  ],
  Ganancia: [
    'Fondo de Emergencia Gubernamental (FOEN/FONDEN)',
    'Aportación Municipal o Estatal',
    'Donaciones Monetarias Directas',
    'Reembolsos y Recuperación de Seguros',
    'Recuperación de Activos / Salvamento',
    'Aportaciones Interinstitucionales'
  ],
  'Insumo Gastado': [
    'Combustible (Gasolina / Diésel / Turbosina)',
    'Insumos Médicos Desechables y Trauma',
    'Agentes Extintores / Espuma / Retardante',
    'Raciones de Combate e Hidratación',
    'Baterías, Pilas y Fuentes de Poder',
    'Oxígeno y Gases Medicinales',
    'Cintas de Delimitación y Tarjetas Triage',
    'Equipo de Bioseguridad y Cubrebocas'
  ]
};

export const CostCenterForm: React.FC<CostCenterFormProps> = ({ data, onChange, incident }) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'items' | 'graficas'>('resumen');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [itemEnEdicion, setItemEnEdicion] = useState<ItemFinanciero | null>(null);

  // Formulario temporal
  const [formTipo, setFormTipo] = useState<TipoTransaccionFinanciera>('Gasto');
  const [formConcepto, setFormConcepto] = useState<string>('');
  const [formCategoria, setFormCategoria] = useState<string>('');
  const [formFecha, setFormFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formCantidad, setFormCantidad] = useState<number>(1);
  const [formUnidad, setFormUnidad] = useState<string>('Pza');
  const [formCostoUnitario, setFormCostoUnitario] = useState<number>(0);
  const [formResponsable, setFormResponsable] = useState<string>('');
  const [formProveedor, setFormProveedor] = useState<string>('');
  const [formComprobante, setFormComprobante] = useState<string>('');
  const [formEstado, setFormEstado] = useState<EstadoPago>('Pagado');
  const [formNotas, setFormNotas] = useState<string>('');

  // Cálculos financieros
  const metricas = useMemo(() => {
    const items = data.items || [];
    let totalGastos = 0;
    let totalAdquisiciones = 0;
    let totalInversiones = 0;
    let totalInsumosGastados = 0;
    let totalGanancias = 0;

    items.forEach((it) => {
      const monto = Number(it.montoTotal) || 0;
      switch (it.tipo) {
        case 'Gasto':
          totalGastos += monto;
          break;
        case 'Adquisición':
          totalAdquisiciones += monto;
          break;
        case 'Inversión':
          totalInversiones += monto;
          break;
        case 'Insumo Gastado':
          totalInsumosGastados += monto;
          break;
        case 'Ganancia':
          totalGanancias += monto;
          break;
      }
    });

    const totalEgresos = totalGastos + totalAdquisiciones + totalInversiones + totalInsumosGastados;
    const balanceNeto = totalGanancias - totalEgresos;
    const presupuestoDisponible = (data.presupuestoAsignado || 0) + totalGanancias - totalEgresos;

    return {
      totalGastos,
      totalAdquisiciones,
      totalInversiones,
      totalInsumosGastados,
      totalGanancias,
      totalEgresos,
      balanceNeto,
      presupuestoDisponible
    };
  }, [data.items, data.presupuestoAsignado]);

  // Lista filtrada
  const itemsFiltrados = useMemo(() => {
    return (data.items || []).filter((it) => {
      const cumpleFiltro = filtroTipo === 'todos' || it.tipo === filtroTipo;
      const q = busqueda.toLowerCase().trim();
      const cumpleBusqueda =
        !q ||
        it.concepto.toLowerCase().includes(q) ||
        it.categoria.toLowerCase().includes(q) ||
        it.responsable.toLowerCase().includes(q) ||
        (it.proveedorBeneficiario && it.proveedorBeneficiario.toLowerCase().includes(q)) ||
        (it.numComprobante && it.numComprobante.toLowerCase().includes(q));
      return cumpleFiltro && cumpleBusqueda;
    });
  }, [data.items, filtroTipo, busqueda]);

  const abrirCrearModal = () => {
    setItemEnEdicion(null);
    setFormTipo('Gasto');
    setFormConcepto('');
    setFormCategoria(CATEGORIAS_POR_TIPO['Gasto'][0]);
    setFormFecha(new Date().toISOString().slice(0, 10));
    setFormCantidad(1);
    setFormUnidad('Pza');
    setFormCostoUnitario(0);
    setFormResponsable(data.responsableFinanzas || '');
    setFormProveedor('');
    setFormComprobante('');
    setFormEstado('Pagado');
    setFormNotas('');
    setModalAbierto(true);
  };

  const abrirEditarModal = (it: ItemFinanciero) => {
    setItemEnEdicion(it);
    setFormTipo(it.tipo);
    setFormConcepto(it.concepto);
    setFormCategoria(it.categoria);
    setFormFecha(it.fecha);
    setFormCantidad(it.cantidad);
    setFormUnidad(it.unidadMedida || 'Pza');
    setFormCostoUnitario(it.costoUnitario);
    setFormResponsable(it.responsable);
    setFormProveedor(it.proveedorBeneficiario || '');
    setFormComprobante(it.numComprobante || '');
    setFormEstado(it.estadoPago);
    setFormNotas(it.notas || '');
    setModalAbierto(true);
  };

  const guardarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConcepto.trim()) {
      alert('Por favor especifique el concepto del movimiento financiero.');
      return;
    }

    const cantidad = Math.max(0.01, Number(formCantidad) || 1);
    const costoUnit = Math.max(0, Number(formCostoUnitario) || 0);
    const montoTotal = Number((cantidad * costoUnit).toFixed(2));

    const itemGuardar: ItemFinanciero = {
      id: itemEnEdicion ? itemEnEdicion.id : `fin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tipo: formTipo,
      concepto: formConcepto.trim(),
      categoria: formCategoria || CATEGORIAS_POR_TIPO[formTipo][0],
      fecha: formFecha,
      cantidad,
      unidadMedida: formUnidad,
      costoUnitario: costoUnit,
      montoTotal,
      responsable: formResponsable.trim() || 'Oficial de Finanzas',
      proveedorBeneficiario: formProveedor.trim(),
      numComprobante: formComprobante.trim(),
      estadoPago: formEstado,
      notas: formNotas.trim()
    };

    let nuevosItems: ItemFinanciero[];
    if (itemEnEdicion) {
      nuevosItems = (data.items || []).map((it) => (it.id === itemEnEdicion.id ? itemGuardar : it));
    } else {
      nuevosItems = [itemGuardar, ...(data.items || [])];
    }

    onChange({
      ...data,
      items: nuevosItems
    });

    setModalAbierto(false);
    setItemEnEdicion(null);
  };

  const eliminarItem = (id: string) => {
    if (confirm('¿Desea eliminar este registro financiero?')) {
      onChange({
        ...data,
        items: (data.items || []).filter((it) => it.id !== id)
      });
    }
  };

  const formatearDinero = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 2
    }).format(monto);
  };

  const exportarCSV = () => {
    const headers = [
      'ID',
      'Tipo',
      'Fecha',
      'Concepto',
      'Categoría',
      'Cantidad',
      'Unidad',
      'Costo Unitario',
      'Monto Total',
      'Responsable',
      'Proveedor/Beneficiario',
      'Comprobante',
      'Estado',
      'Notas'
    ];

    const rows = (data.items || []).map((it) => [
      it.id,
      it.tipo,
      it.fecha,
      `"${it.concepto.replace(/"/g, '""')}"`,
      `"${it.categoria.replace(/"/g, '""')}"`,
      it.cantidad,
      it.unidadMedida,
      it.costoUnitario,
      it.montoTotal,
      `"${it.responsable.replace(/"/g, '""')}"`,
      `"${(it.proveedorBeneficiario || '').replace(/"/g, '""')}"`,
      `"${(it.numComprobante || '').replace(/"/g, '""')}"`,
      it.estadoPago,
      `"${(it.notas || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Centro_de_Costos_SCI_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              SCI-COSTOS
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">Centro de Costos y Finanzas Operativas</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Control presupuestal, registro de egresos (gastos, adquisiciones, inversiones, insumos) e ingresos del operativo según la sección de Administración y Finanzas del SCI (NOM-010-SEGOB).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            title="Exportar registros a archivo Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={abrirCrearModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Presupuesto Base */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Presupuesto</span>
            <Building className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-white font-mono truncate">
              {formatearDinero(data.presupuestoAsignado || 0)}
            </div>
            <div className="text-[10px] text-slate-500">Asignación inicial</div>
          </div>
        </div>

        {/* Total Ganancias / Fondos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Ganancias / Fondos</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-emerald-400 font-mono truncate">
              {formatearDinero(metricas.totalGanancias)}
            </div>
            <div className="text-[10px] text-slate-500">Ingresos y donaciones</div>
          </div>
        </div>

        {/* Total Egresos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Egresos</span>
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-rose-400 font-mono truncate">
              {formatearDinero(metricas.totalEgresos)}
            </div>
            <div className="text-[10px] text-slate-500">Costos acumulados</div>
          </div>
        </div>

        {/* Insumos Gastados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Insumos Gastados</span>
            <Fuel className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-amber-400 font-mono truncate">
              {formatearDinero(metricas.totalInsumosGastados)}
            </div>
            <div className="text-[10px] text-slate-500">Combustible / Médicos</div>
          </div>
        </div>

        {/* Adquisiciones & Inversiones */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Adquisic. + Inv.</span>
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <div className="mt-2">
            <div className="text-sm sm:text-base font-black text-indigo-400 font-mono truncate">
              {formatearDinero(metricas.totalAdquisiciones + metricas.totalInversiones)}
            </div>
            <div className="text-[10px] text-slate-500">Activos y equipo</div>
          </div>
        </div>

        {/* Balance Operativo */}
        <div className={`rounded-2xl p-4 flex flex-col justify-between border ${
          metricas.balanceNeto >= 0
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider">Balance Saldo</span>
            {metricas.balanceNeto >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
          </div>
          <div className="mt-2">
            <div className={`text-sm sm:text-base font-black font-mono truncate ${metricas.balanceNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatearDinero(metricas.balanceNeto)}
            </div>
            <div className="text-[10px] text-slate-400">
              {metricas.balanceNeto >= 0 ? 'Superávit / Cubierto' : 'Déficit presupuestal'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('resumen')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'resumen'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Gráficas Financieras</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`pb-2.5 px-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
            activeTab === 'items'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Detalle de Movimientos ({(data.items || []).length})</span>
        </button>
      </div>

      {/* TAB 1: GRÁFICAS FINANCIERAS */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Gráfica de Dona: Distribución de Egresos */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Distribución de Egresos por Tipo
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Total: {formatearDinero(metricas.totalEgresos)}
                  </span>
                </div>

                {metricas.totalEgresos === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    No hay egresos registrados aún para graficar.
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                    {/* SVG Donut */}
                    <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {(() => {
                          const total = metricas.totalEgresos;
                          const slices = [
                            { val: metricas.totalGastos, color: '#f59e0b', label: 'Gastos' },
                            { val: metricas.totalAdquisiciones, color: '#3b82f6', label: 'Adquisiciones' },
                            { val: metricas.totalInversiones, color: '#8b5cf6', label: 'Inversiones' },
                            { val: metricas.totalInsumosGastados, color: '#ef4444', label: 'Insumos' }
                          ];

                          let accumulatedPercent = 0;
                          return slices.map((s, idx) => {
                            if (s.val <= 0) return null;
                            const percent = (s.val / total) * 100;
                            const strokeDasharray = `${percent} ${100 - percent}`;
                            const strokeDashoffset = -accumulatedPercent;
                            accumulatedPercent += percent;

                            return (
                              <circle
                                key={idx}
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke={s.color}
                                strokeWidth="18"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                pathLength="100"
                                className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                              />
                            );
                          });
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Egresos</span>
                        <span className="text-xs font-black text-white font-mono">100%</span>
                      </div>
                    </div>

                    {/* Leyenda y porcentajes */}
                    <div className="flex-1 w-full space-y-2">
                      {[
                        {
                          tipo: 'Gastos Corrientes',
                          monto: metricas.totalGastos,
                          color: 'bg-amber-500',
                          textColor: 'text-amber-400'
                        },
                        {
                          tipo: 'Adquisiciones de Equipo',
                          monto: metricas.totalAdquisiciones,
                          color: 'bg-blue-500',
                          textColor: 'text-blue-400'
                        },
                        {
                          tipo: 'Inversiones de Capital',
                          monto: metricas.totalInversiones,
                          color: 'bg-purple-500',
                          textColor: 'text-purple-400'
                        },
                        {
                          tipo: 'Insumos Gastados',
                          monto: metricas.totalInsumosGastados,
                          color: 'bg-rose-500',
                          textColor: 'text-rose-400'
                        }
                      ].map((item, idx) => {
                        const pct = metricas.totalEgresos > 0 ? ((item.monto / metricas.totalEgresos) * 100).toFixed(1) : '0';
                        return (
                          <div key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                <span className="text-slate-300 font-medium">{item.tipo}</span>
                              </div>
                              <span className={`font-mono font-bold ${item.textColor}`}>{pct}%</span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-1 pl-4.5">
                              {formatearDinero(item.monto)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfica de Barras: Comparativa Balance (Entradas vs Salidas) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Balance Financiero (Ingresos vs Egresos)
                    </h3>
                  </div>
                  <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg ${
                    metricas.balanceNeto >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {metricas.balanceNeto >= 0 ? 'Superávit' : 'Déficit'}
                  </span>
                </div>

                <div className="space-y-4 py-2">
                  {/* Barra Ingresos */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Ganancias / Fondos Asignados
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatearDinero(metricas.totalGanancias)}
                      </span>
                    </div>
                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(5, (metricas.totalGanancias / Math.max(metricas.totalGanancias, metricas.totalEgresos, 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Barra Egresos Totales */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-rose-400 font-bold flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Egresos Totales Operativos
                      </span>
                      <span className="font-mono font-bold text-rose-400">
                        {formatearDinero(metricas.totalEgresos)}
                      </span>
                    </div>
                    <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(5, (metricas.totalEgresos / Math.max(metricas.totalGanancias, metricas.totalEgresos, 1)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Desglose de Insumos vs Gastos */}
                  <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">Insumos Gastados</span>
                      <span className="font-mono font-bold text-white text-sm block mt-0.5">
                        {formatearDinero(metricas.totalInsumosGastados)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {metricas.totalEgresos > 0 ? ((metricas.totalInsumosGastados / metricas.totalEgresos) * 100).toFixed(0) : 0}% de egresos
                      </span>
                    </div>

                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-blue-400 block">Adquisiciones + Inv.</span>
                      <span className="font-mono font-bold text-white text-sm block mt-0.5">
                        {formatearDinero(metricas.totalAdquisiciones + metricas.totalInversiones)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {metricas.totalEgresos > 0 ? (((metricas.totalAdquisiciones + metricas.totalInversiones) / metricas.totalEgresos) * 100).toFixed(0) : 0}% de egresos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón rápido a movimientos */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('items')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver tabla de movimientos completa</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Configuración presupuestal general */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Parámetros de Finanzas del Incidente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Presupuesto Global Asignado (MXN):
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={data.presupuestoAsignado || 0}
                  onChange={(e) => onChange({ ...data, presupuestoAsignado: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Fondo de Caja Chica en Sitio (MXN):
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={data.fondoCajaChica || 0}
                  onChange={(e) => onChange({ ...data, fondoCajaChica: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                  Oficial Responsable de Finanzas (SCI):
                </label>
                <input
                  type="text"
                  value={data.responsableFinanzas || ''}
                  onChange={(e) => onChange({ ...data, responsableFinanzas: e.target.value })}
                  placeholder="Nombre y cargo del responsable"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Observaciones y Dictamen Financiero:
              </label>
              <textarea
                rows={2}
                value={data.observacionesFinancieras || ''}
                onChange={(e) => onChange({ ...data, observacionesFinancieras: e.target.value })}
                placeholder="Notas de auditoría, autorizaciones y justificaciones de compras de emergencia..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-emerald-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETALLE DE MOVIMIENTOS */}
      {activeTab === 'items' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Controles de Búsqueda y Filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por concepto, categoría, responsable o factura..."
                className="w-full bg-transparent text-xs text-white outline-none"
              />
              {busqueda && (
                <button type="button" onClick={() => setBusqueda('')} className="text-slate-500 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['todos', 'Gasto', 'Adquisición', 'Inversión', 'Ganancia', 'Insumo Gastado'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filtroTipo === tipo
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tipo === 'todos' ? 'Todos' : tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3">Tipo / Estado</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Concepto & Categoría</th>
                  <th className="py-3 px-3 text-right">Cantidad</th>
                  <th className="py-3 px-3 text-right">P. Unitario</th>
                  <th className="py-3 px-3 text-right">Total (MXN)</th>
                  <th className="py-3 px-3">Responsable / Proveedor</th>
                  <th className="py-3 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 text-xs font-sans">
                      No se encontraron movimientos financieros con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((it) => {
                    const esIngreso = it.tipo === 'Ganancia';
                    return (
                      <tr key={it.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                              it.tipo === 'Ganancia'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : it.tipo === 'Insumo Gastado'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : it.tipo === 'Inversión'
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : it.tipo === 'Adquisición'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {it.tipo}
                          </span>
                          <div className="text-[9px] font-sans text-slate-500 mt-0.5">{it.estadoPago}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 text-[11px]">{it.fecha}</td>

                        <td className="py-2.5 px-3 font-sans min-w-[200px]">
                          <div className="font-bold text-slate-200">{it.concepto}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{it.categoria}</div>
                          {it.numComprobante && (
                            <span className="text-[9px] font-mono text-slate-500 block">Doc: {it.numComprobante}</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-300">
                          {it.cantidad} {it.unidadMedida}
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-400">
                          {formatearDinero(it.costoUnitario)}
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold">
                          <span className={esIngreso ? 'text-emerald-400' : 'text-slate-100'}>
                            {esIngreso ? '+' : '-'} {formatearDinero(it.montoTotal)}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 font-sans text-slate-400 text-[11px]">
                          <div>{it.responsable}</div>
                          {it.proveedorBeneficiario && (
                            <div className="text-[10px] text-slate-500">{it.proveedorBeneficiario}</div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => abrirEditarModal(it)}
                              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Editar movimiento"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarItem(it.id)}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Eliminar movimiento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR MOVIMIENTO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">
                  {itemEnEdicion ? 'Editar Movimiento Financiero' : 'Nuevo Registro de Centro de Costos'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarItem} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Tipo de movimiento */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-black block mb-1.5">
                  Tipo de Movimiento Financiero:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {(['Gasto', 'Adquisición', 'Inversión', 'Ganancia', 'Insumo Gastado'] as TipoTransaccionFinanciera[]).map(
                    (tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => {
                          setFormTipo(tipo);
                          setFormCategoria(CATEGORIAS_POR_TIPO[tipo][0]);
                        }}
                        className={`p-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer border ${
                          formTipo === tipo
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {tipo}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Concepto */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Concepto / Descripción del Movimiento: *
                </label>
                <input
                  type="text"
                  required
                  value={formConcepto}
                  onChange={(e) => setFormConcepto(e.target.value)}
                  placeholder="ej. Diésel para generadores, Compra de camillas, Donación FOEN..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>

              {/* Categoría y Fecha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Categoría:</label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    {CATEGORIAS_POR_TIPO[formTipo].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={(e) => setFormFecha(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Cantidad, Unidad, Costo Unitario y Monto Calculado */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Cantidad:</label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={formCantidad}
                    onChange={(e) => setFormCantidad(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Unidad:</label>
                  <select
                    value={formUnidad}
                    onChange={(e) => setFormUnidad(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Pza">Pza</option>
                    <option value="Litros">Litros</option>
                    <option value="Kits">Kits</option>
                    <option value="Raciones">Raciones</option>
                    <option value="Servicio">Servicio</option>
                    <option value="Día">Día</option>
                    <option value="Horas">Horas</option>
                    <option value="Cajas">Cajas</option>
                    <option value="Fondo">Fondo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Costo Unitario:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formCostoUnitario}
                    onChange={(e) => setFormCostoUnitario(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-emerald-400 uppercase font-black block mb-1">Total Calculado:</label>
                  <div className="w-full bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2 py-1.5 text-emerald-400 font-mono font-black text-center truncate">
                    {formatearDinero((formCantidad || 0) * (formCostoUnitario || 0))}
                  </div>
                </div>
              </div>

              {/* Responsable y Proveedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Responsable del Movimiento:
                  </label>
                  <input
                    type="text"
                    value={formResponsable}
                    onChange={(e) => setFormResponsable(e.target.value)}
                    placeholder="ej. Jefe de Logística, Oficial de Finanzas"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Proveedor / Beneficiario:
                  </label>
                  <input
                    type="text"
                    value={formProveedor}
                    onChange={(e) => setFormProveedor(e.target.value)}
                    placeholder="ej. Gasolinera Insurgentes, Distribuidora Médica"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Comprobante y Estado de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    No. Factura / Remisión / Oficio:
                  </label>
                  <input
                    type="text"
                    value={formComprobante}
                    onChange={(e) => setFormComprobante(e.target.value)}
                    placeholder="ej. FAC-2026-9901, TKT-441"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Estado de Pago:</label>
                  <select
                    value={formEstado}
                    onChange={(e) => setFormEstado(e.target.value as EstadoPago)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Comprometido">Comprometido</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Recibido">Recibido (Ingreso)</option>
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Notas / Justificación:</label>
                <textarea
                  rows={2}
                  value={formNotas}
                  onChange={(e) => setFormNotas(e.target.value)}
                  placeholder="Detalles sobre destino táctico, urgencia o comprobación fiscal..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {itemEnEdicion ? 'Actualizar Registro' : 'Guardar en Centro de Costos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
