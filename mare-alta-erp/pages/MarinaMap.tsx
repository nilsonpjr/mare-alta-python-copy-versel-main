import React, { useState } from 'react';
import { MOCK_SLIPS, MOCK_BOATS } from '../constants';
import { Ship, Anchor, ArrowUpFromLine, ArrowDownToLine, Droplets, Warehouse } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const MarinaMap: React.FC = () => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<'ALL' | 'WET' | 'DRY'>('ALL');
    const [selectedSlipId, setSelectedSlipId] = useState<string | null>(null);

    const getBoat = (id?: string) => MOCK_BOATS.find(b => b.id === id);

    const slips = MOCK_SLIPS.filter(s => {
        if (filter === 'WET') return s.type === 'WET_SLIP';
        if (filter === 'DRY') return s.type === 'DRY_STACK';
        return true;
    });

    const wetSlips = slips.filter(s => s.type === 'WET_SLIP');
    const drySlips = slips.filter(s => s.type === 'DRY_STACK');

    const renderSlip = (slip: typeof MOCK_SLIPS[0]) => {
        const boat = getBoat(slip.boatId);
        const statusColors = {
            'OCCUPIED': 'bg-blue-900/40 border-blue-500/50',
            'AVAILABLE': 'bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-400',
            'MAINTENANCE': 'bg-red-900/20 border-red-500/30 opacity-70'
        };

        const statusLabel = slip.status === 'OCCUPIED' ? t.marina.occupied : (slip.status === 'AVAILABLE' ? t.marina.available : t.marina.maintenance);

        return (
            <div 
                key={slip.id}
                onClick={() => setSelectedSlipId(slip.id)}
                className={`
                    relative p-4 rounded-xl border transition-all cursor-pointer group h-40 flex flex-col justify-between
                    ${statusColors[slip.status]}
                    ${selectedSlipId === slip.id ? 'ring-2 ring-white/50 scale-[1.02]' : ''}
                `}
            >
                <div className="flex justify-between items-start">
                    <span className="font-mono text-xl font-bold text-white opacity-50">{slip.code}</span>
                    {slip.status === 'OCCUPIED' && <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                </div>

                {boat ? (
                    <div className="text-center">
                        <Ship className="w-8 h-8 mx-auto text-white mb-2" />
                        <p className="font-bold text-white text-sm truncate">{boat.name}</p>
                        <p className="text-xs text-blue-300">{boat.model}</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full opacity-20 group-hover:opacity-40 transition-opacity">
                        <span className="text-xs font-semibold uppercase tracking-widest">{slip.status}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.marina.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{t.marina.subtitle}</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-lg">
                    <button 
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t.marina.filters.all}
                    </button>
                    <button 
                        onClick={() => setFilter('DRY')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'DRY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t.marina.filters.dry}
                    </button>
                    <button 
                        onClick={() => setFilter('WET')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'WET' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        {t.marina.filters.wet}
                    </button>
                </div>
            </header>

            {/* Quick Actions Panel */}
            {selectedSlipId && (
                <div className="glass-panel p-4 rounded-xl flex items-center justify-between animate-slide-up border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <Anchor className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase">{t.marina.actions.selected}</p>
                            <h3 className="text-xl font-bold text-white">
                                {MOCK_SLIPS.find(s => s.id === selectedSlipId)?.code}
                            </h3>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors">
                            <ArrowUpFromLine className="w-4 h-4" /> {t.marina.actions.launch}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 border border-white/10 rounded-lg hover:bg-slate-700 transition-colors">
                            <ArrowDownToLine className="w-4 h-4" /> {t.marina.actions.maintenance}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                {(filter === 'ALL' || filter === 'WET') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-blue-300">
                            <Droplets className="w-5 h-5" />
                            <h3 className="font-bold text-lg">{t.marina.headers.wet}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {wetSlips.map(renderSlip)}
                        </div>
                    </section>
                )}

                {(filter === 'ALL' || filter === 'DRY') && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-amber-300">
                            <Warehouse className="w-5 h-5" />
                            <h3 className="font-bold text-lg">{t.marina.headers.dry}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {drySlips.map(renderSlip)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default MarinaMap;