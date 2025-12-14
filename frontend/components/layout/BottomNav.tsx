import React from 'react';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Ship,
    Anchor,
    FileText,
    Package,
    Wrench,
    DollarSign,
    Settings,
    LifeBuoy
} from 'lucide-react';
import { UserRole, User } from '../../types';

interface BottomNavProps {
    currentView: string;
    setView: (view: string) => void;
    currentUser: User | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, currentUser }) => {
    if (!currentUser) return null;

    const role = currentUser.role;

    const navItems = [
        { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.MANAGER] },
        { id: 'schedule', label: 'Agenda', icon: Calendar, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
        { id: 'orders', label: 'Serviços', icon: Wrench, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
        { id: 'inventory', label: 'Peças', icon: Package, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TECHNICIAN] },
        { id: 'boats', label: 'Embarcações', icon: Ship, roles: [UserRole.ADMIN, UserRole.MANAGER] },
        { id: 'clients', label: 'Clientes', icon: Users, roles: [UserRole.ADMIN, UserRole.MANAGER] },
        { id: 'marinas', label: 'Marinas', icon: Anchor, roles: [UserRole.ADMIN] },
        { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [UserRole.ADMIN] },
        { id: 'fiscal', label: 'Fiscal', icon: FileText, roles: [UserRole.ADMIN] },
        { id: 'crm', label: 'CRM', icon: LifeBuoy, roles: [UserRole.ADMIN, UserRole.MANAGER] },
        { id: 'settings', label: 'Config', icon: Settings, roles: [UserRole.ADMIN] },
    ];

    // Adicionar item específico para portal do cliente se necessário
    if (role === UserRole.CLIENT) {
        // Lógica simplificada para cliente, pode ser ajustada
        return null;
    }

    const filteredItems = navItems.filter(item => item.roles.includes(role));

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900 to-slate-800 border-t-4 border-cyan-500 shadow-2xl z-50 print:hidden flex items-center justify-center px-4 overflow-x-auto">
            <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-2 gap-2 border border-white/10 shadow-inner max-w-full">
                {filteredItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`
                group flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all duration-300 relative
                ${isActive
                                    ? 'bg-gradient-to-b from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 -translate-y-2'
                                    : 'hover:bg-white/10 hover:-translate-y-1'
                                }
              `}
                        >
                            {/* Active Indicator Dot */}
                            {isActive && (
                                <div className="absolute -top-1 w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                            )}

                            <item.icon
                                className={`w-7 h-7 mb-1 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
