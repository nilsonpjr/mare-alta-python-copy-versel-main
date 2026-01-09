import React, { useMemo, useState, useEffect } from 'react';
import { ServiceOrder, OSStatus, Part } from '../types';
import { ApiService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, AlertCircle, Wrench, Package, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [inventory, setInventory] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, partsData] = await Promise.all([
        ApiService.getOrders(),
        ApiService.getParts()
      ]);
      setOrders(ordersData);
      setInventory(partsData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpi = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === OSStatus.COMPLETED || o.status === OSStatus.APPROVED)
      .reduce((acc, curr) => acc + curr.totalValue, 0);

    const pendingOrders = orders.filter(o => o.status === OSStatus.PENDING).length;
    const activeOrders = orders.filter(o => o.status === OSStatus.IN_PROGRESS).length;
    const lowStock = inventory.filter(p => p.quantity <= p.minStock).length;

    return { totalRevenue, pendingOrders, activeOrders, lowStock };
  }, [orders, inventory]);

  const chartData = [
    { name: 'Pendente', value: orders.filter(o => o.status === OSStatus.PENDING).length, color: '#f59e0b' },
    { name: 'Orçamento', value: orders.filter(o => o.status === OSStatus.QUOTATION).length, color: '#3b82f6' },
    { name: 'Execução', value: orders.filter(o => o.status === OSStatus.IN_PROGRESS).length, color: '#6366f1' },
    { name: 'Concluído', value: orders.filter(o => o.status === OSStatus.COMPLETED).length, color: '#10b981' },
  ];

  const KPICard = ({ label, value, icon: Icon, colorClass, gradientClass, subText, onClick }: any) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
    >
      <div className={`absolute top-0 right-0 p-4 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        {subText && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {subText}</span>}
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full ${gradientClass}`}></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Visão Geral</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Bem-vindo ao painel de controle Mare Alta Náutica</p>
        </div>
        <div className="text-xs md:text-sm text-slate-400 font-medium">
          Atualizado em: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <KPICard
          label="Receita Aprovada"
          value={`R$ ${kpi.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          colorClass="bg-emerald-50 text-emerald-600"
          gradientClass="bg-gradient-to-r from-emerald-400 to-teal-500"
          onClick={() => setView('finance')}
        />
        <KPICard
          label="Solicitações Pendentes"
          value={kpi.pendingOrders}
          icon={AlertCircle}
          colorClass="bg-amber-50 text-amber-600"
          gradientClass="bg-gradient-to-r from-amber-400 to-orange-500"
          subText="Ação Necessária"
          onClick={() => setView('orders')}
        />
        <KPICard
          label="Embarcações em Serviço"
          value={kpi.activeOrders}
          icon={Wrench}
          colorClass="bg-blue-50 text-blue-600"
          gradientClass="bg-gradient-to-r from-blue-400 to-cyan-500"
          onClick={() => setView('orders')}
        />
        <KPICard
          label="Alerta de Estoque"
          value={kpi.lowStock}
          icon={Package}
          colorClass="bg-red-50 text-red-600"
          gradientClass="bg-gradient-to-r from-red-400 to-rose-500"
          onClick={() => setView('inventory')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Volume de Ordens de Serviço</h3>
          </div>
          <div className="h-64 md:h-80 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={40}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[420px]">
          <h3 className="font-bold text-slate-800 text-lg mb-4">Últimas Atualizações</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
            {orders.slice(0, 10).map(order => (
              <div
                key={order.id}
                onClick={() => setView('orders')}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
              >
                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${order.status === OSStatus.COMPLETED ? 'bg-emerald-500' :
                  order.status === OSStatus.IN_PROGRESS ? 'bg-blue-500' :
                    order.status === OSStatus.PENDING ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{order.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">OS #{order.id} • {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide whitespace-nowrap ${order.status === OSStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-600'
                  }`}>{order.status}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setView('orders')}
            className="w-full mt-4 py-2 text-sm text-cyan-600 font-medium hover:bg-cyan-50 rounded-lg transition-colors"
          >
            Ver Todas as Ordens
          </button>
        </div>
      </div>
    </div>
  );
};