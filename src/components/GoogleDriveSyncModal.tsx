import React, { useState, useEffect } from 'react';
import {
  signInWithGoogleDrive,
  uploadIncidentToDrive,
  getCachedDriveToken,
  signOutGoogleDrive,
  DriveUploadResult,
  auth
} from '../services/googleDriveService';
import { IncidentData } from '../types/sci';
import {
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Cloud,
  FileCode,
  LogOut,
  RefreshCw,
  Lock,
  Download
} from 'lucide-react';

interface GoogleDriveSyncModalProps {
  incident: IncidentData;
  onClose: () => void;
  onSaveLocally: () => void;
}

export const GoogleDriveSyncModal: React.FC<GoogleDriveSyncModalProps> = ({
  incident,
  onClose,
  onSaveLocally
}) => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [token, setToken] = useState<string | null>(getCachedDriveToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<DriveUploadResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setCurrentUser(u);
      setToken(getCachedDriveToken());
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogleDrive();
      setCurrentUser(res.user);
      setToken(res.accessToken);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Error al conectar con Google Drive. Verifique los permisos en el navegador.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleUpload = async () => {
    if (!token) {
      await handleSignIn();
      return;
    }

    // Save changes locally first
    onSaveLocally();

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const result = await uploadIncidentToDrive(incident, token);
      setUploadResult(result);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Error al subir el archivo a Google Drive. Puede que su sesión haya expirado.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadLocal = () => {
    onSaveLocally();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(incident, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${incident.folio}_${incident.nombre.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Cloud and Drive Emblem */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Nube Operacional</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-bold text-white">Google Drive</span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Guardar y Enviar a la Nube
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-300 overflow-y-auto max-h-[75vh]">
          {/* Target File Overview */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Expediente a Guardar:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
                {incident.folio}
              </span>
            </div>
            <div className="font-bold text-white text-sm">{incident.nombre}</div>
            <div className="text-[11px] text-slate-400">
              Ubicación: <span className="text-slate-200">{incident.municipioEstado}</span> · Período Operacional: #{incident.periodoOperacional.numero}
            </div>
          </div>

          {/* Authentication State */}
          {!currentUser || !token ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Conectar con Google Drive</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                  Inicia sesión para guardar este expediente en tu carpeta <strong className="text-slate-300">SCI_Cruz_Roja_Mexicana</strong> en Google Drive.
                </p>
              </div>

              {/* Official Google Sign In Button */}
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isSigningIn ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Account Card */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white text-xs">{currentUser.displayName || 'Usuario Google'}</div>
                    <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => signOutGoogleDrive()}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                  title="Cerrar sesión de Google"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Action Card */}
              <div className="bg-gradient-to-b from-blue-950/20 to-slate-950 p-4 rounded-2xl border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-white text-xs">Destino en la nube:</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">/SCI_Cruz_Roja_Mexicana/</span>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Al confirmar, se guardarán los cambios actuales del incidente y se creará/actualizará el archivo con formato oficial en tu Google Drive.
                </p>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Subiendo a Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Confirmar y Enviar a Google Drive</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadResult && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Expediente guardado y sincronizado con éxito!</span>
              </div>
              <div className="text-[11px] text-slate-300 font-mono">
                Archivo: <strong>{uploadResult.fileName}</strong>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <a
                  href={uploadResult.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver en Google Drive</span>
                </a>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-950/30 border border-rose-500/40 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Fallback Local Backup Download */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">¿Deseas una copia local sin conexión?</span>
            <button
              type="button"
              onClick={handleDownloadLocal}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
