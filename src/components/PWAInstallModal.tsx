import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Apple,
  CheckCircle2,
  X,
  Share2,
  PlusSquare,
  Sparkles,
  WifiOff
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, platform, install } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Download className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Instalar App Multiplataforma
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  PWA Offline
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compatible con Windows, Android y iPhone/iPad (iOS)
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          {/* Key Advantages */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-[11px]">100% Funcional Offline</p>
                <p className="text-[10px] text-slate-400">Opera en zonas de desastre sin señal celular.</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-[11px]">Sincronización Automática</p>
                <p className="text-[10px] text-slate-400">Actualiza los datos al recuperar internet.</p>
              </div>
            </div>
          </div>

          {/* Direct Install Button (Chrome / Edge / Android) */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-center space-y-2">
              <p className="font-bold text-white text-sm">
                ¡Tu navegador está listo para instalar la aplicación!
              </p>
              <p className="text-slate-300 text-xs">
                Se agregará a tu escritorio o pantalla de inicio con acceso rápido sin barras de navegador.
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 cursor-pointer active:scale-98 transition"
              >
                <Download className="w-4 h-4" />
                Instalar Ahora en este Dispositivo
              </button>
            </div>
          )}

          {installedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-xs">¡Aplicación instalada exitosamente!</span>
            </div>
          )}

          {isInstalled && (
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold text-xs">Ya estás ejecutando la aplicación instalada en modo Standalone.</span>
            </div>
          )}

          {/* Instructions per Platform */}
          <div className="space-y-3 pt-1">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Guía de Instalación por Dispositivo:
            </h3>

            {/* Windows */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              platform === 'windows' ? 'bg-slate-800/80 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-white text-xs mb-1.5">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>Windows (PC y Laptops de Puesto de Comando)</span>
                {platform === 'windows' && (
                  <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md font-mono">
                    Tu sistema actual
                  </span>
                )}
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                En Google Chrome o Microsoft Edge, haz clic en el ícono de <strong className="text-slate-200">"Instalar aplicación" (icono de pantalla con flecha ⊕)</strong> en la barra de direcciones superior derecha, o ve a Menú <strong>⋮ → Transmitir, guardar e instalar → Instalar SCI Móvil</strong>. Se abrirá en una ventana táctica independiente.
              </p>
            </div>

            {/* Android */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              platform === 'android' ? 'bg-slate-800/80 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-white text-xs mb-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android (Celulares y Tablets en Campo)</span>
                {platform === 'android' && (
                  <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md font-mono">
                    Tu sistema actual
                  </span>
                )}
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                En Chrome para Android, pulsa el menú superior <strong>(⋮)</strong> y selecciona <strong className="text-slate-200">"Instalar aplicación"</strong> o <strong className="text-slate-200">"Agregar a la pantalla principal"</strong>. Funciona de manera nativa sin necesidad de descargar desde Google Play Store.
              </p>
            </div>

            {/* iOS */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              isIOS ? 'bg-slate-800/80 border-amber-500/40 ring-1 ring-amber-500/20' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2 font-bold text-white text-xs mb-1.5">
                <Apple className="w-4 h-4 text-slate-200" />
                <span>iOS / iPadOS (iPhone y iPad)</span>
                {isIOS && (
                  <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md font-mono">
                    Tu sistema actual
                  </span>
                )}
              </div>
              <ol className="text-slate-400 space-y-1 text-[11px] list-decimal list-inside leading-relaxed">
                <li>Abre esta página en el navegador <strong>Safari</strong> de tu iPhone o iPad.</li>
                <li className="flex items-center gap-1.5 inline-flex">
                  Toca el botón <strong>Compartir</strong>
                  <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  en la barra inferior o superior.
                </li>
                <li className="flex items-center gap-1.5 inline-flex">
                  Baja y pulsa en <strong className="text-white">"Agregar a pantalla de inicio"</strong>
                  <PlusSquare className="w-3.5 h-3.5 text-amber-400 inline" />.
                </li>
                <li>Toca <strong>"Agregar"</strong> en la esquina superior derecha.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
