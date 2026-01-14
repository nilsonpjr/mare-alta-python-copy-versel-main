import React, { useState, useEffect } from 'react';
import { Boat, Client, ServiceOrder, OSStatus } from '../types';
import { ApiService } from '../services/api';
import { Bell, Calendar, Clock, Phone, UserCheck, Loader2 } from 'lucide-react';

export const CRMView: React.FC = () => {
    const [boats, setBoats] = useState<Boat[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [boatsData, clientsData, ordersData] = await Promise.all([
                ApiService.getBoats(),
                ApiService.getClients(),
                ApiService.getOrders()
            ]);
            setBoats(boatsData);
            setClients(clientsData);
            setOrders(ordersData);
        } catch (error) {
            console.error("Erro ao carregar dados do CRM:", error);
        } finally {
            setLoading(false);
        }
    };

    const getClient = (id: number) => clients.find(c => c.id === id);

    const SkeletonItem = () => (
        <div className="p-4 border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-skeleton" />
                    <div className="h-3 w-48 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" />
                </div>
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-skeleton" />
            </div>
            <div className="flex gap-4 mt-4">
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" />
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" />
            </div>
        </div>
    );

    // Logic to find boats needing service
    // 1. Based on Engine Hours (every 100h) - Simplified simulation
    // 2. Based on Time (every 6 months)
    const maintenanceReminders = boats.map(boat => {
        const client = getClient(boat.clientId);
        const lastOrder = orders
            .filter(o => o.boatId === boat.id && o.status === OSStatus.COMPLETED)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        const lastDate = lastOrder ? new Date(lastOrder.createdAt) : new Date(2023, 0, 1);
        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 6); // 6 Month rule

        const isDue = new Date() > nextDate;
        const daysOverdue = Math.floor((new Date().getTime() - nextDate.getTime()) / (1000 * 3600 * 24));

        return {
            boat,
            client,
            lastDate,
            nextDate,
            isDue,
            daysOverdue,
            hours: boat.engines[0]?.hours || 0
        };
    }).filter(r => r.isDue); // Only show those due

    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-primary" />
                    CRM & Fidelização
                </h2>
                <p className="text-slate-500 dark:text-slate-400">Monitoramento de revisões preventivas e contato com clientes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-red-500" />
                        Revisões Vencidas (Por Data)
                    </h3>
                    <div className="space-y-4">
                        {loading && boats.length === 0 ? (
                            <>
                                <SkeletonItem />
                                <SkeletonItem />
                                <SkeletonItem />
                            </>
                        ) : null}
                        {maintenanceReminders.length === 0 && !loading && <p className="text-slate-400 dark:text-slate-500 text-sm italic">Nenhuma revisão pendente no momento.</p>}
                        {maintenanceReminders.map((reminder, idx) => (
                            <div key={idx} className="p-4 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700/30 rounded-lg flex justify-between items-center group hover:border-primary transition-all">
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{reminder.boat.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{reminder.client?.name} • {reminder.client?.phone}</p>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase font-bold">
                                            <Calendar className="w-3 h-3" /> Venceu em {reminder.nextDate.toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-red-600 dark:text-red-400 block">+ {reminder.daysOverdue} dias</span>
                                    <button className="mt-2 text-[10px] font-bold uppercase bg-primary text-white px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        Contatar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Próximos Contatos (Fidelização)
                    </h3>
                    <div className="space-y-3">
                        {boats.slice(0, 5).map((boat, idx) => (
                            <div key={idx} className="p-3 border border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {boat.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-white text-sm">{boat.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Última visita: 3 meses atrás</p>
                                    </div>
                                </div>
                                <Phone className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-primary cursor-pointer transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};