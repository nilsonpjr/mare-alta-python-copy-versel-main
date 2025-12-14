import React from 'react';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { User } from '../../types';

interface MainLayoutProps {
    children: React.ReactNode;
    currentView: string;
    setView: (view: string) => void;
    currentUser: User | null;
    onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    currentView,
    setView,
    currentUser,
    onLogout
}) => {

    // Mapeamento simples de IDs de view para Títulos legíveis
    const viewTitles: Record<string, string> = {
        'dashboard': 'Visão Geral',
        'schedule': 'Agenda e Prazos',
        'clients': 'Gestão de Clientes',
        'boats': 'Cadastro de Embarcações',
        'marinas': 'Parceiros e Marinas',
        'orders': 'Ordens de Serviço',
        'inventory': 'Controle de Peças',
        'crm': 'Relacionamento (CRM)',
        'fleet': 'Minha Frota',
        'users': 'Usuários do Sistema',
        'finance': 'Controle Financeiro',
        'settings': 'Configurações do Sistema',
        'fiscal': 'Emissão Fiscal',
        'tech-orders': 'Minhas Tarefas'
    };

    const currentTitle = viewTitles[currentView] || 'Painel de Controle';

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
            <TopBar
                currentUser={currentUser}
                onLogout={onLogout}
                title={currentTitle}
            />

            {/* Área de conteúdo principal */}
            {/* Padding top para compensar TopBar (h-14 = 3.5rem) */}
            {/* Padding bottom para compensar BottomNav (h-24 = 6rem) + espaçamento extra */}
            <main className="flex-1 overflow-y-auto pt-14 pb-28 custom-scrollbar">
                {/* Container centralizado para conteúdo não "vazar" em telas ultrawide */}
                <div className="min-h-full">
                    {children}
                </div>
            </main>

            <BottomNav
                currentView={currentView}
                setView={setView}
                currentUser={currentUser}
            />
        </div>
    );
};
