import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  deleteDoc,
  Unsubscribe
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { IncidentData } from '../types/sci';
import firebaseConfigRaw from '../../firebase-applet-config.json';

// Configuration
const firebaseConfig = {
  apiKey: firebaseConfigRaw.apiKey,
  authDomain: firebaseConfigRaw.authDomain,
  projectId: firebaseConfigRaw.projectId,
  storageBucket: firebaseConfigRaw.storageBucket,
  messagingSenderId: firebaseConfigRaw.messagingSenderId,
  appId: firebaseConfigRaw.appId
};

// Initialize App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with Persistent Multi-Tab Local Cache (for offline mode)
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, firebaseConfigRaw.firestoreDatabaseId || '(default)');
  } catch (e) {
    // If already initialized
    return getFirestore(app, firebaseConfigRaw.firestoreDatabaseId || '(default)');
  }
})();

export const auth = getAuth(app);

// Authenticate anonymously for hassle-free field work
let isAuthenticating = false;
export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  if (isAuthenticating) return null;
  isAuthenticating = true;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous auth failed or offline, proceeding locally:', err);
    return null;
  } finally {
    isAuthenticating = false;
  }
}

// Ensure auth on load
ensureAuth();

export interface CollaboratorInfo {
  userId: string;
  userName: string;
  userRole: string;
  activeForm: string;
  lastSeen: number;
  platform: 'windows' | 'android' | 'ios' | 'web';
  isCurrentUser?: boolean;
}

export interface ActivityItem {
  id: string;
  userName: string;
  userRole: string;
  formId: string;
  action: string;
  timestamp: number;
}

export interface CaseSyncMetadata {
  hasPendingWrites: boolean;
  isFromCache: boolean;
  lastSyncTime: number;
  caseId: string;
}

// Detect client platform
export function detectPlatform(): 'windows' | 'android' | 'ios' | 'web' {
  if (typeof window === 'undefined') return 'web';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/win/.test(ua)) return 'windows';
  return 'web';
}

/**
 * Save incident data to Firestore with offline support
 */
export async function syncIncidentToFirestore(
  caseId: string,
  incident: IncidentData,
  collaborator: { name: string; role: string; formId: string }
): Promise<void> {
  const caseRef = doc(db, 'cases', caseId);
  const now = Date.now();

  const payload = {
    ...incident,
    _syncMeta: {
      lastUpdated: now,
      updatedBy: collaborator.name,
      updatedRole: collaborator.role,
      updatedForm: collaborator.formId,
      platform: detectPlatform()
    }
  };

  await setDoc(caseRef, payload, { merge: true });

  // Record activity
  try {
    const activityRef = doc(collection(db, 'cases', caseId, 'activity'));
    await setDoc(activityRef, {
      userName: collaborator.name,
      userRole: collaborator.role,
      formId: collaborator.formId,
      action: `Actualizó ${collaborator.formId}`,
      timestamp: now
    });
  } catch (e) {
    // Non-fatal if offline
  }
}

/**
 * Update collaborator heartbeat / presence in the case
 */
export async function updateCollaboratorPresence(
  caseId: string,
  collaborator: CollaboratorInfo
): Promise<void> {
  if (!caseId || !collaborator.userId) return;
  const colRef = doc(db, 'cases', caseId, 'collaborators', collaborator.userId);
  try {
    await setDoc(colRef, {
      userId: collaborator.userId,
      userName: collaborator.userName,
      userRole: collaborator.userRole,
      activeForm: collaborator.activeForm,
      lastSeen: Date.now(),
      platform: collaborator.platform
    }, { merge: true });
  } catch (e) {
    // Offline safe
  }
}

/**
 * Remove collaborator presence when leaving
 */
export async function removeCollaboratorPresence(
  caseId: string,
  userId: string
): Promise<void> {
  if (!caseId || !userId) return;
  try {
    const colRef = doc(db, 'cases', caseId, 'collaborators', userId);
    await deleteDoc(colRef);
  } catch (e) {
    // Safe
  }
}

/**
 * Listen to incident changes in real time (and offline cache)
 */
export function subscribeToIncident(
  caseId: string,
  onData: (incident: IncidentData, meta: CaseSyncMetadata) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const caseRef = doc(db, 'cases', caseId);

  return onSnapshot(
    caseRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const raw = snapshot.data() as IncidentData & { _syncMeta?: Record<string, unknown> };
        // Clean metadata out of incident state
        const { _syncMeta, ...cleanIncident } = raw;
        onData(cleanIncident as IncidentData, {
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          isFromCache: snapshot.metadata.fromCache,
          lastSyncTime: Date.now(),
          caseId
        });
      }
    },
    (err) => {
      console.warn('Firestore subscription error (continuing with offline cache):', err);
      onError?.(err);
    }
  );
}

/**
 * Listen to active collaborators in the current case
 */
export function subscribeToCollaborators(
  caseId: string,
  currentUserId: string,
  onCollaborators: (users: CollaboratorInfo[]) => void
): Unsubscribe {
  const colCollection = collection(db, 'cases', caseId, 'collaborators');

  return onSnapshot(
    colCollection,
    (snapshot) => {
      const now = Date.now();
      const cutoff = now - 90 * 1000; // active in last 90 seconds
      const list: CollaboratorInfo[] = [];

      snapshot.forEach((d) => {
        const data = d.data() as CollaboratorInfo;
        if (data.lastSeen && data.lastSeen > cutoff) {
          list.push({
            ...data,
            isCurrentUser: data.userId === currentUserId
          });
        }
      });

      // Sort with current user first
      list.sort((a, b) => (b.isCurrentUser ? 1 : 0) - (a.isCurrentUser ? 1 : 0));
      onCollaborators(list);
    },
    (err) => {
      console.warn('Error reading collaborators:', err);
    }
  );
}

/**
 * Listen to recent activity in the case
 */
export function subscribeToActivity(
  caseId: string,
  onActivity: (items: ActivityItem[]) => void
): Unsubscribe {
  const actRef = collection(db, 'cases', caseId, 'activity');
  const q = query(actRef, orderBy('timestamp', 'desc'), limit(15));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ActivityItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          userName: data.userName || 'Usuario',
          userRole: data.userRole || 'Comando',
          formId: data.formId || '',
          action: data.action || 'Cambio registrado',
          timestamp: data.timestamp || Date.now()
        });
      });
      onActivity(items);
    },
    (err) => {
      console.warn('Error reading activity log:', err);
    }
  );
}

export interface RemoteCaseSummary {
  id: string;
  folio: string;
  nombre: string;
  tipoIncidente: string;
  nivelComplejidad: string;
  estadoIncidente: string;
  municipioEstado: string;
  lastUpdated: number;
  updatedBy: string;
}

/**
 * Permanently delete a case/scenario from Firestore
 */
export async function deleteCaseFromFirestore(caseId: string): Promise<boolean> {
  if (!caseId) return false;
  try {
    const caseRef = doc(db, 'cases', caseId);
    await deleteDoc(caseRef);
    return true;
  } catch (err) {
    console.warn('Error deleting case from Firestore:', err);
    return false;
  }
}

/**
 * Fetch a specific case from Firestore by ID
 */
export async function fetchCaseFromFirestore(caseId: string): Promise<IncidentData | null> {
  if (!caseId) return null;
  try {
    const caseRef = doc(db, 'cases', caseId);
    const snap = await getDoc(caseRef);
    if (snap.exists()) {
      const raw = snap.data();
      const { _syncMeta, ...cleanIncident } = raw;
      return cleanIncident as IncidentData;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching case:', err);
    return null;
  }
}

/**
 * Listen to all available cases saved in Firestore
 */
export function subscribeToAllCases(
  onCases: (cases: RemoteCaseSummary[]) => void
): Unsubscribe {
  const casesCol = collection(db, 'cases');

  return onSnapshot(
    casesCol,
    (snapshot) => {
      const list: RemoteCaseSummary[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.nombre || data.folio) {
          list.push({
            id: docSnap.id,
            folio: data.folio || docSnap.id,
            nombre: data.nombre || 'Incidente sin título',
            tipoIncidente: data.tipoIncidente || 'General',
            nivelComplejidad: data.nivelComplejidad || 'Tipo 3',
            estadoIncidente: data.estadoIncidente || 'Activo',
            municipioEstado: data.municipioEstado || '',
            lastUpdated: data._syncMeta?.lastUpdated || Date.now(),
            updatedBy: data._syncMeta?.updatedBy || 'Comando'
          });
        }
      });
      list.sort((a, b) => b.lastUpdated - a.lastUpdated);
      onCases(list);
    },
    (err) => {
      console.warn('Error subscribing to all cases:', err);
    }
  );
}
