import React, { useState, useEffect } from 'react';
import { Boat, Client, ServiceOrder } from '../types';
import { ApiService } from '../services/api';
import { Anchor, Ship, History, Settings, X, Calendar, Gauge, MapPin, FileText, Loader2 } from 'lucide-react';

export const FleetView: React.FC = () => {
  const [boats, setBoats] = useState<Boat[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [historyBoat, setHistoryBoat] = useState<Boat | null>(null);
  const [detailsBoat, setDetailsBoat] = useState<Boat | null>(null);

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
      console.error("Erro ao carregar frota:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (id: number) => {
    const client = clients.find(c => c.id === id);
    return client ? client.name : 'Desconhecido';
  };

  const getBoatHistory = (boatId: number) => {
    return orders
      .filter(o => o.boatId === boatId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-pulse">
      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-skeleton" />
          <div className="h-4 w-48 bg-slate-100 dark:bg-slate-700 rounded animate-skeleton" />
        </div>
        <div className="w-10 h-10 bg-primary/5 dark:bg-primary/10 rounded-full animate-skeleton" />
      </div>
      <div className="p-4 space-y-4">
        <div className="h-8 w-full bg-slate-100 dark:bg-slate-700/50 rounded animate-skeleton" />
        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-skeleton" />
        <div className="space-y-3">
          <div className="h-12 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg animate-skeleton" />
          <div className="h-12 w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg animate-skeleton" />
        </div>
        <div className="flex gap-2 pt-4">
          <div className="h-10 flex-1 bg-slate-50 dark:bg-slate-700 rounded animate-skeleton" />
          <div className="h-10 flex-1 bg-slate-50 dark:bg-slate-700 rounded animate-skeleton" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
        <Anchor className="w-6 h-6 text-primary" />
        Frota Registrada
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && boats.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          boats.map(boat => (
            <div key={boat.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col group hover:border-primary transition-all">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center transition-colors">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">{boat.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{boat.hullId} • {boat.model}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Ship className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 space-y-4 flex-1">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <History className="w-3 h-3" /> Proprietário
                  </p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{getClientName(boat.clientId)}</p>
                </div>

                <div className="space-y-3">
                  {boat.engines.map((engine, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase">Motor {idx + 1}</span>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{engine.serialNumber}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{engine.model}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-primary" /> {engine.hours} hrs
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary" /> {engine.year}
                        </span>
                      </div>
                    </div>
                  ))}
                  {boat.engines.length === 0 && <p className="text-xs text-slate-400 dark:text-slate-500 text-center italic">Nenhum motor cadastrado.</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setDetailsBoat(boat)}
                    className="flex-1 text-xs font-bold uppercase py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Detalhes
                  </button>
                  <button
                    onClick={() => setHistoryBoat(boat)}
                    className="flex-1 text-xs font-bold uppercase py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <History className="w-4 h-4" /> Histórico
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- HISTORY MODAL --- */}
      {historyBoat && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-600" /> Histórico: {historyBoat.name}
              </h3>
              <button onClick={() => setHistoryBoat(null)} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded-full shadow-sm hover:shadow">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto bg-slate-50/50 flex-1">
              {getBoatHistory(historyBoat.id).length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center gap-3">
                  <FileText className="w-12 h-12 text-slate-300" />
                  <p className="text-slate-500 font-medium">Nenhum serviço registrado para esta embarcação.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getBoatHistory(historyBoat.id).map(order => (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-800 block">OS #{order.id}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${order.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'Em Execução' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>{order.status}</span>
                      </div>
                      <p className="text-sm text-slate-700 mb-3 bg-slate-50 p-2 rounded border border-slate-100">{order.description}</p>
                      <div className="flex justify-between items-end text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-500">Técnico: <span className="font-semibold text-slate-700">{order.technicianName || 'N/A'}</span></span>
                        <span className="font-bold text-slate-800 text-sm">R$ {order.totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-white rounded-b-xl flex justify-end">
              <button onClick={() => setHistoryBoat(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {detailsBoat && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-600" /> Ficha Técnica: {detailsBoat.name}
              </h3>
              <button onClick={() => setDetailsBoat(null)} className="text-slate-400 hover:text-red-500 transition-colors bg-white p-1 rounded-full shadow-sm hover:shadow">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 block">Modelo</label>
                  <p className="font-bold text-slate-800">{detailsBoat.model}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 block">Inscrição / HIN</label>
                  <p className="font-mono text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded w-fit">{detailsBoat.hullId}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 block">Tipo de Uso</label>
                  <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase">{detailsBoat.usageType || 'N/A'}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1 block">Localização</label>
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                    <MapPin className="w-3 h-3 text-red-500" />
                    {detailsBoat.marinaId ? 'Marina Externa' : 'Oficina Mare Alta'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Settings className="w-4 h-4" /> Motorização Instalada
                </h4>
                <div className="space-y-3">
                  {detailsBoat.engines.map((eng, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{eng.model}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Ano: {eng.year}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-xs mb-1">
                          <span className="text-slate-400">S/N:</span> {eng.serialNumber}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                          <Gauge className="w-3 h-3" /> {eng.hours} h
                        </span>
                      </div>
                    </div>
                  ))}
                  {detailsBoat.engines.length === 0 && <p className="text-xs text-slate-400 text-center italic">Sem motores registrados.</p>}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end">
              <button onClick={() => setDetailsBoat(null)} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};