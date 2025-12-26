import React from 'react';
import { 
    Anchor, 
    Wrench, 
    Calculator, 
    Bot, 
    LayoutDashboard, 
    Database, 
    LogOut,
    Map,
    TabletSmartphone,
    ClipboardCheck,
    Globe
} from 'lucide-react';
import { ViewState } from '../types';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
    const { t, language, setLanguage } = useLanguage();

    const menuItems = [
        { id: 'DASHBOARD', label: t.sidebar.dashboard, icon: LayoutDashboard },
        { id: 'MARINA_MAP', label: t.sidebar.marinaMap, icon: Map },
        { id: 'WORKSHOP', label: t.sidebar.workshop, icon: Wrench },
        { id: 'MECHANIC_APP', label: t.sidebar.mechanicApp, icon: TabletSmartphone },
        { id: 'ANALYST_MODE', label: t.sidebar.analystMode, icon: ClipboardCheck },
        { id: 'ESTIMATOR', label: t.sidebar.estimator, icon: Calculator },
        { id: 'AI_DIAGNOSTICS', label: t.sidebar.aiDiagnostics, icon: Bot },
        { id: 'ARCHITECTURE', label: t.sidebar.architecture, icon: Database },
    ];

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/10 flex flex-col z-50">
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Anchor className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-white">MARE ALTA</h1>
                    <p className="text-xs text-blue-300 font-medium tracking-wider">{t.sidebar.premiumErp}</p>
                </div>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id as ViewState)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group
                                ${isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-300'}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-4">
                {/* Language Toggle */}
                <div className="flex bg-black/20 rounded-lg p-1">
                    <button 
                        onClick={() => setLanguage('pt-BR')}
                        className={`flex-1 py-1 text-xs font-bold rounded ${language === 'pt-BR' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        PT-BR
                    </button>
                    <button 
                        onClick={() => setLanguage('en-US')}
                        className={`flex-1 py-1 text-xs font-bold rounded ${language === 'en-US' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                        EN-US
                    </button>
                </div>

                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        JS
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">João Silva</p>
                        <p className="text-xs text-slate-400 truncate">{t.sidebar.seniorMechanic}</p>
                    </div>
                    <LogOut className="w-4 h-4 text-slate-500 cursor-pointer hover:text-red-400 transition-colors" title={t.sidebar.logout} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;