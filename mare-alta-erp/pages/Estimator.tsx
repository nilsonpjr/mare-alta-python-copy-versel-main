import React, { useState } from 'react';
import { MOCK_BOATS, MOCK_KITS } from '../constants';
import { ServiceKit } from '../types';
import { Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Estimator: React.FC = () => {
    const { t } = useLanguage();
    const [selectedBoatId, setSelectedBoatId] = useState<string>('');
    const [selectedKit, setSelectedKit] = useState<ServiceKit | null>(null);

    const selectedBoat = MOCK_BOATS.find(b => b.id === selectedBoatId);

    // Filter kits based on selected boat's engine brand
    const availableKits = selectedBoat 
        ? MOCK_KITS.filter(k => k.engineBrand === selectedBoat.engineBrand)
        : [];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header>
                <h2 className="text-2xl font-bold text-white">{t.estimator.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{t.estimator.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Boat Selection */}
                <div className="glass-panel p-6 rounded-xl space-y-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">1</span>
                        {t.estimator.step1}
                    </h3>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                        <select 
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                            onChange={(e) => {
                                setSelectedBoatId(e.target.value);
                                setSelectedKit(null);
                            }}
                            value={selectedBoatId}
                        >
                            <option value="">{t.estimator.selectPlaceholder}</option>
                            {MOCK_BOATS.map(boat => (
                                <option key={boat.id} value={boat.id}>{boat.name} - {boat.model} ({boat.engineModel})</option>
                            ))}
                        </select>
                    </div>

                    {selectedBoat && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/5 flex gap-4 animate-fade-in">
                            <div className="w-20 h-20 rounded-md bg-slate-800 bg-cover bg-center" style={{ backgroundImage: `url(${selectedBoat.imageUrl})` }}></div>
                            <div>
                                <h4 className="font-bold text-white">{selectedBoat.name}</h4>
                                <p className="text-sm text-slate-400">{selectedBoat.model}</p>
                                <div className="mt-2 text-xs font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded inline-block">
                                    {selectedBoat.engineModel} • {selectedBoat.engineHours}h
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Kit Selection */}
                <div className={`glass-panel p-6 rounded-xl space-y-6 transition-opacity duration-300 ${!selectedBoat ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-xs flex items-center justify-center">2</span>
                        {t.estimator.step2}
                    </h3>

                    <div className="space-y-3">
                        {availableKits.length > 0 ? availableKits.map(kit => (
                            <div 
                                key={kit.id}
                                onClick={() => setSelectedKit(kit)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                    selectedKit?.id === kit.id 
                                    ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10' 
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h5 className="font-medium text-white">{kit.name}</h5>
                                        <p className="text-sm text-slate-400 mt-1">{kit.parts.length} {t.estimator.summary.items} • ~{kit.estimatedLaborHours}h {t.estimator.summary.labor}</p>
                                    </div>
                                    <span className="text-lg font-bold text-white">${kit.totalPrice}</span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-slate-500 text-sm text-center py-4">{t.estimator.noKits}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom: Summary & Action */}
            {selectedKit && (
                <div className="glass-panel p-6 rounded-xl border-t-4 border-t-blue-500 animate-slide-up">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-2">{t.estimator.summary.title}</h3>
                            <div className="flex gap-8 text-sm text-slate-300">
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">{t.estimator.summary.labor}</span>
                                    <span className="font-mono">{selectedKit.estimatedLaborHours} {t.estimator.summary.hours}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">{t.estimator.summary.parts}</span>
                                    <span className="font-mono">{selectedKit.parts.length} {t.estimator.summary.items}</span>
                                </div>
                                <div>
                                    <span className="block text-slate-500 text-xs uppercase">{t.estimator.summary.total}</span>
                                    <span className="font-mono text-xl text-blue-400 font-bold">${selectedKit.totalPrice}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-6 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium">
                                {t.estimator.buttons.draft}
                            </button>
                            <button className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/30 font-bold flex items-center gap-2">
                                {t.estimator.buttons.create} <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Estimator;