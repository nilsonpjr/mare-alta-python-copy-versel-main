import React, { useState, useEffect } from 'react';
import { Marina } from '../types';
import { ApiService } from '../services/api';
import { Plus, Search, MapPin, Phone, Edit2, Anchor, Clock, AlertCircle, Trash2 } from 'lucide-react';

export const MarinasView: React.FC = () => {
  const [marinas, setMarinas] = useState<Marina[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMarina, setEditingMarina] = useState<Partial<Marina>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMarinas();
  }, []);

  const loadMarinas = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getMarinas();
      setMarinas(data);
    } catch (error) {
      console.error("Erro ao carregar marinas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingMarina.name) return;

    setLoading(true);
    try {
      const marinaData: any = {
        name: editingMarina.name,
        address: editingMarina.address || '',
        contactName: editingMarina.contactName,
        phone: editingMarina.phone,
        operatingHours: editingMarina.operatingHours
      };

      if (editingMarina.id) {
        await ApiService.updateMarina(editingMarina.id, marinaData);
      } else {
        await ApiService.createMarina(marinaData);
      }

      await loadMarinas();
      setIsModalOpen(false);
      setEditingMarina({});
    } catch (error) {
      console.error("Erro ao salvar marina:", error);
      alert("Erro ao salvar marina. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (marina: Marina) => {
    setEditingMarina(marina);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingMarina({});
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta marina?')) {
      setLoading(true);
      try {
        await ApiService.deleteMarina(id);
        await loadMarinas();
      } catch (error) {
        console.error("Erro ao excluir marina:", error);
        alert("Erro ao excluir marina.");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredMarinas = marinas.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Anchor className="w-6 h-6 text-primary" />
            Marinas & Locais Externos
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Paranaguá, Pontal do Sul, Matinhos e Guaratuba</p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary hover:opacity-90 transition-all text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 font-bold text-sm"
        >
          <Plus className="w-5 h-5" /> Nova Marina
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar marina..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-10">
              <span className="text-slate-400 animate-pulse font-medium">Carregando Marinas...</span>
            </div>
          ) : filteredMarinas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 dark:text-slate-500 italic">
              Nenhuma marina cadastrada.
            </div>
          ) : (
            filteredMarinas.map(marina => (
              <div key={marina.id} className="group border border-slate-100 dark:border-slate-700 rounded-2xl p-5 hover:shadow-xl hover:shadow-primary/5 transition-all bg-slate-50/50 dark:bg-slate-900/40 relative">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors pr-12">{marina.name}</h3>
                  <div className="flex gap-2 absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(marina)} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 hover:text-primary transition-colors border border-slate-100 dark:border-slate-700" title="Editar">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(marina.id!)} className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 hover:text-red-500 transition-colors border border-slate-100 dark:border-slate-700" title="Apagar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1.5">{marina.address || 'Endereço não informado'}</span>
                  </div>

                  {marina.operatingHours && (
                    <div className="flex items-center gap-3 bg-amber-500/10 dark:bg-amber-500/5 p-3 rounded-xl text-amber-700 dark:text-amber-500 border border-amber-500/20">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-tight">{marina.operatingHours}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                    {marina.contactName && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold uppercase text-[10px] text-slate-400 dark:text-slate-500 w-16">Contato:</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{marina.contactName}</span>
                      </div>
                    )}
                    {marina.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold uppercase text-[10px] text-slate-400 dark:text-slate-500 w-16">Fone:</span>
                        <span className="font-mono text-primary font-bold">{marina.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
              <Anchor className="w-5 h-5 text-primary" />
              {editingMarina.id ? 'Editar Local' : 'Novo Local'}
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Nome do Local / Marina</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingMarina.name || ''}
                  onChange={e => setEditingMarina({ ...editingMarina, name: e.target.value })}
                  placeholder="Ex: Marina Porto Marina"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Endereço Completo</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingMarina.address || ''}
                  onChange={e => setEditingMarina({ ...editingMarina, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Contato / Gerente</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editingMarina.contactName || ''}
                    onChange={e => setEditingMarina({ ...editingMarina, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Telefone / Rádio</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editingMarina.phone || ''}
                    onChange={e => setEditingMarina({ ...editingMarina, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" /> Funcionamento / Observações
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fecha às Segundas / Aberto todos os dias 8-18h"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingMarina.operatingHours || ''}
                  onChange={e => setEditingMarina({ ...editingMarina, operatingHours: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-slate-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm uppercase"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-primary/20"
              >
                Salvar Local
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};