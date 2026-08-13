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
   - **Security:** desmarque **"Automatically expose new tables"** — o schema define os grants manualmente
   - Deixe **"Enable automatic RLS"** desmarcado — o schema ativa o RLS explicitamente
3. Clique em **Create new project** e aguarde ~1 minuto para o provisionamento

---

## 2. Executar o schema do banco

Existe um único arquivo de schema que representa o estado completo e final do banco de dados.

1. No seu projeto Supabase, acesse o **SQL Editor** (barra lateral esquerda) → **New query**
2. Copie o conteúdo completo de [`supabase/migrations/001_schema.sql`](../supabase/migrations/001_schema.sql) e cole na janela
3. Clique em **Run** (ou `Ctrl+Enter`)
4. Você verá **"Success. No rows returned"**

Isso cria todas as tabelas (`waitlist`, `feedback`, `contact_requests`), ativa o RLS, define os grants e cria a função `get_dashboard_kpis()` usada pelo painel admin.

**Para verificar que o schema rodou corretamente**, execute essas queries no SQL Editor:

```sql
-- Verificar tabelas e colunas
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

-- Verificar função SECURITY DEFINER
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'get_dashboard_kpis';
```

Esperado: tabelas `waitlist`, `feedback` e `contact_requests` com suas colunas, grants corretos, `rowsecurity = true` em todas as tabelas, e `get_dashboard_kpis` com `security_type = DEFINER`.

---

## 3. Conceder acesso de Fundador (apenas local)

O dashboard `/admin` é protegido por uma **policy RLS baseada em role** — ela verifica `app_metadata.role = 'founder'` no usuário autenticado. Esse valor é configurado manualmente em cada ambiente e nunca fica no arquivo de schema.

Após criar sua conta na aplicação (via signup ou pelo painel de Auth do Supabase), execute isso uma vez no SQL Editor, substituindo pelo seu e-mail:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "founder"}'
WHERE email = 'seu-email@exemplo.com';
```

> **Importante:** use seu próprio e-mail para testes locais. Nunca use o e-mail ou as credenciais do owner de produção.

---

## 4. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha com os valores do seu projeto Supabase (**Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://<seu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon/public>
SUPABASE_SERVICE_ROLE_KEY=<chave service_role>
```

As variáveis do SonarCloud (`SONAR_TOKEN` e `SONAR_PROJECT_KEY`) são **opcionais** para rodar a aplicação localmente. Elas só são necessárias se você quiser usar o script `./scripts/sonar-check.sh` para consultar o Quality Gate pelo terminal. Consulte a seção [SonarCloud via CLI](#sonarcloud-via-cli) para instruções de configuração.

---

## 5. Instalar e rodar

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

---

## Evoluindo o schema

O schema do banco é mantido como um **único arquivo** (`supabase/migrations/001_schema.sql`) que sempre reflete o estado atual e completo do banco. Não existem migrations numeradas incrementais.

Quando precisar alterar o schema (adicionar coluna, criar tabela, atualizar policy):

1. Edite `supabase/migrations/001_schema.sql` diretamente
2. Aplique a mudança específica no seu projeto Supabase via SQL Editor (só o delta — não execute o arquivo completo em um banco já existente)
3. Faça commit do `001_schema.sql` atualizado — o histórico do git é o changelog

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
| `e2e/feedback.spec.ts` | Abre modal de feedback → preenche mensagem → submete → vê confirmação (casos de sucesso e erro de validação) |
| `e2e/auth.spec.ts` | Redirecionamento de rota protegida, formulário de login, credenciais inválidas, login válido, switcher de idioma, cookie de locale |

No CI (GitHub Actions), os testes E2E rodam automaticamente no job `e2e`, após o job `ci`. Screenshots de falha são salvas como artefatos por 7 dias.

---

## SonarCloud via CLI

Consulte o Quality Gate e as issues de uma PR diretamente pelo terminal, sem precisar abrir o browser.

### Pré-requisitos: configurar SONAR_TOKEN e SONAR_PROJECT_KEY

Duas variáveis são necessárias no seu `.env.local`:

**`SONAR_TOKEN`** — seu token de acesso pessoal ao SonarCloud:

1. Acesse [sonarcloud.io](https://sonarcloud.io) e faça login (pode usar sua conta GitHub)
2. Clique no avatar (canto superior direito) → **My Account** → **Security**
3. Em "Generate Tokens", dê um nome (ex: `kairos-labs-local`) e clique em **Generate**
4. Copie o token gerado — ele é exibido apenas uma vez
5. Cole no `.env.local`: `SONAR_TOKEN=<cole aqui>`

**`SONAR_PROJECT_KEY`** — identificador único deste projeto no SonarCloud:

- O valor já está definido no `.env.example`: `CabPiz_kairos-labs`
- Não altere — ele mapeia exatamente este repositório na plataforma
- Se precisar confirmar: acesse [sonarcloud.io](https://sonarcloud.io) → abra o projeto `kairos-labs` → **Information** (barra lateral esquerda)

### Rodando o script

```bash
# Carregar variáveis do .env.local
export $(grep -v '^#' .env.local | xargs)

# Verificar status do Quality Gate de uma PR
./scripts/sonar-check.sh gate <NUMERO_DA_PR>

# Listar issues abertas com arquivo e linha
./scripts/sonar-check.sh issues <NUMERO_DA_PR>

# Redirecionar saída para saida.log (padrão do projeto)
./scripts/sonar-check.sh issues <NUMERO_DA_PR> 2>&1 | tee saida.log
```

**Exemplo de saída (`gate`):**

```
=== Quality Gate — PR #75 ===
STATUS: FAILED (bloqueado)

Condições:
  [ERROR] new_coverage — valor: 72.5 (limite: 80.0)
  [OK] new_duplicated_lines_density — valor: 0.0 (limite: 3.0)
```

**Exemplo de saída (`issues`):**

```
=== Issues abertas — PR #75 ===
[MAJOR] Props should be read-only.
  Arquivo : src/components/ui/Modal.tsx
  Linha   : 12
  Regra   : typescript:S6598

Total: 1 issue(s)
```

No CI, o `SONAR_TOKEN` é injetado automaticamente via secret do repositório — nenhuma configuração adicional é necessária para o pipeline.

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
