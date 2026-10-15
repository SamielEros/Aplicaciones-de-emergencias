import React from 'react';
import { FormId } from '../types/sci';
import {
  FileText,
  Target,
  Users,
  Briefcase,
  Radio,
  HeartPulse,
  Layers,
  ShieldAlert,
  FileBarChart2,
  UserCheck,
  BookOpen,
  LogOut,
  CheckCircle2,
  Bookmark,
  Shield,
  DollarSign,
  Clock
} from 'lucide-react';

interface FormNavProps {
  currentForm: FormId;
  onSelectForm: (id: FormId) => void;
  paiApproved: boolean;
}

interface FormMeta {
  id: FormId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isPAI?: boolean;
  color: string;
}

const FORM_GROUPS: { name: string; forms: FormMeta[] }[] = [
  {
    name: 'Mando e Inicio Operativo',
    forms: [
      {
        id: 'SCI-201',
        title: 'SCI-201: Informe de Incidente',
        subtitle: 'Croquis táctico y acción inicial',
        icon: FileText,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      },
      {
        id: 'SCI-202',
        title: 'SCI-202: Objetivos del Incidente',
        subtitle: 'Período operacional y firma CI',
        icon: Target,
        isPAI: true,
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      },
      {
        id: 'SCI-203',
        title: 'SCI-203: Organización del Incidente',
        subtitle: 'Organigrama y Staff General',
        icon: Users,
        isPAI: true,
        color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
      }
    ]
  },
  {
    name: 'Plan de Acción del Incidente (PAI)',
    forms: [
      {
        id: 'SCI-204',
        title: 'SCI-204: Asignaciones Tácticas',
        subtitle: 'Divisiones, grupos y tareas',
        icon: Briefcase,
        isPAI: true,
        color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
      },
      {
        id: 'SCI-205',
        title: 'SCI-205: Plan de Comunicaciones',
        subtitle: 'Frecuencias y canales de radio',
        icon: Radio,
        isPAI: true,
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
      },
      {
        id: 'SCI-206',
        title: 'SCI-206: Plan Médico',
        subtitle: 'Puestos de socorro y hospitales',
        icon: HeartPulse,
        isPAI: true,
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      },
      {
        id: 'SCI-208',
        title: 'SCI-208: Plan de Seguridad',
        subtitle: 'Riesgos, EPP y evacuación',
        icon: ShieldAlert,
        isPAI: true,
        color: 'text-red-400 bg-red-500/10 border-red-500/30'
      }
    ]
  },
  {
    name: 'Costos, Finanzas y Personal',
    forms: [
      {
        id: 'SCI-COSTOS',
        title: 'Centro de Costos',
        subtitle: 'Gastos, adquisiciones, inversiones y balance',
        icon: DollarSign,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      },
      {
        id: 'SCI-HORAS',
        title: 'Control de Horas-Hombre',
        subtitle: 'Fuerza de tarea, horas trabajadas y fatiga',
        icon: Clock,
        color: 'text-violet-400 bg-violet-500/10 border-violet-500/30'
      }
    ]
  },
  {
    name: 'Recursos, Bitácoras y Cierre',
    forms: [
      {
        id: 'SCI-207',
        title: 'SCI-207: Estado de Recursos / Triage',
        subtitle: 'Inventario activo y víctimas',
        icon: Layers,
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      },
      {
        id: 'SCI-209',
        title: 'SCI-209: Resumen del Incidente',
        subtitle: 'Informe final, costos y HH',
        icon: FileBarChart2,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
      },
      {
        id: 'SCI-211',
        title: 'SCI-211: Ingreso de Recursos',
        subtitle: 'Registro de arribos (Check-in)',
        icon: UserCheck,
        color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
      },
      {
        id: 'SCI-214',
        title: 'SCI-214: Bitácora de la Unidad',
        subtitle: 'Registro cronológico continuo',
        icon: BookOpen,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      },
      {
        id: 'SCI-221',
        title: 'SCI-221: Plan de Desmovilización',
        subtitle: 'Control de salida de recursos',
        icon: LogOut,
        color: 'text-slate-400 bg-slate-500/10 border-slate-500/30'
      }
    ]
  }
];

export const FormNav: React.FC<FormNavProps> = ({ currentForm, onSelectForm, paiApproved }) => {
  return (
    <div className="h-full flex flex-col justify-between py-2 overflow-y-auto">
      <div className="space-y-5 px-3">
        {FORM_GROUPS.map((group) => (
          <div key={group.name} className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 py-0.5">
              {group.name}
            </div>

            <div className="space-y-1">
              {group.forms.map((item) => {
                const Icon = item.icon;
                const isActive = currentForm === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectForm(item.id)}
                    className={`w-full text-left rounded-xl p-2.5 flex items-center gap-3 transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        isActive
                          ? 'bg-slate-950 text-amber-400 border-slate-900 shadow-sm'
                          : `${item.color}`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-slate-950' : 'text-slate-200 group-hover:text-white'}`}>
                          {item.id}
                        </span>
                        {item.isPAI && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black tracking-tight ${
                              isActive
                                ? 'bg-slate-950 text-amber-300'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            PAI
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-slate-800 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* NOM-010 Reference tag in sidebar */}
      <div className="p-3 mx-3 mt-4 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-extrabold text-white text-[10px] uppercase tracking-wide">
              Sistema de Comando de Incidentes
            </div>
            <div className="text-[9px] text-amber-300 font-mono">
              PROY-NOM-010-SEGOB-2016
            </div>
          </div>
        </div>
        <div className="text-slate-400 leading-tight text-[10px] pt-1 border-t border-slate-800">
          Alcance de control táctico: 3 - 7 elementos por líder.
        </div>
      </div>
    </div>
  );
};
