import React, { useRef, useState, useEffect } from 'react';
import { TacticalPin, TacticalZone } from '../types/sci';
import {
  Plus,
  Trash2,
  MapPin,
  Eraser,
  Pen,
  ShieldAlert,
  Flag,
  Navigation,
  Satellite,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ExternalLink,
  CheckCircle2,
  Radio,
  Target,
  Circle,
  Sliders,
  Check,
  Shield,
  Eye,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface TacticalSketchPadProps {
  pines: TacticalPin[];
  onUpdatePines: (pines: TacticalPin[]) => void;
  zonas?: TacticalZone[];
  onUpdateZonas?: (zonas: TacticalZone[]) => void;
  notas: string;
  onUpdateNotas: (notas: string) => void;
  drawingData?: string;
  onUpdateDrawing?: (dataUrl: string) => void;
  coordenadasLat?: number | string;
  coordenadasLng?: number | string;
  coordenadasTexto?: string;
  onUpdateCoordinates?: (lat: number, lng: number) => void;
}

export const SCI_SYMBOLS = [
  { tipo: 'PC', label: 'Puesto de Comando', color: '#ea580c', desc: 'Lugar físico donde se ejercen las funciones de mando (Cruz Roja Mexicana).' },
  { tipo: 'E', label: 'Área de Espera', color: '#eab308', desc: 'Lugar donde se concentran los recursos disponibles listos para asignación.' },
  { tipo: 'ACV', label: 'Área Concentración Víctimas', color: '#dc2626', desc: 'Triage START, estabilización médica y puesto de socorro.' },
  { tipo: 'B', label: 'Base', color: '#059669', desc: 'Coordinación y administración de servicios logísticos primarios.' },
  { tipo: 'C', label: 'Campamento', color: '#7c3aed', desc: 'Alojamiento, alimentación e higiene del personal de emergencia.' },
  { tipo: 'H', label: 'Helibase', color: '#2563eb', desc: 'Estacionamiento, abastecimiento y mantenimiento de aeronaves.' },
  { tipo: 'H1', label: 'Helipunto 1', color: '#0284c7', desc: 'Punto de aterrizaje táctico y evacuación aeromédica temporal.' },
  { tipo: 'PELIGRO', label: 'Zona Caliente / Riesgo', color: '#e11d48', desc: 'Perímetro de colapso, materiales peligrosos o exclusión.' },
  { tipo: 'BOMBEROS', label: 'Línea Contraincendio', color: '#f97316', desc: 'Ataque con agua, ventilación o mitigación de fuego.' },
  { tipo: 'POLICIA', label: 'Control Vial / Perímetro', color: '#4f46e5', desc: 'Acordonamiento perimetral y desvío de circulación vehicular.' }
] as const;

// Plantillas de zonas circulares para el Tracker Táctico
export const ZONE_PRESETS: Array<{
  tipo: TacticalZone['tipo'];
  nombre: string;
  radio: number; // Porcentaje del mapa
  radioMetros: number;
  color: string;
  opacidad: number;
  estiloBorde: TacticalZone['estiloBorde'];
  desc: string;
}> = [
  {
    tipo: 'caliente',
    nombre: 'Zona Caliente / Exclusión',
    radio: 12,
    radioMetros: 100,
    color: '#ef4444',
    opacidad: 0.28,
    estiloBorde: 'radar_pulse',
    desc: 'Área de máximo peligro inmediato, riesgo estructural o materiales peligrosos.'
  },
  {
    tipo: 'tibia',
    nombre: 'Zona Tibia / Descontaminación',
    radio: 20,
    radioMetros: 200,
    color: '#f97316',
    opacidad: 0.22,
    estiloBorde: 'punteado',
    desc: 'Área de descontaminación, control de acceso y apoyo directo a la zona caliente.'
  },
  {
    tipo: 'perimetro',
    nombre: 'Perímetro de Seguridad Vial',
    radio: 28,
    radioMetros: 350,
    color: '#eab308',
    opacidad: 0.16,
    estiloBorde: 'punteado',
    desc: 'Cordón de seguridad, restricción vial y control perimetral policiaco.'
  },
  {
    tipo: 'busqueda_tracker',
    nombre: 'Sector Rastreo Tracker / Búsqueda',
    radio: 35,
    radioMetros: 500,
    color: '#3b82f6',
    opacidad: 0.18,
    estiloBorde: 'radar_pulse',
    desc: 'Cuadrante circular georreferenciado para tracker GPS de búsqueda y rescate.'
  },
  {
    tipo: 'fria',
    nombre: 'Zona Fría / Soporte Logístico',
    radio: 24,
    radioMetros: 250,
    color: '#10b981',
    opacidad: 0.15,
    estiloBorde: 'solido',
    desc: 'Zona segura donde se ubica el PC, ACV, Base y prensa.'
  },
  {
    tipo: 'evacuacion',
    nombre: 'Radio de Evacuación Preventiva',
    radio: 42,
    radioMetros: 750,
    color: '#a855f7',
    opacidad: 0.15,
    estiloBorde: 'punteado',
    desc: 'Perímetro amplio de alertamiento y evacuación comunitaria.'
  }
];

export const TacticalSketchPad: React.FC<TacticalSketchPadProps> = ({
  pines = [],
  onUpdatePines,
  zonas = [],
  onUpdateZonas,
  notas = '',
  onUpdateNotas,
  drawingData,
  onUpdateDrawing,
  coordenadasLat = 19.4195,
  coordenadasLng = -99.1628,
  coordenadasTexto,
  onUpdateCoordinates
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Modos de interacción: 'symbols' (fijar pines), 'zones' (marcar zonas/círculos tracker), 'draw' (rutas a mano)
  const [activeMode, setActiveMode] = useState<'symbols' | 'zones' | 'draw'>('symbols');
  const [activePinType, setActivePinType] = useState<typeof SCI_SYMBOLS[number]['tipo']>('PC');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  // Control de tamaño de iconos de simbología SCI (pequeños por solicitud del usuario)
  const [iconSize, setIconSize] = useState<'pequeno' | 'normal'>('pequeno');

  // Estado de zonas circulares tipo Tracker
  const [localZonas, setLocalZonas] = useState<TacticalZone[]>(zonas || []);
  const [activeZonePreset, setActiveZonePreset] = useState<typeof ZONE_PRESETS[number]>(ZONE_PRESETS[0]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Sincronizar zonas externas si se proveen
  useEffect(() => {
    if (zonas) {
      setLocalZonas(zonas);
    }
  }, [zonas]);

  const updateZonas = (newZonas: TacticalZone[]) => {
    setLocalZonas(newZonas);
    if (onUpdateZonas) {
      onUpdateZonas(newZonas);
    }
  };

  // Trazo a mano alzada
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ea580c');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'grid'>('satellite');
  const [mapZoom, setMapZoom] = useState(17);

  const numLat = typeof coordenadasLat === 'number' ? coordenadasLat : parseFloat(String(coordenadasLat)) || 19.4195;
  const numLng = typeof coordenadasLng === 'number' ? coordenadasLng : parseFloat(String(coordenadasLng)) || -99.1628;

  // Sincronizar canvas de dibujo libre
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = drawingData;
    }
  }, [drawingData]);

  // Clic en el croquis para situar símbolos o zonas circulares
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMode === 'draw') return;
    if (!containerRef.current) return;

    // Si hizo clic en un pin o zona existente, no crear otro automáticamente
    if ((e.target as HTMLElement).closest('.tactical-pin')) return;
    if ((e.target as HTMLElement).closest('.tactical-zone-handle')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(2, Math.min(98, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    // Calcular coordenadas georreferenciadas basadas en el zoom y desviación respecto al centro
    const zoomFactor = Math.pow(2, 17 - mapZoom);
    const latOffset = ((50 - y) / 100) * 0.0025 * zoomFactor;
    const lngOffset = ((x - 50) / 100) * 0.0025 * zoomFactor;
    const pointLat = parseFloat((numLat + latOffset).toFixed(5));
    const pointLng = parseFloat((numLng + lngOffset).toFixed(5));

    // MODO ZONAS / CÍRCULOS TRACKER
    if (activeMode === 'zones') {
      const preset = activeZonePreset;
      const newZone: TacticalZone = {
        id: `zone-${Date.now()}`,
        nombre: `${preset.nombre} (${localZonas.length + 1})`,
        tipo: preset.tipo,
        x,
        y,
        radio: preset.radio,
        radioMetros: preset.radioMetros,
        color: preset.color,
        opacidad: preset.opacidad,
        estiloBorde: preset.estiloBorde,
        descripcion: preset.desc,
        coordenadasCentro: `${pointLat}° N, ${pointLng}° O`
      };

      const updated = [...localZonas, newZone];
      updateZonas(updated);
      setSelectedZoneId(newZone.id);
      setSelectedPinId(null);
      return;
    }

    // MODO SIMBOLOGÍA SCI (PINES)
    const sym = SCI_SYMBOLS.find((s) => s.tipo === activePinType) || SCI_SYMBOLS[0];
    const newPin: TacticalPin = {
      id: `pin-${Date.now()}`,
      tipo: sym.tipo,
      label: `${sym.tipo} - ${sym.label}`,
      x,
      y,
      color: sym.color,
      coordenadas: `${pointLat}° N, ${pointLng}° O`
    };

    onUpdatePines([...pines, newPin]);
    setSelectedPinId(newPin.id);
    setSelectedZoneId(null);
  };

  const removePin = (id: string) => {
    onUpdatePines(pines.filter((p) => p.id !== id));
    if (selectedPinId === id) setSelectedPinId(null);
  };

  const removeZone = (id: string) => {
    const updated = localZonas.filter((z) => z.id !== id);
    updateZonas(updated);
    if (selectedZoneId === id) setSelectedZoneId(null);
  };

  // Situar automáticamente el Puesto de Comando (PC) en el centro
  const handlePlacePCAtCenter = () => {
    const sym = SCI_SYMBOLS.find((s) => s.tipo === 'PC') || SCI_SYMBOLS[0];
    const newPin: TacticalPin = {
      id: `pin-${Date.now()}`,
      tipo: 'PC',
      label: 'PC - Puesto de Comando (Punto Cero)',
      x: 50,
      y: 50,
      color: sym.color,
      coordenadas: `${numLat.toFixed(5)}° N, ${numLng.toFixed(5)}° O`
    };
    onUpdatePines([...pines.filter((p) => p.tipo !== 'PC'), newPin]);
    setSelectedPinId(newPin.id);
  };

  // Situar rápidamente un Perímetro de Seguridad Tracker 360° en el Punto Cero
  const handlePlacePerimeterAtCenter = () => {
    const preset = activeZonePreset || ZONE_PRESETS[0];
    const newZone: TacticalZone = {
      id: `zone-${Date.now()}`,
      nombre: 'Perímetro Táctico 360° (Punto Cero)',
      tipo: 'perimetro',
      x: 50,
      y: 50,
      radio: 22,
      radioMetros: 250,
      color: '#eab308',
      opacidad: 0.2,
      estiloBorde: 'radar_pulse',
      descripcion: 'Zona de control y acordonamiento concéntrico al Punto Cero',
      coordenadasCentro: `${numLat.toFixed(5)}° N, ${numLng.toFixed(5)}° O`
    };
    const updated = [...localZonas, newZone];
    updateZonas(updated);
    setSelectedZoneId(newZone.id);
    setActiveMode('zones');
  };

  // Trazo libre
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeMode !== 'draw') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeMode !== 'draw' || !isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && onUpdateDrawing) {
      onUpdateDrawing(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvasDrawings = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onUpdateDrawing) {
      onUpdateDrawing('');
    }
  };

  const selectedZone = localZonas.find((z) => z.id === selectedZoneId);

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas: Simbología, Zonas Tracker y Capas de Mapa */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 flex flex-col gap-3 shadow-md">
        {/* Pestañas Principales de Modo de Trabajo */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveMode('symbols');
                setSelectedZoneId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'symbols'
                  ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Simbología SCI ({pines.length})</span>
            </button>

            {/* MODO ZONAS TRACKER / CÍRCULOS (SOLICITADO) */}
            <button
              type="button"
              onClick={() => {
                setActiveMode('zones');
                setSelectedPinId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'zones'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-black ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
              <span>Zonas Tracker / Círculos ({localZonas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode('draw');
                setSelectedPinId(null);
                setSelectedZoneId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'draw'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pen className="w-3.5 h-3.5" />
              <span>Trazar Rutas</span>
            </button>
          </div>

          {/* Selector de Tamaño de Iconos (Simbología más pequeña solicitada) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-400 font-semibold hidden sm:inline">Iconos SCI:</span>
              <button
                type="button"
                onClick={() => setIconSize('pequeno')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  iconSize === 'pequeno'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Iconos más pequeños y compactos para no saturar la vista satelital"
              >
                <Minimize2 className="w-3 h-3" />
                <span>Pequeños</span>
              </button>
              <button
                type="button"
                onClick={() => setIconSize('normal')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  iconSize === 'normal'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Iconos en tamaño estándar amplio"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Normal</span>
              </button>
            </div>
          </div>
        </div>

        {/* SUB-BARRA 1: SELECCIÓN DE SÍMBOLOS SCI CUANDO ESTÁ EN MODO SÍMBOLOS */}
        {activeMode === 'symbols' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              Fijar en Mapa:
            </span>
            {SCI_SYMBOLS.map((s) => (
              <button
                key={s.tipo}
                type="button"
                onClick={() => setActivePinType(s.tipo)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  activePinType === s.tipo
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/25 ring-2 ring-orange-400 scale-105'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
                title={s.desc}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span>{s.tipo}</span>
              </button>
            ))}
          </div>
        )}

        {/* SUB-BARRA 2: HERRAMIENTAS DE ZONAS TRACKER / CÍRCULOS (SOLICITADO) */}
        {activeMode === 'zones' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-blue-400 font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-400 animate-pulse" />
                Haga clic en el mapa para situar el círculo de la zona seleccionada:
              </span>
              <button
                type="button"
                onClick={handlePlacePerimeterAtCenter}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold cursor-pointer transition"
                title="Trazar inmediatamente un perímetro concéntrico en el Punto Cero"
              >
                <Circle className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Perímetro 360° en Punto Cero</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {ZONE_PRESETS.map((p) => {
                const isSelected = activeZonePreset.tipo === p.tipo;
                return (
                  <button
                    key={p.tipo}
                    type="button"
                    onClick={() => setActiveZonePreset(p)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white border-2 shadow-lg scale-102'
                        : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                    style={{
                      borderColor: isSelected ? p.color : undefined
                    }}
                    title={p.desc}
                  >
                    <span
                      className="w-3 h-3 rounded-full inline-block shrink-0 shadow-sm ring-1 ring-white/50"
                      style={{ backgroundColor: p.color }}
                    />
                    <span>{p.nombre}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                      ~{p.radioMetros}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB-BARRA 3: DIBUJO LIBRE */}
        {activeMode === 'draw' && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300 font-semibold">Color de Trazo:</span>
              <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                {['#ea580c', '#eab308', '#dc2626', '#2563eb', '#10b981', '#a855f7'].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setDrawColor(col)}
                    className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                      drawColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={clearCanvasDrawings}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/30 cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Borrar Trazos</span>
            </button>
          </div>
        )}

        {/* Fila Inferior: Capas de Mapa (Satélite / Callejero / Cuadrícula), Zoom y Punto Cero */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-amber-300" />
              <span>Satélite</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('streets')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapLayer === 'streets'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Callejero</span>
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                mapLayer === 'grid'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Cuadrícula</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {mapLayer !== 'grid' && (
              <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setMapZoom(Math.min(mapZoom + 1, 20))}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Acercar vista satelital"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-2 text-amber-400 font-bold">{mapZoom}z</span>
                <button
                  type="button"
                  onClick={() => setMapZoom(Math.max(mapZoom - 1, 14))}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                  title="Alejar vista satelital"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePlacePCAtCenter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-semibold cursor-pointer transition-all"
              title="Situar el Puesto de Comando (PC) en las coordenadas centrales del incidente"
            >
              <Crosshair className="w-3.5 h-3.5 text-orange-400" />
              <span>Fijar PC al Centro</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISOR TÁCTICO CON MAPA SATELITAL, CÍRCULOS TRACKER Y PINES COMPACTOS */}
      {/* ========================================================================= */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full h-[440px] sm:h-[520px] rounded-3xl border-2 border-slate-700/80 overflow-hidden shadow-2xl select-none cursor-crosshair bg-slate-950"
      >
        {/* Capa de Mapa Satelital de Google */}
        {mapLayer === 'satellite' && (
          <iframe
            title="Croquis Táctico Satelital Conectado"
            src={`https://maps.google.com/maps?q=${numLat},${numLng}&t=k&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-90 brightness-95 contrast-105"
            style={{ border: 0 }}
          />
        )}

        {mapLayer === 'streets' && (
          <iframe
            title="Croquis Táctico Callejero Conectado"
            src={`https://maps.google.com/maps?q=${numLat},${numLng}&t=m&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-90"
            style={{ border: 0 }}
          />
        )}

        {mapLayer === 'grid' && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%),
                linear-gradient(to right, rgba(51, 65, 85, 0.25) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(51, 65, 85, 0.25) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 36px 36px, 36px 36px'
            }}
          />
        )}

        {/* Retícula Táctica Semitransparente */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Mira central Punto Cero (Referencia Geográfica del Incidente) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-75 flex flex-col items-center">
          <Crosshair className="w-7 h-7 text-amber-400 stroke-1 drop-shadow-lg" />
          <span className="text-[8px] font-mono text-amber-300 bg-slate-950/85 px-1.5 py-0.5 rounded border border-slate-700 -mt-1 font-bold">
            PUNTO CERO ({numLat.toFixed(4)}°, {numLng.toFixed(4)}°)
          </span>
        </div>

        {/* Badge Flotante Superior Izquierdo: Coordenadas y Orientación */}
        <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-200 font-mono flex items-center gap-2 pointer-events-none z-20 shadow-xl">
          <Navigation className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
          <span className="text-white font-bold">NORTE ↑</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">
            {numLat.toFixed(5)}° N, {numLng.toFixed(5)}° O
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Satélite
          </span>
        </div>

        {/* Badge Flotante Superior Derecho: Contadores */}
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 pointer-events-none z-20 flex items-center gap-3 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-black text-white">{pines.length}</span>
            <span className="font-semibold text-slate-400">Pines</span>
          </div>
          {localZonas.length > 0 && (
            <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="font-black text-blue-300">{localZonas.length}</span>
              <span className="font-semibold text-slate-400">Zonas Tracker</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* CAPA DE ZONAS CIRCULARES Y PERÍMETROS TRACKER (SVG OVERLAY) */}
        {/* ========================================================================= */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
          <defs>
            {localZonas.map((zone) => (
              <radialGradient key={`grad-${zone.id}`} id={`grad-${zone.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={zone.color} stopOpacity={zone.opacidad * 1.5} />
                <stop offset="70%" stopColor={zone.color} stopOpacity={zone.opacidad * 0.8} />
                <stop offset="100%" stopColor={zone.color} stopOpacity={zone.opacidad * 0.3} />
              </radialGradient>
            ))}
          </defs>

          {localZonas.map((zone) => {
            const isSelected = selectedZoneId === zone.id;
            // Radio en porcentaje respecto al contenedor
            const rPercent = `${zone.radio}%`;

            return (
              <g key={zone.id} className="transition-all">
                {/* Círculo Principal con Relleno Semitransparente */}
                <circle
                  cx={`${zone.x}%`}
                  cy={`${zone.y}%`}
                  r={rPercent}
                  fill={`url(#grad-${zone.id})`}
                  stroke={zone.color}
                  strokeWidth={isSelected ? '3.5' : '2'}
                  strokeDasharray={
                    zone.estiloBorde === 'punteado'
                      ? '6,4'
                      : zone.estiloBorde === 'radar_pulse'
                      ? '8,5'
                      : 'none'
                  }
                  className="transition-all"
                />

                {/* Efecto Radar Pulsante Tracker si es estilo radar o está seleccionada */}
                {(zone.estiloBorde === 'radar_pulse' || isSelected) && (
                  <circle
                    cx={`${zone.x}%`}
                    cy={`${zone.y}%`}
                    r={`${Math.min(zone.radio * 1.15, 48)}%`}
                    fill="none"
                    stroke={zone.color}
                    strokeWidth="1.5"
                    strokeOpacity="0.45"
                    strokeDasharray="4,4"
                    className="animate-pulse"
                  />
                )}

                {/* Mira central de la zona tracker */}
                <circle
                  cx={`${zone.x}%`}
                  cy={`${zone.y}%`}
                  r="3.5"
                  fill="#ffffff"
                  stroke={zone.color}
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Elementos interactivos HTML para seleccionar o interactuar con cada zona tracker */}
        {localZonas.map((zone) => {
          const isSelected = selectedZoneId === zone.id;
          return (
            <div
              key={`handle-${zone.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedZoneId(zone.id);
                setSelectedPinId(null);
              }}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`tactical-zone-handle absolute z-25 group cursor-pointer transition-transform select-none flex flex-col items-center pointer-events-auto ${
                isSelected ? 'scale-110 z-35' : 'hover:scale-105'
              }`}
            >
              {/* Etiqueta Flotante de la Zona Tracker */}
              <div
                className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-black shadow-xl backdrop-blur-md border flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-slate-950 text-white ring-2 ring-white border-white scale-110'
                    : 'bg-slate-950/85 text-slate-200 border-slate-700 hover:border-white/80'
                }`}
                style={{
                  borderLeftColor: zone.color,
                  borderLeftWidth: '4px'
                }}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0 animate-ping"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-extrabold">{zone.nombre}</span>
                <span className="font-mono text-amber-300 text-[9px] font-bold">
                  {zone.radioMetros ? `~${zone.radioMetros}m` : `${zone.radio}%`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Lienzo de Trazo Libre */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={drawMove}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={drawMove}
          onTouchEnd={stopDraw}
          className={`absolute inset-0 w-full h-full z-18 ${
            activeMode === 'draw' ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* ========================================================================= */}
        {/* MARCADORES E INSTALACIONES DEL SCI (TAMAÑO MÁS PEQUEÑO SOLICITADO) */}
        {/* ========================================================================= */}
        {pines.map((pin) => {
          const isSelected = selectedPinId === pin.id;
          const isSmall = iconSize === 'pequeno';

          return (
            <div
              key={pin.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPinId(pin.id);
                setSelectedZoneId(null);
              }}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`tactical-pin absolute z-30 group cursor-pointer transition-transform select-none ${
                isSelected ? 'scale-115 z-40 ring-2 ring-white rounded-xl shadow-2xl' : 'hover:scale-110'
              }`}
            >
              {/* Emblema / Símbolo Táctico (Más pequeño y refinado) */}
              <div
                className={`flex items-center justify-center font-black text-white shadow-xl border tracking-tight transition-all ${
                  isSmall
                    ? 'min-w-[26px] h-[26px] px-1.5 rounded-lg text-[9.5px] border-[1.5px] border-white shadow-md'
                    : 'min-w-[34px] h-[34px] px-2 rounded-xl text-xs border-2 border-white shadow-lg'
                }`}
                style={{ backgroundColor: pin.color }}
              >
                {pin.tipo}
              </div>

              {/* Etiqueta Flotante Compacta con Coordenadas */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-slate-950/90 text-slate-100 rounded-md shadow-xl border border-slate-700/80 backdrop-blur-md pointer-events-none text-center ${
                  isSmall ? 'text-[8.5px] px-1.5 py-0.5' : 'text-[9.5px] px-2 py-0.8'
                }`}
              >
                <div className="text-white font-extrabold">{pin.label}</div>
                {pin.coordenadas && (
                  <div className="text-[8px] font-mono text-amber-300 font-semibold">{pin.coordenadas}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* INSPECTOR / EDITOR DE ZONA TRACKER SELECCIONADA */}
      {/* ========================================================================= */}
      {selectedZone && (
        <div className="bg-slate-900 border border-blue-500/50 rounded-2xl p-4 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md"
                style={{ backgroundColor: selectedZone.color }}
              >
                <Radio className="w-4 h-4 text-white" />
              </span>
              <div>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                  Configuración de Zona / Círculo Tracker
                </span>
                <input
                  type="text"
                  value={selectedZone.nombre}
                  onChange={(e) => {
                    const updated = localZonas.map((z) =>
                      z.id === selectedZone.id ? { ...z, nombre: e.target.value } : z
                    );
                    updateZonas(updated);
                  }}
                  className="bg-slate-950 text-white font-bold text-xs border border-slate-700 rounded-lg px-2.5 py-1 focus:border-blue-400 outline-none w-64 sm:w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedZone.coordenadasCentro && (
                <span className="text-xs text-amber-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  Centro: {selectedZone.coordenadasCentro}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeZone(selectedZone.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-600 rounded-lg border border-rose-500/30 transition cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Zona</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedZoneId(null)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>

          {/* Ajuste de Radio (Métrico y Slider) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {/* Slider de Radio */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400 font-semibold">Radio de Cobertura:</span>
                <span className="text-amber-400 font-bold font-mono">
                  {selectedZone.radioMetros ? `~${selectedZone.radioMetros} metros` : `${selectedZone.radio}%`}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="48"
                step="1"
                value={selectedZone.radio}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 10;
                  const metros = Math.round(val * 18);
                  const updated = localZonas.map((z) =>
                    z.id === selectedZone.id ? { ...z, radio: val, radioMetros: metros } : z
                  );
                  updateZonas(updated);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 mt-1.5">
                {[50, 100, 200, 350, 500, 800].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      const rPercent = Math.max(6, Math.min(46, Math.round(m / 18)));
                      const updated = localZonas.map((z) =>
                        z.id === selectedZone.id ? { ...z, radio: rPercent, radioMetros: m } : z
                      );
                      updateZonas(updated);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-blue-600 text-slate-300 hover:text-white font-mono text-[9px] border border-slate-800 cursor-pointer"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color y Nivel de Peligro */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Color / Nivel Táctico:</label>
              <div className="flex items-center gap-2">
                {[
                  { col: '#ef4444', label: 'Rojo' },
                  { col: '#f97316', label: 'Naranja' },
                  { col: '#eab308', label: 'Amarillo' },
                  { col: '#10b981', label: 'Verde' },
                  { col: '#3b82f6', label: 'Azul' },
                  { col: '#a855f7', label: 'Púrpura' }
                ].map((c) => (
                  <button
                    key={c.col}
                    type="button"
                    onClick={() => {
                      const updated = localZonas.map((z) =>
                        z.id === selectedZone.id ? { ...z, color: c.col } : z
                      );
                      updateZonas(updated);
                    }}
                    className={`w-6 h-6 rounded-full transition cursor-pointer ${
                      selectedZone.color === c.col ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.col }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            {/* Estilo de Perímetro Tracker */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Estilo de Línea:</label>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                {(['radar_pulse', 'punteado', 'solido'] as const).map((estilo) => (
                  <button
                    key={estilo}
                    type="button"
                    onClick={() => {
                      const updated = localZonas.map((z) =>
                        z.id === selectedZone.id ? { ...z, estiloBorde: estilo } : z
                      );
                      updateZonas(updated);
                    }}
                    className={`px-2 py-1 rounded-lg font-semibold transition cursor-pointer capitalize ${
                      selectedZone.estiloBorde === estilo
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {estilo === 'radar_pulse' ? 'Pulso Radar' : estilo}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDITOR DEL MARCADOR DE SIMBOLOGÍA SCI SELECCIONADO */}
      {/* ========================================================================= */}
      {selectedPinId && (
        (() => {
          const pin = pines.find((p) => p.id === selectedPinId);
          if (!pin) return null;
          return (
            <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-xs border-2 border-white shadow-md"
                  style={{ backgroundColor: pin.color }}
                >
                  {pin.tipo}
                </div>
                <div>
                  <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                    Editar Instalación SCI Seleccionada
                  </div>
                  <input
                    type="text"
                    value={pin.label}
                    onChange={(e) => {
                      const updated = pines.map((p) => (p.id === pin.id ? { ...p, label: e.target.value } : p));
                      onUpdatePines(updated);
                    }}
                    className="block text-xs sm:text-sm font-bold text-white bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 mt-0.5 focus:border-amber-400 outline-none w-64 sm:w-80"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pin.coordenadas && (
                  <span className="text-xs text-amber-300 font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    GPS: {pin.coordenadas}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePin(pin.id)}
                  className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-600 px-3 py-1.5 rounded-xl border border-rose-500/40 transition-colors cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar Marcador
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPinId(null)}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Listo
                </button>
              </div>
            </div>
          );
        })()
      )}

      {/* ========================================================================= */}
      {/* LISTADO DE ZONAS Y PERÍMETROS TRACKER REGISTRADOS */}
      {/* ========================================================================= */}
      {localZonas.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Zonas y Perímetros Tácticos Tracker en el Mapa ({localZonas.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => updateZonas([])}
              className="text-slate-500 hover:text-rose-400 text-xs underline cursor-pointer"
            >
              Borrar todas las zonas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {localZonas.map((zone) => (
              <div
                key={zone.id}
                onClick={() => {
                  setSelectedZoneId(zone.id);
                  setSelectedPinId(null);
                }}
                className={`bg-slate-950 p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedZoneId === zone.id
                    ? 'border-blue-500 ring-1 ring-blue-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: zone.color }}
                  >
                    <Radio className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{zone.nombre}</div>
                    <div className="text-[10px] font-mono text-amber-300 truncate">
                      {zone.radioMetros ? `Radio: ~${zone.radioMetros}m` : `Radio: ${zone.radio}%`}
                      {zone.coordenadasCentro ? ` · ${zone.coordenadasCentro}` : ''}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeZone(zone.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg shrink-0 ml-1 cursor-pointer"
                  title="Eliminar esta zona tracker"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTADO DE INSTALACIONES DEL SCI GEORREFERENCIADAS */}
      {pines.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Instalaciones SCI Georreferenciadas en la Escena ({pines.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onUpdatePines([])}
              className="text-slate-500 hover:text-rose-400 text-xs underline cursor-pointer"
            >
              Borrar todas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {pines.map((pin) => (
              <div
                key={pin.id}
                onClick={() => {
                  setSelectedPinId(pin.id);
                  setSelectedZoneId(null);
                }}
                className={`bg-slate-950 p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPinId === pin.id
                    ? 'border-orange-500 ring-1 ring-orange-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-[10px] shrink-0 border border-white/60"
                    style={{ backgroundColor: pin.color }}
                  >
                    {pin.tipo}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{pin.label}</div>
                    <div className="text-[10px] font-mono text-amber-300 truncate">
                      {pin.coordenadas || `${numLat}° N, ${numLng}° O`}
                    </div>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    pin.coordenadas?.replace(/° [NO]/g, '') || `${numLat},${numLng}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-900 rounded-lg shrink-0 ml-1"
                  title="Ver coordenadas en Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notas de Ubicación y Rutas Tácticas */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Notas de Ubicación, Rutas de Acceso y Evacuación de la Escena (SCI-201):
        </label>
        <textarea
          value={notas}
          onChange={(e) => onUpdateNotas(e.target.value)}
          rows={2}
          placeholder="Ej: Acceso prioritario de ambulancias por calle Orizaba. Ruta de evacuación hacia el oriente. Viento dominante del NE. Zona caliente delimitada a 50m."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        />
      </div>
    </div>
  );
};
