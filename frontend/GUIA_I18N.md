# 🌍 Guia de Internacionalização (i18n) - Mare Alta

## 📋 Visão Geral

O sistema Mare Alta agora suporta **múltiplos idiomas** usando **react-i18next**!

**Idiomas Disponíveis:**
- 🇧🇷 **Português (Brasil)** - Padrão
- 🇺🇸 **English (United States)**

---

## 🚀 Como Usar

### Para Usuários Finais

1. **Localizar o Seletor de Idioma:**
   - Está localizado na **sidebar**, logo acima do botão "Encerrar Sessão"
   - Ícone: 🌐 Globe

2. **Trocar Idioma:**
   - Click no dropdown
   - Selecione o idioma desejado:
     - 🇧🇷 Português
     - 🇺🇸 English

3. **Preferência Salva Automaticamente:**
   - Sua escolha fica salva no navegador
   - Na próxima visita, o idioma será o mesmo que você escolheu

---

## 🔧 Para Desenvolvedores

### Estrutura

```
frontend/
├── i18n.ts                  # Configuração principal do i18n
├── components/
│   └── LanguageSwitcher.tsx # Componente seletor de idioma
```

### Usando Traduções em Componentes

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Exemplo com Interpolação

```tsx
// Em i18n.ts
orderNumber: 'OS #{{number}}'

// No componente
<h2>{t('orders.orderNumber', { number: 1001 })}</h2>
// Resultado: "OS #1001"
```

### Adicionar Nova Tradução

1. Abra `frontend/i18n.ts`
2. Adicione em ambas as seções (`pt` e `en`):

```typescript
// Português
const pt = {
  translation: {
    myModule: {
      title: 'Meu Módulo',
      button: 'Clique Aqui'
    }
  }
};

// Inglês
const en = {
  translation: {
    myModule: {
      title: 'My Module',
      button: 'Click Here'
    }
  }
};
```

3. Use no componente:

```tsx
{t('myModule.title')}
{t('myModule.button')}
```

---

## 📚 Palavras-Chave Traduzidas

### Navegação (nav)
- dashboard, agenda, orders, crm, clients, boats, marinas, inventory, finance, maintenance, users, settings, logout

### Botões Comuns (common)
- save, cancel, delete, edit, add, search, filter, export, import, print, loading, confirm, back, next, finish, close

### Status de OS (orders.status)
- pending, quotation, approved, inProgress, completed, canceled

### Tipos de Cliente (clients.type)
- individual, company, government

### Tipos de Uso de Barco (boats.usageType)
- leisure, fishing, commercial, government

### Abas de Estoque (inventory.tabs)
- overview, invoice, count, kardex

### Status Financeiro (finance.status)
- paid, pending, canceled

---

## 🎨 Detecção Automática de Idioma

O sistema **detecta automaticamente** o idioma do navegador:

1. **Navegador em PT-BR** → Sistema em Português
2. **Navegador em EN-US** → Sistema em Inglês
3. **Outro idioma** → Fallback para Português

**Prioridade:**
1. Preferência salva no localStorage
2. Idioma do navegador
3. Fallback (PT-BR)

---

## 🔄 Mudança Dinâmica

O idioma muda **instantaneamente** sem reload da página!

```tsx
// Programaticamente
import { useTranslation } from 'react-i18next';

function Component() {
  const { i18n } = useTranslation();
  
  // Mudar para inglês
  i18n.changeLanguage('en');
  
  // Mudar para português
  i18n.changeLanguage('pt');
}
```

---

## 🌟 Boas Práticas

### ✅ Faça

```tsx
// Sempre use t() para textos visíveis
<h1>{t('dashboard.title')}</h1>

// Use interpolação para valores dinâmicos
<p>{t('orders.orderNumber', { number: order.id })}</p>

// Organize traduções por módulo
myModule: {
  title: '...',
  subtitle: '...',
  buttons: { ... }
}
```

### ❌ Evite

```tsx
// NÃO hardcode textos
<h1>Dashboard</h1> // ❌

// NÃO concatene strings
<p>{'OS #' + order.id}</p> // ❌ Use interpolação
```

---

## 📦 Bibliotecas Utilizadas

- **i18next** - Core de internacionalização
- **react-i18next** - Bindings para React
- **i18next-browser-languagedetector** - Detecta idioma do navegador

---

## 🚀 Expandindo para Novos Idiomas

Para adicionar **Espanhol (ES)**, por exemplo:

1. Crie a tradução em `i18n.ts`:

```typescript
const es = {
  translation: {
    nav: {
      dashboard: 'Tablero',
      orders: 'Órdenes',
      // ... todas as chaves
    }
  }
};
```

2. Registre o idioma:

```typescript
i18n.init({
  resources: {
    pt,
    en,
    es  // Adicione aqui
  }
});
```

3. Adicione no LanguageSwitcher:

```tsx
<select>
  <option value="pt">🇧🇷 Português</option>
  <option value="en">🇺🇸 English</option>
  <option value="es">🇪🇸 Español</option>
</select>
```

---

## 🧪 Testando Traduções

```bash
# No console do navegador
localStorage.setItem('i18nextLng', 'en'); // Forçar inglês
localStorage.setItem('i18nextLng', 'pt'); // Forçar português
location.reload();
```

---

## 📊 Cobertura Atual

**Módulos Traduzidos:**
- ✅ Navegação principal
- ✅ Dashboard
- ✅ Ordens de Serviço
- ✅ Clientes
- ✅ Embarcações
- ✅ Estoque
- ✅ Financeiro
- ✅ Manutenção/Orçamentos
- ✅ Configurações
- ✅ Mensagens comuns

**Total:** ~150+ strings traduzidas

---

## 💡 Dicas

1. **Sempre teste em ambos os idiomas** antes de fazer deploy
2. **Mantenha chaves organizadas** por módulo/contexto
3. **Use nomes descritivos** para as chaves
4. **Documente novas traduções** no commit
5. **Revise com nativos** quando possível

---

## 🐛 Troubleshooting

### Tradução não aparece

1. Verifique se a chave existe em **ambos** os idiomas (pt e en)
2. Certifique-se que importou `useTranslation`
3. Use `console.log(t('sua.chave'))` para debugar

### Idioma não muda

1. Limpe localStorage: `localStorage.clear()`
2. Recarregue a página
3. Verifique se o componente está dentro do provider

---

## 📞 Suporte

Para dúvidas ou expansão de traduções:
- Email: dev@marealta.com
- Documentação: `/frontend/i18n.ts`

---

**Versão:** 1.0.0  
**Última Atualização:** 20/12/2025  
**Responsável:** Equipe Mare Alta
