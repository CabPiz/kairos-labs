# Contribuindo com Kairos Labs

Guia para qualquer pessoa clonar, configurar e rodar o projeto localmente.

---

## Pré-requisitos

- **Node.js** >= 22 (`node --version` para verificar)
- **npm** >= 10 (incluído com o Node.js)
- Conta no [Supabase](https://supabase.com) para obter as variáveis de ambiente

---

## Setup local

```bash
# 1. Clone o repositório
git clone https://github.com/CabPiz/kairos-labs.git
cd kairos-labs

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Testes unitários

```bash
# Rodar todos os testes
npm test

# Rodar com relatório de cobertura
npm run test:coverage
```

Stack: [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com/react).

---

## Testes E2E

> **Ainda não configurados.** A issue [#39 — Configurar Playwright para testes E2E](https://github.com/CabPiz/kairos-labs/issues/39) é responsável por implementar essa infra. Quando concluída, esta seção será atualizada com o comando `npm run test:e2e` e as instruções de uso.

---

## Hooks de pre-commit

[Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) estão configurados. Ao executar `git commit`, o ESLint roda automaticamente nos arquivos `.ts` e `.tsx` modificados. Commits com erros ou warnings de lint são bloqueados.

---

## Convenções de branch

| Tipo | Padrão |
| :--- | :--- |
| Nova funcionalidade | `feature/[N]-descricao-curta` |
| Correção de bug | `fix/[N]-descricao-curta` |
| Setup / config | `chore/[N]-descricao-curta` |
| Documentação | `docs/[N]-descricao-curta` |

---

## Conventional Commits

Toda mensagem de commit segue o padrão `tipo(escopo): descrição no imperativo em português`.

| Tipo | Quando usar |
| :--- | :--- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Setup, config, dependências |
| `docs` | Documentação |
| `style` | Formatação sem mudança de lógica |
| `refactor` | Refatoração sem mudança funcional |
| `test` | Adição ou correção de testes |
| `ci` | Mudanças em CI/CD |

**Exemplos:**

```
feat(waitlist): adiciona validação de e-mail duplicado
fix(modal): corrige fechamento ao pressionar Escape
docs(contributing): adiciona seção de testes E2E
```

---

*Kairos Labs — Cesar Antonio Brito Pizarro*
