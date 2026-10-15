import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { IncidentData } from '../types/sci';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (never stored in localStorage for security)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Drive.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al autenticar con Google Drive:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedDriveToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Creates or retrieves the root folder in Google Drive
 */
async function getOrCreateFolder(folderName: string, accessToken: string): Promise<string> {
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (listRes.ok) {
    const listData = await listRes.json();
    if (listData.files && listData.files.length > 0) {
      return listData.files[0].id;
    }
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Expedientes oficiales del Sistema de Comando de Incidentes - Cruz Roja Mexicana'
    })
  });

  if (!createRes.ok) {
    throw new Error('No se pudo crear la carpeta en Google Drive');
  }

  const createdData = await createRes.json();
  return createdData.id;
}

export interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink?: string;
  folderId: string;
  uploadedAt: string;
}

/**
 * Uploads or updates an incident file into Google Drive
 */
export async function uploadIncidentToDrive(
  incident: IncidentData,
  accessToken: string
): Promise<DriveUploadResult> {
  const folderId = await getOrCreateFolder('SCI_Cruz_Roja_Mexicana', accessToken);
  const fileName = `${incident.folio}_${incident.nombre.replace(/[/\\?%*:|"<>]/g, '_')}.json`;
  const fileContent = JSON.stringify(incident, null, 2);

  // Check if file already exists in folder to update or create
  const q = encodeURIComponent(`name = '${fileName}' and '${folderId}' in parents and trashed = false`);
  const existingRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  let existingFileId: string | null = null;
  if (existingRes.ok) {
    const existingData = await existingRes.json();
    if (existingData.files && existingData.files.length > 0) {
      existingFileId = existingData.files[0].id;
    }
  }

  let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink';
  let method = 'POST';

  if (existingFileId) {
    uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,webViewLink`;
    method = 'PATCH';
  }

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Expediente oficial SCI Cruz Roja Mexicana: ${incident.nombre}. Período #${incident.periodoOperacional.numero}`,
    ...(existingFileId ? {} : { parents: [folderId] })
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadRes = await fetch(uploadUrl, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Error al subir a Google Drive: ${uploadRes.status} ${errText}`);
  }

  const resultData = await uploadRes.json();

  return {
    fileId: resultData.id,
    fileName: resultData.name || fileName,
    webViewLink: resultData.webViewLink || `https://drive.google.com/file/d/${resultData.id}/view`,
    folderId,
    uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
