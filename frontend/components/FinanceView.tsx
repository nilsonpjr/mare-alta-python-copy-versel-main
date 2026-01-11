import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionCreate } from '../types';
import { ApiService } from '../services/api';
import {
  DollarSign, TrendingUp, TrendingDown, Plus,
  Search, FileText, Calendar, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const FinanceView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<TransactionCreate>>({
    type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
    status: 'PAID',
    category: 'Geral'
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpi = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const pending = transactions
      .filter(t => t.status === 'PENDING')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return { income, expense, balance: income - expense, pending };
  }, [transactions]);

  const handleSave = async () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      const transactionToCreate: TransactionCreate = {
        type: newTransaction.type as 'INCOME' | 'EXPENSE',
        category: newTransaction.category || 'Geral',
        description: newTransaction.description,
        amount: Number(newTransaction.amount),
        date: newTransaction.date,
        status: newTransaction.status || 'PAID',
        documentNumber: newTransaction.documentNumber,
        orderId: newTransaction.orderId ? Number(newTransaction.orderId) : undefined
      };

      await ApiService.createTransaction(transactionToCreate);
      setIsModalOpen(false);
      setNewTransaction({
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0],
        status: 'PAID',
        category: 'Geral'
      });
      loadTransactions();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao salvar transação no servidor.");
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Financeiro</h2>
          <p className="text-slate-500 text-sm">Controle de Entradas e Saídas (Banco de Dados)</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Lançamento Manual
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase">Receitas Totais</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">R$ {kpi.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown className="w-16 h-16 text-red-600" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase">Despesas Totais</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">R$ {kpi.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden ${kpi.balance >= 0 ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white border-transparent' : 'bg-white border-slate-200 text-red-600'}`}>
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign className="w-16 h-16 text-white" />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${kpi.balance >= 0 ? 'bg-white/20' : 'bg-red-100'}`}>
              <DollarSign className={`w-5 h-5 ${kpi.balance >= 0 ? 'text-white' : 'text-red-600'}`} />
            </div>
            <span className={`text-sm font-bold uppercase ${kpi.balance >= 0 ? 'text-cyan-100' : 'text-slate-500'}`}>Saldo Líquido</span>
          </div>
          <p className="text-3xl font-bold">R$ {kpi.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento, categoria ou NF..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading && <Loader2 className="w-6 h-6 animate-spin text-slate-400 self-center" />}
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria / NF</th>
              <th className="px-6 py-4 text-center">Tipo</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  {loading ? 'Carregando...' : 'Nenhum lançamento encontrado.'}
                </td>
              </tr>
            ) : filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {t.description}
                  {t.orderId && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AUTO</span>}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-col">
                    <span>{t.category}</span>
                    {t.documentNumber && <span className="text-xs text-slate-400">NF: {t.documentNumber}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                  {t.type === 'EXPENSE' ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center">
                  {t.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      <FileText className="w-3 h-3" /> Pago
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                      <Calendar className="w-3 h-3" /> Pendente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold mb-4">Novo Lançamento</h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Type Toggle */}
              <div className="col-span-2 flex gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={newTransaction.type === 'EXPENSE'}
                    onChange={() => setNewTransaction({ ...newTransaction, type: 'EXPENSE' })}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="font-medium text-red-700 bg-red-50 px-3 py-1 rounded">Despesa (Saída)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={newTransaction.type === 'INCOME'}
                    onChange={() => setNewTransaction({ ...newTransaction, type: 'INCOME' })}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded">Receita (Entrada)</span>
                </label>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-slate-200 outline-none bg-white text-slate-900"
                  placeholder="Ex: Compra de peças, Conta de Luz"
                  value={newTransaction.description || ''}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Categoria</label>
                <input
                  type="text"
                  list="categories"
                  className="w-full p-2 border rounded bg-white text-slate-900"
                  value={newTransaction.category || ''}
                  onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                />
                <datalist id="categories">
                  <option value="Peças / Estoque" />
                  <option value="Venda Balcão" />
                  <option value="Ordens de Serviço" />
                  <option value="Serviços" />
                  <option value="Infraestrutura" />
                  <option value="Impostos" />
                  <option value="Pessoal" />
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded bg-white text-slate-900"
                  value={newTransaction.amount || ''}
                  onChange={e => setNewTransaction({ ...newTransaction, amount: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded bg-white text-slate-900"
                  value={newTransaction.date}
                  onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nº Documento / NF</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded bg-white text-slate-900"
                  value={newTransaction.documentNumber || ''}
                  onChange={e => setNewTransaction({ ...newTransaction, documentNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
              >
                Salvar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};