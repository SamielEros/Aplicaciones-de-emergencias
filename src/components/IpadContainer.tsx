import React, { useState, useEffect } from 'react';
import {
  Tablet,
  RotateCw,
  Wifi,
  WifiOff,
  BatteryCharging,
  Radio,
  Clock,
  Menu,
  X,
  FileCheck2,
  BookOpen,
  FolderOpen,
  Save,
  ShieldAlert,
  Flame,
  ChevronDown,
  CloudUpload,
  Archive,
  CheckCircle2,
  Share2,
  Shield,
  Users,
  Download,
  Smartphone,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';
import { IncidentData } from '../types/sci';
import { CruzRojaMexicanaEmblem } from './CruzRojaMexicanaEmblem';

interface IpadContainerProps {
  children: React.ReactNode;
  incident: IncidentData;
  onSelectIncident: (inc: IncidentData) => void;
  presetIncidents: IncidentData[];
  onNewIncident: () => void;
  onOpenPAIModal: () => void;
  onOpenGuideModal: () => void;
  onOpenDriveModal?: () => void;
  onOpenHistoryModal?: () => void;
  onQuickSave?: () => void;
  onSaveAndContinueEditing?: () => void;
  onOpenScenarioModal?: () => void;
  onOpenPeriodoManager?: () => void;
  saveStatusText?: string;
  // Multi-user & Cross-platform & Offline props
  isOnline?: boolean;
  activeCaseId?: string;
  onOpenCaseModal?: () => void;
  onOpenPwaModal?: () => void;
  collaboratorCount?: number;
  collaboratorName?: string;
  collaboratorRole?: string;
  hasPendingSync?: boolean;
  // Theme Switching
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const IpadContainer: React.FC<IpadContainerProps> = ({
  children,
  incident,
  onSelectIncident,
  presetIncidents,
  onNewIncident,
  onOpenPAIModal,
  onOpenGuideModal,
  onOpenDriveModal,
  onOpenHistoryModal,
  onQuickSave,
  onSaveAndContinueEditing,
  onOpenScenarioModal,
  onOpenPeriodoManager,
  saveStatusText,
  isOnline = true,
  activeCaseId = 'CASO-01',
  onOpenCaseModal,
  onOpenPwaModal,
  collaboratorCount = 1,
  collaboratorName = 'Comandante',
  collaboratorRole = 'CI',
  hasPendingSync = false,
  theme = 'dark',
  onToggleTheme
}) => {
  const [isSimulatedFrame, setIsSimulatedFrame] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [currentTime, setCurrentTime] = useState('');
  const [incidentMenuOpen, setIncidentMenuOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start p-0 md:p-2 selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200 ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Device Bar (Floating Control Bar) */}
      <div className="w-full max-w-7xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 no-print">
        <div className="flex items-center gap-2.5">
          <CruzRojaMexicanaEmblem size="sm" className="hidden sm:inline-block shadow-md ring-1 ring-orange-500/40" />
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-amber-500 animate-pulse' : 'bg-amber-600'}`} />
            <span className="text-xs sm:text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-500" />
              Sistema de Comando de Incidentes
            </span>
          </div>
          <span className="hidden lg:inline text-slate-600">|</span>
          <span className="hidden lg:inline text-amber-400 font-bold text-[11px]">
            Cruz Roja Mexicana · Delegación Tepatitlán
          </span>
        </div>

        {/* Live Multi-user, Offline & Device Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Connection Status Badge */}
          {onOpenCaseModal && (
            <button
              type="button"
              onClick={onOpenCaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold text-xs cursor-pointer transition active:scale-95 ${
                isOnline
                  ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/60 shadow-sm'
                  : 'bg-amber-950/70 border-amber-600/60 text-amber-300 hover:bg-amber-900/60'
              }`}
              title={isOnline ? 'Conectado a la red de datos en tiempo real' : 'Trabajando en modo local fuera de línea'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En Línea ({collaboratorCount})</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Offline {hasPendingSync ? '(Guardado local)' : ''}</span>
                </>
              )}
            </button>
          )}



          {/* Install PWA Button (Windows / Android / iOS) */}
          {onOpenPwaModal && (
            <button
              type="button"
              onClick={onOpenPwaModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold border border-slate-700/90 cursor-pointer text-xs transition-all active:scale-95"
              title="Instalar aplicación en Windows, Android o iPhone/iPad"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Instalar App</span>
            </button>
          )}

          {/* Quick Save Button */}
          {onQuickSave && (
            <button
              type="button"
              onClick={onQuickSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold border border-slate-700/80 cursor-pointer text-xs transition-all shadow-sm active:scale-95"
              title="Guardar cambios actuales"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar</span>
            </button>
          )}

          {/* Send to Google Drive Button */}
          {onOpenDriveModal && (
            <button
              type="button"
              onClick={onOpenDriveModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700 cursor-pointer text-xs transition-all active:scale-95"
              title="Guardar y respaldar en la nube de Google Drive"
            >
              <CloudUpload className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Google Drive</span>
            </button>
          )}

          {/* Event History / Dossier Archive Button */}
          {onOpenHistoryModal && (
            <button
              type="button"
              onClick={onOpenHistoryModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800 cursor-pointer text-xs transition-all"
              title="Historial de eventos y expedientes guardados"
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Eventos</span>
            </button>
          )}

          {/* Theme Toggle Button (Oscuro / Claro) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm ${
                theme === 'light'
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700/80'
              }`}
              title={theme === 'dark' ? 'Cambiar a Tema Claro (Modo Día / Alta Visibilidad)' : 'Cambiar a Tema Oscuro (Modo Noche / Táctico)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tema Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Tema Oscuro</span>
                </>
              )}
            </button>
          )}

          {/* Frame Toggle */}
          <button
            type="button"
            onClick={() => setIsSimulatedFrame(!isSimulatedFrame)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer text-xs font-semibold ${
              isSimulatedFrame
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Alternar entre pantalla adaptativa (Windows/Móvil) y marco físico de iPad"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isSimulatedFrame ? 'Marco Activo' : 'Marco iPad'}</span>
          </button>

          {/* Orientation Toggle (Only in frame mode) */}
          {isSimulatedFrame && (
            <button
              type="button"
              onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              title="Girar orientación de pantalla"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Convertir a PDF y Compartir PAI */}
          <button
            type="button"
            onClick={onOpenPAIModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black shadow-md shadow-orange-500/25 cursor-pointer text-xs transition-all active:scale-95"
            title="Convertir el Plan de Acción del Incidente (PAI) a PDF oficial y compartir"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-950" />
            <span>PAI · Compartir PDF</span>
          </button>
        </div>
      </div>

      {/* Outer Shell (Adaptive or Simulated iPad) */}
      <div
        className={`w-full transition-all duration-300 flex flex-col justify-center items-center ${
          isSimulatedFrame
            ? orientation === 'landscape'
              ? 'max-w-[1240px] my-2'
              : 'max-w-[880px] my-2'
            : 'max-w-full flex-1'
        }`}
      >
        <div
          className={`w-full bg-slate-900 border transition-all duration-300 flex flex-col overflow-hidden shadow-2xl relative ${
            isSimulatedFrame
              ? 'border-8 border-slate-800 rounded-[42px] ring-1 ring-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
              : 'border-0 sm:border sm:border-slate-800 sm:rounded-2xl flex-1'
          }`}
          style={{
            height: isSimulatedFrame ? (orientation === 'landscape' ? '820px' : '1080px') : 'auto',
            minHeight: isSimulatedFrame ? undefined : '95vh'
          }}
        >
          {/* Tactical OS System Status Bar */}
          <div className="bg-slate-950/90 backdrop-blur-md px-4 sm:px-6 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 font-medium select-none z-30 shrink-0">
            {/* Left: Time & Emergency Mesh */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-white font-mono text-[13px]">{currentTime || '08:00'}</span>
              <div
                onClick={onOpenCaseModal}
                className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-900 hover:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-800 cursor-pointer transition"
                title="Presiona para ver respondedores conectados"
              >
                <Radio className={`w-3 h-3 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
                <span className="hidden sm:inline font-mono">
                  {isOnline ? 'RED SCI-OPERACIONES EN LÍNEA' : 'RED LOCAL AUTÓNOMA (OFFLINE)'}
                </span>
                <span className="sm:hidden font-mono">
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>

            {/* Center Dynamic Notch (iPad FaceID / Camera sensor) */}
            {isSimulatedFrame && (
              <div className="w-24 h-4 bg-slate-950 rounded-full border border-slate-800/80 mx-auto flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
              </div>
            )}

            {/* Right: Active Collaborator, Wi-Fi, Signal, Battery */}
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              {collaboratorName && (
                <button
                  type="button"
                  onClick={onOpenCaseModal}
                  className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="font-semibold">{collaboratorName}</span>
                  <span className="text-[10px] text-amber-400 font-mono">({collaboratorRole})</span>
                </button>
              )}

              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">COE-PC-MX</span>

              {isOnline ? (
                <span title="Conexión en línea activa"><Wifi className="w-3.5 h-3.5 text-emerald-400" /></span>
              ) : (
                <span title="Modo sin conexión"><WifiOff className="w-3.5 h-3.5 text-amber-400" /></span>
              )}

              <div className="flex items-center gap-1 font-mono text-emerald-400 font-bold text-[11px]">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>98%</span>
              </div>
            </div>
          </div>

          {/* Incident Top Quick Selector Bar */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {/* Active Incident Dropdown & Manager Shortcut */}
            <div className="flex items-center flex-wrap gap-2.5">
              <CruzRojaMexicanaEmblem size="md" className="h-9 w-auto shadow-md ring-1 ring-orange-500/40 shrink-0" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIncidentMenuOpen(!incidentMenuOpen)}
                  className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer text-left shadow-sm group"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <span>Incidente Activo:</span>
                      <span className="font-mono text-amber-400 font-bold">{incident.folio}</span>
                    </div>
                    <div className="text-xs font-bold text-white max-w-[240px] sm:max-w-xs md:max-w-md truncate">
                      {incident.nombre}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white ml-1 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                {incidentMenuOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-84 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
                    <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 mb-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Gestión Táctica de Escenarios:
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        Carga, guarda cambios en vivo, elimina definitivamente o sincroniza con tu equipo.
                      </div>
                      {onOpenScenarioModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setIncidentMenuOpen(false);
                            onOpenScenarioModal();
                          }}
                          className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-slate-950" />
                          <span>Abrir Gestor de Escenarios Completo</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">
                      Cambio Rápido de Escenario:
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {presetIncidents.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSelectIncident(p);
                            setIncidentMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex flex-col ${
                            incident.id === p.id
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'hover:bg-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold truncate">{p.nombre}</span>
                            <span className={`text-[10px] font-mono ${incident.id === p.id ? 'text-slate-900' : 'text-amber-400'}`}>
                              {p.tipoIncidente.split(' ')[0]}
                            </span>
                          </div>
                          <span className={`text-[10px] truncate ${incident.id === p.id ? 'text-slate-800' : 'text-slate-400'}`}>
                            {p.municipioEstado}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onNewIncident();
                          setIncidentMenuOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold flex items-center justify-between cursor-pointer border border-slate-800"
                      >
                        <span>+ Crear Nuevo Incidente en Blanco</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Open Scenario Manager Modal Button */}
              {onOpenScenarioModal && (
                <button
                  type="button"
                  onClick={onOpenScenarioModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs cursor-pointer shadow-sm transition active:scale-95"
                  title="Abrir área de cargar, guardar y borrar escenarios"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Cargar / Gestionar Escenarios</span>
                  <span className="sm:hidden">Escenarios</span>
                </button>
              )}

              {/* Direct "Guardar y Seguir Editando" Button */}
              {onSaveAndContinueEditing && (
                <button
                  type="button"
                  onClick={onSaveAndContinueEditing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer transition active:scale-95"
                  title="Guardar escenario registrado y continuar editando en tiempo real"
                >
                  <Save className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden md:inline">Guardar y Seguir Editando</span>
                  <span className="md:hidden">Guardar</span>
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenPeriodoManager}
                className="bg-slate-950 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-amber-500/60 text-slate-300 font-mono text-[11px] hidden sm:flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-sm"
                title="Ver, modificar o eliminar períodos operacionales del incidente (SCI-202)"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>P. Operacional: <strong className="text-amber-400">Nº {incident.periodoOperacional.numero}</strong></span>
              </button>

              <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] hidden md:flex items-center gap-1.5">
                <span>Complejidad:</span>
                <span className="font-bold text-amber-400">{incident.nivelComplejidad}</span>
              </div>

              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${
                  incident.estadoIncidente === 'Activo'
                    ? 'bg-red-500/20 text-red-300 border-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {incident.estadoIncidente}
              </span>
            </div>
          </div>

          {/* Main App Content Viewport (Body) */}
          <div className="flex-1 overflow-hidden relative flex bg-slate-950">
            {children}
          </div>

          {/* iPad Home Bar Indicator */}
          {isSimulatedFrame && (
            <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
              <div className="w-32 h-1 bg-slate-700/60 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
