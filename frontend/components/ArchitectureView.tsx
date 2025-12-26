import React from 'react';
import { Database, FolderTree, Server, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ArchitectureView: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-12">
            <header>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{t('architecture.title')}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('architecture.subtitle')}</p>
            </header>

            {/* Folder Structure */}
            <section className="bg-white dark:glass-panel border border-slate-200 dark:border-white/5 p-6 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-blue-500 dark:text-blue-400 mb-2">
                    <FolderTree className="w-6 h-6" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('architecture.sections.structure')} (FastAPI + React)</h3>
                </div>
                <div className="font-mono text-sm bg-slate-100 dark:bg-black/40 p-6 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 overflow-x-auto">
                    <pre>{`mare-alta/
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── workshop.py
│   │   │   │   │   ├── inventory.py
│   │   │   │   │   └── auth.py
│   │   ├── core/           # Config, Security, Events
│   │   ├── db/             # Database connection & Base class
│   │   ├── models/         # SQLAlchemy Models (The Schema)
│   │   │   ├── tenant.py
│   │   │   ├── workshop.py # ServiceOrder, Kit
│   │   │   └── assets.py   # Boat, Part
│   │   ├── schemas/        # Pydantic Schemas (Validation)
│   │   └── services/       # Business Logic & AI Integration
│   ├── tests/
│   ├── alembic/            # Migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/       # API Clients
│   │   ├── types/
│   │   └── App.tsx
│   ├── Dockerfile
│   └── vite.config.ts
└── docker-compose.yml      # Orchestration`}</pre>
                </div>
            </section>

            {/* DB Schema */}
            <section className="bg-white dark:glass-panel border border-slate-200 dark:border-white/5 p-6 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-emerald-500 dark:text-emerald-400 mb-2">
                    <Database className="w-6 h-6" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('architecture.sections.schema')} (PostgreSQL)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                        <h4 className="font-bold text-purple-600 dark:text-purple-300 mb-2">Core & Multi-tenancy</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                            <li><span className="font-mono text-slate-800 dark:text-white">Tenant</span>: id (PK), name, schema_name</li>
                            <li><span className="font-mono text-slate-800 dark:text-white">User</span>: id, tenant_id (FK), role, email</li>
                            <li><span className="font-mono text-slate-800 dark:text-white">Client</span>: id, tenant_id (FK), name, contact_info</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/5">
                        <h4 className="font-bold text-blue-600 dark:text-blue-300 mb-2">Assets & Inventory</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                            <li><span className="font-mono text-slate-800 dark:text-white">Boat</span>: id, client_id (FK), engine_brand, engine_serial</li>
                            <li><span className="font-mono text-slate-800 dark:text-white">Part</span>: id, sku, cost, margin, stock_qty</li>
                            <li><span className="font-mono text-slate-800 dark:text-white">ServiceKit</span>: id, name, engine_model</li>
                        </ul>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-200 dark:border-white/5 col-span-1 md:col-span-2">
                        <h4 className="font-bold text-yellow-600 dark:text-yellow-300 mb-2">Workshop Module (Phase 1)</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                            <li><span className="font-mono text-slate-800 dark:text-white">ServiceOrder (OS)</span>: id, tenant_id, boat_id, status (Enum), technician_id</li>
                            <li><span className="font-mono text-slate-800 dark:text-white">OrderItem</span>: id, os_id, part_id, quantity, applied_price</li>
                            <li><span className="font-mono text-slate-800 dark:text-white">ServiceLog</span>: id, os_id, mechanic_id, timestamp, notes, photo_url</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Plan */}
            <section className="bg-white dark:glass-panel border border-slate-200 dark:border-white/5 p-6 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-pink-500 dark:text-pink-400 mb-2">
                    <Layers className="w-6 h-6" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('architecture.sections.plan')} (Phase 1)</h3>
                </div>
                <div className="space-y-4">
                    {[
                        { step: 1, title: 'Foundation', desc: 'Setup Docker, FastAPI, PostgreSQL with RLS (Row Level Security) for isolation.' },
                        { step: 2, title: 'Inventory Core', desc: 'Import Mercury/Yamaha Part Numbers database seed.' },
                        { step: 3, title: 'Workshop API', desc: 'CRUD endpoints for Service Orders and Estimator logic.' },
                        { step: 4, title: 'Frontend Shell', desc: 'React setup, Authentication flow, and Dashboard UI.' },
                        { step: 5, title: 'Smart Estimator', desc: 'Logic to aggregate Parts into Kits and calculate totals.' },
                        { step: 6, title: 'AI Integration', desc: 'Connect Google Gemini API for diagnostic chat.' },
                    ].map((item) => (
                        <div key={item.step} className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-white shrink-0">
                                {item.step}
                            </div>
                            <div>
                                <h5 className="text-slate-800 dark:text-white font-medium">{item.title}</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
