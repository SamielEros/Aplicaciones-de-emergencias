import React, { useState } from 'react';
import { TacticalPin } from '../types/sci';
import { SCI_SYMBOLS } from './TacticalSketchPad';
import { MapPin, Plus, Trash2, Compass, Navigation } from 'lucide-react';

interface TacticalInstallationsPanelProps {
  pines: TacticalPin[];
  centerLat: number;
  centerLng: number;
  selectedPinId: string | null;
  onSelectPin: (pin: TacticalPin) => void;
  onRemovePin: (id: string) => void;
  onAddCustomPin: (pin: TacticalPin) => void;
}

const SITIOS_PREDETERMINADOS = [
  { nombre: 'Cruz Roja Delegación Tepatitlán (Base Morelos)', tipo: 'B', lat: 20.8192, lng: -102.7621 },
  { nombre: 'Hospital Regional de Tepatitlán (Puesto Médico / ACV)', tipo: 'ACV', lat: 20.8125, lng: -102.7538 },
  { nombre: 'Parque Bicentenario / Unidad Deportiva (Área de Espera)', tipo: 'E', lat: 20.8250, lng: -102.7745 },
  { nombre: 'Aeródromo / Helipuerto Tepatitlán (Helibase H)', tipo: 'H', lat: 20.8350, lng: -102.7410 },
  { nombre: 'Caseta Autopista Tepatitlán - Zapotlanejo (Control Vial)', tipo: 'POLICIA', lat: 20.8010, lng: -102.7850 },
  { nombre: 'Campamento de Brigadistas y Rescatistas Sur', tipo: 'C', lat: 20.8080, lng: -102.7710 }
];

function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const TacticalInstallationsPanel: React.FC<TacticalInstallationsPanelProps> = ({
  pines,
  centerLat,
  centerLng,
  selectedPinId,
  onSelectPin,
  onRemovePin,
  onAddCustomPin
}) => {
  const [showModal, setShowModal] = useState(false);
  const [customTipo, setCustomTipo] = useState<typeof SCI_SYMBOLS[number]['tipo']>('E');
  const [customNombre, setCustomNombre] = useState('');
  const [customLat, setCustomLat] = useState(centerLat);
  const [customLng, setCustomLng] = useState(centerLng);

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = SITIOS_PREDETERMINADOS.find((p) => p.nombre === e.target.value);
    if (preset) {
      setCustomTipo(preset.tipo as any);
      setCustomNombre(preset.nombre);
      setCustomLat(preset.lat);
      setCustomLng(preset.lng);
    }
  };

  const handleConfirmAdd = () => {
    const sym = SCI_SYMBOLS.find((s: any) => s.tipo === customTipo) || SCI_SYMBOLS[0];
    const distKm = calcularDistanciaKm(centerLat, centerLng, customLat, customLng);
    const distStr = distKm < 0.1 ? 'En Punto Cero' : distKm < 1 ? `a ${(distKm * 1000).toFixed(0)} m` : `a ${distKm.toFixed(2)} km de Zona Cero`;

    const newPin: TacticalPin = {
      id: `pin-${Date.now()}`,
      tipo: sym.tipo,
      label: `${sym.tipo} - ${customNombre || sym.label}`,
      x: 50,
      y: 50,
      lat: customLat,
      lng: customLng,
      ubicacionSitio: customNombre || `Sitio ${distStr}`,
      color: sym.color,
      coordenadas: `${customLat.toFixed(5)}° N, ${customLng.toFixed(5)}° O`
    };

    onAddCustomPin(newPin);
    setShowModal(false);
    setCustomNombre('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Instalaciones Tácticas del SCI ({pines.length})
            </h4>
            <p className="text-[11px] text-slate-400">
              Despliegue instalaciones en diversos sitios estratégicos del municipio o región.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Desplegar en Otro Sitio</span>
        </button>
      </div>

      {pines.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-medium">
          No hay instalaciones fijadas en el mapa. Haga clic sobre el mapa dinámico o pulse "Desplegar en Otro Sitio".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {pines.map((pin) => {
            const pinLat = pin.lat ?? centerLat;
            const pinLng = pin.lng ?? centerLng;
            const distKm = calcularDistanciaKm(centerLat, centerLng, pinLat, pinLng);
            const distStr = distKm < 0.1 ? 'En Punto Cero' : distKm < 1 ? `a ${(distKm * 1000).toFixed(0)} m` : `a ${distKm.toFixed(2)} km`;
            const isSelected = selectedPinId === pin.id;

            return (
              <div
                key={pin.id}
                onClick={() => onSelectPin(pin)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs text-white shrink-0 shadow-md"
                    style={{ backgroundColor: pin.color }}
                  >
                    {pin.tipo}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {pin.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {pin.ubicacionSitio || 'Sitio táctico'}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono font-semibold mt-0.5 flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5 rotate-45" />
                      <span>{distStr}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePin(pin.id);
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition cursor-pointer shrink-0"
                  title="Eliminar esta instalación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Desplegar Instalación en Otro Sitio */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Desplegar Instalación en Otro Sitio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Tipo de Instalación SCI:
                </label>
                <select
                  value={customTipo}
                  onChange={(e) => setCustomTipo(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {SCI_SYMBOLS.map((s: any) => (
                    <option key={s.tipo} value={s.tipo}>
                      [{s.tipo}] {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Nombre o Referencia del Sitio:
                </label>
                <input
                  type="text"
                  value={customNombre}
                  onChange={(e) => setCustomNombre(e.target.value)}
                  placeholder="ej. Base Logística Norte, Puesto de Socorro Hospital, Helibase Aeródromo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Sitios Estratégicos Predeterminados (Tepatitlán):
                </label>
                <select
                  onChange={handleSelectPreset}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 outline-none"
                >
                  <option value="">-- Seleccionar sitio predeterminado --</option>
                  {SITIOS_PREDETERMINADOS.map((s) => (
                    <option key={s.nombre} value={s.nombre}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Latitud Geográfica:
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLat}
                    onChange={(e) => setCustomLat(parseFloat(e.target.value) || centerLat)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Longitud Geográfica:
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customLng}
                    onChange={(e) => setCustomLng(parseFloat(e.target.value) || centerLng)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Fijar Instalación en Este Sitio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
