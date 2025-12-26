
import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { Anchor, Lock, Mail, ArrowRight, Building, User, CheckCircle } from 'lucide-react';

interface SignupViewProps {
    onSignupSuccess: () => void;
    onGoToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onSignupSuccess, onGoToLogin }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        plan: 'START',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.adminPassword !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await ApiService.signup({
                companyName: formData.companyName,
                plan: formData.plan,
                adminName: formData.adminName,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword
            });

            // O backend agora retorna o token direto (Login Automático)
            if (response && response.access_token) {
                localStorage.setItem('token', response.access_token);
                // Força reload ou notifica App.tsx para atualizar estado
                window.location.reload();
            } else {
                alert("Conta criada! Faça login.");
                onSignupSuccess();
            }
        } catch (err: any) {
            console.error("Signup Error:", err);
            let errorMsg = 'Erro desconhecido.';

            if (err.response) {
                // O servidor respondeu com um status de erro
                errorMsg = err.response.data?.detail || err.response.statusText || JSON.stringify(err.response.data);
            } else if (err.request) {
                // A requisição foi feita mas não houve resposta
                errorMsg = 'Erro de conexão: Servidor não respondeu. Verifique sua internet.';
            } else {
                // Erro na configuração da requisição
                errorMsg = err.message;
            }

            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1566374828859-96892552e6c5?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/50"></div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col">
                {/* Header */}
                <div className="bg-slate-900/50 p-6 border-b border-white/10 text-center">
                    <h1 className="text-2xl font-bold text-white tracking-wide">Teste Gratuito</h1>
                    <p className="text-cyan-200 text-sm font-medium mt-1">Crie sua conta e comece agora</p>
                </div>

                {/* Form */}
                <div className="p-8 bg-white max-h-[80vh] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Dados da Empresa */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nome da Oficina / Marina</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                </div>
                                <input
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                                    placeholder="Ex: Marina do Sol"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Seu Nome</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                    </div>
                                    <input
                                        name="adminName"
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                                        placeholder="João Silva"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Plano</label>
                                <select
                                    name="plan"
                                    value={formData.plan}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                                >
                                    <option value="START">Start (R$ 149)</option>
                                    <option value="PRO">Pro (R$ 399)</option>
                                    <option value="MARINA">Marina (R$ 890)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email de Acesso</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                </div>
                                <input
                                    name="adminEmail"
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                                    placeholder="admin@empresa.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                    </div>
                                    <input
                                        name="adminPassword"
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        type="password"
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CheckCircle className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        type="password"
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mt-4 border border-transparent rounded-xl shadow-lg shadow-cyan-200 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 transition-all transform active:scale-[0.98]"
                        >
                            {isLoading ? 'Criando conta...' : 'Criar Conta Grátis'}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={onGoToLogin}
                            className="text-sm text-slate-500 hover:text-cyan-600 font-medium transition-colors"
                        >
                            Já tem uma conta? Faça Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
