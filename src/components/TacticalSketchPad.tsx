import React, { useRef, useState, useEffect } from 'react';
import { TacticalPin } from '../types/sci';
import {
  Plus,
  Trash2,
  MapPin,
  Eraser,
  Pen,
  ShieldAlert,
  Flag,
  HelpCircle,
  Navigation,
  Satellite,
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ExternalLink,
  LocateFixed,
  Compass,
  CheckCircle2,
  Radio,
  Eye,
  RotateCcw
} from 'lucide-react';

interface TacticalSketchPadProps {
  pines: TacticalPin[];
  onUpdatePines: (pines: TacticalPin[]) => void;
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

export const TacticalSketchPad: React.FC<TacticalSketchPadProps> = ({
  pines = [],
  onUpdatePines,
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
  const [activePinType, setActivePinType] = useState<typeof SCI_SYMBOLS[number]['tipo']>('PC');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isDrawMode, setIsDrawMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#ea580c');
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'grid'>('satellite');
  const [mapZoom, setMapZoom] = useState(17);

  const numLat = typeof coordenadasLat === 'number' ? coordenadasLat : parseFloat(String(coordenadasLat)) || 19.4195;
  const numLng = typeof coordenadasLng === 'number' ? coordenadasLng : parseFloat(String(coordenadasLng)) || -99.1628;

  // Sincronizar canvas de dibujo
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

  // Al hacer clic en el mapa satelital para situar una instalación SCI
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawMode) return;
    if (!containerRef.current) return;

    // Si hizo clic en un pin existente, no crear otro
    if ((e.target as HTMLElement).closest('.tactical-pin')) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(2, Math.min(98, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(2, Math.min(98, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    // Calcular coordenadas georreferenciadas reales aproximadas del pin
    // basadas en el zoom y desviación respecto al centro (Punto Cero)
    const zoomFactor = Math.pow(2, 17 - mapZoom);
    const latOffset = ((50 - y) / 100) * 0.0025 * zoomFactor;
    const lngOffset = ((x - 50) / 100) * 0.0025 * zoomFactor;
    const pinLat = parseFloat((numLat + latOffset).toFixed(5));
    const pinLng = parseFloat((numLng + lngOffset).toFixed(5));

    const sym = SCI_SYMBOLS.find((s) => s.tipo === activePinType) || SCI_SYMBOLS[0];
    const newPin: TacticalPin = {
      id: `pin-${Date.now()}`,
      tipo: sym.tipo,
      label: `${sym.tipo} - ${sym.label}`,
      x,
      y,
      color: sym.color,
      coordenadas: `${pinLat}° N, ${pinLng}° O`
    };

    onUpdatePines([...pines, newPin]);
    setSelectedPinId(newPin.id);
  };

  const removePin = (id: string) => {
    onUpdatePines(pines.filter((p) => p.id !== id));
    if (selectedPinId === id) setSelectedPinId(null);
  };

  // Posicionar automáticamente el Puesto de Comando en el centro
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

  // Dibujo táctico a mano alzada
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
    if (!isDrawMode) return;
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
    if (!isDrawMode || !isDrawing) return;
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

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas: Simbología Oficial SCI & Modos de Mapa */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-sm">
        {/* Fila 1: Selección de Símbolos SCI de la Coordinación de Socorros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-orange-400" />
            Simbología SCI:
          </span>
          {SCI_SYMBOLS.map((s) => (
            <button
              key={s.tipo}
              type="button"
              onClick={() => {
                setActivePinType(s.tipo);
                setIsDrawMode(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                !isDrawMode && activePinType === s.tipo
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

        {/* Fila 2: Capas de Mapa (Satélite / Callejero / Cuadrícula), Zoom y Trazo */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
          {/* Selector de Capa de Mapa Georreferenciado */}
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
              <span>Satélite Enlazado</span>
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

          {/* Controles de Zoom y Centrado */}
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

            {/* Botón rápido para fijar PC en Punto Cero */}
            <button
              type="button"
              onClick={handlePlacePCAtCenter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/30 text-xs font-semibold cursor-pointer transition-all"
              title="Situar el Puesto de Comando (PC) en las coordenadas centrales del incidente"
            >
              <Crosshair className="w-3.5 h-3.5 text-orange-400" />
              <span>Fijar PC al Centro</span>
            </button>

            {/* Modo de trazo táctico (iPad Apple Pencil / Dedo) */}
            <button
              type="button"
              onClick={() => setIsDrawMode(!isDrawMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDrawMode
                  ? 'bg-rose-500 text-white ring-2 ring-rose-400 shadow-md shadow-rose-500/25'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Pen className="w-3.5 h-3.5" />
              <span>{isDrawMode ? 'Dibujando Rutas' : 'Trazar Rutas'}</span>
            </button>

            {isDrawMode && (
              <>
                <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                  {['#ea580c', '#eab308', '#dc2626', '#2563eb', '#10b981'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setDrawColor(col)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        drawColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearCanvasDrawings}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-lg border border-rose-500/30 cursor-pointer"
                  title="Borrar trazos libres"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* VISOR TÁCTICO CONECTADO AL MAPA SATELITAL DE GOOGLE */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative w-full h-[420px] sm:h-[500px] rounded-3xl border-2 border-slate-700/80 overflow-hidden shadow-2xl select-none cursor-crosshair bg-slate-950"
      >
        {/* CAPA DE MAPA SATELITAL AUTOMÁTICA EN TIEMPO REAL */}
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
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Mira central Punto Cero (Punto de Referencia del Incidente) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 opacity-75 flex flex-col items-center">
          <Crosshair className="w-8 h-8 text-amber-400 stroke-1 drop-shadow-lg" />
          <span className="text-[8.5px] font-mono text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-700 -mt-1 font-bold">
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
            Satélite Sincronizado
          </span>
        </div>

        {/* Badge Flotante Superior Derecho: Conteo de Instalaciones */}
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 pointer-events-none z-20 flex items-center gap-2 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-black text-white">{pines.length}</span>
          <span className="font-semibold">Instalaciones Tácticas</span>
        </div>

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
          className={`absolute inset-0 w-full h-full z-15 ${
            isDrawMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* Marcadores e Instalaciones del SCI en el Croquis */}
        {pines.map((pin) => {
          const isSelected = selectedPinId === pin.id;
          return (
            <div
              key={pin.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPinId(pin.id);
              }}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`tactical-pin absolute z-30 group cursor-pointer transition-transform select-none ${
                isSelected ? 'scale-125 z-40 ring-4 ring-white rounded-2xl shadow-2xl' : 'hover:scale-115'
              }`}
            >
              {/* Emblema / Símbolo Táctico */}
              <div
                className="flex items-center justify-center min-w-[36px] h-[36px] px-2 rounded-xl font-black text-xs text-white shadow-2xl border-2 border-white tracking-tight"
                style={{ backgroundColor: pin.color }}
              >
                {pin.tipo}
              </div>

              {/* Etiqueta Flotante con Coordenadas */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 whitespace-nowrap bg-slate-950/95 text-[10px] font-bold text-slate-100 px-2.5 py-1 rounded-lg shadow-2xl border border-slate-700 backdrop-blur-md pointer-events-none text-center">
                <div className="text-white font-extrabold">{pin.label}</div>
                {pin.coordenadas && (
                  <div className="text-[9px] font-mono text-amber-300 font-semibold">{pin.coordenadas}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor del Marcador Seleccionado */}
      {selectedPinId && (
        (() => {
          const pin = pines.find((p) => p.id === selectedPinId);
          if (!pin) return null;
          return (
            <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm border-2 border-white shadow-md"
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
                    className="block text-sm font-bold text-white bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 mt-0.5 focus:border-amber-400 outline-none w-72"
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
                onClick={() => setSelectedPinId(pin.id)}
                className={`bg-slate-950 p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedPinId === pin.id
                    ? 'border-orange-500 ring-1 ring-orange-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-[11px] shrink-0 border border-white/60"
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
