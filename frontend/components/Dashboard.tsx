import React, { useMemo, useState, useEffect } from 'react';
import { ServiceOrder, OSStatus, Part, Transaction } from '../types';
import { ApiService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, AlertCircle, Wrench, Package, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DashboardProps {
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [inventory, setInventory] = useState<Part[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { preferences } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, partsData, transactionsData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getParts(),
        ApiService.getTransactions()
      ]);
      setOrders(ordersData);
      setInventory(partsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpi = useMemo(() => {
    // Para bater com o Financeiro, usamos as transações de entrada (INCOME)
    const totalRevenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingOrders = orders.filter(o => o.status === OSStatus.PENDING).length;
    const activeOrders = orders.filter(o => o.status === OSStatus.IN_PROGRESS).length;
    const lowStock = inventory.filter(p => p.quantity <= p.minStock).length;

    return { totalRevenue, pendingOrders, activeOrders, lowStock };
  }, [orders, inventory, transactions]);

  const chartData = [
    { name: 'Pendente', value: orders.filter(o => o.status === OSStatus.PENDING).length, color: '#f59e0b' },
    { name: 'Orçamento', value: orders.filter(o => o.status === OSStatus.QUOTATION).length, color: '#3b82f6' },
    { name: 'Execução', value: orders.filter(o => o.status === OSStatus.IN_PROGRESS).length, color: '#6366f1' },
    { name: 'Concluído', value: orders.filter(o => o.status === OSStatus.COMPLETED).length, color: '#10b981' },
  ];

  const SkeletonKPI = () => (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 relative overflow-hidden animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-700/50 rounded-2xl" />
        <div className="w-16 h-6 bg-slate-50 dark:bg-slate-700/30 rounded-full" />
      </div>
      <div className="space-y-4">
        <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700/50 rounded-full" />
        <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
      </div>
    </div>
  );

  const KPICard = ({ label, value, icon: Icon, colorClass, gradientClass, subText, onClick }: any) => (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer transform hover:-translate-y-1 duration-500"
    >
      <div className="absolute top-0 right-0 p-6 opacity-[0.05] dark:opacity-[0.1] transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
        <Icon className="w-28 h-28 dark:text-white" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`p-4 rounded-2xl shadow-lg ${colorClass} dark:bg-opacity-10 transition-colors`}>
          <Icon className="w-7 h-7" />
        </div>
        {subText && (
          <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 px-3 py-1.5 rounded-full flex items-center gap-1 uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-400/20">
            <ArrowUpRight className="w-3 h-3" /> {subText}
          </span>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
      </div>

      <div className={`absolute bottom-0 left-0 h-1.5 w-full opacity-60 ${gradientClass}`}></div>
    </div>
  );

  return (
    <div className="p-8 space-y-12 animate-fade-in bg-slate-50 dark:bg-slate-900 min-h-full transition-colors duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Dashboard</h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Visão consolidada da operação náutica • {preferences.darkMode ? 'Modo Escuro' : 'Modo Claro'}</p>
        </div>
        <div className="px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Último Sinc: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading && orders.length === 0 ? (
          <>
            <SkeletonKPI />
            <SkeletonKPI />
            <SkeletonKPI />
            <SkeletonKPI />
          </>
        ) : (
          <>
            <KPICard
              label="Faturamento Total"
              value={`R$ ${kpi.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              icon={Wallet}
              colorClass="bg-emerald-50 text-emerald-600 shadow-emerald-100 dark:shadow-none"
              gradientClass="bg-emerald-500"
              onClick={() => setView('finance')}
            />
            <KPICard
              label="Pendências Críticas"
              value={kpi.pendingOrders}
              icon={AlertCircle}
              colorClass="bg-amber-50 text-amber-600 shadow-amber-100 dark:shadow-none"
              gradientClass="bg-amber-500"
              subText="Agir Agora"
              onClick={() => setView('orders')}
            />
            <KPICard
              label="Execuções Ativas"
              value={kpi.activeOrders}
              icon={Wrench}
              colorClass="bg-indigo-50 text-indigo-600 shadow-indigo-100 dark:shadow-none"
              gradientClass="bg-indigo-500"
              onClick={() => setView('orders')}
            />
            <KPICard
              label="Ruptura de Estoque"
              value={kpi.lowStock}
              icon={Package}
              colorClass="bg-rose-50 text-rose-600 shadow-rose-100 dark:shadow-none"
              gradientClass="bg-rose-500"
              subText={kpi.lowStock > 0 ? "Comprar" : ""}
              onClick={() => setView('inventory')}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-slate-800 dark:text-white text-xl uppercase tracking-tight">Fluxo de Ordens de Serviço</h3>
            <div className="flex gap-2">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: preferences.darkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: preferences.darkMode ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900 }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: preferences.darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' }}
                  contentStyle={{
                    borderRadius: '24px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    backgroundColor: preferences.darkMode ? '#1e293b' : '#fff',
                    padding: '20px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 flex flex-col h-[525px]">
          <h3 className="font-black text-slate-800 dark:text-white text-xl uppercase tracking-tight mb-8">Eventos Recentes</h3>
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin">
            {loading && orders.length === 0 ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-5 p-4 animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-slate-100 animate-skeleton" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg animate-skeleton" />
                    <div className="h-3 w-1/2 bg-slate-50 rounded-lg animate-skeleton" />
                  </div>
                </div>
              ))
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl mb-4">
                  <Package className="w-12 h-12 text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nada por aqui no momento</p>
              </div>
            ) : orders.slice(0, 10).map(order => (
              <div
                key={order.id}
                onClick={() => setView('orders')}
                className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
              >
                <div className={`mt-2 w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform ${order.status === OSStatus.COMPLETED ? 'bg-emerald-500' :
                  order.status === OSStatus.IN_PROGRESS ? 'bg-blue-500' :
                    order.status === OSStatus.PENDING ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">{order.description}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mt-1 italic">#{order.id} • {new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${order.status === OSStatus.COMPLETED
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                  'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                  }`}>{order.status}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setView('orders')}
            className="w-full mt-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Ver Fluxo Completo
          </button>
        </div>
      </div>
    </div>
  );
};