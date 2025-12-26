import { Language } from './types';

export const translations = {
    'pt-BR': {
        sidebar: {
            dashboard: 'Dashboard / CRM',
            marinaMap: 'Logística Marina',
            workshop: 'Oficina',
            mechanicApp: 'App Mecânico',
            analystMode: 'Checklist Analista',
            estimator: 'Smart Orçador',
            aiDiagnostics: 'Mare Alta AI',
            architecture: 'Arquitetura & Docs',
            premiumErp: 'ERP PREMIUM',
            seniorMechanic: 'Mecânico Sênior',
            logout: 'Sair'
        },
        workshop: {
            title: 'Oficina / Workshop',
            subtitle: 'Gerencie Ordens de Serviço ativas e atribuições.',
            newOrder: 'Nova Ordem',
            stats: {
                execution: 'Em Execução',
                approval: 'Aprovação Pendente',
                completed: 'Concluído (Mai)',
                efficiency: 'Eficiência'
            },
            table: {
                title: 'Ordens de Serviço Ativas',
                all: 'Todas',
                myOrders: 'Minhas',
                headers: {
                    os: 'Nº O.S.',
                    boat: 'Barco / Motor',
                    desc: 'Descrição',
                    status: 'Status',
                    created: 'Criado',
                    actions: 'Ações'
                }
            }
        },
        estimator: {
            title: 'Smart Orçador',
            subtitle: 'Gere orçamentos completos com peças e mão de obra em segundos.',
            step1: 'Selecione o Barco',
            selectPlaceholder: 'Selecione o barco do cliente...',
            step2: 'Selecione Kit de Manutenção',
            noKits: 'Nenhum kit encontrado para este modelo.',
            summary: {
                title: 'Resumo do Orçamento',
                labor: 'Mão de Obra',
                parts: 'Peças',
                total: 'Total',
                hours: 'horas',
                items: 'itens'
            },
            buttons: {
                draft: 'Salvar Rascunho',
                create: 'Criar Ordem de Serviço'
            }
        },
        ai: {
            title: 'Mare Alta AI',
            subtitle: 'Assistente de diagnóstico treinado em manuais Mercury & Yamaha.',
            labels: {
                model: 'Modelo do Motor',
                code: 'Código de Erro (Opcional)',
                symptoms: 'Sintomas'
            },
            placeholders: {
                symptoms: 'Descreva o que está acontecendo (ex: perda de potência acima de 4000 RPM...)'
            },
            button: {
                analyzing: 'Analisando...',
                run: 'Executar Diagnóstico'
            },
            status: {
                waiting: 'Aguardando entrada...',
                consulting: 'Consultando manuais técnicos...'
            },
            result: 'Resultado do Diagnóstico',
            disclaimer: 'As sugestões da IA são apenas para orientação. Verifique sempre os manuais oficiais.'
        },
        marina: {
            title: 'Mapa Logístico da Marina',
            subtitle: 'Gerencie Vagas Secas, Vagas Molhadas e operações de Descida/Subida.',
            filters: {
                all: 'Todos',
                dry: 'Vaga Seca',
                wet: 'Vaga Molhada'
            },
            headers: {
                wet: 'Vagas Molhadas (Pier A)',
                dry: 'Vagas Secas (Hangar D)'
            },
            actions: {
                selected: 'Vaga Selecionada',
                launch: 'Agendar Descida',
                maintenance: 'Mover p/ Manutenção'
            }
        },
        mechanic: {
            title: 'Modo Técnico',
            welcome: 'Bem-vindo de volta',
            online: 'ONLINE',
            tasks: 'Minhas Tarefas Hoje',
            back: 'Voltar para Lista',
            buttons: {
                stop: 'PARAR',
                start: 'INICIAR',
                checklist: 'Checklist',
                photo: 'Adic. Foto',
                parts: 'Peças',
                history: 'Histórico'
            },
            partsRequired: 'Peças Necessárias'
        },
        analyst: {
            title: 'Modo Analista',
            subtitle: 'Inspeção mensal de manutenção e geração de relatórios.',
            generate: 'Gerar Relatório',
            target: 'Alvo da Inspeção',
            items: 'Itens de Inspeção',
            recs: 'Recomendações Técnicas',
            placeholder: 'Ex: Necessário agendar pintura de fundo para o próximo mês...',
            status: {
                ok: 'OK',
                attention: 'ATENÇÃO',
                critical: 'CRÍTICO'
            }
        },
        architecture: {
            title: 'Arquitetura do Sistema',
            subtitle: 'Especificações técnicas, Esquema de Banco de Dados e Plano de Implementação.',
            sections: {
                structure: 'Estrutura do Projeto',
                schema: 'Esquema SQLAlchemy',
                plan: 'Plano de Implementação'
            }
        },
        dashboard: {
            title: 'Dashboard & CRM',
            subtitle: 'Visão geral das operações da marina e alertas de clientes.',
            alerts: 'Gatilhos Pós-Venda Ativos',
            whatsapp: 'Enviar WhatsApp',
            approaching: 'Aproximando Revisão 100h',
            lastService: 'Última Revisão',
            monthsAgo: 'meses atrás'
        }
    },
    'en-US': {
        sidebar: {
            dashboard: 'Dashboard / CRM',
            marinaMap: 'Marina Logistics',
            workshop: 'Workshop',
            mechanicApp: 'Mechanic App',
            analystMode: 'Analyst Checklist',
            estimator: 'Smart Estimator',
            aiDiagnostics: 'Mare Alta AI',
            architecture: 'Architecture & Docs',
            premiumErp: 'PREMIUM ERP',
            seniorMechanic: 'Senior Mechanic',
            logout: 'Logout'
        },
        workshop: {
            title: 'Workshop',
            subtitle: 'Manage active Service Orders and technician assignments.',
            newOrder: 'New Order',
            stats: {
                execution: 'In Execution',
                approval: 'Pending Approval',
                completed: 'Completed (May)',
                efficiency: 'Efficiency'
            },
            table: {
                title: 'Active Service Orders',
                all: 'All',
                myOrders: 'My Orders',
                headers: {
                    os: 'O.S. #',
                    boat: 'Boat / Engine',
                    desc: 'Description',
                    status: 'Status',
                    created: 'Created',
                    actions: 'Actions'
                }
            }
        },
        estimator: {
            title: 'Smart Estimator',
            subtitle: 'Generate complete quotes with parts and labor in seconds.',
            step1: 'Select Boat',
            selectPlaceholder: 'Select a client\'s boat...',
            step2: 'Select Maintenance Kit',
            noKits: 'No kits found for this engine model.',
            summary: {
                title: 'Estimation Summary',
                labor: 'Labor',
                parts: 'Parts',
                total: 'Total',
                hours: 'hours',
                items: 'items'
            },
            buttons: {
                draft: 'Save Draft',
                create: 'Create Service Order'
            }
        },
        ai: {
            title: 'Mare Alta AI',
            subtitle: 'Diagnostic assistant trained on Mercury & Yamaha service manuals.',
            labels: {
                model: 'Engine Model',
                code: 'Error Code (Optional)',
                symptoms: 'Symptoms'
            },
            placeholders: {
                symptoms: 'Describe what\'s happening (e.g., loss of power above 4000 RPM...)'
            },
            button: {
                analyzing: 'Analyzing...',
                run: 'Run Diagnostic'
            },
            status: {
                waiting: 'Waiting for input...',
                consulting: 'Consulting technical manuals...'
            },
            result: 'Diagnostic Result',
            disclaimer: 'AI suggestions are for guidance only. Always verify with official service manuals.'
        },
        marina: {
            title: 'Marina Logistics Map',
            subtitle: 'Manage Dry Stack, Wet Slips, and Launch/Retrieve operations.',
            filters: {
                all: 'All',
                dry: 'Dry Stack',
                wet: 'Wet Slips'
            },
            headers: {
                wet: 'Wet Slips (Pier A)',
                dry: 'Dry Stack (Hangar D)'
            },
            actions: {
                selected: 'Selected Slip',
                launch: 'Schedule Launch',
                maintenance: 'Move to Maintenance'
            }
        },
        mechanic: {
            title: 'Technician Mode',
            welcome: 'Welcome back',
            online: 'ONLINE',
            tasks: 'My Tasks Today',
            back: 'Back to List',
            buttons: {
                stop: 'STOP',
                start: 'START',
                checklist: 'Checklist',
                photo: 'Add Photo',
                parts: 'Parts Request',
                history: 'History'
            },
            partsRequired: 'Parts Required'
        },
        analyst: {
            title: 'Analyst Mode',
            subtitle: 'Monthly maintenance inspection and report generation.',
            generate: 'Generate Report',
            target: 'Inspection Target',
            items: 'Inspection Items',
            recs: 'Technical Recommendations',
            placeholder: 'E.g., Need to schedule bottom painting for next month...',
            status: {
                ok: 'OK',
                attention: 'ATTENTION',
                critical: 'CRITICAL'
            }
        },
        architecture: {
            title: 'System Architecture',
            subtitle: 'Technical specifications, Database Schema, and Implementation Plan.',
            sections: {
                structure: 'Project Structure',
                schema: 'SQLAlchemy Schema',
                plan: 'Implementation Plan'
            }
        },
        dashboard: {
            title: 'Dashboard & CRM',
            subtitle: 'Overview of marina operations and customer alerts.',
            alerts: 'Active Post-Sales Triggers',
            whatsapp: 'Send WhatsApp',
            approaching: 'Approaching 100h Service',
            lastService: 'Last Service',
            monthsAgo: 'months ago'
        }
    }
};