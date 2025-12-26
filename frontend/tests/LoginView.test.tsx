import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginView } from '../components/LoginView';
import '@testing-library/jest-dom';

describe('LoginView Component', () => {
    it('deve renderizar o formulário de login corretamente com o novo nome', () => {
        const onLoginMock = vi.fn();
        render(<LoginView onLogin={onLoginMock} />);

        // Verificar o título novo (pode haver mais de um, pega todos e verifica se pelo menos um está visível)
        const titles = screen.getAllByText(/VIVERDI NAUTICA/i);
        expect(titles.length).toBeGreaterThan(0);
        expect(titles[0]).toBeInTheDocument();

        expect(screen.getByText(/Gestão Náutica Especializada/i)).toBeInTheDocument();

        // Verificar campos
        expect(screen.getByPlaceholderText(/seu.nome@viverdinautica.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

        // Verificar botão
        expect(screen.getByRole('button', { name: /Acessar Sistema/i })).toBeInTheDocument();
    });

    it('deve permitir digitar email e senha', () => {
        const onLoginMock = vi.fn();
        render(<LoginView onLogin={onLoginMock} />);

        const emailInput = screen.getByPlaceholderText(/seu.nome@viverdinautica.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);

        fireEvent.change(emailInput, { target: { value: 'teste@viverdinautica.com' } });
        fireEvent.change(passwordInput, { target: { value: 'senha123' } });

        expect(emailInput).toHaveValue('teste@viverdinautica.com');
        expect(passwordInput).toHaveValue('senha123');
    });
});
