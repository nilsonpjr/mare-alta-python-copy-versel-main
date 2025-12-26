import React, { useState } from 'react';
import { Bot, AlertTriangle, Sparkles, Terminal } from 'lucide-react';
import { analyzeEngineIssue } from '../services/geminiService';
import { useLanguage } from '../LanguageContext';

const AIDiagnostics: React.FC = () => {
    const { t, language } = useLanguage();
    const [engineModel, setEngineModel] = useState('Mercury Verado 300');
    const [errorCode, setErrorCode] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);
        
        // Call the Gemini Service with current language
        const result = await analyzeEngineIssue(engineModel, errorCode, symptoms, language);
        
        setResponse(result);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
            <header>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            {t.ai.title}
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">BETA</span>
                        </h2>
                        <p className="text-slate-400 text-sm">{t.ai.subtitle}</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* Input Panel */}
                <div className="w-1/3 glass-panel p-6 rounded-xl flex flex-col gap-4 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">{t.ai.labels.model}</label>
                        <select 
                            value={engineModel}
                            onChange={(e) => setEngineModel(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        >
                            <option>Mercury Verado 300</option>
                            <option>Mercury ProXS 250</option>
                            <option>Yamaha F300</option>
                            <option>Yamaha F150</option>
                            <option>Volvo Penta D6</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">{t.ai.labels.code}</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 32, P0300"
                            value={errorCode}
                            onChange={(e) => setErrorCode(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-600"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">{t.ai.labels.symptoms}</label>
                        <textarea 
                            placeholder={t.ai.placeholders.symptoms}
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            className="w-full h-full min-h-[150px] bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-slate-600 resize-none"
                        />
                    </div>

                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || !symptoms}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold shadow-lg shadow-purple-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t.ai.button.analyzing}
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                {t.ai.button.run}
                            </>
                        )}
                    </button>
                </div>

                {/* Output Panel */}
                <div className="flex-1 glass-panel rounded-xl flex flex-col relative overflow-hidden">
                    {!response && !loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-30">
                            <Bot className="w-24 h-24 mb-4" />
                            <p className="text-lg">{t.ai.status.waiting}</p>
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-purple-300 animate-pulse">{t.ai.status.consulting}</p>
                        </div>
                    )}

                    {response && (
                        <div className="p-8 overflow-y-auto h-full text-slate-200 leading-relaxed space-y-4">
                            <div className="flex items-center gap-2 text-purple-300 mb-4 pb-4 border-b border-white/5">
                                <Terminal className="w-5 h-5" />
                                <span className="font-mono text-sm uppercase">{t.ai.result}</span>
                            </div>
                            <div className="markdown-prose whitespace-pre-wrap">
                                {response}
                            </div>
                            
                            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                                <p className="text-sm text-yellow-200/80">
                                    {t.ai.disclaimer}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIDiagnostics;