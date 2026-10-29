import React, { useRef, useEffect, useState } from 'react';
import { TacticalPin, TacticalZone, TacticalRoute } from '../types/sci';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Move,
  ZoomIn,
  ZoomOut,
  Compass,
  Trash2,
  Check,
  Undo2,
  X,
  Route,
  Layers,
  Footprints,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ROUTE_TYPES = [
  { id: 'evacuacion', label: 'Ruta de Evacuación', color: '#10b981', dash: '8, 8', icon: '🏃' },
  { id: 'acceso_ambulancias', label: 'Acceso Ambulancias', color: '#0ea5e9', dash: undefined, icon: '🚑' },
  { id: 'linea_combate', label: 'Línea de Combate / Fuego', color: '#ef4444', dash: '4, 4', icon: '🔥' },
  { id: 'perimetro', label: 'Cordón Vial / Seguridad', color: '#f59e0b', dash: '6, 6', icon: '🚧' },
  { id: 'reabastecimiento', label: 'Corredor Logístico', color: '#8b5cf6', dash: undefined, icon: '📦' },
  { id: 'libre', label: 'Trazo Libre Manual', color: '#06b6d4', dash: undefined, icon: '✏️' }
] as const;

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

export const ZONE_PRESETS: Array<{
  tipo: TacticalZone['tipo'];
  nombre: string;
  radioMetros: number;
  color: string;
  opacidad: number;
  estiloBorde: TacticalZone['estiloBorde'];
  desc: string;
}> = [
  {
    tipo: 'caliente',
    nombre: 'Zona Caliente / Exclusión',
    radioMetros: 100,
    color: '#ef4444',
    opacidad: 0.28,
    estiloBorde: 'radar_pulse',
    desc: 'Área de máximo peligro inmediato, riesgo estructural o materiales peligrosos.'
  },
  {
    tipo: 'tibia',
    nombre: 'Zona Tibia / Descontaminación',
    radioMetros: 250,
    color: '#f97316',
    opacidad: 0.22,
    estiloBorde: 'punteado',
    desc: 'Área de descontaminación, control de acceso y apoyo directo.'
  },
  {
    tipo: 'perimetro',
    nombre: 'Perímetro de Seguridad Vial',
    radioMetros: 400,
    color: '#eab308',
    opacidad: 0.16,
    estiloBorde: 'punteado',
    desc: 'Cordón de seguridad, restricción vial y control perimetral policiaco.'
  },
  {
    tipo: 'busqueda_tracker',
    nombre: 'Sector Rastreo Tracker / Búsqueda',
    radioMetros: 600,
    color: '#3b82f6',
    opacidad: 0.18,
    estiloBorde: 'radar_pulse',
    desc: 'Cuadrante circular georreferenciado para tracker GPS de búsqueda y rescate.'
  },
  {
    tipo: 'fria',
    nombre: 'Zona Fría / Soporte Logístico',
    radioMetros: 300,
    color: '#10b981',
    opacidad: 0.15,
    estiloBorde: 'solido',
    desc: 'Zona segura donde se ubica el PC, ACV, Base y prensa.'
  },
  {
    tipo: 'evacuacion',
    nombre: 'Radio de Evacuación Preventiva',
    radioMetros: 1000,
    color: '#a855f7',
    opacidad: 0.15,
    estiloBorde: 'punteado',
    desc: 'Perímetro amplio de alertamiento y evacuación comunitaria.'
  }
];

export interface DynamicTacticalMapProps {
  pines: TacticalPin[];
  onUpdatePines: (pines: TacticalPin[]) => void;
  zonas: TacticalZone[];
  onUpdateZonas?: (zonas: TacticalZone[]) => void;
  rutas?: TacticalRoute[];
  onUpdateRutas?: (rutas: TacticalRoute[]) => void;
  centerLat: number;
  centerLng: number;
  iconSize: 'pequeno' | 'normal';
  activeMode: 'symbols' | 'zones' | 'draw';
  onChangeMode?: (mode: 'symbols' | 'zones' | 'draw') => void;
  activePinType: string;
  activeZonePreset: {
    tipo: TacticalZone['tipo'];
    nombre: string;
    radioMetros: number;
    color: string;
    opacidad: number;
    estiloBorde: TacticalZone['estiloBorde'];
    desc: string;
  };
  selectedPinId: string | null;
  onSelectPinId: (id: string | null) => void;
  selectedZoneId: string | null;
  onSelectZoneId: (id: string | null) => void;
  mapLayer: 'satellite' | 'streets' | 'dark';
  flyToCoords?: { lat: number; lng: number } | null;
}

// Cálculo de distancia en km entre dos puntos (Haversine)
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

// Garantizar coordenadas geográficas fijas para que las instalaciones no se muevan al apagar o reiniciar
export function ensurePinCoordinates(pin: TacticalPin, defaultLat: number, defaultLng: number): { lat: number; lng: number } {
  if (typeof pin.lat === 'number' && !isNaN(pin.lat) && typeof pin.lng === 'number' && !isNaN(pin.lng)) {
    return { lat: pin.lat, lng: pin.lng };
  }
  if (pin.coordenadas) {
    const clean = pin.coordenadas.replace(/[^\d.,\-]/g, ' ');
    const parts = clean.split(/[, ]+/).filter(Boolean).map(Number);
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
  }
  // Dispersión suave por defecto según porcentajes para no encimar instalaciones
  const offsetX = ((pin.x ?? 50) - 50) * 0.00015;
  const offsetY = ((pin.y ?? 50) - 50) * 0.00015;
  return {
    lat: parseFloat((defaultLat + offsetY).toFixed(5)),
    lng: parseFloat((defaultLng + offsetX).toFixed(5))
  };
}

export const DynamicTacticalMap: React.FC<DynamicTacticalMapProps> = ({
  pines,
  onUpdatePines,
  zonas,
  onUpdateZonas,
  rutas = [],
  onUpdateRutas,
  centerLat,
  centerLng,
  iconSize,
  activeMode,
  onChangeMode,
  activePinType,
  activeZonePreset,
  selectedPinId,
  onSelectPinId,
  selectedZoneId,
  onSelectZoneId,
  mapLayer,
  flyToCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const activeDrawLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({
    lat: centerLat,
    lng: centerLng
  });
  const [currentZoom, setCurrentZoom] = useState(16);

  // Estados para dibujo manual de trazos y rutas tácticas
  const [currentRoutePoints, setCurrentRoutePoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [selectedRouteTypeId, setSelectedRouteTypeId] = useState<string>('evacuacion');
  const [customRouteName, setCustomRouteName] = useState<string>('');
  const [showElementsDrawer, setShowElementsDrawer] = useState<boolean>(false);
  const [mapToast, setMapToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setMapToast(msg);
    setTimeout(() => setMapToast(null), 3500);
  };

  // 1. Inicializar Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    mapRef.current = map;

    const zonesGroup = L.layerGroup().addTo(map);
    const routesGroup = L.layerGroup().addTo(map);
    const activeDrawGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    zonesLayerRef.current = zonesGroup;
    routesLayerRef.current = routesGroup;
    activeDrawLayerRef.current = activeDrawGroup;
    markersLayerRef.current = markersGroup;

    map.on('move', () => {
      const c = map.getCenter();
      setCurrentCenter({
        lat: parseFloat(c.lat.toFixed(5)),
        lng: parseFloat(c.lng.toFixed(5))
      });
      setCurrentZoom(map.getZoom());
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Capa base de azulejos (Satélite / Callejero / Oscuro)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let maxZoom = 19;

    if (mapLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapLayer === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    } else {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';
      maxZoom = 20;
    }

    const newTile = L.tileLayer(url, { maxZoom, subdomains: ['a', 'b', 'c'] }).addTo(map);
    tileLayerRef.current = newTile;
  }, [mapLayer]);

  // 3. Volar a coordenadas cuando se solicita desde el exterior
  useEffect(() => {
    if (!flyToCoords || !mapRef.current) return;
    mapRef.current.flyTo([flyToCoords.lat, flyToCoords.lng], 17, { duration: 1.2 });
  }, [flyToCoords]);

  // Manejador para eliminar un círculo específico
  const handleDeleteZone = (zoneId: string) => {
    if (!onUpdateZonas) return;
    const remaining = zonas.filter((z) => z.id !== zoneId);
    onUpdateZonas(remaining);
    if (selectedZoneId === zoneId) onSelectZoneId(null);
    triggerToast('🗑️ Círculo/zona eliminada correctamente');
  };

  // Manejador para eliminar todas las zonas
  const handleDeleteAllZones = () => {
    if (!onUpdateZonas || zonas.length === 0) return;
    onUpdateZonas([]);
    onSelectZoneId(null);
    triggerToast('🗑️ Se han eliminado todos los círculos');
  };

  // Manejador para eliminar una ruta específica
  const handleDeleteRoute = (routeId: string) => {
    if (!onUpdateRutas) return;
    const remaining = rutas.filter((r) => r.id !== routeId);
    onUpdateRutas(remaining);
    triggerToast('🗑️ Ruta táctica eliminada');
  };

  // Manejador para eliminar todas las rutas
  const handleDeleteAllRoutes = () => {
    if (!onUpdateRutas || rutas.length === 0) return;
    onUpdateRutas([]);
    triggerToast('🗑️ Se han eliminado todos los trazos y rutas');
  };

  // Acciones de dibujo en progreso
  const handleUndoDrawPoint = () => {
    setCurrentRoutePoints((prev) => prev.slice(0, -1));
  };

  const handleCancelDrawing = () => {
    setCurrentRoutePoints([]);
    setCustomRouteName('');
  };

  const handleSaveCurrentRoute = () => {
    if (currentRoutePoints.length < 2) {
      triggerToast('⚠️ Se requieren al menos 2 puntos para guardar una ruta.');
      return;
    }

    const typeConfig = ROUTE_TYPES.find((t) => t.id === selectedRouteTypeId) || ROUTE_TYPES[0];

    // Calcular longitud total de la ruta
    let totalKm = 0;
    for (let i = 0; i < currentRoutePoints.length - 1; i++) {
      totalKm += calcularDistanciaKm(
        currentRoutePoints[i].lat,
        currentRoutePoints[i].lng,
        currentRoutePoints[i + 1].lat,
        currentRoutePoints[i + 1].lng
      );
    }
    const distStr = totalKm < 1 ? `~${(totalKm * 1000).toFixed(0)} m` : `~${totalKm.toFixed(2)} km`;

    const newRoute: TacticalRoute = {
      id: `route-${Date.now()}`,
      nombre: customRouteName.trim() || `${typeConfig.label} (${rutas.length + 1})`,
      tipo: selectedRouteTypeId as any,
      color: typeConfig.color,
      grosor: 4,
      puntos: currentRoutePoints,
      distanciaAprox: distStr,
      descripcion: `${typeConfig.label} (${currentRoutePoints.length} puntos, ${distStr})`
    };

    if (onUpdateRutas) {
      onUpdateRutas([...rutas, newRoute]);
    }

    setCurrentRoutePoints([]);
    setCustomRouteName('');
    triggerToast(`✅ ${newRoute.nombre} guardada con éxito (${distStr})`);
  };

  // 4. Clic en el mapa dinámico para situar instalaciones, círculos tracker o trazos manuales
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const clickLat = parseFloat(e.latlng.lat.toFixed(5));
      const clickLng = parseFloat(e.latlng.lng.toFixed(5));

      // Modo DIBUJAR TRAZOS Y RUTAS
      if (activeMode === 'draw') {
        setCurrentRoutePoints((prev) => [...prev, { lat: clickLat, lng: clickLng }]);
        return;
      }

      const distKm = calcularDistanciaKm(centerLat, centerLng, clickLat, clickLng);
      const distStr = distKm < 0.1 ? 'En Punto Cero' : distKm < 1 ? `a ${(distKm * 1000).toFixed(0)} m` : `a ${distKm.toFixed(2)} km de Zona Cero`;

      // Modo Zonas Tracker / Círculos
      if (activeMode === 'zones') {
        const preset = activeZonePreset;
        const newZone: TacticalZone = {
          id: `zone-${Date.now()}`,
          nombre: `${preset.nombre} (${zonas.length + 1})`,
          tipo: preset.tipo,
          x: 50,
          y: 50,
          lat: clickLat,
          lng: clickLng,
          radio: 20,
          radioMetros: preset.radioMetros,
          color: preset.color,
          opacidad: preset.opacidad,
          estiloBorde: preset.estiloBorde,
          descripcion: `${preset.desc} (${distStr})`,
          coordenadasCentro: `${clickLat}° N, ${clickLng}° O`
        };

        const updated = [...zonas, newZone];
        if (onUpdateZonas) onUpdateZonas(updated);
        onSelectZoneId(newZone.id);
        triggerToast(`⭕ Círculo ${preset.nombre} trazado (${preset.radioMetros}m)`);
        return;
      }

      // Modo Simbología SCI (Pines de Instalaciones)
      const colorMap: Record<string, string> = {
        PC: '#ea580c',
        E: '#eab308',
        ACV: '#dc2626',
        B: '#059669',
        C: '#7c3aed',
        H: '#2563eb',
        H1: '#0284c7',
        PELIGRO: '#e11d48',
        BOMBEROS: '#f97316',
        POLICIA: '#4f46e5'
      };

      const newPin: TacticalPin = {
        id: `pin-${Date.now()}`,
        tipo: activePinType as any,
        label: `${activePinType} - Instalación Táctica`,
        x: 50,
        y: 50,
        lat: clickLat,
        lng: clickLng,
        ubicacionSitio: distKm < 0.1 ? 'Punto Cero' : `Sitio ${distStr}`,
        color: colorMap[activePinType] || '#ea580c',
        coordenadas: `${clickLat}° N, ${clickLng}° O`
      };

      onUpdatePines([...pines, newPin]);
      onSelectPinId(newPin.id);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [activeMode, activePinType, activeZonePreset, centerLat, centerLng, onSelectPinId, onSelectZoneId, onUpdatePines, onUpdateZonas, pines, zonas]);

  // Auto-fijar coordenadas permanentes en pines para que no se muevan al reiniciar la aplicación
  useEffect(() => {
    let hasMissing = false;
    const normalized = pines.map((p) => {
      if (typeof p.lat === 'number' && !isNaN(p.lat) && typeof p.lng === 'number' && !isNaN(p.lng)) {
        return p;
      }
      hasMissing = true;
      const coords = ensurePinCoordinates(p, centerLat, centerLng);
      return {
        ...p,
        lat: coords.lat,
        lng: coords.lng,
        coordenadas: p.coordenadas || `${coords.lat}° N, ${coords.lng}° O`
      };
    });

    if (hasMissing) {
      onUpdatePines(normalized);
    }
  }, [pines, centerLat, centerLng, onUpdatePines]);

  // 5. Renderizar Marcadores de Instalaciones (Draggables con badges nítidos)
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    // Punto Cero (Centro geográfico del incidente)
    const zeroIcon = L.divIcon({
      className: 'zero-point-icon',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%);pointer-events:none;">
          <div style="width:22px;height:22px;border-radius:50%;background:#eab308;border:3px solid #020617;box-shadow:0 0 14px #eab308;display:flex;align-items:center;justify-content:center;">
            <div style="width:6px;height:6px;border-radius:50%;background:#020617;"></div>
          </div>
          <span style="background:#020617;color:#fef08a;font-size:8px;font-weight:900;padding:2px 5px;border-radius:5px;border:1px solid #eab308;margin-top:2px;font-family:monospace;white-space:nowrap;">
            PUNTO CERO
          </span>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    L.marker([centerLat, centerLng], { icon: zeroIcon, interactive: false }).addTo(markersGroup);

    // Marcadores de Instalaciones SCI
    pines.forEach((pin) => {
      const pinCoords = ensurePinCoordinates(pin, centerLat, centerLng);
      const pinLat = pinCoords.lat;
      const pinLng = pinCoords.lng;
      const distKm = calcularDistanciaKm(centerLat, centerLng, pinLat, pinLng);
      const distStr = distKm < 0.1 ? 'En Punto Cero' : distKm < 1 ? `a ${(distKm * 1000).toFixed(0)} m` : `a ${distKm.toFixed(2)} km de Zona Cero`;
      const isSelected = selectedPinId === pin.id;

      const sizePx = iconSize === 'pequeno' ? 26 : 36;
      const fontPx = iconSize === 'pequeno' ? 10 : 12;

      const pinIcon = L.divIcon({
        className: `sci-marker-${pin.id}`,
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
            <div style="
              width:${sizePx}px;
              height:${sizePx}px;
              border-radius:8px;
              background:${pin.color};
              color:#ffffff;
              display:flex;
              align-items:center;
              justify-content:center;
              font-family:monospace;
              font-weight:900;
              font-size:${fontPx}px;
              border:2.5px solid ${isSelected ? '#ffffff' : '#0f172a'};
              box-shadow:${isSelected ? '0 0 16px #38bdf8' : '0 3px 8px rgba(0,0,0,0.6)'};
            ">
              ${pin.tipo}
            </div>
            <div style="
              background:rgba(2, 6, 23, 0.95);
              color:#f8fafc;
              font-size:8.5px;
              font-weight:700;
              padding:1px 4px;
              border-radius:4px;
              border:1px solid #334155;
              margin-top:2px;
              white-space:nowrap;
            ">
              ${pin.ubicacionSitio || pin.label.split('-')[0].trim()}
            </div>
          </div>
        `,
        iconSize: [sizePx, sizePx + 18],
        iconAnchor: [sizePx / 2, sizePx + 18]
      });

      const marker = L.marker([pinLat, pinLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(markersGroup);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        const updatedLat = parseFloat(pos.lat.toFixed(5));
        const updatedLng = parseFloat(pos.lng.toFixed(5));
        const newDistKm = calcularDistanciaKm(centerLat, centerLng, updatedLat, updatedLng);
        const newDistStr = newDistKm < 0.1 ? 'En Punto Cero' : newDistKm < 1 ? `a ${(newDistKm * 1000).toFixed(0)} m` : `a ${newDistKm.toFixed(2)} km de Zona Cero`;

        const updated = pines.map((p) =>
          p.id === pin.id
            ? {
                ...p,
                lat: updatedLat,
                lng: updatedLng,
                coordenadas: `${updatedLat}° N, ${updatedLng}° O`,
                ubicacionSitio: p.ubicacionSitio?.includes('Sitio') ? `Sitio ${newDistStr}` : p.ubicacionSitio
              }
            : p
        );
        onUpdatePines(updated);
        triggerToast(`📌 Posición fijada: ${pin.label}`);
      });

      marker.on('click', () => {
        onSelectPinId(pin.id);
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;color:#0f172a;min-width:180px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="background:${pin.color};color:#fff;font-weight:900;padding:2px 6px;border-radius:4px;font-size:11px;">
              ${pin.tipo}
            </span>
            <strong style="font-size:12px;">${pin.label}</strong>
          </div>
          <div style="font-size:11px;color:#475569;margin-bottom:4px;">
            📍 ${pinLat}° N, ${pinLng}° O
          </div>
          <div style="font-size:11px;color:#0284c7;font-weight:bold;margin-bottom:6px;">
            📏 Distancia: ${distStr}
          </div>
          <div style="font-size:10px;color:#64748b;">
            💡 Arrastre el icono para colocar esta instalación en otro sitio.
          </div>
        </div>
      `);
    });
  }, [pines, centerLat, centerLng, iconSize, onSelectPinId, onUpdatePines, selectedPinId]);

  // 6. Renderizar Círculos y Zonas Georreferenciadas
  useEffect(() => {
    const zonesGroup = zonesLayerRef.current;
    if (!zonesGroup) return;

    zonesGroup.clearLayers();

    zonas.forEach((zone) => {
      const zLat = zone.lat ?? centerLat;
      const zLng = zone.lng ?? centerLng;
      const radiusM = zone.radioMetros || 250;

      const circle = L.circle([zLat, zLng], {
        radius: radiusM,
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: zone.opacidad,
        dashArray: zone.estiloBorde === 'punteado' ? '6, 6' : undefined,
        weight: selectedZoneId === zone.id ? 3.5 : 2
      }).addTo(zonesGroup);

      circle.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;color:#0f172a;min-width:180px;">
          <strong style="color:${zone.color};">${zone.nombre}</strong>
          <div style="font-size:11px;color:#475569;margin-top:2px;">
            Radio real: <strong>${radiusM} metros</strong>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;margin-bottom:6px;">
            ${zone.descripcion || 'Zona delimitada'}
          </div>
          <div style="font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:4px;">
            💡 Puede eliminar este círculo en el panel flotante 'Zonas y Rutas'.
          </div>
        </div>
      `);

      circle.on('click', () => {
        onSelectZoneId(zone.id);
      });
    });
  }, [centerLat, centerLng, onSelectZoneId, selectedZoneId, zonas]);

  // 7. Renderizar Rutas y Trazos Tácticos Trazados
  useEffect(() => {
    const routesGroup = routesLayerRef.current;
    if (!routesGroup) return;

    routesGroup.clearLayers();

    rutas.forEach((route) => {
      if (!route.puntos || route.puntos.length < 2) return;
      const latlngs = route.puntos.map((p) => [p.lat, p.lng] as [number, number]);
      const typeConfig = ROUTE_TYPES.find((t) => t.id === route.tipo);

      const polyline = L.polyline(latlngs, {
        color: route.color || '#10b981',
        weight: route.grosor || 4,
        dashArray: typeConfig?.dash,
        opacity: 0.95
      }).addTo(routesGroup);

      // Marcador de inicio
      const startPt = latlngs[0];
      const startIcon = L.divIcon({
        className: `route-start-${route.id}`,
        html: `<div style="background:${route.color};color:#ffffff;font-size:8px;font-weight:900;padding:1px 5px;border-radius:4px;border:1.5px solid #ffffff;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.6);font-family:monospace;">INICIO</div>`,
        iconSize: [40, 16],
        iconAnchor: [20, 8]
      });
      L.marker(startPt, { icon: startIcon, interactive: false }).addTo(routesGroup);

      // Marcador de fin
      const endPt = latlngs[latlngs.length - 1];
      const endIcon = L.divIcon({
        className: `route-end-${route.id}`,
        html: `<div style="background:#020617;color:${route.color};font-size:8px;font-weight:900;padding:1px 5px;border-radius:4px;border:1.5px solid ${route.color};white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.6);font-family:monospace;">FIN (${route.distanciaAprox || ''})</div>`,
        iconSize: [60, 16],
        iconAnchor: [30, 8]
      });
      L.marker(endPt, { icon: endIcon, interactive: false }).addTo(routesGroup);

      polyline.bindPopup(`
        <div style="font-family:sans-serif;font-size:12px;color:#0f172a;min-width:180px;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
            <span style="font-size:14px;">${typeConfig?.icon || '🛣️'}</span>
            <strong style="color:${route.color};font-size:12px;">${route.nombre}</strong>
          </div>
          <div style="font-size:11px;color:#475569;margin-bottom:2px;">
            Tipo: <strong>${typeConfig?.label || route.tipo}</strong>
          </div>
          <div style="font-size:11px;color:#0284c7;font-weight:bold;margin-bottom:6px;">
            📏 Distancia: ${route.distanciaAprox || 'N/D'} · ${route.puntos.length} puntos
          </div>
          <div style="font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:4px;">
            💡 Puede eliminar esta ruta en el panel flotante 'Zonas y Rutas'.
          </div>
        </div>
      `);
    });
  }, [rutas]);

  // 8. Renderizar Trazo en Vivo mientras el usuario dibuja
  useEffect(() => {
    const drawGroup = activeDrawLayerRef.current;
    if (!drawGroup) return;

    drawGroup.clearLayers();

    if (currentRoutePoints.length === 0) return;

    const latlngs = currentRoutePoints.map((p) => [p.lat, p.lng] as [number, number]);
    const typeConfig = ROUTE_TYPES.find((t) => t.id === selectedRouteTypeId) || ROUTE_TYPES[0];

    // Línea continua en vivo
    L.polyline(latlngs, {
      color: typeConfig.color,
      weight: 3.5,
      dashArray: '5, 5',
      opacity: 0.9
    }).addTo(drawGroup);

    // Vértices clicados
    currentRoutePoints.forEach((pt, idx) => {
      const isStart = idx === 0;
      const isLast = idx === currentRoutePoints.length - 1;
      const vertexIcon = L.divIcon({
        className: `vertex-${idx}`,
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${isStart ? '#22c55e' : isLast ? '#eab308' : typeConfig.color};border:2px solid #ffffff;box-shadow:0 0 8px rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;color:#000;font-size:7px;font-weight:900;">${idx + 1}</div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });
      L.marker([pt.lat, pt.lng], { icon: vertexIcon, interactive: false }).addTo(drawGroup);
    });
  }, [currentRoutePoints, selectedRouteTypeId]);

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleCenterZero = () => {
    if (mapRef.current) {
      mapRef.current.flyTo([centerLat, centerLng], 16, { duration: 1 });
    }
  };

  // Cálculo en vivo de la distancia del trazo en progreso
  let liveDrawDistance = '0 m';
  if (currentRoutePoints.length > 1) {
    let dKm = 0;
    for (let i = 0; i < currentRoutePoints.length - 1; i++) {
      dKm += calcularDistanciaKm(
        currentRoutePoints[i].lat,
        currentRoutePoints[i].lng,
        currentRoutePoints[i + 1].lat,
        currentRoutePoints[i + 1].lng
      );
    }
    liveDrawDistance = dKm < 1 ? `${(dKm * 1000).toFixed(0)} m` : `${dKm.toFixed(2)} km`;
  }

  return (
    <div className="relative w-full h-[470px] sm:h-[560px] rounded-3xl border-2 border-slate-700/80 overflow-hidden shadow-2xl bg-slate-950 z-0 flex flex-col">
      <div ref={mapContainerRef} className="w-full h-full cursor-crosshair z-0" />

      {/* Badge Flotante Superior Izquierdo: Coordenadas y Orientación */}
      <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-200 font-mono flex items-center gap-2 pointer-events-none z-[400] shadow-xl">
        <Navigation className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
        <span className="text-white font-bold">NORTE ↑</span>
        <span className="text-slate-600">|</span>
        <span className="text-amber-400 font-bold">
          {currentCenter.lat.toFixed(5)}° N, {currentCenter.lng.toFixed(5)}° O
        </span>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-1 hidden sm:inline-flex">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Zoom {currentZoom}x
        </span>
      </div>

      {/* Controles de Zoom Flotantes a la Derecha */}
      <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[400]">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-lg cursor-pointer transition"
          title="Acercar vista"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center border border-slate-700 shadow-lg cursor-pointer transition"
          title="Alejar vista"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleCenterZero}
          className="w-8 h-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700 shadow-lg cursor-pointer transition"
          title="Centrar en Punto Cero"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setShowElementsDrawer((prev) => !prev)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-lg cursor-pointer transition ${
            showElementsDrawer
              ? 'bg-rose-600 text-white border-rose-400'
              : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border-slate-700'
          }`}
          title="Gestión y Eliminación de Círculos y Rutas"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Toast Flotante de Confirmación */}
      {mapToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-2xl z-[500] backdrop-blur-md animate-fade-in flex items-center gap-2">
          <span>{mapToast}</span>
        </div>
      )}

      {/* BARRA FLOTANTE DE TRAZADO MANUAL DE RUTAS (Cuando activeMode === 'draw') */}
      {activeMode === 'draw' && (
        <div className="absolute top-12 left-3 right-14 sm:left-auto sm:right-14 sm:w-[460px] bg-slate-950/95 border border-emerald-500/50 rounded-2xl p-3 shadow-2xl z-[450] backdrop-blur-md animate-fade-in space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5" /> Trazo Manual de Rutas
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {currentRoutePoints.length} {currentRoutePoints.length === 1 ? 'punto' : 'puntos'} · {liveDrawDistance}
            </span>
          </div>

          {/* Selector de Tipo de Ruta Táctica */}
          <div className="grid grid-cols-3 gap-1.5">
            {ROUTE_TYPES.map((rt) => {
              const isSelected = selectedRouteTypeId === rt.id;
              return (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setSelectedRouteTypeId(rt.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border transition text-left truncate cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-2'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                  style={{ borderColor: isSelected ? rt.color : undefined }}
                >
                  <span>{rt.icon}</span>
                  <span className="truncate">{rt.label.split(' ')[0]} {rt.label.split(' ')[1] || ''}</span>
                </button>
              );
            })}
          </div>

          {/* Nombre Opcional de la Ruta */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customRouteName}
              onChange={(e) => setCustomRouteName(e.target.value)}
              placeholder="Nombre táctico de la ruta (opcional)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Instrucción y Botones de Acción */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400">
              Haga clic sobre el mapa para trazar el trayecto.
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUndoDrawPoint}
                disabled={currentRoutePoints.length === 0}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-amber-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                title="Deshacer último punto"
              >
                <Undo2 className="w-3 h-3" /> Deshacer
              </button>
              <button
                type="button"
                onClick={handleCancelDrawing}
                disabled={currentRoutePoints.length === 0}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950 disabled:opacity-40 text-rose-400 border border-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                title="Cancelar trazo"
              >
                <X className="w-3 h-3" /> Borrar
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentRoute}
                disabled={currentRoutePoints.length < 2}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-lg shadow-emerald-950"
              >
                <Check className="w-3 h-3" /> Guardar Ruta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANEL FLOTANTE DE GESTIÓN Y ELIMINACIÓN DE CÍRCULOS Y RUTAS */}
      {showElementsDrawer && (
        <div className="absolute top-12 right-14 w-80 max-h-[420px] bg-slate-950/95 border border-slate-700 rounded-2xl p-3.5 shadow-2xl z-[450] backdrop-blur-md overflow-y-auto space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Capas Trazadas
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowElementsDrawer(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sección de Círculos / Zonas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>CÍRCULOS Y ZONAS ({zonas.length})</span>
              {zonas.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllZones}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Eliminar todos
                </button>
              )}
            </div>
            {zonas.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic bg-slate-900/50 p-2 rounded-xl">
                No hay círculos o zonas dibujadas en el mapa.
              </p>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {zonas.map((z) => (
                  <div
                    key={z.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: z.color }}
                      />
                      <div className="truncate">
                        <div className="font-bold text-white truncate text-[11px]">{z.nombre}</div>
                        <div className="text-[9px] text-slate-400">Radio: {z.radioMetros || 250}m</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteZone(z.id)}
                      className="p-1 rounded-lg hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition cursor-pointer shrink-0 ml-2"
                      title="Eliminar este círculo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Trazos y Rutas */}
          <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>TRAZOS Y RUTAS ({rutas.length})</span>
              {rutas.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllRoutes}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Eliminar todas
                </button>
              )}
            </div>
            {rutas.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic bg-slate-900/50 p-2 rounded-xl">
                No hay rutas o trazos dibujados. Use la herramienta 'Trazar Rutas'.
              </p>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {rutas.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-1 rounded shrink-0"
                        style={{ background: r.color }}
                      />
                      <div className="truncate">
                        <div className="font-bold text-white truncate text-[11px]">{r.nombre}</div>
                        <div className="text-[9px] text-emerald-400">{r.distanciaAprox || `${r.puntos.length} pts`}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoute(r.id)}
                      className="p-1 rounded-lg hover:bg-rose-950 text-rose-400 hover:text-rose-300 transition cursor-pointer shrink-0 ml-2"
                      title="Eliminar esta ruta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barra Inferior Informativa y Acceso Rápido a Capas */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-[400]">
        <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1.5 shadow-lg">
          <Move className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">
            {activeMode === 'draw'
              ? 'Modo Trazo de Rutas activo: Haga clic secuencialmente sobre el mapa para trazar.'
              : 'Mapa dinámico táctico: Clic para situar · Arrastre para reubicar'}
          </span>
        </div>

        {/* Acceso Rápido a Capas / Conteo */}
        <button
          type="button"
          onClick={() => setShowElementsDrawer((prev) => !prev)}
          className="pointer-events-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-lg transition"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>{zonas.length} Círculos · {rutas.length} Rutas</span>
          <ChevronUp className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
