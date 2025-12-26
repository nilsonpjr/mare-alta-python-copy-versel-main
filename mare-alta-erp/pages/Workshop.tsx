import React from 'react';
import { MOCK_ORDERS, MOCK_BOATS } from '../constants';
import { OSStatus } from '../types';
import { Clock, CheckCircle2, AlertCircle, Wrench, MoreVertical } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const StatusBadge: React.FC<{ status: OSStatus }> = ({ status }) => {
    const colors = {
        [OSStatus.OPEN]: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        [OSStatus.ANALYSIS]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        [OSStatus.APPROVED]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        [OSStatus.EXECUTION]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        [OSStatus.COMPLETED]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}>
            {status}
        </span>
    );
};

const Workshop: React.FC = () => {
    const { t } = useLanguage();
    const getBoat = (id: string) => MOCK_BOATS.find(b => b.id === id);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">{t.workshop.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">{t.workshop.subtitle}</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                    <Wrench className="w-4 h-4" />
                    {t.workshop.newOrder}
                </button>
            </header>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: t.workshop.stats.execution, val: '12', icon: Clock, color: 'text-purple-400' },
                    { label: t.workshop.stats.approval, val: '5', icon: AlertCircle, color: 'text-yellow-400' },
                    { label: t.workshop.stats.completed, val: '28', icon: CheckCircle2, color: 'text-emerald-400' },
                    { label: t.workshop.stats.efficiency, val: '94%', icon: Wrench, color: 'text-blue-400' },
                ].map((m, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider">{m.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{m.val}</p>
                        </div>
                        <m.icon className={`w-8 h-8 opacity-80 ${m.color}`} />
                    </div>
                ))}
            </div>

            {/* List View */}
            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{t.workshop.table.title}</h3>
                    <div className="flex gap-2 text-sm text-slate-400">
                        <button className="px-3 py-1 hover:text-white transition-colors">{t.workshop.table.all}</button>
                        <button className="px-3 py-1 text-white bg-white/10 rounded-md">{t.workshop.table.myOrders}</button>
                    </div>
                </div>
                
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-white/5 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">{t.workshop.table.headers.os}</th>
                            <th className="px-6 py-4">{t.workshop.table.headers.boat}</th>
                            <th className="px-6 py-4">{t.workshop.table.headers.desc}</th>
                            <th className="px-6 py-4">{t.workshop.table.headers.status}</th>
                            <th className="px-6 py-4">{t.workshop.table.headers.created}</th>
                            <th className="px-6 py-4 text-right">{t.workshop.table.headers.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {MOCK_ORDERS.map((os) => {
                            const boat = getBoat(os.boatId);
                            return (
                                <tr key={os.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4 font-medium text-white">{os.number}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url(${boat?.imageUrl})` }}></div>
                                            <div>
                                                <div className="text-white font-medium">{boat?.name}</div>
                                                <div className="text-xs text-slate-500">{boat?.engineModel}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate">{os.description}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={os.status} />
                                    </td>
                                    <td className="px-6 py-4">{os.createdAt}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Workshop;