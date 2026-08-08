# Contributing to Kairos Labs

Guide for anyone to clone, set up, and run the project locally.

🇧🇷 [Leia em Português](./docs/CONTRIBUTING.pt-BR.md)

---

## Prerequisites

- **Node.js** >= 22 (check with `node --version`)
- **npm** >= 10 (bundled with Node.js)
- A [Supabase](https://supabase.com) account (free tier is enough)

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Fill in:
   - **Organization:** your org
   - **Project name:** any name (e.g. `kairos-labs`)
   - **Database password:** click **Generate a password** and save it
   - **Region:** Americas (or closest to your users)
   - **Security:** uncheck **"Automatically expose new tables"** — the migration script sets grants manually
   - Leave **"Enable automatic RLS"** unchecked — the migration enables RLS explicitly
3. Click **Create new project** and wait ~1 minute for provisioning

---

## 2. Run the database migrations

Run the migrations **in order** — each one builds on the previous.

### Migration 001 — Initial schema

1. In your Supabase project, go to **SQL Editor** (left sidebar) → **New query**
2. Copy the full contents of [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) and paste it
3. Click **Run** (or `Ctrl+Enter`)
4. You should see **"Success. No rows returned"**

This creates the `waitlist` and `feedback` tables, enables RLS on both, and sets the correct grants for `anon` and `service_role`.

### Migration 002 — Dashboard RPC

1. Open a new query in the SQL Editor
2. Copy the full contents of [`supabase/migrations/002_dashboard_rpc.sql`](./supabase/migrations/002_dashboard_rpc.sql) and paste it
3. Click **Run**
4. You should see **"Success. No rows returned"**

This creates the `get_dashboard_kpis()` SECURITY DEFINER function used by the admin dashboard to read data without relying on `BYPASSRLS` (service_role).

**To verify both migrations ran correctly**, run these queries in the SQL Editor:

```sql
-- Check columns
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check grants
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
ORDER BY table_name, grantee;

-- Check RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check SECURITY DEFINER function
SELECT routine_name, security_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'get_dashboard_kpis';
```

Expected: `waitlist` and `feedback` tables with their columns, `anon` with INSERT on both, `service_role` with ALL on both, `rowsecurity = true` on both tables, and `get_dashboard_kpis` with `security_type = DEFINER`.

---

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values from your Supabase project (**Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/public key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

---

## 4. Install and run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## Unit Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

Stack: [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com/react).

---

## E2E Tests

Stack: [Playwright](https://playwright.dev) + Chromium.

E2E tests validate the critical application flows in a real browser. Specs live in the `e2e/` folder.

**Prerequisite (first time only):**

```bash
./node_modules/.bin/playwright install --with-deps chromium
```

**Run E2E tests:**

```bash
npm run test:e2e
```

The development server (`npm run dev`) must be running at `localhost:3000`, or you can use Playwright's automatic `webServer` (configured in `playwright.config.ts`).

**HTML report after execution:**

```bash
./node_modules/.bin/playwright show-report
```

**Covered flows:**

| Spec | Validated flow |
| :--- | :--- |
| `e2e/waitlist.spec.ts` | Opens waitlist modal → fills email → submits → sees confirmation |

In CI (GitHub Actions), E2E tests run automatically in the `e2e` job, after the `ci` job. Failure screenshots are saved as artifacts for 7 days.

---

## SonarCloud via CLI

Consulte o Quality Gate e as issues de uma PR diretamente pelo terminal, sem precisar abrir o browser.

**Pré-requisito:** defina `SONAR_TOKEN` em `.env.local` (gere em [sonarcloud.io/account/security](https://sonarcloud.io/account/security)).

```bash
# Carregar variáveis do .env.local
export $(grep -v '^#' .env.local | xargs)

# Verificar status do Quality Gate de uma PR
./scripts/sonar-check.sh gate <PR_NUMBER>

# Listar issues abertas com arquivo e linha
./scripts/sonar-check.sh issues <PR_NUMBER>

# Redirecionar saída para saida.log (padrão do projeto)
./scripts/sonar-check.sh issues <PR_NUMBER> 2>&1 | tee saida.log
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

Em CI, o `SONAR_TOKEN` é injetado automaticamente via secret do repositório — nenhuma configuração adicional é necessária para o pipeline.

---

## Pre-commit Hooks

[Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged) are configured. When running `git commit`, ESLint runs automatically on modified `.ts` and `.tsx` files. Commits with lint errors or warnings are blocked.

---

## Branch Conventions

| Type | Pattern |
| :--- | :--- |
| New feature | `feature/[N]-short-description` |
| Bug fix | `fix/[N]-short-description` |
| Setup / config | `chore/[N]-short-description` |
| Documentation | `docs/[N]-short-description` |

---

## Conventional Commits

All commit messages follow the pattern `type(scope): imperative description in Portuguese`.

| Type | When to use |
| :--- | :--- |
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Setup, config, dependencies |
| `docs` | Documentation |
| `style` | Formatting, no logic change |
| `refactor` | Refactoring without functional change |
| `test` | Adding or fixing tests |
| `ci` | CI/CD changes |

**Examples:**

```
feat(waitlist): adiciona validação de e-mail duplicado
fix(modal): corrige fechamento ao pressionar Escape
docs(contributing): adiciona seção de testes E2E
```

---

*Kairos Labs — Cesar Antonio Brito Pizarro*
