import React, { useState, useEffect } from 'react';
import { User, UserRole, Client } from '../types';
import { ApiService } from '../services/api';
import { Plus, Search, Trash, Edit2, Shield, UserCircle, Briefcase } from 'lucide-react';

// Extend User type to include password for form state
interface UserFormState extends Partial<User> {
  password?: string;
}

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormState>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, clientsData] = await Promise.all([
        ApiService.getUsers(),
        ApiService.getClients()
      ]);
      setUsers(usersData);
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    }
  };

  const handleSave = async () => {
    if (!editingUser.name || !editingUser.email || (!editingUser.id && !editingUser.password) || !editingUser.role) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: editingUser.name,
        email: editingUser.email,
        password: editingUser.password,
        role: editingUser.role,
        clientId: editingUser.clientId ? Number(editingUser.clientId) : undefined
      };

      if (editingUser.id) {
        // Atualizar
        await ApiService.updateUser(editingUser.id, userData);
      } else {
        // Criar novo
        await ApiService.createUser(userData);
      }

      await loadData();
      setIsModalOpen(false);
      setEditingUser({});
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await ApiService.deleteUser(id);
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário');
    }
  };

  const openNew = () => {
    setEditingUser({ role: UserRole.TECHNICIAN });
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-red-200 dark:border-red-800"><Shield className="w-3 h-3" /> Admin</span>;
      case UserRole.TECHNICIAN: return <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800"><Briefcase className="w-3 h-3" /> Técnico</span>;
      default: return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-blue-200 dark:border-blue-800"><UserCircle className="w-3 h-3" /> Cliente</span>;
    }
  };

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-900 min-h-full transition-colors">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tight">
            <UsersViewIcon className="w-8 h-8 text-primary" />
            GESTÃO DE ACESSOS
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Controle de administradores, técnicos e clientes.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary hover:opacity-90 transition-all text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/25 font-bold text-sm uppercase tracking-wider"
        >
          <Plus className="w-5 h-5" /> Novo Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-hidden transition-all">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5">Acesso / Login</th>
                <th className="px-8 py-5">Perfil</th>
                <th className="px-8 py-5">Vínculo ERP</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 shadow-sm border border-white dark:border-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-mono text-xs">{user.email}</td>
                  <td className="px-8 py-5">{getRoleBadge(user.role)}</td>
                  <td className="px-8 py-5">
                    {user.role === UserRole.CLIENT && user.clientId ? (
                      <span className="text-slate-600 dark:text-slate-300 font-medium text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded">
                        {clients.find(c => c.id === user.clientId)?.name || 'Cliente Removido'}
                      </span>
                    ) : <span className="text-slate-300 dark:text-slate-600 font-light italic">Sem vínculo</span>}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" title="Editar">
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Excluir">
                        <Trash className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-800">
            <UserCircle className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-slate-500 font-medium italic">Nenhum administrador ou usuário encontrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in transition-all">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl border border-slate-100 dark:border-slate-700 transition-all">
            <h3 className="text-2xl font-black mb-8 text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              {editingUser.id ? 'EDITAR ACESSO' : 'NOVO USUÁRIO'}
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    value={editingUser.name || ''}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Email (Login) *</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    value={editingUser.email || ''}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Senha *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    value={editingUser.password || ''}
                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder={editingUser.id ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Tipo de Acesso *</label>
                    <select
                      className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    >
                      <option value={UserRole.ADMIN}>Administrador</option>
                      <option value={UserRole.TECHNICIAN}>Técnico</option>
                      <option value={UserRole.CLIENT}>Cliente (Portal)</option>
                    </select>
                  </div>
                  {editingUser.role === UserRole.CLIENT && (
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Vincular Cliente</label>
                      <select
                        className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                        value={editingUser.clientId || ''}
                        onChange={e => setEditingUser({ ...editingUser, clientId: Number(e.target.value) })}
                      >
                        <option value="">Selecione...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end gap-4 pt-8 border-t dark:border-slate-700">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="px-6 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-10 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Confirmar & Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersViewIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor shadow-sm">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);