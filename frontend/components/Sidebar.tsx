import React from 'react';
import { LayoutDashboard, Wrench, Anchor, Package, DollarSign, Users, Ship, Calendar, MapPin, Settings, UserCheck, ClipboardList, LogOut, ChevronRight, X, ShieldCheck, FileText, Bot, Map, Calculator, Network, ClipboardCheck } from 'lucide-react';
import { UserRole, User } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  tenantPlan?: string; // Novo: Recebe o plano da empresa para filtrar módulos
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, currentUser, onLogout, isOpen, onClose, tenantPlan = 'ENTERPRISE' }) => {
  const role = currentUser.role;
  let menuItems = [];

  // Lógica de Permissão de Módulos Baseada no Plano
  const hasModule = (moduleId: string) => {
    // Se for plano FULL/ENTERPRISE, tem tudo
    if (tenantPlan === 'ENTERPRISE' || tenantPlan === 'Marina Full') return true;

    // Mecânico PRO (Básico)
    if (tenantPlan === 'START' || tenantPlan === 'Mecânico PRO') {
      const allowed = ['dashboard', 'schedule', 'orders', 'clients', 'boats', 'settings', 'mechanic-app'];
      return allowed.includes(moduleId);
    }

    // Oficina Team (Intermediário)
    if (tenantPlan === 'PRO' || tenantPlan === 'Oficina Team') {
      const blocked = ['marina-map', 'crm', 'fiscal']; // O que NÃO tem
      return !blocked.includes(moduleId);
    }

    return true; // Fallback
  };

  if (role === UserRole.ADMIN) {
    const allItems = [
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'schedule', label: 'Agenda', icon: Calendar },
      { id: 'orders', label: 'Ordens de Serviço', icon: Wrench },
      { id: 'maintenance-budget', label: 'Orçador de Revisão', icon: ClipboardList },
      { id: 'crm', label: 'CRM & Fidelização', icon: UserCheck },
      { id: 'warranty-lookup', label: 'Consulta Garantia', icon: ShieldCheck },
      { id: 'sep1', type: 'separator', label: 'Gestão' },
      { id: 'clients', label: 'Clientes', icon: Users },
      { id: 'boats', label: 'Embarcações', icon: Ship },
      { id: 'marinas', label: 'Marinas & Locais', icon: MapPin },
      { id: 'sep2', type: 'separator', label: 'Administrativo' },
      { id: 'inventory', label: 'Estoque', icon: Package },
      { id: 'fiscal', label: 'Notas Fiscais', icon: FileText },
      { id: 'finance', label: 'Financeiro', icon: DollarSign },
      { id: 'users', label: 'Usuários', icon: Users },
      { id: 'partners', label: 'Parceiros', icon: Users },
      { id: 'sep_erp', type: 'separator', label: 'Módulos ERP' },
      { id: 'workshop', label: 'Oficina (Workshop)', icon: Wrench },
      { id: 'estimator', label: 'Smart Orçador', icon: Calculator },
      { id: 'ai-diagnostics', label: 'Viverdi AI', icon: Bot },
      { id: 'marina-map', label: 'Mapa Marina', icon: Map },
      { id: 'mechanic-app', label: 'App Mecânico', icon: Wrench },
      { id: 'analyst-checklist', label: 'Checklist Analista', icon: ClipboardCheck },
      { id: 'architecture', label: 'Arquitetura', icon: Network },
      { id: 'settings', label: 'Configurações', icon: Settings },
    ];

    // Filtra itens baseado no plano
    menuItems = allItems.filter(item => item.type === 'separator' || hasModule(item.id));
    menuItems = [
      { id: 'tech-orders', label: 'Meus Serviços', icon: ClipboardList },
      { id: 'schedule', label: 'Minha Agenda', icon: Calendar },
      { id: 'inspection', label: 'Inspeção Técnica', icon: ClipboardList },
    ];
  } else {
    // Client
    menuItems = [
      { id: 'client-portal', label: 'Minhas Solicitações', icon: Wrench },
      { id: 'client-fleet', label: 'Minha Frota', icon: Anchor },
    ];
  }

  const getRoleBadge = () => {
    switch (role) {
      case UserRole.ADMIN: return { bg: 'bg-red-500', label: 'Admin' };
      case UserRole.TECHNICIAN: return { bg: 'bg-emerald-500', label: 'Técnico' };
      default: return { bg: 'bg-blue-500', label: 'Cliente' };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-800 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen
      `}>
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/50">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide">VIVERDI NAUTICA</h1>
              <p className="text-[10px] text-cyan-400 font-medium tracking-wider uppercase">Manager System</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {menuItems.map((item, idx) => {
            if (item.type === 'separator') {
              return (
                <div key={`sep-${idx}`} className="pt-4 pb-2 px-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3 h-3 text-cyan-200" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ${badge.bg}`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">{currentUser.name.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${badge.bg}`}></span>
                {badge.label}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="px-4 mb-3">
            <LanguageSwitcher />
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-red-900/30 hover:border-red-900/50 border border-transparent rounded transition-all"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Encerrar Sessão
          </button>
        </div>
      </div>
    </>
  );
};