import React, { useState } from 'react';
import { MOCK_ORDERS, MOCK_BOATS } from '../constants_erp';
import { Camera, Clock, CheckSquare, Package, ChevronRight, PlayCircle, PauseCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MechanicAppView: React.FC = () => {
    const { t } = useTranslation();
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [timerActive, setTimerActive] = useState(false);

    // Filter only Approved or Execution orders
    const myTasks = MOCK_ORDERS.filter(o => ['APPROVED', 'EXECUTION'].includes(o.status));

    const getBoat = (id: string) => MOCK_BOATS.find(b => b.id === id);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t('mechanic.title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{t('mechanic.welcome')}, João Silva</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-mono text-slate-800 dark:text-white font-bold">14:32</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">{t('mechanic.online')}</p>
                </div>
            </header>

            {!activeOrderId ? (
                // Task List View
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{t('mechanic.tasks')}</h3>
                    {myTasks.map(order => {
                        const boat = getBoat(order.boatId);
                        return (
                            <div
                                key={order.id}
                                onClick={() => setActiveOrderId(order.id)}
                                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-white/5 active:scale-95 transition-transform cursor-pointer shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{order.number}</span>
                                    <ChevronRight className="text-slate-400 dark:text-slate-500" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{boat?.name}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{order.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-black/20 p-2 rounded">
                                    <span className="font-mono text-blue-600 dark:text-blue-300">{boat?.engineModel}</span>
                                    <span>•</span>
                                    <span>Engine Room A</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                // Active Task Detail View
                <div className="animate-fade-in space-y-6">
                    <button
                        onClick={() => setActiveOrderId(null)}
                        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-2 text-sm"
                    >
                        ← {t('mechanic.back')}
                    </button>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-blue-500/30 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{getBoat(MOCK_ORDERS.find(o => o.id === activeOrderId)!.boatId)?.name}</h3>
                            <button
                                onClick={() => setTimerActive(!timerActive)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition-all ${timerActive
                                        ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/50 animate-pulse'
                                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                                    }`}
                            >
                                {timerActive ? <><PauseCircle /> {t('mechanic.buttons.stop')}</> : <><PlayCircle /> {t('mechanic.buttons.start')}</>}
                            </button>
                        </div>

                        {/* Big Touch Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors">
                                <CheckSquare className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                                <span className="text-slate-800 dark:text-white font-medium">{t('mechanic.buttons.checklist')}</span>
                            </button>
                            <button className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors">
                                <Camera className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                                <span className="text-slate-800 dark:text-white font-medium">{t('mechanic.buttons.photo')}</span>
                            </button>
                            <button className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors">
                                <Package className="w-10 h-10 text-amber-500 dark:text-amber-400" />
                                <span className="text-slate-800 dark:text-white font-medium">{t('mechanic.buttons.parts')}</span>
                            </button>
                            <button className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors">
                                <Clock className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                                <span className="text-slate-800 dark:text-white font-medium">{t('mechanic.buttons.history')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-black/20 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">{t('mechanic.partsRequired')}</h4>
                        <ul className="space-y-2">
                            <li className="flex justify-between text-slate-600 dark:text-slate-300 py-2 border-b border-slate-200 dark:border-white/5">
                                <span>Oil Filter</span>
                                <span className="text-slate-800 dark:text-white">x1</span>
                            </li>
                            <li className="flex justify-between text-slate-600 dark:text-slate-300 py-2 border-b border-slate-200 dark:border-white/5">
                                <span>Engine Oil (Qt)</span>
                                <span className="text-slate-800 dark:text-white">x6</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
