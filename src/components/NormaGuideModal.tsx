import React, { useState } from 'react';
import { X, BookOpen, Shield, HelpCircle, CheckCircle, Flag, Layers } from 'lucide-react';

interface NormaGuideModalProps {
  onClose: () => void;
}

export const NormaGuideModal: React.FC<NormaGuideModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'principios' | 'funciones' | 'instalaciones' | 'formularios'>('principios');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Guía Rápida: PROY-NOM-010-SEGOB-2016
              </h2>
              <p className="text-xs text-slate-400">
                Requisitos básicos para la implementación del Sistema de Comando de Incidentes en México
              </p>
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 gap-2 overflow-x-auto">
          {[
            { id: 'principios', label: '14 Principios SCI' },
            { id: 'funciones', label: '8 Funciones de Mando' },
            { id: 'instalaciones', label: 'Instalaciones y Símbolos' },
            { id: 'formularios', label: 'Formularios Oficiales' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as any)}
              className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {tab === 'principios' && (
            <div className="space-y-3">
              <p className="text-slate-400 leading-relaxed">
                El SCI en México se sustenta en 14 principios fundamentales agrupados en 6 áreas clave:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { n: 1, t: 'Terminología común', d: 'Nombres estándar para recursos, instalaciones y funciones. Cero claves.' },
                  { n: 2, t: 'Alcance de control', d: 'Supervisar de 3 a 7 personas u órganos subordinados. El óptimo es 5.' },
                  { n: 3, t: 'Organización modular', d: 'La estructura crece o decrece según la magnitud y complejidad del incidente.' },
                  { n: 4, t: 'Comunicaciones integradas', d: 'Frecuencias, canales y protocolos de comunicación interinstitucionales enlazados.' },
                  { n: 5, t: 'Plan de Acción del Incidente (PAI)', d: 'Plan escrito u oral que rige las operaciones durante cada período operacional.' },
                  { n: 6, t: 'Unidad de mando', d: 'Cada recurso o elemento responde y reporta a un único supervisor inmediato.' },
                  { n: 7, t: 'Comando unificado', d: 'Cuando concurren múltiples agencias con competencia jurisdiccional o legal.' },
                  { n: 8, t: 'Instalaciones estandarizadas', d: 'Ubicación y señalización fija para PC, E, ACV, B, C, H y Helipuntos.' },
                  { n: 9, t: 'Manejo integral de recursos', d: 'Categorización de recursos en Asignados, Disponibles o Fuera de servicio.' },
                  { n: 10, t: 'Seguridad en la escena', d: 'La integridad de los rescatistas y la población es prioridad absoluta.' },
                  { n: 11, t: 'Claridad en la delegación', d: 'Asignación explícita de autoridad y responsabilidades funcionales.' },
                  { n: 12, t: 'Manejo de la información', d: 'Un solo canal oficial para medios de comunicación mediante el OIP.' },
                  { n: 13, t: 'Profesionalismo y ética', d: 'Actuación disciplinada y respetuosa de los derechos humanos.' },
                  { n: 14, t: 'Responsabilidad y rendición de cuentas', d: 'Check-in estricto, bitácoras y cierre ordenado de desmovilización.' }
                ].map((item) => (
                  <div key={item.n} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="font-bold text-amber-400 font-mono text-[11px] block">
                      {item.n}. {item.t}
                    </span>
                    <p className="text-slate-400 mt-1 text-[11px] leading-snug">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'funciones' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-950/20 border border-amber-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-amber-400 text-sm">1. Mando</div>
                  <p className="text-slate-300 mt-1">Asumir la dirección general, fijar objetivos, aprobar el PAI y velar por la seguridad integral.</p>
                </div>
                <div className="bg-red-950/20 border border-red-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-red-400 text-sm">2. Seguridad</div>
                  <p className="text-slate-300 mt-1">Evalúa riesgos y tiene autoridad para suspender operaciones inmediatamente ante peligro inminente.</p>
                </div>
                <div className="bg-sky-950/20 border border-sky-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-sky-400 text-sm">3. Información Pública</div>
                  <p className="text-slate-300 mt-1">Canal oficial de vocería hacia medios de comunicación, redes y comunidad.</p>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-emerald-400 text-sm">4. Enlace</div>
                  <p className="text-slate-300 mt-1">Contacto oficial con las demás dependencias e instituciones de los 3 órdenes de gobierno.</p>
                </div>
                <div className="bg-orange-950/20 border border-orange-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-orange-400 text-sm">5. Planificación</div>
                  <p className="text-slate-300 mt-1">Recolecta información, evalúa la situación, prepara el PAI y proyecta recursos futuros.</p>
                </div>
                <div className="bg-yellow-950/20 border border-yellow-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-yellow-400 text-sm">6. Operaciones</div>
                  <p className="text-slate-300 mt-1">Ejecuta las tácticas operativas en el terreno para salvar vidas y controlar el evento.</p>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-emerald-400 text-sm">7. Logística</div>
                  <p className="text-slate-300 mt-1">Suministra instalaciones, alimentación, radiocomunicaciones, insumos médicos y combustible.</p>
                </div>
                <div className="bg-purple-950/20 border border-purple-500/40 p-3.5 rounded-xl">
                  <div className="font-bold text-purple-400 text-sm">8. Administración y Finanzas</div>
                  <p className="text-slate-300 mt-1">Control de tiempos laborados, costos, compras de emergencia y reclamos de indemnización.</p>
                </div>
              </div>
            </div>
          )}

          {tab === 'instalaciones' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { tag: 'PC', color: 'bg-orange-600', name: 'Puesto de Comando', desc: 'Lugar fijo o móvil donde el Comandante y el Staff coordinan el incidente. Señalizado con bandera o cuadro naranja/azul.' },
                  { tag: 'E', color: 'bg-yellow-500 text-black', name: 'Área de Espera', desc: 'Ubicación donde se concentran los recursos en estado "Disponible" antes de ser asignados al terreno.' },
                  { tag: 'ACV', color: 'bg-red-600', name: 'Área Concentración de Víctimas', desc: 'Lugar seguro para triage, tratamiento médico y clasificación previa al traslado a hospitales.' },
                  { tag: 'B', color: 'bg-emerald-600', name: 'Base', desc: 'Instalación donde se coordinan y administran las funciones primarias de apoyo logístico.' },
                  { tag: 'C', color: 'bg-purple-600', name: 'Campamento', desc: 'Instalación temporal con facilidades de alojamiento, alimentación e higiene para los brigadistas.' },
                  { tag: 'H', color: 'bg-blue-600', name: 'Helibase', desc: 'Ubicación principal para estacionamiento, reabastecimiento y mantenimiento de aeronaves.' },
                  { tag: 'H1', color: 'bg-sky-500', name: 'Helipunto (H1, H2)', desc: 'Punto de descenso y aterrizaje táctico temporal en el campo para carga/descarga rápida.' }
                ].map((item) => (
                  <div key={item.tag} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border border-white/40 ${item.color}`}>
                      {item.tag}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{item.name}</div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'formularios' && (
            <div className="space-y-2">
              {[
                { f: 'SCI-201', n: 'Informe del Incidente', d: 'Resumen inicial, mapa/croquis, asignaciones y recursos iniciales para transferencia de mando.' },
                { f: 'SCI-202', n: 'Objetivos del Incidente', d: 'Objetivos SMART del período operacional, meteorología y aprobación formal del CI.' },
                { f: 'SCI-203', n: 'Organización del Incidente', d: 'Estructura modular del mando y lista de personal designado a cada sección.' },
                { f: 'SCI-204', n: 'Asignaciones de Trabajo', d: 'Instrucciones tácticas para cada división o grupo operacional.' },
                { f: 'SCI-205', n: 'Plan de Radio-Comunicaciones', d: 'Frecuencias, canales, tonos y asignación de radios.' },
                { f: 'SCI-206', n: 'Plan Médico', d: 'Puestos de auxilio, ambulancias, hospitales receptores y protocolo de socorro a rescatistas.' },
                { f: 'SCI-207', n: 'Registro y Estado de Recursos', d: 'Inventario activo de recursos (disponibles/asignados) y conteo de triage START.' },
                { f: 'SCI-208', n: 'Plan y Mensaje de Seguridad', d: 'Matriz de riesgos, EPP reglamentario y señal sonora de evacuación.' },
                { f: 'SCI-209', n: 'Resumen del Estado del Incidente', d: 'Informe ejecutivo de situación para autoridades superiores y prensa.' },
                { f: 'SCI-211', n: 'Registro y Control de Recursos', d: 'Check-in formal de ingreso de personal y unidades a la escena.' },
                { f: 'SCI-214', n: 'Bitácora de la Unidad', d: 'Registro cronológico continuo de actividades y órdenes recibidas.' },
                { f: 'SCI-221', n: 'Plan de Desmovilización', d: 'Check-out ordenado de entrega de equipos, informes y repliegue final.' }
              ].map((item) => (
                <div key={item.f} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-xs">
                      {item.f}
                    </span>
                    <span className="font-semibold text-white text-xs">{item.n}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[280px] sm:max-w-md">{item.d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
