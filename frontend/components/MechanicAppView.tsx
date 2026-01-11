import React, { useState, useEffect, useRef } from 'react';
import { ServiceOrder, Boat, OSStatus } from '../types';
import { Camera, Clock, CheckSquare, Package, ChevronRight, PlayCircle, PauseCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';

export const MechanicAppView: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [boats, setBoats] = useState<Boat[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [timerActive, setTimerActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [ordersData, boatsData] = await Promise.all([
                ApiService.getOrders(),
                ApiService.getBoats()
            ]);
            setOrders(ordersData);
            setBoats(boatsData);
        } catch (error) {
            console.error("Erro ao carregar dados do técnico:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter only Approved or In Progress orders
    const myTasks = orders.filter(o =>
        o.status === OSStatus.APPROVED || o.status === OSStatus.IN_PROGRESS
    );

    const activeOrder = orders.find(o => String(o.id) === activeOrderId);
    const getBoat = (id: number) => boats.find(b => b.id === id);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeOrderId) return;

        try {
            const url = await ApiService.uploadImage(file);
            alert("Foto enviada com sucesso!");
            // Aqui poderíamos adicionar a URL às 'notes' da OS ou um campo de anexos
            await ApiService.addOrderNote(Number(activeOrderId), {
                text: `[FOTO DO TÉCNICO]: ${url}`
            });
            loadData();
        } catch (error) {
            console.error("Erro no upload:", error);
            alert("Falha ao enviar foto.");
        }
    };

    const handleFinalize = async () => {
        if (!activeOrderId) return;
        if (!window.confirm("Deseja finalizar este serviço e dar baixa no estoque?")) return;

        try {
            await ApiService.completeOrder(Number(activeOrderId));
            alert("Serviço finalizado com sucesso!");
            setActiveOrderId(null);
            loadData();
        } catch (error) {
            console.error("Erro ao finalizar:", error);
            alert("Erro ao finalizar serviço. Verifique se há estoque para as peças.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-500">Carregando ordens de serviço...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{t('mechanic.title')}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{t('mechanic.welcome')}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-mono text-slate-800 dark:text-white font-bold">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">{t('mechanic.online')}</p>
                </div>
            </header>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
            />

            {!activeOrderId ? (
                // Task List View
                <div id="tech-schedule" className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{t('mechanic.tasks')} ({myTasks.length})</h3>
                    {myTasks.length === 0 && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Nenhuma tarefa pendente para execução.</p>
                        </div>
                    )}
                    {myTasks.map(order => {
                        const boat = getBoat(order.boatId);
                        return (
                            <div
                                key={order.id}
                                onClick={() => setActiveOrderId(String(order.id))}
                                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-white/5 active:scale-95 transition-transform cursor-pointer shadow-lg"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">OS #{String(order.id).padStart(4, '0')}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${order.status === OSStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <ChevronRight className="text-slate-400 dark:text-slate-500" />
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{boat?.name || 'Barco não identificado'}</h4>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{order.description}</p>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-black/20 p-2 rounded">
                                    <span className="font-mono text-blue-600 dark:text-blue-300">{boat?.model || 'Modelo N/A'}</span>
                                    <span>•</span>
                                    <span>{order.technicianName || 'Técnico não definido'}</span>
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
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {getBoat(activeOrder?.boatId!)?.name || t('mechanic.taskDetail')}
                            </h3>
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
                            <button id="btn-checklist-entry" className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors">
                                <CheckSquare className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                                <span className="text-slate-800 dark:text-white font-medium">{t('mechanic.buttons.checklist')}</span>
                            </button>
                            <button
                                onClick={handlePhotoClick}
                                className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors"
                            >
                                <Camera className="w-10 h-10 text-blue-500 dark:text-blue-400" />
                                <span className="text-slate-800 dark:text-white font-medium">{t('mechanic.buttons.photo')}</span>
                            </button>
                            <button id="btn-add-part-os" className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 p-6 rounded-xl flex flex-col items-center gap-3 border border-slate-200 dark:border-white/5 transition-colors">
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
                            {activeOrder?.items.filter(i => i.type === 'PART').map((item, idx) => (
                                <li key={idx} className="flex justify-between text-slate-600 dark:text-slate-300 py-2 border-b border-slate-200 dark:border-white/5">
                                    <span>{item.description}</span>
                                    <span className="text-slate-800 dark:text-white font-bold">x{item.quantity}</span>
                                </li>
                            ))}
                            {activeOrder?.items.filter(i => i.type === 'PART').length === 0 && (
                                <p className="text-xs text-slate-400 italic">Nenhuma peça requisitada para esta OS.</p>
                            )}
                        </ul>
                    </div>

                    <button
                        id="btn-finalize-os"
                        onClick={handleFinalize}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <CheckSquare className="w-5 h-5" />
                        Finalizar Serviço
                    </button>
                </div>
            )}
        </div>
    );
};

