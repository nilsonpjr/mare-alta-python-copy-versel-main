export const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });
};

export const parseCurrencyInput = (value: string): number => {
    const digits = value.replace(/\D/g, '');
    return Number(digits) / 100;
};

export const formatCurrencyInput = (value: string | number): string => {
    const amount = typeof value === 'number' ? value : parseCurrencyInput(value);
    return amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        style: 'currency',
        currency: 'BRL',
    });
};
