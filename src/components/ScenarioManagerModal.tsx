import React, { useState, useEffect, useMemo } from 'react';
import { IncidentData } from '../types/sci';
import {
  FolderOpen,
  Save,
  Trash2,
  Share2,
  Copy,
  Check,
  Plus,
  Upload,
  Download,
  Search,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  X,
  Radio,
  Wifi,
  WifiOff,
  Flame,
  Shield,
  Layers,
  Sparkles,
  DollarSign,
  Activity,
  FileCheck2,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import {
  deleteCaseFromFirestore,
  fetchCaseFromFirestore,
  subscribeToAllCases,
  RemoteCaseSummary
} from '../services/firebaseService';

interface ScenarioManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIncident: IncidentData;
  activeCaseId: string;
  registeredScenarios: IncidentData[];
  onLoadAndEditScenario: (scenario: IncidentData, targetCaseId?: string) => void;
  onSaveAndContinueEditing: (scenarioToSave: IncidentData, successNotice?: string) => void;
  onPermanentDeleteScenario: (scenarioId: string, caseId?: string) => void;
  onCreateBlankScenario: () => void;
  onImportScenario: (scenario: IncidentData) => void;
  isOnline: boolean;
  collaboratorCount?: number;
}

export const ScenarioManagerModal: React.FC<ScenarioManagerModalProps> = ({
  isOpen,
  onClose,
  currentIncident,
  activeCaseId,
  registeredScenarios,
  onLoadAndEditScenario,
  onSaveAndContinueEditing,
  onPermanentDeleteScenario,
  onCreateBlankScenario,
  onImportScenario,
  isOnline,
  collaboratorCount = 1
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'activos' | 'sismo' | 'fuego' | 'nube'>('todos');
  const [copiedLinkCaseId, setCopiedLinkCaseId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Deletion Confirmation Dialog State
  const [scenarioToDelete, setScenarioToDelete] = useState<{ id: string; nombre: string; folio: string; caseId?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // "Guardar como nuevo" state
  const [showSaveAsNewModal, setShowSaveAsNewModal] = useState(false);
  const [newScenarioTitle, setNewScenarioTitle] = useState('');
  const [newScenarioFolio, setNewScenarioFolio] = useState('');

  // Remote scenarios state from Firestore
  const [remoteCases, setRemoteCases] = useState<RemoteCaseSummary[]>([]);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to remote cases stored in Firestore
    const unsubscribe = subscribeToAllCases((cases) => {
      setRemoteCases(cases);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  const showNotification = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => {
      setNotificationMsg(null);
    }, 3800);
  };

  // Filtered registered scenarios
  const filteredScenarios = useMemo(() => {
    return registeredScenarios.filter((sc) => {
      const matchSearch =
        searchTerm === '' ||
        sc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sc.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sc.municipioEstado && sc.municipioEstado.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sc.comandanteIncidente && sc.comandanteIncidente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sc.tipoIncidente && sc.tipoIncidente.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;

      if (selectedCategory === 'activos') {
        return sc.estadoIncidente === 'Activo';
      }
      if (selectedCategory === 'sismo') {
        return sc.tipoIncidente.toLowerCase().includes('sismo') || sc.tipoIncidente.toLowerCase().includes('colapso');
      }
      if (selectedCategory === 'fuego') {
        return sc.tipoIncidente.toLowerCase().includes('incendio') || sc.tipoIncidente.toLowerCase().includes('forestal');
      }

      return true;
    });
  }, [registeredScenarios, searchTerm, selectedCategory]);

  if (!isOpen) return null;

  // Copy shareable collaboration link for a specific scenario
  const handleCopyShareLink = (targetId: string, folio: string) => {
    // Generate clean case room ID
    const roomKey = `CASO-${folio.replace(/[^A-Za-z0-9]/g, '-')}`;
    const url = new URL(window.location.href);
    url.searchParams.set('case', roomKey);

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLinkCaseId(targetId);
      showNotification(`¡Enlace copiado! Comparte este enlace para que otros respondientes se unan en vivo a "${folio}".`, 'info');
      setTimeout(() => setCopiedLinkCaseId(null), 3000);
    });
  };

  // Handle immediate "Guardar y Seguir Editando"
  const handleSaveAndKeepEditingCurrent = () => {
    onSaveAndContinueEditing(
      currentIncident,
      `¡Escenario "${currentIncident.nombre}" guardado con éxito! Puedes continuar editando en tiempo real.`
    );
    showNotification(`Escenario "${currentIncident.nombre}" guardado correctamente. Continúas en modo de edición en vivo.`, 'success');
  };

  // Handle Save As New Scenario
  const handleConfirmSaveAsNew = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newScenarioTitle.trim() || `${currentIncident.nombre} (Copia)`;
    const finalFolio = newScenarioFolio.trim() || `SCI-MX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newScenario: IncidentData = {
      ...JSON.parse(JSON.stringify(currentIncident)),
      id: `sc-user-${Date.now()}`,
      nombre: finalTitle,
      folio: finalFolio,
      fechaCreacion: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ultimaModificacion: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onSaveAndContinueEditing(
      newScenario,
      `¡Nuevo escenario "${finalTitle}" registrado! Ahora estás editando esta versión.`
    );
    setShowSaveAsNewModal(false);
    setNewScenarioTitle('');
    setNewScenarioFolio('');
    showNotification(`Se creó y guardó el nuevo escenario "${finalTitle}". Continúas editando en tiempo real.`, 'success');
  };

  // Handle Confirm Permanent Deletion
  const handleConfirmPermanentDelete = async () => {
    if (!scenarioToDelete) return;
    setIsDeleting(true);

    try {
      // If linked to a firestore case, delete from cloud as well
      const caseToDelete = scenarioToDelete.caseId || `CASO-${scenarioToDelete.folio.replace(/[^A-Za-z0-9]/g, '-')}`;
      await deleteCaseFromFirestore(caseToDelete);

      onPermanentDeleteScenario(scenarioToDelete.id, caseToDelete);
      showNotification(`El escenario "${scenarioToDelete.nombre}" ha sido borrado de manera definitiva del dispositivo y de la nube.`, 'warn');
      setScenarioToDelete(null);
    } catch (err) {
      console.error('Error al borrar escenario:', err);
      showNotification('Ocurrió un error al intentar borrar el escenario.', 'warn');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle loading a remote cloud case
  const handleLoadRemoteCase = async (remCaseId: string) => {
    setIsLoadingRemote(true);
    try {
      const data = await fetchCaseFromFirestore(remCaseId);
      if (data) {
        onLoadAndEditScenario(data, remCaseId);
        showNotification(`Escenario remoto "${data.nombre}" cargado exitosamente. Sincronización en vivo activa.`, 'success');
        onClose();
      } else {
        showNotification('No se pudo encontrar el expediente en la nube.', 'warn');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al conectar con la nube.', 'warn');
    } finally {
      setIsLoadingRemote(false);
    }
  };

  // Export specific scenario to JSON
  const handleExportJSON = (sc: IncidentData) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sc, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ESCENARIO_SCI_${sc.folio.replace(/[^A-Za-z0-9]/g, '_')}_${sc.nombre.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showNotification(`Archivo JSON de "${sc.folio}" descargado para respaldo fuera de línea.`, 'info');
  };

  // Import JSON file
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.nombre && imported.folio) {
          const freshId: IncidentData = {
            ...imported,
            id: `sc-import-${Date.now()}`
          };
          onImportScenario(freshId);
          showNotification(`¡Escenario importado exitosamente: "${freshId.nombre}"!`, 'success');
        } else {
          showNotification('El archivo no contiene un formato válido de incidente SCI.', 'warn');
        }
      } catch (err) {
        showNotification('Error al procesar el archivo JSON importado.', 'warn');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-500/20 shrink-0">
              <FolderOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
                  Área de Carga y Gestión de Escenarios
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NOM-010-SEGOB
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Guarda, borra definitivamente, sincroniza en tiempo real y comparte escenarios operativos entre varios usuarios simultáneamente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Create Blank */}
            <button
              type="button"
              onClick={() => {
                onCreateBlankScenario();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="Iniciar un formulario completamente en blanco"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Nuevo en Blanco</span>
            </button>

            {/* Quick Import JSON */}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer transition"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notificationMsg && (
          <div
            className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700'
                : notificationMsg.type === 'warn'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700'
                : 'bg-blue-950/90 text-blue-200 border-blue-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{notificationMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotificationMsg(null)}
              className="p-1 hover:opacity-80 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/40">

          {/* ACTIVE SCENARIO HIGHLIGHT BANNER (GUARDAR Y SEGUIR EDITANDO) */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Escenario Activo en tu Mesa de Trabajo
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (Caso: {activeCaseId})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>{currentIncident.nombre}</span>
                  <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-slate-950/80 border border-amber-500/30">
                    {currentIncident.folio}
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentIncident.municipioEstado || 'Ubicación registrada'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    {currentIncident.comandanteIncidente || 'Comandante en puesto'}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
                    <Users className="w-3.5 h-3.5" />
                    {collaboratorCount} respondedor{collaboratorCount > 1 ? 'es' : ''} en línea
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS FOR ACTIVE SCENARIO */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                {/* 1. GUARDAR Y SEGUIR EDITANDO */}
                <button
                  type="button"
                  onClick={handleSaveAndKeepEditingCurrent}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95"
                  title="Guarda los cambios actuales en el registro y en la sincronización en la nube, continuando la edición"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Guardar y Seguir Editando</span>
                </button>

                {/* 2. GUARDAR COMO NUEVO ESCENARIO */}
                <button
                  type="button"
                  onClick={() => {
                    setNewScenarioTitle(`${currentIncident.nombre} (Revisión)`);
                    setNewScenarioFolio(`SCI-MX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
                    setShowSaveAsNewModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
                  title="Guardar una copia o nueva versión sin sobreescribir el actual"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guardar como Nuevo</span>
                </button>

                {/* 3. COMPARTIR ENLACE DE EDICIÓN EN VIVO */}
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(currentIncident.id, currentIncident.folio)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
                  title="Copiar enlace para editar simultáneamente con otros usuarios"
                >
                  {copiedLinkCaseId === currentIncident.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Compartir en Vivo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SEARCH, FILTER CHIPS & STATISTICS BAR */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, folio, tipo de desastre, lugar o comandante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Quick Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todos')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'todos'
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Todos ({registeredScenarios.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('activos')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'activos'
                      ? 'bg-red-600 text-white font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Activos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('sismo')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'sismo'
                      ? 'bg-orange-600 text-white font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Sismos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('fuego')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'fuego'
                      ? 'bg-amber-600 text-white font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Incendios
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('nube')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === 'nube'
                      ? 'bg-cyan-600 text-white font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Wifi className="w-3 h-3 text-cyan-300" />
                  <span>En la Nube ({remoteCases.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* VIEW: REMOTE CLOUD CASES TAB */}
          {selectedCategory === 'nube' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Escenarios Sincronizados en la Nube (Firebase Firestore)
                </span>
                <span className="text-[11px] font-mono">
                  {remoteCases.length} caso{remoteCases.length !== 1 ? 's' : ''} disponible{remoteCases.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {remoteCases.map((rc) => {
                  const isCurrentActive = activeCaseId === rc.id || currentIncident.folio === rc.folio;
                  const dateStr = new Date(rc.lastUpdated).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

                  return (
                    <div
                      key={rc.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrentActive
                          ? 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/50">
                            {rc.folio}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Act.: {dateStr}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm">{rc.nombre}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-amber-300 font-semibold">{rc.tipoIncidente}</span>
                          <span>·</span>
                          <span>{rc.nivelComplejidad}</span>
                          {rc.municipioEstado && (
                            <>
                              <span>·</span>
                              <span>{rc.municipioEstado}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                          Por: {rc.updatedBy}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleLoadRemoteCase(rc.id)}
                            disabled={isLoadingRemote}
                            className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isCurrentActive ? 'En Uso' : 'Cargar de la Nube'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setScenarioToDelete({ id: rc.id, nombre: rc.nombre, folio: rc.folio, caseId: rc.id })}
                            className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                            title="Borrar de la nube definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {remoteCases.length === 0 && (
                  <div className="col-span-full py-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                    No se encontraron escenarios almacenados en la nube.
                    <div className="text-[11px] text-slate-500 mt-1">
                      Usa el botón "Guardar y Seguir Editando" para sincronizar el escenario activo con tu equipo.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: REGISTERED SCENARIOS CARDS LIST */}
          {selectedCategory !== 'nube' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold uppercase tracking-wider text-slate-300">
                  Escenarios Registrados ({filteredScenarios.length})
                </span>
                <span className="text-[11px] font-mono">
                  Haz clic en "Cargar y Seguir Editando" para abrir o en "Borrar" para eliminar permanentemente
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredScenarios.map((sc) => {
                  const isCurrentActive = currentIncident.id === sc.id || currentIncident.folio === sc.folio;
                  
                  // Summary metrics for fast operational comprehension
                  const totalItemsFinancieros = sc.centroCostos?.items?.length || 0;
                  const totalGastos = (sc.centroCostos?.items || []).reduce((acc, it) => {
                    const val = Number(it.montoTotal) || 0;
                    return it.tipo !== 'Ganancia' ? acc + val : acc;
                  }, 0);
                  const totalHorasHombre = (sc.controlHorasHombre?.registros || []).reduce((acc, r) => acc + (Number(r.totalHorasHombre) || 0), 0);
                  const totalPacientes = sc.sci207?.pacientesAtendidos?.length || 0;

                  return (
                    <div
                      key={sc.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
                        isCurrentActive
                          ? 'bg-slate-900/95 border-amber-500/80 shadow-xl shadow-amber-500/10'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-lg'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/40">
                              {sc.folio}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
                              {sc.nivelComplejidad}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                sc.estadoIncidente === 'Activo'
                                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {sc.estadoIncidente}
                            </span>
                            {isCurrentActive && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 animate-pulse">
                                ACTIVO AHORA
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-white text-sm line-clamp-2 pt-0.5">
                            {sc.nombre}
                          </h4>
                        </div>
                      </div>

                      {/* Tactical Location & Commander Info */}
                      <div className="space-y-1 text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-300/90 font-semibold truncate max-w-[200px]">
                            {sc.tipoIncidente}
                          </span>
                          <span className="font-mono text-slate-500">
                            P. Operacional: {sc.periodoOperacional?.numero || 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] truncate">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{sc.municipioEstado || sc.lugar || 'Ubicación no especificada'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] truncate">
                          <Shield className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate text-slate-300">{sc.comandanteIncidente || 'Comando Unificado'}</span>
                        </div>
                      </div>

                      {/* Quick Comprehension Metric Chips */}
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                        <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">COSTOS</span>
                          <span className="text-emerald-400 font-bold">
                            {totalGastos > 0 ? `$${(totalGastos / 1000).toFixed(0)}k` : '$0'}
                          </span>
                        </div>
                        <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">HORAS-H</span>
                          <span className="text-cyan-400 font-bold">{totalHorasHombre}h</span>
                        </div>
                        <div className="bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">PACIENTES</span>
                          <span className="text-amber-400 font-bold">{totalPacientes}</span>
                        </div>
                      </div>

                      {/* Scenario Action Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-2">
                        {/* 1. CARGAR Y SEGUIR EDITANDO */}
                        <button
                          type="button"
                          onClick={() => {
                            onLoadAndEditScenario(sc);
                            showNotification(`¡Escenario "${sc.nombre}" cargado con éxito! Continúas editando en tiempo real.`, 'success');
                            onClose();
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 ${
                            isCurrentActive
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                          }`}
                          title="Cargar este escenario y mantener la sesión de edición activa sincronizada"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{isCurrentActive ? 'Seguir Editando' : 'Cargar y Seguir Editando'}</span>
                        </button>

                        {/* 2. COMPARTIR ENLACE DE COLABORACIÓN */}
                        <button
                          type="button"
                          onClick={() => handleCopyShareLink(sc.id, sc.folio)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                          title="Copiar enlace para compartir y editar simultáneamente"
                        >
                          {copiedLinkCaseId === sc.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                        </button>

                        {/* 3. EXPORTAR JSON */}
                        <button
                          type="button"
                          onClick={() => handleExportJSON(sc)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                          title="Exportar respaldo JSON"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-300" />
                        </button>

                        {/* 4. BORRAR DE MANERA DEFINITIVA */}
                        <button
                          type="button"
                          onClick={() => {
                            setScenarioToDelete({
                              id: sc.id,
                              nombre: sc.nombre,
                              folio: sc.folio,
                              caseId: `CASO-${sc.folio.replace(/[^A-Za-z0-9]/g, '-')}`
                            });
                          }}
                          className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 transition cursor-pointer"
                          title="Borrar de manera definitiva este escenario"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredScenarios.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-60" />
                    No se encontraron escenarios con los criterios de búsqueda seleccionados.
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('todos');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                      >
                        Restablecer Filtros
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isOnline ? 'Sincronización en línea disponible' : 'Modo fuera de línea (Almacenamiento local persistente)'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMACIÓN DE BORRADO DEFINITIVO */}
      {scenarioToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  ¿Borrar de Manera Definitiva?
                </h3>
                <p className="text-[11px] text-rose-300">
                  Esta acción es irreversible y no se podrá deshacer.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">
                Estás a punto de borrar permanentemente el siguiente escenario:
              </div>
              <div className="font-bold text-white text-sm">
                {scenarioToDelete.nombre}
              </div>
              <div className="font-mono text-amber-400 text-xs">
                Folio: {scenarioToDelete.folio}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                Se eliminarán todos los registros asociados: formularios SCI (201 a 221), balances del Centro de Costos, horas-hombre y presencia en la nube compartida.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setScenarioToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Cancelar y Mantener
              </button>
              <button
                type="button"
                onClick={handleConfirmPermanentDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Eliminando...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Borrar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE "GUARDAR COMO NUEVO ESCENARIO" */}
      {showSaveAsNewModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <form
            onSubmit={handleConfirmSaveAsNew}
            className="bg-slate-900 border-2 border-amber-500 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Save className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Guardar como Nuevo Escenario
                </h3>
                <p className="text-[11px] text-slate-400">
                  Crea un nuevo registro independiente a partir del estado actual
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Nombre del Escenario / Operativo:
                </label>
                <input
                  type="text"
                  required
                  value={newScenarioTitle}
                  onChange={(e) => setNewScenarioTitle(e.target.value)}
                  placeholder="Ej: Sismo M 7.2 - Réplica y Fase de Estabilización"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Folio Oficial SCI:
                </label>
                <input
                  type="text"
                  required
                  value={newScenarioFolio}
                  onChange={(e) => setNewScenarioFolio(e.target.value)}
                  placeholder="Ej: SCI-MX-2026-0090"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-amber-400 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                Al guardar, este nuevo escenario quedará registrado en tu lista y en la nube. La aplicación comenzará a editarlo de inmediato y podrás compartirlo con tu equipo.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveAsNewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>Guardar y Comenzar Edición</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
