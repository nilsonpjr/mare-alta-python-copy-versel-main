import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { User, UserRole } from '../types';
import '@testing-library/jest-dom';

// Mock do i18n
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: () => new Promise(() => { }),
        },
    }),
}));

describe('Sidebar Component', () => {
    const mockUser: User = {
        id: 1,
        name: 'Admin Teste',
        email: 'admin@viverdinautica.com',
        role: UserRole.ADMIN
    };

    const props = {
        currentView: 'dashboard',
        setView: vi.fn(),
        currentUser: mockUser,
        onLogout: vi.fn(),
        isOpen: true,
        onClose: vi.fn()
    };

    it('deve exibir o nome da marca na sidebar', () => {
        render(<Sidebar {...props} />);

        expect(screen.getByText(/VIVERDI NAUTICA/i)).toBeInTheDocument();
        expect(screen.getByText(/Manager System/i)).toBeInTheDocument();
    });

    it('deve exibir itens de menu corretos para Admin', () => {
        render(<Sidebar {...props} />);

        // Verificar o nome novo da IA
        // Nota: O teste procura pelo texto que está hardcoded no componente ou via tradução se o mock não for usado diretamente no label
        // No componente Sidebar.tsx o texto 'Viverdi AI' está hardcoded na lista menuItems? Vamos verificar.
        // Sim: { id: 'ai-diagnostics', label: 'Viverdi AI', icon: Bot },
        expect(screen.getByText(/Viverdi AI/i)).toBeInTheDocument();

        // Outros itens
        expect(screen.getByText(/Visão Geral/i)).toBeInTheDocument();
        expect(screen.getByText(/Orçador de Revisão/i)).toBeInTheDocument();
    });

    it('deve chamar setView ao clicar em um item', () => {
        render(<Sidebar {...props} />);

        fireEvent.click(screen.getByText(/Viverdi AI/i));
        expect(props.setView).toHaveBeenCalledWith('ai-diagnostics');
    });
});
