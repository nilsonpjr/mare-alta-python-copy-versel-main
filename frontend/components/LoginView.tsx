import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { Anchor, Lock, Mail, ArrowRight, UserCircle } from 'lucide-react';


interface LoginViewProps {
  onLogin: (user: User) => void;
  onGoToSignup?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGoToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use ApiService instead of StorageService mock
      const data = await import('../services/api').then(m => m.ApiService.login(email, password));
      if (data) {
        // Fetch full user details to ensure we have role/tenant info if not in login response
        // But login response usually has user/token. Assuming data is what onLogin expects (User object or similar)
        // Adjusting based on ApiService.login returning { accessToken, user? } or similar
        // Let's assume ApiService.login returns the auth payload.
        // We might need to fetch user profile or if login returns it.
        // Checking ApiService.login implementation: returns response.data.

        // If ApiService.login only returns token, we need to fetch user.
        // Let's do a quick fetch of 'me' to be sure, or pass the user if returned.
        const user = await import('../services/api').then(m => m.ApiService.getMe());
        onLogin(user);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = err.response?.data?.detail || "Falha ao entrar. Verifique suas credenciais.";

      // Tenant-specific error handling
      if (typeof msg === 'string' && (msg.toLowerCase().includes('tenant') || msg.toLowerCase().includes('locatário'))) {
        msg = "Erro de Configuração de Conta: Sua conta não está vinculada a um ambiente (Tenant) válido. Contate o suporte.";
      }

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor - Nautical Abstract */}
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1566374828859-96892552e6c5?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/50"></div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/50 p-8 border-b border-white/10 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-cyan-600 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-900/50 rotate-3 transform hover:rotate-6 transition-transform">
            <Anchor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">VIVERDI NÁUTICA</h1>
          <p className="text-cyan-200 text-sm font-medium mt-1">Gestão Náutica Especializada</p>
        </div>

        {/* Form */}
        <div className="p-8 bg-white">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Corporativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                  placeholder="seu.nome@viverdinautica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha de Acesso</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-200 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all transform active:scale-[0.98]"
            >
              {isLoading ? 'Entrando...' : 'Acessar Sistema'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>

            {onGoToSignup && (
              <div className="mt-4 text-center">
                <span className="text-slate-500 text-sm">Ainda não tem conta? </span>
                <button
                  type="button"
                  onClick={onGoToSignup}
                  className="text-cyan-600 font-bold text-sm hover:underline"
                >
                  Teste Grátis
                </button>
              </div>
            )}
          </form>

          {/* Quick Login - Test Users */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              🧪 Login Rápido - Testes
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin.teste@viverdinautica.com');
                  setPassword('admin123');
                }}
                className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-medium text-red-700 flex items-center justify-between transition-colors"
              >
                <span>👑 Admin</span>
                <span className="text-xs opacity-70">admin.teste@viverdinautica.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('tecnico1.teste@viverdinautica.com');
                  setPassword('tecnico123');
                }}
                className="w-full px-3 py-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-xs font-medium text-green-700 flex items-center justify-between transition-colors"
              >
                <span>🔧 Técnico</span>
                <span className="text-xs opacity-70">tecnico1.teste@viverdinautica.com</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('cliente1.teste@viverdinautica.com');
                  setPassword('cliente123');
                }}
                className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 flex items-center justify-between transition-colors"
              >
                <span>👤 Cliente</span>
                <span className="text-xs opacity-70">cliente1.teste@viverdinautica.com</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">
              Click para preencher • Depois click em "Acessar Sistema"
            </p>
          </div>

        </div>
      </div>

      <div className="absolute bottom-4 text-slate-500 text-xs opacity-60">
        © {new Date().getFullYear()} Viverdi Náutica - v2.5.0
      </div>
    </div>
  );
};