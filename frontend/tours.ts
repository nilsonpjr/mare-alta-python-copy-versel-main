import { Step } from 'react-joyride';

/**
 * Definição dos passos de onboarding (tour) para cada perfil de usuário.
 * Cada array define uma jornada específica.
 */

export const ADMIN_TOUR: Step[] = [
    {
        target: 'body',
        content: 'Bem-vindo ao Sistema Viverdi Náutica! Vamos fazer um tour rápido pelas funcionalidades principais.',
        placement: 'center',
        title: 'Boas-vindas!',
    },
    {
        target: 'a[href="/dashboard"]', // Check selector in Sidebar
        content: 'Na Dashboard você tem a visão geral de faturamento, ocupação da marina e status das OSs.',
        title: 'Painel de Controle',
    },
    {
        target: '#sidebar-inventory', // Need to add ID to sidebar items
        content: 'Gerencie seu estoque de peças, kits de revisão e faça reposições automáticas aqui.',
        title: 'Estoque Inteligente',
    },
    {
        target: '#sidebar-quick-sale',
        content: 'Use nosso PDV para vendas rápidas de balcão, sem necessidade de abrir uma Ordem de Serviço.',
        title: 'Frente de Caixa (PDV)',
    },
    {
        target: '#sidebar-settings',
        content: 'Configure usuários, integrações (Mercury) e emissores fiscais aqui.',
        title: 'Configurações',
    }
];

export const TECHNICIAN_TOUR: Step[] = [
    {
        target: 'body',
        content: 'Olá! Este é o seu app de trabalho. Vamos ver como agilizar suas tarefas.',
        placement: 'center',
        title: 'App do Técnico',
    },
    {
        target: '#tech-schedule', // Need to ensure IDs exist
        content: 'Aqui você vê as embarcações agendadas para hoje. Mantenha o foco no prazo!',
        title: 'Dashboard de Tarefas',
    },
    {
        target: '#btn-checklist-entry',
        content: 'Toque aqui para registrar fotos e o estado inicial do barco assim que ele chegar.',
        title: 'Checklist de Entrada',
    },
    {
        target: '#btn-add-part-os',
        content: 'Use o scanner para adicionar peças do estoque diretamente à OS durante o serviço.',
        title: 'Lançamento de Peças',
    },
    {
        target: '#btn-finalize-os',
        content: 'Colete a assinatura do cliente aqui para validar a entrega técnica.',
        title: 'Finalização',
    }
];

export const PARTNER_TOUR: Step[] = [
    {
        target: 'body',
        content: 'Bem-vindo parceiro! Aqui você gerencia os serviços solicitados pela marina.',
        placement: 'center',
        title: 'Portal do Parceiro',
    },
    {
        target: '#pending-quotes',
        content: 'Veja aqui as cotações que a marina solicitou para você.',
        title: 'Solicitações Pendentes',
    },
    {
        target: '#quote-input',
        content: 'Informe o valor do seu serviço e o prazo de entrega estimado.',
        title: 'Lançamento de Valores',
    },
    {
        target: '#upload-proposal',
        content: 'Anexe seu orçamento em PDF ou fotos do material que será usado.',
        title: 'Upload de Proposta',
    },
    {
        target: '#btn-send-quote',
        content: 'Ao enviar, o gestor da marina será notificado para aprovação imediata.',
        title: 'Envio',
    }
];

export const CLIENT_TOUR: Step[] = [
    {
        target: 'body',
        content: 'Bem-vindo à área do proprietário! Acompanhe tudo sobre sua embarcação.',
        placement: 'center',
        title: 'Portal do Proprietário',
    },
    {
        target: '#boat-status-card',
        content: 'Acompanhe o progresso da manutenção em tempo real por aqui.',
        title: 'Status da Embarcação',
    },
    {
        target: '#pending-approvals',
        content: 'Revise os itens e aprove o serviço com um clique para iniciarmos o trabalho.',
        title: 'Aprovação de Orçamentos',
    },
    {
        target: '#boat-history',
        content: 'Acesse todos os manuais, revisões e serviços realizados anteriormente.',
        title: 'Histórico (Prontuário)',
    }
];

// Helper para selecionar o tour baseado na role
export const getTourForRole = (role: string): Step[] => {
    switch (role) {
        case 'ADMIN': return ADMIN_TOUR;
        case 'TECHNICIAN': return TECHNICIAN_TOUR;
        case 'PARTNER': return PARTNER_TOUR;
        case 'CLIENT': return CLIENT_TOUR;
        default: return [];
    }
};
