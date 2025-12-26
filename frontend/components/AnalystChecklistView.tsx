import React, { useState } from 'react';
import { MOCK_BOATS } from '../constants_erp';
import { ClipboardCheck, CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AnalystChecklistView: React.FC = () => {
    const { t } = useTranslation();
    const [selectedBoatId, setSelectedBoatId] = useState(MOCK_BOATS[0].id);

    const checklistItems = [
        { id: 1, cat: 'MOTOR', label: 'Engine Oil Level' },
        { id: 2, cat: 'MOTOR', label: 'Coolant Level' },
        { id: 3, cat: 'MOTOR', label: 'Belts Condition' },
        { id: 4, cat: 'ELECTRIC', label: 'Battery Voltage (Start)' },
        { id: 5, cat: 'ELECTRIC', label: 'Battery Voltage (House)' },
        { id: 6, cat: 'ELECTRIC', label: 'Bilge Pumps' },
        { id: 7, cat: 'HULL', label: 'Zinc Anodes' },
        { id: 8, cat: 'HULL', label: 'Sea Cocks Operation' },
    ];

    const [statuses, setStatuses] = useState<Record<number, string>>({});

    const handleStatus = (id: number, status: string) => {
        setStatuses(prev => ({ ...prev, [id]: status }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('analyst.title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('analyst.subtitle')}</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                    <FileText className="w-4 h-4" /> {t('analyst.generate')}
                </button>
            </header>

            {/* Boat Selector */}
            <div className="bg-white dark:glass-panel border border-slate-200 dark:border-white/5 p-4 rounded-xl flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">
                    12
                </div>
                <div className="flex-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">{t('analyst.target')}</label>
                    <select
                        value={selectedBoatId}
                        onChange={(e) => setSelectedBoatId(e.target.value)}
                        className="block w-full bg-transparent text-slate-800 dark:text-white font-bold text-lg focus:outline-none cursor-pointer"
                    >
                        {MOCK_BOATS.map(b => (
                            <option key={b.id} value={b.id} className="text-slate-800 dark:text-white dark:bg-slate-900">{b.name} ({b.model})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Checklist Form */}
            <div className="bg-white dark:glass-panel border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ClipboardCheck className="text-blue-500 dark:text-blue-400" /> {t('analyst.items')}
                    </h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {checklistItems.map((item) => (
                        <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <div>
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20 mb-1 inline-block">
                                    {item.cat}
                                </span>
                                <p className="text-slate-700 dark:text-slate-200 font-medium">{item.label}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatus(item.id, 'OK')}
                                    className={`p-2 rounded-lg transition-all ${statuses[item.id] === 'OK' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                >
                                    <CheckCircle className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => handleStatus(item.id, 'ATTENTION')}
                                    className={`p-2 rounded-lg transition-all ${statuses[item.id] === 'ATTENTION' ? 'bg-yellow-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                >
                                    <AlertTriangle className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => handleStatus(item.id, 'CRITICAL')}
                                    className={`p-2 rounded-lg transition-all ${statuses[item.id] === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white dark:glass-panel border border-slate-200 dark:border-white/5 p-6 rounded-xl space-y-4 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white">{t('analyst.recs')}</h3>
                <textarea
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg p-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 min-h-[120px]"
                    placeholder={t('analyst.placeholder')}
                ></textarea>
            </div>
        </div>
    );
};
