import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traduções em Português (Brasil)
const pt = {
    translation: {
        // Menu Principal
        nav: {
            dashboard: 'Dashboard',
            agenda: 'Agenda',
            orders: 'Ordens de Serviço',
            crm: 'CRM',
            clients: 'Clientes',
            boats: 'Embarcações',
            marinas: 'Marinas',
            inventory: 'Estoque',
            finance: 'Financeiro',
            maintenance: 'Manutenção',
            users: 'Usuários',
            settings: 'Configurações',
            logout: 'Sair'
        },

        // Botões Comuns
        common: {
            save: 'Salvar',
            cancel: 'Cancelar',
            delete: 'Excluir',
            edit: 'Editar',
            add: 'Adicionar',
            search: 'Buscar',
            filter: 'Filtrar',
            export: 'Exportar',
            import: 'Importar',
            print: 'Imprimir',
            loading: 'Carregando...',
            confirm: 'Confirmar',
            back: 'Voltar',
            next: 'Próximo',
            finish: 'Finalizar',
            close: 'Fechar'
        },

        // Dashboard
        dashboard: {
            title: 'Visão Geral',
            revenue: 'Receita Aprovada',
            pending: 'Solicitações Pendentes',
            inService: 'Embarcações em Serviço',
            stockAlert: 'Alertas de Estoque',
            recentUpdates: 'Atualizações Recentes'
        },

        // Ordens de Serviço
        orders: {
            title: 'Ordens de Serviço',
            newOrder: 'Nova OS',
            orderNumber: 'OS #{{number}}',
            status: {
                pending: 'Pendente',
                quotation: 'Em Orçamento',
                approved: 'Aprovado',
                inProgress: 'Em Execução',
                completed: 'Concluído',
                canceled: 'Cancelado'
            },
            boat: 'Embarcação',
            client: 'Cliente',
            description: 'Descrição',
            technician: 'Técnico',
            startDate: 'Data Início',
            estimatedDuration: 'Duração Estimada (horas)',
            tabs: {
                details: 'Detalhes',
                items: 'Itens & Peças',
                checklist: 'Checklist',
                media: 'Fotos',
                report: 'Relatório',
                profit: 'Rentabilidade'
            },
            addPart: 'Adicionar Peça',
            addService: 'Adicionar Serviço',
            total: 'Total',
            complete: 'Concluir',
            reopen: 'Reabrir'
        },

        // Clientes
        clients: {
            title: 'Clientes',
            newClient: 'Novo Cliente',
            name: 'Nome',
            document: 'CPF/CNPJ',
            phone: 'Telefone',
            email: 'Email',
            address: 'Endereço',
            type: {
                label: 'Tipo',
                individual: 'Particular',
                company: 'Empresa',
                government: 'Governo'
            }
        },

        // Embarcações
        boats: {
            title: 'Embarcações',
            newBoat: 'Nova Embarcação',
            name: 'Nome',
            hullId: 'Inscrição/HIN',
            model: 'Modelo',
            owner: 'Proprietário',
            marina: 'Marina',
            engines: 'Motores',
            addEngine: 'Adicionar Motor',
            serialNumber: 'Número de Série',
            hours: 'Horas',
            year: 'Ano',
            usageType: {
                label: 'Tipo de Uso',
                leisure: 'Lazer',
                fishing: 'Pesca',
                commercial: 'Comercial',
                government: 'Governo'
            }
        },

        // Estoque
        inventory: {
            title: 'Controle de Estoque & Logística',
            newItem: 'Novo Item',
            tabs: {
                overview: 'Visão Geral',
                invoice: 'Entrada de Nota (NFe)',
                count: 'Inventário / Balanço',
                kardex: 'Histórico (Kardex)'
            },
            sku: 'SKU',
            barcode: 'Código de Barras',
            quantity: 'Quantidade',
            cost: 'Custo',
            price: 'Preço',
            minStock: 'Estoque Mínimo',
            location: 'Localização',
            status: {
                normal: 'Normal',
                low: 'Baixo'
            },
            uploadXml: 'Upload XML da NFe',
            processInvoice: 'Processar Nota Fiscal',
            finishCount: 'Finalizar Contagem'
        },

        // Financeiro
        finance: {
            title: 'Financeiro',
            revenue: 'Receitas',
            expense: 'Despesas',
            balance: 'Saldo',
            newRevenue: 'Nova Receita',
            newExpense: 'Nova Despesa',
            category: 'Categoria',
            amount: 'Valor',
            date: 'Data',
            status: {
                paid: 'Pago',
                pending: 'Pendente',
                canceled: 'Cancelado'
            }
        },

        // Manutenção
        maintenance: {
            title: 'Orçamentos de Manutenção',
            quickQuote: 'Orçamento Rápido',
            selectBrand: 'Selecione a Marca',
            selectModel: 'Selecione o Modelo',
            selectInterval: 'Selecione o Intervalo',
            generateQuote: 'Gerar Orçamento',
            generatePdf: 'Gerar PDF',
            createOrder: 'Criar OS',
            preview: 'Pré-visualização',
            parts: 'Peças',
            labor: 'Mão de Obra',
            saveAsTemplate: 'Salvar como Modelo',
            deleteTemplate: 'Apagar Modelo'
        },

        // Configurações
        settings: {
            title: 'Configurações',
            company: 'Dados da Empresa',
            manufacturers: 'Fabricantes',
            services: 'Catálogo de Serviços',
            boatManufacturers: 'Fabricantes de Barcos',
            engineManufacturers: 'Fabricantes de Motores',
            addManufacturer: 'Adicionar Fabricante',
            addModel: 'Adicionar Modelo',
            mercuryCredentials: 'Credenciais Mercury Marine'
        },

        // Mensagens
        messages: {
            deleteConfirm: 'Tem certeza que deseja excluir?',
            saveSuccess: 'Salvo com sucesso!',
            deleteSuccess: 'Excluído com sucesso!',
            error: 'Ocorreu um erro',
            noResults: 'Nenhum resultado encontrado',
            loading: 'Carregando dados...'
        },

        // ERP Module (New)
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
        }
    }
};

// Traduções em Inglês (US)
const en = {
    translation: {
        // Main Menu
        nav: {
            dashboard: 'Dashboard',
            agenda: 'Schedule',
            orders: 'Service Orders',
            crm: 'CRM',
            clients: 'Clients',
            boats: 'Boats',
            marinas: 'Marinas',
            inventory: 'Inventory',
            finance: 'Finance',
            maintenance: 'Maintenance',
            users: 'Users',
            settings: 'Settings',
            logout: 'Logout'
        },

        // Common Buttons
        common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            search: 'Search',
            filter: 'Filter',
            export: 'Export',
            import: 'Import',
            print: 'Print',
            loading: 'Loading...',
            confirm: 'Confirm',
            back: 'Back',
            next: 'Next',
            finish: 'Finish',
            close: 'Close'
        },

        // Dashboard
        dashboard: {
            title: 'Overview',
            revenue: 'Approved Revenue',
            pending: 'Pending Requests',
            inService: 'Boats in Service',
            stockAlert: 'Stock Alerts',
            recentUpdates: 'Recent Updates'
        },

        // Service Orders
        orders: {
            title: 'Service Orders',
            newOrder: 'New Order',
            orderNumber: 'Order #{{number}}',
            status: {
                pending: 'Pending',
                quotation: 'Quotation',
                approved: 'Approved',
                inProgress: 'In Progress',
                completed: 'Completed',
                canceled: 'Canceled'
            },
            boat: 'Boat',
            client: 'Client',
            description: 'Description',
            technician: 'Technician',
            startDate: 'Start Date',
            estimatedDuration: 'Estimated Duration (hours)',
            tabs: {
                details: 'Details',
                items: 'Items & Parts',
                checklist: 'Checklist',
                media: 'Photos',
                report: 'Report',
                profit: 'Profitability'
            },
            addPart: 'Add Part',
            addService: 'Add Service',
            total: 'Total',
            complete: 'Complete',
            reopen: 'Reopen'
        },

        // Clients
        clients: {
            title: 'Clients',
            newClient: 'New Client',
            name: 'Name',
            document: 'Tax ID',
            phone: 'Phone',
            email: 'Email',
            address: 'Address',
            type: {
                label: 'Type',
                individual: 'Individual',
                company: 'Company',
                government: 'Government'
            }
        },

        // Boats
        boats: {
            title: 'Boats',
            newBoat: 'New Boat',
            name: 'Name',
            hullId: 'HIN/Registration',
            model: 'Model',
            owner: 'Owner',
            marina: 'Marina',
            engines: 'Engines',
            addEngine: 'Add Engine',
            serialNumber: 'Serial Number',
            hours: 'Hours',
            year: 'Year',
            usageType: {
                label: 'Usage Type',
                leisure: 'Leisure',
                fishing: 'Fishing',
                commercial: 'Commercial',
                government: 'Government'
            }
        },

        // Inventory
        inventory: {
            title: 'Inventory & Logistics Control',
            newItem: 'New Item',
            tabs: {
                overview: 'Overview',
                invoice: 'Invoice Entry (NFe)',
                count: 'Physical Count',
                kardex: 'History (Kardex)'
            },
            sku: 'SKU',
            barcode: 'Barcode',
            quantity: 'Quantity',
            cost: 'Cost',
            price: 'Price',
            minStock: 'Min Stock',
            location: 'Location',
            status: {
                normal: 'Normal',
                low: 'Low'
            },
            uploadXml: 'Upload XML',
            processInvoice: 'Process Invoice',
            finishCount: 'Finish Count'
        },

        // Finance
        finance: {
            title: 'Finance',
            revenue: 'Revenue',
            expense: 'Expenses',
            balance: 'Balance',
            newRevenue: 'New Revenue',
            newExpense: 'New Expense',
            category: 'Category',
            amount: 'Amount',
            date: 'Date',
            status: {
                paid: 'Paid',
                pending: 'Pending',
                canceled: 'Canceled'
            }
        },

        // Maintenance
        maintenance: {
            title: 'Maintenance Quotes',
            quickQuote: 'Quick Quote',
            selectBrand: 'Select Brand',
            selectModel: 'Select Model',
            selectInterval: 'Select Interval',
            generateQuote: 'Generate Quote',
            generatePdf: 'Generate PDF',
            createOrder: 'Create Order',
            preview: 'Preview',
            parts: 'Parts',
            labor: 'Labor',
            saveAsTemplate: 'Save as Template',
            deleteTemplate: 'Delete Template'
        },

        // Settings
        settings: {
            title: 'Settings',
            company: 'Company Info',
            manufacturers: 'Manufacturers',
            services: 'Service Catalog',
            boatManufacturers: 'Boat Manufacturers',
            engineManufacturers: 'Engine Manufacturers',
            addManufacturer: 'Add Manufacturer',
            addModel: 'Add Model',
            mercuryCredentials: 'Mercury Marine Credentials'
        },

        // Messages
        messages: {
            deleteConfirm: 'Are you sure you want to delete?',
            saveSuccess: 'Saved successfully!',
            deleteSuccess: 'Deleted successfully!',
            error: 'An error occurred',
            noResults: 'No results found',
            loading: 'Loading data...'
        },

        // ERP Module (New - EN)
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
            subtitle: 'Analyst Checklist',
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
        }
    }
};

i18n
    .use(LanguageDetector) // Detecta idioma do navegador
    .use(initReactI18next) // Passa i18n para react-i18next
    .init({
        resources: {
            pt,
            en
        },
        fallbackLng: 'pt', // Idioma padrão
        debug: false,

        interpolation: {
            escapeValue: false // React já faz escaping
        },

        detection: {
            order: ['localStorage', 'navigator'], // Prioriza localStorage, depois navegador
            caches: ['localStorage']
        }
    });

export default i18n;
