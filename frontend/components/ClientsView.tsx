import React, { useState, useEffect } from 'react';
import { Client, ClientCreate, ClientUpdate } from '../types';
import { ApiService } from '../services/api';
import { Plus, Search, Building2, User, Landmark, Edit2, Phone, Mail, Trash2 } from 'lucide-react';

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getClients();
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingClient.name || !editingClient.document) return;
    setIsLoading(true);
    try {
      if (editingClient.id) {
        // Update existing
        const updateData: ClientUpdate = {
          name: editingClient.name,
          document: editingClient.document,
          phone: editingClient.phone,
          email: editingClient.email,
          address: editingClient.address,
          type: editingClient.type
        };
        await ApiService.updateClient(editingClient.id, updateData);
      } else {
        // Create new
        const createData: ClientCreate = {
          name: editingClient.name!,
          document: editingClient.document!,
          phone: editingClient.phone,
          email: editingClient.email,
          address: editingClient.address,
          type: editingClient.type || 'PARTICULAR'
        };
        await ApiService.createClient(createData);
      }
      await loadClients();
      setIsModalOpen(false);
      setEditingClient({});
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro ao salvar cliente. Verifique os dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este cliente?")) return;
    setIsLoading(true);
    try {
      await ApiService.deleteClient(id);
      await loadClients();
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Erro ao excluir cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingClient({ type: 'PARTICULAR' });
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.document.includes(searchTerm)
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GOVERNO': return <Landmark className="w-4 h-4 text-blue-600" />;
      case 'EMPRESA': return <Building2 className="w-4 h-4 text-purple-600" />;
      default: return <User className="w-4 h-4 text-green-600" />;
    }
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Clientes
        </h2>
        <button
          onClick={openNew}
          className="bg-primary hover:opacity-90 transition-all text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 font-bold text-sm"
        >
          <Plus className="w-5 h-5" /> Novo Cliente
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou CPF/CNPJ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading && <div className="p-8 text-center text-slate-500 animate-pulse">Carregando...</div>}

        {!isLoading && filteredClients.length === 0 && (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 italic">
            Nenhum cliente encontrado.
          </div>
        )}

        {!isLoading && filteredClients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{client.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">{client.document}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex flex-col text-xs gap-1.5">
                        <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}</div>
                        <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 border px-3 py-1 rounded-full w-fit bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {getTypeIcon(client.type || 'PARTICULAR')}
                        {client.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(client)} className="text-slate-400 hover:text-primary transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(client.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {editingClient.id ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingClient.name || ''}
                  onChange={e => setEditingClient({ ...editingClient, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Tipo</label>
                <select
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingClient.type || 'PARTICULAR'}
                  onChange={e => setEditingClient({ ...editingClient, type: e.target.value as any })}
                >
                  <option value="PARTICULAR">Particular (PF)</option>
                  <option value="EMPRESA">Empresa (PJ)</option>
                  <option value="GOVERNO">Governo/Militar</option>
                </select>
              </div>
              <div className="col-span-2 grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">CEP</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="00000-000"
                      className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={editingClient.zip || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setEditingClient({ ...editingClient, zip: val });
                        if (val.length === 8) {
                          fetch(`https://viacep.com.br/ws/${val}/json/`)
                            .then(res => res.json())
                            .then(data => {
                              if (!data.erro) {
                                setEditingClient(prev => ({
                                  ...prev,
                                  address: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`
                                }));
                              }
                            })
                            .catch(err => console.error("Erro CEP", err));
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Endereço Completo</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editingClient.address || ''}
                    onChange={e => setEditingClient({ ...editingClient, address: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">CPF/CNPJ</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={editingClient.document || ''}
                    onChange={e => setEditingClient({ ...editingClient, document: e.target.value })}
                    onBlur={() => {
                      const doc = editingClient.document?.replace(/\D/g, '');
                      if (doc?.length === 14) {
                        fetch(`https://brasilapi.com.br/api/cnpj/v1/${doc}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data.razao_social) {
                              setEditingClient(prev => ({
                                ...prev,
                                name: data.nome_fantasia || data.razao_social,
                                type: 'EMPRESA',
                                email: data.email || prev.email,
                                phone: data.ddd_telefone_1 || prev.phone,
                                zip: data.cep,
                                address: `${data.logradouro}, ${data.numero} - ${data.bairro} - ${data.municipio}/${data.uf}`
                              }));
                            }
                          })
                          .catch(err => console.error("Erro CNPJ", err));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="bg-slate-100 dark:bg-slate-700 p-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                    onClick={() => {/* Trigger manual lookup logic if needed */ }}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Telefone</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingClient.phone || ''}
                  onChange={e => setEditingClient({ ...editingClient, phone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={editingClient.email || ''}
                  onChange={e => setEditingClient({ ...editingClient, email: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t dark:border-slate-700">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold text-sm uppercase px-4"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 font-bold text-sm shadow-lg shadow-primary/20"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};