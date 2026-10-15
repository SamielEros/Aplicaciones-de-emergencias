import React, { useState } from 'react';
import { SCI201Data, TacticalPin } from '../../types/sci';
import { TacticalSketchPad } from '../TacticalSketchPad';
import {
  Plus,
  Trash2,
  Clock,
  MapPin,
  Shield,
  Layers,
  FileText,
  Navigation,
  ExternalLink,
  LocateFixed,
  Compass,
  CheckCircle2,
  Radio,
  Satellite
} from 'lucide-react';

interface SCI201FormProps {
  data: SCI201Data;
  onChange: (data: SCI201Data) => void;
  incidentName: string;
  lugar: string;
}

const PRESET_MEXICO_COORDS = [
  { name: 'CDMX - Cuauhtémoc (Roma Nte / Insurgentes)', lat: 19.4195, lng: -99.1628 },
  { name: 'CDMX - Zócalo / Centro Histórico', lat: 19.4326, lng: -99.1332 },
  { name: 'CDMX - Tlalpan / Zona Sur', lat: 19.2891, lng: -99.1685 },
  { name: 'Nuevo León - Sierra de Santiago / Cumbres', lat: 25.4241, lng: -100.1534 },
  { name: 'Nuevo León - Monterrey Centro', lat: 25.6695, lng: -100.3099 },
  { name: 'Jalisco - Guadalajara Centro / Calzada', lat: 20.6736, lng: -103.344 },
  { name: 'Guerrero - Acapulco Zona Diamante / Costera', lat: 16.8531, lng: -99.8237 },
  { name: 'Puebla - Centro Histórico / Angelópolis', lat: 19.0414, lng: -98.2063 },
  { name: 'Oaxaca - Valles Centrales', lat: 17.0732, lng: -96.7266 },
  { name: 'Veracruz - Puerto / Malecón', lat: 19.1738, lng: -96.1342 },
  { name: 'Baja California - Tijuana Zona Río', lat: 32.5149, lng: -117.0382 }
];

export const SCI201Form: React.FC<SCI201FormProps> = ({ data, onChange, incidentName, lugar }) => {
  const [isLocating, setIsLocating] = useState(false);

  const currentLat = typeof data.coordenadasLat === 'number' ? data.coordenadasLat : parseFloat(String(data.coordenadasLat || '19.4195')) || 19.4195;
  const currentLng = typeof data.coordenadasLng === 'number' ? data.coordenadasLng : parseFloat(String(data.coordenadasLng || '-99.1628')) || -99.1628;

  const updateField = (field: keyof SCI201Data, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada por este navegador/dispositivo.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        onChange({
          ...data,
          coordenadasLat: lat,
          coordenadasLng: lng,
          coordenadasTexto: `${lat}° N, ${lng}° O`
        });
      },
      (err) => {
        setIsLocating(false);
        alert(`No se pudo obtener la ubicación: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSelectPresetCoord = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_MEXICO_COORDS.find((p) => p.name === e.target.value);
    if (selected) {
      onChange({
        ...data,
        coordenadasLat: selected.lat,
        coordenadasLng: selected.lng,
        coordenadasTexto: `${selected.lat}° N, ${selected.lng}° O`
      });
    }
  };

  const addAccion = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAcc = {
      id: `acc-${Date.now()}`,
      hora: timeStr,
      accion: '',
      responsable: ''
    };
    updateField('resumenAcciones', [...data.resumenAcciones, newAcc]);
  };

  const removeAccion = (id: string) => {
    updateField(
      'resumenAcciones',
      data.resumenAcciones.filter((a) => a.id !== id)
    );
  };

  const updateAccion = (id: string, field: 'hora' | 'accion' | 'responsable', val: string) => {
    updateField(
      'resumenAcciones',
      data.resumenAcciones.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const addRecurso = () => {
    const newRec = {
      id: `rec-${Date.now()}`,
      recurso: '',
      tipoClase: 'Tipo I',
      cantidad: 1,
      responsable: '',
      ubicacion: '',
      horaArribo: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    updateField('recursosAsignadosIniciales', [...data.recursosAsignadosIniciales, newRec]);
  };

  const removeRecurso = (id: string) => {
    updateField(
      'recursosAsignadosIniciales',
      data.recursosAsignadosIniciales.filter((r) => r.id !== id)
    );
  };

  const updateRecurso = (id: string, field: string, val: any) => {
    updateField(
      'recursosAsignadosIniciales',
      data.recursosAsignadosIniciales.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const addObjetivo = () => {
    updateField('objetivosIniciales', [...data.objetivosIniciales, '']);
  };

  const updateObjetivo = (idx: number, val: string) => {
    const list = [...data.objetivosIniciales];
    list[idx] = val;
    updateField('objetivosIniciales', list);
  };

  const removeObjetivo = (idx: number) => {
    updateField(
      'objetivosIniciales',
      data.objetivosIniciales.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Oficial del Formulario SCI-201 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 font-mono text-xs font-bold rounded-lg border border-orange-500/30">
                  SCI-201
                </span>
                <h2 className="text-lg font-bold text-white">Informe del Incidente (Acción Inicial)</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sistema de Comando de Incidentes · PROY-NOM-010-SEGOB-2016
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <span>Ubicación: </span>
            <span className="text-amber-300 font-semibold">{lugar || 'No especificada'}</span>
          </div>
        </div>
      </div>

      {/* Control de Georreferenciación Conectado Automáticamente al Croquis Satelital */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>Georreferenciación y Posicionamiento de la Escena</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado al Croquis Táctico
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Las coordenadas actualizan en tiempo real el croquis táctico y la vista satelital oficial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-all"
              title="Obtener coordenadas mediante el GPS del dispositivo iPad"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{isLocating ? 'Detectando GPS...' : 'Mi GPS Actual'}</span>
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        {/* Inputs de Coordenadas Geográficas */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block">Latitud (°N):</label>
            <input
              type="number"
              step="0.0001"
              value={currentLat}
              onChange={(e) => {
                const lat = parseFloat(e.target.value) || 0;
                onChange({
                  ...data,
                  coordenadasLat: lat,
                  coordenadasTexto: `${lat}° N, ${currentLng}° O`
                });
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block">Longitud (°O):</label>
            <input
              type="number"
              step="0.0001"
              value={currentLng}
              onChange={(e) => {
                const lng = parseFloat(e.target.value) || 0;
                onChange({
                  ...data,
                  coordenadasLng: lng,
                  coordenadasTexto: `${currentLat}° N, ${lng}° O`
                });
              }}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block">Coordenadas GPS (Texto):</label>
            <input
              type="text"
              value={data.coordenadasTexto || `${currentLat}° N, ${currentLng}° O`}
              onChange={(e) => updateField('coordenadasTexto', e.target.value)}
              placeholder="19.4195° N, 99.1628° O"
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-semibold block">Zonas Frecuentes México:</label>
            <select
              onChange={handleSelectPresetCoord}
              className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
              defaultValue=""
            >
              <option value="" disabled>Seleccionar zona...</option>
              {PRESET_MEXICO_COORDS.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1. Evaluación Inicial de la Situación */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Evaluación Inicial de la Situación y Magnitud del Evento
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-2">
          Describa qué ocurrió, áreas amenazadas, condiciones del terreno, accesos y factores de riesgo inmediatos.
        </p>
        <textarea
          rows={3}
          value={data.evaluacionInicial}
          onChange={(e) => updateField('evaluacionInicial', e.target.value)}
          placeholder="Ej: Colapso en inmueble habitacional de 5 niveles con personas atrapadas. Se establece perímetro de aislamiento..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:border-orange-400 outline-none"
        />
      </div>

      {/* 2. Croquis Táctico e Instalaciones SCI (Conectado Automáticamente con Georreferenciación y Satélite) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>2. Croquis Táctico e Instalaciones del SCI</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Satélite Georreferenciado
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sitúe el Puesto de Comando (PC), Área de Espera (E), Área de Concentración de Víctimas (ACV), Helipuntos y perímetros de riesgo.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° O
          </span>
        </div>

        {/* PIZARRA TÁCTICA CONECTADA CON COORDENADAS Y MAPA SATELITAL */}
        <TacticalSketchPad
          pines={data.croquisPines}
          onUpdatePines={(pines) => updateField('croquisPines', pines)}
          notas={data.croquisNotas}
          onUpdateNotas={(notas) => updateField('croquisNotas', notas)}
          drawingData={data.croquisDrawing}
          onUpdateDrawing={(draw) => updateField('croquisDrawing', draw)}
          coordenadasLat={currentLat}
          coordenadasLng={currentLng}
          coordenadasTexto={data.coordenadasTexto}
          onUpdateCoordinates={(lat, lng) => {
            onChange({
              ...data,
              coordenadasLat: lat,
              coordenadasLng: lng,
              coordenadasTexto: `${lat}° N, ${lng}° O`
            });
          }}
        />
      </div>

      {/* 3. Objetivos Iniciales */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              3. Objetivos Iniciales del Incidente
            </h3>
          </div>
          <button
            type="button"
            onClick={addObjetivo}
            className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Objetivo
          </button>
        </div>
        <div className="space-y-2">
          {data.objetivosIniciales.map((obj, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono text-orange-400 w-5 text-right font-bold">{idx + 1}.</span>
              <input
                type="text"
                value={obj}
                onChange={(e) => updateObjetivo(idx, e.target.value)}
                placeholder="Objetivo específico medible y alcanzable..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:border-orange-400 outline-none"
              />
              <button
                type="button"
                onClick={() => removeObjetivo(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                title="Eliminar objetivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.objetivosIniciales.length === 0 && (
            <p className="text-xs text-slate-500 italic">No se han registrado objetivos iniciales aún.</p>
          )}
        </div>
      </div>

      {/* 4. Resumen de Acciones Tomadas (Cronología) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              4. Resumen de Acciones Tomadas (Cronológico)
            </h3>
          </div>
          <button
            type="button"
            onClick={addAccion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Acción
          </button>
        </div>

        <div className="space-y-2.5">
          {data.resumenAcciones.map((acc) => (
            <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              <div className="w-24 shrink-0">
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Hora:</label>
                <input
                  type="text"
                  value={acc.hora}
                  onChange={(e) => updateAccion(acc.id, 'hora', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-amber-300 outline-none"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Acción Realizada:</label>
                <input
                  type="text"
                  value={acc.accion}
                  onChange={(e) => updateAccion(acc.id, 'accion', e.target.value)}
                  placeholder="Descripción de la acción táctica tomada..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-orange-400"
                />
              </div>
              <div className="w-full sm:w-48 shrink-0">
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Responsable:</label>
                <input
                  type="text"
                  value={acc.responsable}
                  onChange={(e) => updateAccion(acc.id, 'responsable', e.target.value)}
                  placeholder="Nombre / Institución"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none focus:border-orange-400"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAccion(acc.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg self-end sm:self-center"
                title="Eliminar registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.resumenAcciones.length === 0 && (
            <p className="text-xs text-slate-500 italic">No hay acciones registradas en la cronología.</p>
          )}
        </div>
      </div>

      {/* 5. Recursos Asignados Iniciales */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              5. Recursos Inicialmente Asignados en la Escena
            </h3>
          </div>
          <button
            type="button"
            onClick={addRecurso}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Recurso
          </button>
        </div>

        <div className="space-y-2">
          {data.recursosAsignadosIniciales.map((rec) => (
            <div key={rec.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-6 gap-2 items-center text-xs">
              <div className="col-span-2 sm:col-span-2">
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Identificación / Recurso:</label>
                <input
                  type="text"
                  value={rec.recurso}
                  onChange={(e) => updateRecurso(rec.id, 'recurso', e.target.value)}
                  placeholder="Ej: Ambulancia CRM-044"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Tipo / Clase:</label>
                <input
                  type="text"
                  value={rec.tipoClase}
                  onChange={(e) => updateRecurso(rec.id, 'tipoClase', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  value={rec.cantidad}
                  onChange={(e) => updateRecurso(rec.id, 'cantidad', parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase block font-semibold">Ubicación Actual:</label>
                <input
                  type="text"
                  value={rec.ubicacion}
                  onChange={(e) => updateRecurso(rec.id, 'ubicacion', e.target.value)}
                  placeholder="Área de Espera (E)"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase block font-semibold">Arribo:</label>
                  <span className="font-mono text-amber-300">{rec.horaArribo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRecurso(rec.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                  title="Eliminar recurso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {data.recursosAsignadosIniciales.length === 0 && (
            <p className="text-xs text-slate-500 italic">No hay recursos iniciales listados.</p>
          )}
        </div>
      </div>
    </div>
  );
};
