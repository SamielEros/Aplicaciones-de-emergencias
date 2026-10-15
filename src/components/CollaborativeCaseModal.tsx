import React, { useState } from 'react';
import {
  Users,
  Radio,
  Share2,
  Copy,
  Check,
  Shield,
  Smartphone,
  Monitor,
  Apple,
  Globe,
  Activity,
  Sparkles,
  Wifi,
  WifiOff,
  Clock,
  ArrowRight,
  UserCheck,
  X,
  AlertCircle
} from 'lucide-react';
import { CollaboratorInfo, ActivityItem, CaseSyncMetadata } from '../services/firebaseService';

interface CollaborativeCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onChangeCaseId: (newCaseId: string) => void;
  currentCollaborator: CollaboratorInfo;
  onUpdateCollaborator: (name: string, role: string) => void;
  collaborators: CollaboratorInfo[];
  activities: ActivityItem[];
  syncMeta: CaseSyncMetadata | null;
  isOnline: boolean;
  onForceSync: () => void;
}

const SCI_ROLES = [
  'Comandante del Incidente (CI)',
  'Oficial de Seguridad',
  'Oficial de Información Pública (OIP)',
  'Oficial de Enlace',
  'Jefe de Sección de Operaciones',
  'Jefe de Sección de Planificación',
  'Jefe de Sección de Logística',
  'Jefe de Sección de Administración y Finanzas',
  'Líder de Recursos y Personal (SCI-211)',
  'Médico / Triage en Campo (SCI-207)',
  'Comunicaciones de Emergencia (SCI-205)',
  'Evaluador de Daños y Necesidades (EDAN)'
];

const PRESET_CASES = [
  {
    id: 'CASO-VOLCAN-POPOCATEPETL-2026',
    title: 'Caso Práctico 1: Erupción Volcánica Popocatépetl (Fase Amarilla 3)',
    desc: 'Evacuación de comunidades rurales, ceniza volcánica y apertura de refugios.'
  },
  {
    id: 'CASO-SISMO-CDMX-7.2',
    title: 'Caso Práctico 2: Sismo Magnitud 7.2 en Área Metropolitana',
    desc: 'Colapso estructural, triage masivo de víctimas y corte de suministros.'
  },
  {
    id: 'CASO-INCENDIO-FORESTAL-AJUSCO',
    title: 'Caso Práctico 3: Incendio Forestal y de Interfaz Urbana',
    desc: 'Combate de fuego agreste, helitransporte y protección a asentamientos.'
  },
  {
    id: 'CASO-INUNDACION-TABASCO-2026',
    title: 'Caso Práctico 4: Inundación Fluvial y Rescate Acuático',
    desc: 'Desbordamiento de ríos, evacuación en lanchas y abastecimiento de albergues.'
  }
];

export const CollaborativeCaseModal: React.FC<CollaborativeCaseModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onChangeCaseId,
  currentCollaborator,
  onUpdateCollaborator,
  collaborators,
  activities,
  syncMeta,
  isOnline,
  onForceSync
}) => {
  const [tempName, setTempName] = useState(currentCollaborator.userName);
  const [tempRole, setTempRole] = useState(currentCollaborator.userRole);
  const [customCaseInput, setCustomCaseInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'cases' | 'activity'>('team');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    onUpdateCollaborator(tempName.trim(), tempRole);
    setActiveTab('team');
  };

  const handleCopyShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('case', caseId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleSelectCase = (id: string) => {
    onChangeCaseId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('case', id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleCustomCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCaseInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
    if (clean) {
      handleSelectCase(clean);
      setCustomCaseInput('');
    }
  };

  const getPlatformIcon = (platform?: string) => {
    switch (platform) {
      case 'windows':
        return <span title="Windows PC"><Monitor className="w-3.5 h-3.5 text-blue-400" /></span>;
      case 'android':
        return <span title="Android"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /></span>;
      case 'ios':
        return <span title="iOS / iPadOS"><Apple className="w-3.5 h-3.5 text-slate-200" /></span>;
      default:
        return <span title="Web"><Globe className="w-3.5 h-3.5 text-cyan-400" /></span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Colaboración Multiusuario en Tiempo Real
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {isOnline ? 'En Línea' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Caso: <strong className="text-amber-400 font-mono">{caseId}</strong></span>
                <span>•</span>
                <span>{collaborators.length} respondedores conectados</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className={`px-5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b ${
          isOnline
            ? syncMeta?.hasPendingWrites
              ? 'bg-amber-950/40 border-amber-800/40 text-amber-300'
              : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isOnline
                ? syncMeta?.hasPendingWrites
                  ? 'Sincronizando cambios con el equipo en campo...'
                  : 'Sincronizado con la nube y el equipo en tiempo real.'
                : 'Modo Offline: Datos resguardados localmente. Se sincronizarán al reconectar.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onForceSync}
              className="text-[11px] font-bold underline hover:text-white cursor-pointer"
            >
              Forzar sincronización
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'team'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipo en Campo ({collaborators.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cases'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Casos Prácticos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Mi Identidad SCI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Bitácora de Cambios</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* TAB: TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {/* Share link box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">
                      Enlace para conectar a otros respondedores al mismo caso:
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {caseId}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?case=${caseId}`}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? '¡Copiado!' : 'Copiar Enlace'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cualquier oficial o brigadista con este enlace en su laptop Windows, celular Android o iPhone/iPad se unirá inmediatamente a este mismo caso y verá las actualizaciones al instante.
                </p>
              </div>

              {/* Collaborators List */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Respondedores Conectados en este Caso:</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {collaborators.length} en línea
                  </span>
                </h3>

                <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  {collaborators.map((user) => (
                    <div
                      key={user.userId}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center relative font-bold text-amber-400 text-sm">
                          {user.userName.slice(0, 2).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{user.userName}</span>
                            {user.isCurrentUser && (
                              <span className="text-[9px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.5 rounded">
                                Tú
                              </span>
                            )}
                            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-300">
                              {getPlatformIcon(user.platform)}
                              <span className="capitalize">{user.platform || 'web'}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-amber-400/90 font-medium">{user.userRole}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono">
                          Editando {user.activeForm || 'SCI-201'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Activo ahora</p>
                      </div>
                    </div>
                  ))}

                  {collaborators.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                      Esperando conexión de compañeros... Comparte el enlace del caso.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CASES */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs">
                Selecciona uno de los casos prácticos precargados para entrenamiento y respuesta, o ingresa un código personalizado para crear un caso nuevo en tu jurisdicción.
              </div>

              {/* Preloaded Cases */}
              <div className="space-y-2.5">
                {PRESET_CASES.map((c) => {
                  const isActive = caseId === c.id;
                  return (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border transition cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                      }`}
                      onClick={() => handleSelectCase(c.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-xs">{c.title}</h4>
                            {isActive && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                                Activo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">{c.desc}</p>
                          <span className="font-mono text-[10px] text-slate-500 mt-1 block">ID: {c.id}</span>
                        </div>
                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isActive
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          {isActive ? 'Conectado' : 'Unirse'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Case / Sala de Incidente */}
              <form onSubmit={handleCustomCaseSubmit} className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-white">
                  Crear o Conectarse a Otro Caso / Folio de Emergencia:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCaseInput}
                    onChange={(e) => setCustomCaseInput(e.target.value)}
                    placeholder="Ejemplo: INC-INUNDACION-VERACRUZ-2026"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs cursor-pointer transition"
                  >
                    Abrir Caso
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs">
                Esta identidad se mostrará en tiempo real a los demás miembros del comando de incidentes cuando realices cambios en los formularios y croquis tácticos.
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white">
                  Nombre Completo o Indicativo de Radio:
                </label>
                <input
                  type="text"
                  required
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Ej. Comandante Roberto Morales"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-white">
                  Función / Rol Oficial en el Sistema de Comando:
                </label>
                <select
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {SCI_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Plataforma detectada:</span>
                <span className="font-mono text-white flex items-center gap-1.5 capitalize font-bold">
                  {getPlatformIcon(currentCollaborator.platform)}
                  {currentCollaborator.platform}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  Actualizar Mi Identidad en el Caso
                </button>
              </div>
            </form>
          )}

          {/* TAB: ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Bitácora en Vivo de Operaciones:
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Últimos {activities.length} eventos
                </span>
              </div>

              <div className="space-y-2">
                {activities.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-white font-semibold">
                          <strong className="text-amber-400">{item.userName}</strong> ({item.userRole})
                        </p>
                        <p className="text-slate-400 text-[11px]">{item.action}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    Aún no hay actividades registradas en este caso. Realiza cambios en los formularios para transmitirlos al equipo.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Actualización en tiempo real habilitada</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
