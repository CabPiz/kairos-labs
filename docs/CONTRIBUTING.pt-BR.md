# Contribuindo com Kairos Labs

Guia para qualquer pessoa clonar, configurar e rodar o projeto localmente.

---

## Pré-requisitos

- **Node.js** >= 22 (`node --version` para verificar)
- **npm** >= 10 (incluído com o Node.js)
- Conta no [Supabase](https://supabase.com) (o plano gratuito é suficiente)

---

## 1. Criar um projeto Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Preencha:
   - **Organization:** sua organização
   - **Project name:** qualquer nome (ex: `kairos-labs`)
   - **Database password:** clique em **Generate a password** e guarde o valor
   - **Region:** Americas (ou a mais próxima dos seus usuários)
   - **Security:** desmarque **"Automatically expose new tables"** — o script de migration define os grants manualmente
   - Deixe **"Enable automatic RLS"** desmarcado — a migration ativa o RLS explicitamente
3. Clique em **Create new project** e aguarde ~1 minuto para o provisionamento

---

## 2. Executar a migration do banco

1. No seu projeto Supabase, acesse o **SQL Editor** (barra lateral esquerda) → **New query**
2. Copie o conteúdo completo de [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql) e cole na janela
3. Clique em **Run** (ou `Ctrl+Enter`)
4. Você verá **"Success. No rows returned"**

Isso cria as tabelas `waitlist` e `feedback`, ativa o RLS em ambas e define os grants corretos para `anon` e `service_role`.

**Para verificar que a migration rodou corretamente**, execute essas queries no SQL Editor:

```sql
-- Verificar colunas
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Verificar grants
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY table_name, grantee;

-- Verificar RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Esperado: tabelas `waitlist` e `feedback` com suas colunas, `anon` com INSERT em ambas, `service_role` com ALL em ambas, e `rowsecurity = true` nas duas tabelas.

---

## 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha com os valores do seu projeto Supabase (**Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://<seu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon/public>
SUPABASE_SERVICE_ROLE_KEY=<chave service_role>
```

---

## 4. Instalar e rodar

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
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

Stack: [Playwright](https://playwright.dev) + Chromium.

Os testes E2E validam os fluxos críticos da aplicação no browser real. Os specs ficam na pasta `e2e/`.

**Pré-requisito (apenas na primeira vez):**

```bash
./node_modules/.bin/playwright install --with-deps chromium
```

**Rodar os testes E2E:**

```bash
npm run test:e2e
```

O servidor de desenvolvimento (`npm run dev`) precisa estar rodando em `localhost:3000`, ou você pode usar o `webServer` automático do Playwright (configurado no `playwright.config.ts`).

**Relatório HTML após a execução:**

```bash
./node_modules/.bin/playwright show-report
```

**Fluxos cobertos:**

| Spec | Fluxo validado |
| :--- | :--- |
| `e2e/waitlist.spec.ts` | Abre modal de waitlist → preenche e-mail → submete → vê confirmação |

No CI (GitHub Actions), os testes E2E rodam automaticamente no job `e2e`, após o job `ci`. Screenshots de falha são salvas como artefatos por 7 dias.

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
