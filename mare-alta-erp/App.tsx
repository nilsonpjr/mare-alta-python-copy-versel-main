import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Workshop from './pages/Workshop';
import Estimator from './pages/Estimator';
import AIDiagnostics from './pages/AIDiagnostics';
import Architecture from './pages/Architecture';
import MarinaMap from './pages/MarinaMap';
import MechanicApp from './pages/MechanicApp';
import AnalystChecklist from './pages/AnalystChecklist';
import { ViewState } from './types';
import { Home, BellRing } from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext';

const DashboardContent: React.FC = () => {
    const { t } = useLanguage();
    
    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-white">{t.dashboard.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{t.dashboard.subtitle}</p>
            </header>

            {/* CRM Alerts */}
            <div className="glass-panel p-6 rounded-xl border-l-4 border-yellow-500">
                <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                    <BellRing className="text-yellow-500 w-5 h-5" /> {t.dashboard.alerts}
                </h3>
                <div className="space-y-3">
                    <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">Ocean Runner (Phantom 303)</p>
                            <p className="text-sm text-slate-400">Engine Hours: 98h ({t.dashboard.approaching})</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 rounded text-sm text-white font-medium hover:bg-blue-500">{t.dashboard.whatsapp}</button>
                    </div>
                    <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white">Sea Spirit (Azimut 50)</p>
                            <p className="text-sm text-slate-400">{t.dashboard.lastService}: 11 {t.dashboard.monthsAgo}</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 rounded text-sm text-white font-medium hover:bg-blue-500">{t.dashboard.whatsapp}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const MainLayout: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewState>('WORKSHOP');

    const renderView = () => {
        switch (currentView) {
            case 'DASHBOARD': return <DashboardContent />;
            case 'MARINA_MAP': return <MarinaMap />;
            case 'WORKSHOP': return <Workshop />;
            case 'MECHANIC_APP': return <MechanicApp />;
            case 'ANALYST_MODE': return <AnalystChecklist />;
            case 'ESTIMATOR': return <Estimator />;
            case 'AI_DIAGNOSTICS': return <AIDiagnostics />;
            case 'ARCHITECTURE': return <Architecture />;
            default: return <Workshop />;
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-ocean-900 text-slate-200 font-sans">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[128px]"></div>
            </div>

            <Sidebar currentView={currentView} onChangeView={setCurrentView} />

            <main className="flex-1 ml-64 p-8 relative z-10 overflow-y-auto h-screen">
                {renderView()}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <LanguageProvider>
            <MainLayout />
        </LanguageProvider>
    );
};

export default App;