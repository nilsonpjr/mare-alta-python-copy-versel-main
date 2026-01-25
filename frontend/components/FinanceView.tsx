import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionCreate } from '../types';
import { ApiService } from '../services/api';
import {
  DollarSign, TrendingUp, TrendingDown, Plus,
  Search, FileText, Calendar, ArrowUpRight, ArrowDownRight, Loader2,
  Upload
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../context/ThemeContext';

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
      setDisplayAmount('');
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

  const formatCurrencyInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const amount = Number(digits) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      style: 'currency',
      currency: 'BRL'
    });
  };

  const [displayAmount, setDisplayAmount] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '');
    const amount = Number(digits) / 100;
    setNewTransaction({ ...newTransaction, amount });
    setDisplayAmount(formatCurrencyInput(digits));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const imported = await ApiService.importTransactions(file);
      alert(`${imported.length} transações importadas com sucesso!`);
      loadTransactions();
    } catch (error: any) {
      console.error("Erro na importação:", error);
      alert(error.response?.data?.detail || "Erro ao importar arquivo. Verifique o formato.");
    } finally {
      setLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const { preferences } = useTheme();

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse" />
        <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
      </div>
      <div className="h-8 w-40 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" />
    </div>
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-700" /></td>
      <td className="px-6 py-4"><div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-700" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-700" /></td>
      <td className="px-6 py-4 text-center"><div className="h-6 w-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-700" /></td>
      <td className="px-6 py-4 text-right"><div className="h-4 w-24 ml-auto rounded bg-slate-100 dark:bg-slate-700" /></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-16 mx-auto rounded bg-slate-100 dark:bg-slate-700" /></td>
    </tr>
  );

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-lg">Financeiro</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Controle de Entradas e Saídas</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            id="import-file"
            className="hidden"
            accept=".pdf,.csv,.ofx"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="import-file"
            className="cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
          >
            <Upload className="w-4 h-4" /> Importar Extrato
          </label>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Lançamento Manual
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {loading && transactions.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20">
                <TrendingUp className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Receitas Totais</span>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">R$ {kpi.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20">
                <TrendingDown className="w-16 h-16 text-red-600" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Despesas Totais</span>
              </div>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">R$ {kpi.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className={`p-6 rounded-xl shadow-sm border relative overflow-hidden ${kpi.balance >= 0 ? 'bg-primary text-white border-transparent' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-red-600'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <DollarSign className="w-16 h-16 text-white" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${kpi.balance >= 0 ? 'bg-white/20' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  <DollarSign className={`w-5 h-5 ${kpi.balance >= 0 ? 'text-white' : 'text-red-600'}`} />
                </div>
                <span className={`text-sm font-bold uppercase ${kpi.balance >= 0 ? 'text-white/80' : 'text-slate-500'}`}>Saldo Líquido</span>
              </div>
              <p className="text-3xl font-bold">R$ {kpi.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </>
        )}
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar lançamento, categoria ou NF..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading && <Loader2 className="w-6 h-6 animate-spin text-slate-400 self-center" />}
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 uppercase text-xs font-semibold">
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
            {loading && transactions.length === 0 ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {new Date(t.date).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                  {t.description}
                  {t.orderId && <span className="ml-2 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">AUTO</span>}
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div className="flex flex-col">
                    <span>{t.category}</span>
                    {t.documentNumber && <span className="text-xs text-slate-400">NF: {t.documentNumber}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {t.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {t.type === 'EXPENSE' ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-center">
                  {t.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <FileText className="w-3 h-3" /> Pago
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-medium">
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 animate-fade-in-up">
            <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" /> Novo Lançamento
            </h3>

            <div className="grid grid-cols-2 gap-6">
              {/* Type Toggle */}
              <div className="col-span-2 flex gap-4 mb-2">
                <button
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'EXPENSE' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${newTransaction.type === 'EXPENSE' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200'}`}
                >
                  <TrendingDown className="w-4 h-4" /> Despesa
                </button>
                <button
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'INCOME' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${newTransaction.type === 'INCOME' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-200'}`}
                >
                  <TrendingUp className="w-4 h-4" /> Receita
                </button>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  placeholder="Ex: Compra de peças, Conta de Luz"
                  value={newTransaction.description || ''}
                  onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                <input
                  type="text"
                  list="categories"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100"
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor (R$)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100 font-bold text-lg"
                  placeholder="R$ 0,00"
                  value={displayAmount}
                  onChange={handleAmountChange}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100"
                  value={newTransaction.date}
                  onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nº Documento / NF</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none text-slate-800 dark:text-slate-100"
                  value={newTransaction.documentNumber || ''}
                  onChange={e => setNewTransaction({ ...newTransaction, documentNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
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