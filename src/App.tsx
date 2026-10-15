/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormId, IncidentData } from './types/sci';
import { PRESET_INCIDENTS, BLANK_INCIDENT_TEMPLATE } from './data/presetIncidents';
import { IpadContainer } from './components/IpadContainer';
import { FormNav } from './components/FormNav';
import { PAICompilationModal } from './components/PAICompilationModal';
import { NormaGuideModal } from './components/NormaGuideModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { EventHistoryModal } from './components/EventHistoryModal';
import { CollaborativeCaseModal } from './components/CollaborativeCaseModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { ScenarioManagerModal } from './components/ScenarioManagerModal';

import {
  syncIncidentToFirestore,
  deleteCaseFromFirestore,
  subscribeToIncident,
  subscribeToCollaborators,
  subscribeToActivity,
  updateCollaboratorPresence,
  detectPlatform,
  CollaboratorInfo,
  ActivityItem,
  CaseSyncMetadata
} from './services/firebaseService';

// Form Components
import { SCI201Form } from './components/forms/SCI201Form';
import { SCI202Form } from './components/forms/SCI202Form';
import { SCI203Form } from './components/forms/SCI203Form';
import { SCI204Form } from './components/forms/SCI204Form';
import { SCI205Form } from './components/forms/SCI205Form';
import { SCI206Form } from './components/forms/SCI206Form';
import { SCI207Form } from './components/forms/SCI207Form';
import { SCI208Form } from './components/forms/SCI208Form';
import { SCI209Form } from './components/forms/SCI209Form';
import { SCI211Form } from './components/forms/SCI211Form';
import { SCI214Form } from './components/forms/SCI214Form';
import { SCI221Form } from './components/forms/SCI221Form';
import { CostCenterForm } from './components/forms/CostCenterForm';
import { ManHoursForm } from './components/forms/ManHoursForm';

import {
  Menu,
  X,
  Search,
  CheckCircle,
  FileCheck2,
  Share2,
  RefreshCw,
  FolderDown,
  Upload,
  Calendar,
  MapPin,
  User,
  Shield,
  Layers,
  Sparkles,
  CloudUpload,
  Users,
  Wifi,
  WifiOff,
  Radio,
  Download,
  Bell,
  FolderOpen,
  Save
} from 'lucide-react';

const STORAGE_KEY = 'sci_mexico_nom010_incident_v1';
const CASE_STORAGE_KEY = 'sci_active_case_id_v1';
const USER_STORAGE_KEY = 'sci_responder_profile_v1';
const REGISTERED_SCENARIOS_KEY = 'sci_registered_scenarios_v2';

// Initial case ID helper
function getInitialCaseId(): string {
  try {
    const params = new URLSearchParams(window.location.search);
    const caseParam = params.get('case');
    if (caseParam && caseParam.trim()) {
      return caseParam.trim().toUpperCase();
    }
    const saved = localStorage.getItem(CASE_STORAGE_KEY);
    if (saved) return saved;
  } catch (e) {
    // ignore
  }
  return 'CASO-OPERATIVO-01';
}

// Initial collaborator profile helper
function getInitialCollaborator(): CollaboratorInfo {
  let userId = 'resp-' + Math.random().toString(36).substring(2, 9);
  let userName = 'Comandante de Turno';
  let userRole = 'Comandante del Incidente (CI)';

  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.userId) userId = parsed.userId;
      if (parsed.userName) userName = parsed.userName;
      if (parsed.userRole) userRole = parsed.userRole;
    } else {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ userId, userName, userRole }));
    }
  } catch (e) {
    // ignore
  }

  return {
    userId,
    userName,
    userRole,
    activeForm: 'SCI-201',
    lastSeen: Date.now(),
    platform: detectPlatform(),
    isCurrentUser: true
  };
}

export default function App() {
  const [incident, setIncident] = useState<IncidentData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading stored incident', e);
    }
    return PRESET_INCIDENTS[0];
  });

  const [currentForm, setCurrentForm] = useState<FormId>('SCI-201');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaiModalOpen, setIsPaiModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Guardado');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showGeneralInfoModal, setShowGeneralInfoModal] = useState(false);

  // Cross-Platform, Offline & Multi-user Real-Time State
  const [caseId, setCaseId] = useState<string>(getInitialCaseId);
  const [collaborator, setCollaborator] = useState<CollaboratorInfo>(getInitialCollaborator);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncMeta, setSyncMeta] = useState<CaseSyncMetadata | null>(null);
  const [liveToast, setLiveToast] = useState<string | null>(null);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);

  // Registered Scenarios State (Local + Cloud + Offline)
  const [registeredScenarios, setRegisteredScenarios] = useState<IncidentData[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_SCENARIOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading registered scenarios', e);
    }
    return PRESET_INCIDENTS;
  });
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('sci_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sci_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
        if (document.body) document.body.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
        if (document.body) document.body.classList.remove('light-theme');
      }
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync registeredScenarios to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_SCENARIOS_KEY, JSON.stringify(registeredScenarios));
    } catch (e) {
      // ignore
    }
  }, [registeredScenarios]);

  // Sync debounce refs to prevent rapid flooding, main thread freezing and cursor jumping
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLocalEditTimeRef = useRef<number>(0);
  const isIncomingUpdateRef = useRef(false);

  // Track online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLiveToast('🟢 Conexión a internet restablecida. Sincronizando datos...');
      setTimeout(() => setLiveToast(null), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setLiveToast('🟠 Modo Sin Conexión (Offline). Los datos se guardan en tu dispositivo y se sincronizarán al reconectar.');
      setTimeout(() => setLiveToast(null), 5000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save caseId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CASE_STORAGE_KEY, caseId);
    } catch (e) {
      // ignore
    }
  }, [caseId]);

  // Subscribe to real-time incident updates from Firestore (with automatic offline cache)
  useEffect(() => {
    console.log(`Subscribing to incident case: ${caseId}`);

    const unsubscribeIncident = subscribeToIncident(
      caseId,
      (remoteIncident, meta) => {
        setSyncMeta(meta);

        // 1. NEVER overwrite local React state if snapshot represents local pending writes
        if (meta.hasPendingWrites) {
          return;
        }

        // 2. Check if change originated from this client (self-update echo)
        const remoteMeta = (remoteIncident as any)._syncMeta;
        if (remoteMeta && remoteMeta.updatedBy === collaborator.userName) {
          return;
        }

        // 3. Prevent cursor jumping and character loss:
        // If local user recently edited (< 2500ms) or an input is actively focused,
        // DO NOT clobber the user's active typing buffer!
        const isRecentlyEditedLocally = Date.now() - lastLocalEditTimeRef.current < 2500;
        const isInputFocused =
          typeof document !== 'undefined' &&
          document.activeElement &&
          (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');

        if (isRecentlyEditedLocally || isInputFocused) {
          return;
        }

        if (remoteMeta && remoteMeta.updatedBy && remoteMeta.updatedBy !== collaborator.userName) {
          const bannerMsg = `⚡ ${remoteMeta.updatedBy} (${remoteMeta.updatedRole || 'Comando'}) actualizó ${remoteMeta.updatedForm || 'el formulario'}`;
          setLiveToast(bannerMsg);
          setTimeout(() => setLiveToast(null), 4000);
        }

        // Apply incoming incident state safely
        isIncomingUpdateRef.current = true;
        setIncident(remoteIncident);
        setTimeout(() => {
          isIncomingUpdateRef.current = false;
        }, 100);

        const now = new Date();
        setLastSavedTime(`Sincronizado ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      },
      (err) => {
        console.warn('Subscription error, using offline local state:', err);
      }
    );

    // Subscribe to active team collaborators
    const unsubscribeCollaborators = subscribeToCollaborators(
      caseId,
      collaborator.userId,
      (users) => {
        setCollaborators(users);
      }
    );

    // Subscribe to incident activity feed
    const unsubscribeActivity = subscribeToActivity(
      caseId,
      (items) => {
        setActivities(items);
      }
    );

    return () => {
      unsubscribeIncident();
      unsubscribeCollaborators();
      unsubscribeActivity();
    };
  }, [caseId, collaborator.userId, collaborator.userName]);

  // Heartbeat & presence update
  useEffect(() => {
    const updatePresence = () => {
      updateCollaboratorPresence(caseId, {
        ...collaborator,
        activeForm: currentForm,
        lastSeen: Date.now()
      });
    };

    updatePresence();
    const heartbeat = setInterval(updatePresence, 25000); // 25s heartbeat

    return () => clearInterval(heartbeat);
  }, [caseId, collaborator, currentForm]);

  // Push local changes to Firestore (debounced) and LocalStorage (debounced to avoid blocking typing)
  const triggerSync = useCallback((updatedIncident: IncidentData) => {
    lastLocalEditTimeRef.current = Date.now();

    // Debounce localStorage.setItem so we don't JSON.stringify the whole incident on every single keystroke!
    if (localSaveTimeoutRef.current) {
      clearTimeout(localSaveTimeoutRef.current);
    }
    localSaveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIncident));
        const now = new Date();
        setLastSavedTime(
          `Guardado ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        );
      } catch (e) {
        console.warn('Failed to local cache', e);
      }
    }, 800);

    // Don't echo incoming updates back to server
    if (isIncomingUpdateRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await syncIncidentToFirestore(caseId, updatedIncident, {
          name: collaborator.userName,
          role: collaborator.userRole,
          formId: currentForm
        });
      } catch (err) {
        console.warn('Sync pending in offline cache:', err);
      }
    }, 1200);
  }, [caseId, collaborator, currentForm]);

  const updateIncidentField = <K extends keyof IncidentData>(field: K, val: IncidentData[K]) => {
    lastLocalEditTimeRef.current = Date.now();
    setIncident((prev) => {
      const updated: IncidentData = {
        ...prev,
        [field]: val,
        ultimaModificacion: new Date().toISOString().replace('T', ' ').slice(0, 16)
      };
      triggerSync(updated);
      return updated;
    });
  };

  const handleManualSave = async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incident));
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(`Guardado ${timeStr}`);
      setSaveToast(`¡Cambios guardados con éxito a las ${timeStr}!`);
      setTimeout(() => setSaveToast(null), 3000);

      // Force push to Firestore / offline cache
      await syncIncidentToFirestore(caseId, incident, {
        name: collaborator.userName,
        role: collaborator.userRole,
        formId: currentForm
      });
    } catch (e) {
      setSaveToast('Guardado localmente. Se sincronizará al reconectar.');
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  const handleUpdateCollaboratorProfile = (name: string, role: string) => {
    const updated = {
      ...collaborator,
      userName: name,
      userRole: role
    };
    setCollaborator(updated);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
        userId: collaborator.userId,
        userName: name,
        userRole: role
      }));
    } catch (e) {
      // ignore
    }
    updateCollaboratorPresence(caseId, updated);
  };

  const handleChangeCaseId = (newCaseId: string) => {
    setCaseId(newCaseId);
    setLiveToast(`Cambiando a caso: ${newCaseId}...`);
    setTimeout(() => setLiveToast(null), 3000);
  };

  const handleNewIncident = () => {
    const freshTemplate: IncidentData = {
      ...BLANK_INCIDENT_TEMPLATE,
      id: `inc-${Date.now()}`,
      folio: `SCI-MX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      fechaCreacion: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setIncident(freshTemplate);
    triggerSync(freshTemplate);
    setCurrentForm('SCI-201');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.folio && parsed.sci201) {
          handleImportScenario(parsed);
          setSaveToast('Incidente importado con éxito y registrado para edición colaborativa.');
          setTimeout(() => setSaveToast(null), 3500);
        } else {
          setSaveToast('El archivo no contiene un formato de incidente SCI válido.');
          setTimeout(() => setSaveToast(null), 3500);
        }
      } catch (err) {
        setSaveToast('Error al procesar el archivo JSON.');
        setTimeout(() => setSaveToast(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Scenario Management Handlers
  const handleLoadAndEditScenario = (targetScenario: IncidentData, targetCaseId?: string) => {
    setIncident(targetScenario);
    const room = targetCaseId || `CASO-${targetScenario.folio.replace(/[^A-Za-z0-9]/g, '-')}`;
    setCaseId(room);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('case', room);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }

    triggerSync(targetScenario);
    setLiveToast(`🟢 Escenario "${targetScenario.nombre}" cargado. Sincronización en vivo activa.`);
    setTimeout(() => setLiveToast(null), 4000);
  };

  const handleSaveAndContinueEditing = (scenarioToSave: IncidentData, customNotice?: string) => {
    const updatedWithTime: IncidentData = {
      ...scenarioToSave,
      ultimaModificacion: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    setIncident(updatedWithTime);

    setRegisteredScenarios((prev) => {
      const existsIndex = prev.findIndex(
        (s) => s.id === updatedWithTime.id || s.folio === updatedWithTime.folio
      );
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = updatedWithTime;
        return next;
      }
      return [updatedWithTime, ...prev];
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWithTime));
    } catch (e) {
      console.warn('Failed to local cache', e);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(`Guardado ${timeStr}`);

    const notice = customNotice || `¡Escenario "${updatedWithTime.nombre}" guardado con éxito! Continúas editando en tiempo real.`;
    setSaveToast(notice);
    setTimeout(() => setSaveToast(null), 3500);

    // Push immediately to Firestore
    syncIncidentToFirestore(caseId, updatedWithTime, {
      name: collaborator.userName,
      role: collaborator.userRole,
      formId: currentForm
    }).catch((err) => {
      console.warn('Sync pending in offline cache:', err);
    });
  };

  const handlePermanentDeleteScenario = (scenarioId: string, caseIdToDelete?: string) => {
    setRegisteredScenarios((prev) => {
      const updated = prev.filter((s) => s.id !== scenarioId);
      // If deleted active scenario, switch to the first available or blank
      if (incident.id === scenarioId) {
        if (updated.length > 0) {
          setIncident(updated[0]);
          triggerSync(updated[0]);
        } else {
          handleNewIncident();
        }
      }
      return updated;
    });

    if (caseIdToDelete) {
      deleteCaseFromFirestore(caseIdToDelete).catch((err) => {
        console.warn('Could not delete from Firestore:', err);
      });
    }

    setSaveToast('Escenario borrado de manera definitiva.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleImportScenario = (sc: IncidentData) => {
    setRegisteredScenarios((prev) => [sc, ...prev.filter((p) => p.folio !== sc.folio)]);
    handleLoadAndEditScenario(sc);
  };

  // Render Form Component dynamically
  const renderCurrentForm = () => {
    switch (currentForm) {
      case 'SCI-201':
        return (
          <SCI201Form
            data={incident.sci201}
            onChange={(d) => updateIncidentField('sci201', d)}
            incidentName={incident.nombre}
            lugar={incident.lugar}
          />
        );
      case 'SCI-202':
        return (
          <SCI202Form
            data={incident.sci202}
            onChange={(d) => updateIncidentField('sci202', d)}
            periodo={incident.periodoOperacional}
            periodos={incident.periodosOperacionales}
            onUpdatePeriodo={(periodoActual, todosLosPeriodos) => {
              setIncident((prev) => ({
                ...prev,
                periodoOperacional: periodoActual,
                periodosOperacionales: todosLosPeriodos
              }));
              triggerSync({
                ...incident,
                periodoOperacional: periodoActual,
                periodosOperacionales: todosLosPeriodos
              });
            }}
            comandante={incident.comandanteIncidente}
          />
        );
      case 'SCI-203':
        return (
          <SCI203Form
            data={incident.sci203}
            onChange={(d) => updateIncidentField('sci203', d)}
          />
        );
      case 'SCI-204':
        return (
          <SCI204Form
            data={incident.sci204}
            onChange={(d) => updateIncidentField('sci204', d)}
            periodoNumero={incident.periodoOperacional.numero}
          />
        );
      case 'SCI-205':
        return (
          <SCI205Form
            data={incident.sci205}
            onChange={(d) => updateIncidentField('sci205', d)}
          />
        );
      case 'SCI-206':
        return (
          <SCI206Form
            data={incident.sci206}
            onChange={(d) => updateIncidentField('sci206', d)}
          />
        );
      case 'SCI-207':
        return (
          <SCI207Form
            data={incident.sci207}
            onChange={(d) => updateIncidentField('sci207', d)}
          />
        );
      case 'SCI-208':
        return (
          <SCI208Form
            data={incident.sci208}
            onChange={(d) => updateIncidentField('sci208', d)}
          />
        );
      case 'SCI-209':
        return (
          <SCI209Form
            data={incident.sci209}
            onChange={(d) => updateIncidentField('sci209', d)}
            comandante={incident.comandanteIncidente}
            centroCostos={incident.centroCostos}
            controlHorasHombre={incident.controlHorasHombre}
          />
        );
      case 'SCI-COSTOS':
        return (
          <CostCenterForm
            data={
              incident.centroCostos || {
                presupuestoAsignado: 0,
                fondoCajaChica: 0,
                responsableFinanzas: '',
                moneda: 'MXN',
                items: [],
                observacionesFinancieras: ''
              }
            }
            onChange={(d) => updateIncidentField('centroCostos', d)}
            incident={incident}
          />
        );
      case 'SCI-HORAS':
        return (
          <ManHoursForm
            data={
              incident.controlHorasHombre || {
                coordinadorPersonal: '',
                limiteHorasTurno: 8,
                registros: [],
                observaciones: ''
              }
            }
            onChange={(d) => updateIncidentField('controlHorasHombre', d)}
            incident={incident}
          />
        );
      case 'SCI-211':
        return (
          <SCI211Form
            data={incident.sci211}
            onChange={(d) => updateIncidentField('sci211', d)}
          />
        );
      case 'SCI-214':
        return (
          <SCI214Form
            data={incident.sci214}
            onChange={(d) => updateIncidentField('sci214', d)}
          />
        );
      case 'SCI-221':
        return (
          <SCI221Form
            data={incident.sci221}
            onChange={(d) => updateIncidentField('sci221', d)}
          />
        );
      default:
        return (
          <SCI201Form
            data={incident.sci201}
            onChange={(d) => updateIncidentField('sci201', d)}
            incidentName={incident.nombre}
            lugar={incident.lugar}
          />
        );
    }
  };

  return (
    <IpadContainer
      incident={incident}
      theme={theme}
      onToggleTheme={toggleTheme}
      onSelectIncident={(inc) => {
        handleLoadAndEditScenario(inc);
      }}
      presetIncidents={registeredScenarios}
      onNewIncident={handleNewIncident}
      onOpenPAIModal={() => setIsPaiModalOpen(true)}
      onOpenGuideModal={() => setIsGuideModalOpen(true)}
      onOpenDriveModal={() => setIsDriveModalOpen(true)}
      onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
      onQuickSave={handleManualSave}
      onSaveAndContinueEditing={() => handleSaveAndContinueEditing(incident)}
      onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
      saveStatusText={lastSavedTime}
      isOnline={isOnline}
      activeCaseId={caseId}
      onOpenCaseModal={() => setIsCaseModalOpen(true)}
      onOpenPwaModal={() => setIsPwaModalOpen(true)}
      collaboratorCount={collaborators.length || 1}
      collaboratorName={collaborator.userName}
      collaboratorRole={collaborator.userRole}
      hasPendingSync={!!syncMeta?.hasPendingWrites}
    >
      {/* Real-time Collaboration Notification Toast */}
      {liveToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-amber-500/80 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-white animate-in slide-in-from-top-2 duration-300 max-w-md w-full mx-4">
          <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span className="flex-1 font-medium">{liveToast}</span>
          <button
            onClick={() => setLiveToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Manual Save Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/80 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2.5 text-xs text-emerald-200 animate-in fade-in duration-300">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Navigation Sidebar */}
        <div
          className={`${
            isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-0'
          } fixed lg:relative z-40 inset-y-0 left-0 bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 overflow-hidden shadow-2xl lg:shadow-none`}
        >
          {/* Sidebar Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-white text-xs tracking-wider uppercase">
                  Formularios SCI
                </h3>
                <p className="text-[10px] text-slate-400">NOM-010-SEGOB-2016</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Navigator Items */}
          <div className="flex-1 overflow-y-auto">
            <FormNav
              currentForm={currentForm}
              onSelectForm={(id) => {
                setCurrentForm(id);
                // On mobile portrait, close drawer after selection
                if (window.innerWidth < 1024) {
                  setIsSidebarOpen(false);
                }
              }}
              paiApproved={!!incident.sci202.firmaCIData}
            />
          </div>

          {/* Sidebar Footer: Import/Export JSON & Multi-User Indicator */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1 hover:text-white cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {lastSavedTime}
              </span>
            </div>

            {/* Quick Case Shortcut */}
            <button
              type="button"
              onClick={() => setIsCaseModalOpen(true)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-[10px] text-slate-300 cursor-pointer transition"
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3 text-cyan-400" />
                <span className="font-semibold truncate max-w-[140px]">{caseId}</span>
              </div>
              <span className="text-amber-400 font-mono">{collaborators.length} en campo</span>
            </button>

            {/* Quick Scenario Manager Shortcut */}
            <button
              type="button"
              onClick={() => setIsScenarioModalOpen(true)}
              className="w-full py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-[10px] text-slate-300 cursor-pointer transition"
              title="Cargar, guardar o borrar escenarios de manera definitiva"
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-3 h-3 text-amber-400" />
                <span className="font-semibold">Gestionar Escenarios</span>
              </div>
              <span className="text-amber-400 font-mono">{registeredScenarios.length} guardados</span>
            </button>
          </div>
        </div>

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Form Content Area */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col bg-slate-950">
          {/* Form Header Action Bar */}
          <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer mr-1"
                title="Abrir o cerrar menú de formularios"
              >
                <Menu className="w-4 h-4" />
              </button>
              <span className="font-bold text-white text-sm sm:text-base">{currentForm}</span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs hidden sm:inline">
                {incident.nombre}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              {/* Scenario Manager Button */}
              <button
                type="button"
                onClick={() => setIsScenarioModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="Cargar, guardar o borrar escenarios de manera definitiva"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Cargar Escenario</span>
                <span className="sm:hidden">Escenarios</span>
              </button>

              {/* Collaborative Case Room Quick Button */}
              <button
                type="button"
                onClick={() => setIsCaseModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                title="Gestionar caso práctico y participantes conectados"
              >
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                <span>Colaborar ({collaborators.length || 1})</span>
              </button>

              {/* Guardar y Seguir Editando */}
              <button
                type="button"
                onClick={() => handleSaveAndContinueEditing(incident)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                title="Guardar escenario registrado y seguir editando en tiempo real"
              >
                <Save className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden md:inline">Guardar y Seguir Editando</span>
                <span className="md:hidden">Guardar</span>
              </button>

              {/* Cloud Drive Button */}
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-semibold text-xs transition-all cursor-pointer active:scale-95"
                title="Subir expediente a Google Drive"
              >
                <CloudUpload className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Drive</span>
              </button>

              {/* Incident Header Info Quick Button */}
              <button
                type="button"
                onClick={() => setShowGeneralInfoModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Datos Generales</span>
              </button>

              {/* Compile PAI shortcut */}
              <button
                type="button"
                onClick={() => setIsPaiModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>PAI</span>
              </button>
            </div>
          </div>

          {/* Form Main Body */}
          <div className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
            {renderCurrentForm()}
          </div>
        </div>
      </div>

      {/* General Incident Info Editor Modal */}
      {showGeneralInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">Datos Generales del Incidente</h2>
                  <p className="text-[11px] text-slate-400">Requisitos PROY-NOM-010-SEGOB-2016 / SCI</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGeneralInfoModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Folio Oficial SCI:</label>
                  <input
                    type="text"
                    value={incident.folio}
                    onChange={(e) => updateIncidentField('folio', e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Tipo de Incidente:</label>
                  <input
                    type="text"
                    value={incident.tipoIncidente}
                    onChange={(e) => updateIncidentField('tipoIncidente', e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold block">Nombre del Incidente:</label>
                <input
                  type="text"
                  value={incident.nombre}
                  onChange={(e) => updateIncidentField('nombre', e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Lugar / Ubicación:</label>
                  <input
                    type="text"
                    value={incident.lugar}
                    onChange={(e) => updateIncidentField('lugar', e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Municipio y Estado:</label>
                  <input
                    type="text"
                    value={incident.municipioEstado}
                    onChange={(e) => updateIncidentField('municipioEstado', e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Comandante del Incidente (CI):</label>
                  <input
                    type="text"
                    value={incident.comandanteIncidente}
                    onChange={(e) => updateIncidentField('comandanteIncidente', e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold block">Estado del Incidente:</label>
                  <select
                    value={incident.estadoIncidente}
                    onChange={(e) => updateIncidentField('estadoIncidente', e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Bajo Control">Bajo Control</option>
                    <option value="En Desmovilización">En Desmovilización</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGeneralInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Listo / Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborative Case Modal */}
      <CollaborativeCaseModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
        caseId={caseId}
        onChangeCaseId={handleChangeCaseId}
        currentCollaborator={collaborator}
        onUpdateCollaborator={handleUpdateCollaboratorProfile}
        collaborators={collaborators}
        activities={activities}
        syncMeta={syncMeta}
        isOnline={isOnline}
        onForceSync={handleManualSave}
      />

      {/* PWA Install Modal (Windows, Android, iOS) */}
      <PWAInstallModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      {/* PAI Compilation Modal */}
      {isPaiModalOpen && (
        <PAICompilationModal
          incident={incident}
          onClose={() => setIsPaiModalOpen(false)}
          onOpenDrive={() => {
            setIsPaiModalOpen(false);
            setIsDriveModalOpen(true);
          }}
        />
      )}

      {/* Google Drive Upload / Sync Modal */}
      {isDriveModalOpen && (
        <GoogleDriveSyncModal
          incident={incident}
          onClose={() => setIsDriveModalOpen(false)}
          onSaveLocally={handleManualSave}
        />
      )}

      {/* Event History / Dossier Archive Modal */}
      {isHistoryModalOpen && (
        <EventHistoryModal
          currentIncident={incident}
          onLoadIncident={(loadedInc) => {
            setIncident(loadedInc);
            triggerSync(loadedInc);
            handleManualSave();
          }}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {/* NOM-010 Guide Modal */}
      {isGuideModalOpen && (
        <NormaGuideModal onClose={() => setIsGuideModalOpen(false)} />
      )}

      {/* Scenario Manager Modal (Cargar, Borrar Definitivamente, Guardar y Seguir Editando, Sincronización en Vivo) */}
      <ScenarioManagerModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        currentIncident={incident}
        activeCaseId={caseId}
        registeredScenarios={registeredScenarios}
        onLoadAndEditScenario={handleLoadAndEditScenario}
        onSaveAndContinueEditing={handleSaveAndContinueEditing}
        onPermanentDeleteScenario={handlePermanentDeleteScenario}
        onCreateBlankScenario={handleNewIncident}
        onImportScenario={handleImportScenario}
        isOnline={isOnline}
        collaboratorCount={collaborators.length || 1}
      />
    </IpadContainer>
  );
}
