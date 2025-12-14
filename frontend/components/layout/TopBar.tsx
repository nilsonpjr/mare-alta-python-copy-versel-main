import React from 'react';
import { User } from '../../types';
import { LogOut, Bell, User as UserIcon, Maximize2 } from 'lucide-react';
import { ApiService } from '../../services/api';

interface TopBarProps {
    currentUser: User | null;
    onLogout: () => void;
    title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ currentUser, onLogout, title }) => {
    if (!currentUser) return null;

    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-slate-900 border-b border-slate-700 z-50 flex items-center justify-between px-4 lg:px-6 shadow-md print:hidden">
            {/* Esquerda: Logo e Título Dinâmico */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="text-white font-black text-xs tracking-tighter">MA</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm leading-tight tracking-wide">MARE ALTA</span>
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-mono">System v2.5</span>
                    </div>
                </div>

                <div className="h-6 w-px bg-slate-700 mx-2 hidden md:block"></div>

                <div className="hidden md:flex items-center text-slate-300 gap-2">
                    <span className="text-cyan-500 font-mono text-xs">MODULE:</span>
                    <h1 className="text-sm font-semibold text-white uppercase tracking-wider">{title}</h1>
                </div>
            </div>

            {/* Direita: Ações e Perfil */}
            <div className="flex items-center gap-3 md:gap-4">

                {/* Status indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">ONLINE</span>
                </div>

                <button
                    onClick={handleFullScreen}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Tela Cheia"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>

                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                </button>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>

                <div className="flex items-center gap-3 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white leading-none">{currentUser.name}</p>
                        <p className="text-[10px] text-cyan-500 font-mono mt-0.5">{currentUser.role?.toUpperCase()}</p>
                    </div>
                    <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600 text-slate-300">
                        <UserIcon className="w-5 h-5" />
                    </div>

                    <button
                        onClick={onLogout}
                        className="ml-2 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Sair"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};
