# Setup — Kairos Labs

Guia de configuração do ambiente local de desenvolvimento.
Mantido pelo Claude Code: atualizado a cada issue que introduzir mudança de ambiente.

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Conta Supabase (projeto já criado)
- Conta GitHub com acesso ao repositório `CabPiz/kairos-labs`

---

## Instalação

```bash
git clone https://github.com/CabPiz/kairos-labs.git
cd kairos-labs
npm ci
```

---

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google AI (tradução on-demand de feedbacks no painel admin via Gemini 2.0 Flash — free tier)
# Obter em: https://aistudio.google.com/apikey
# Opcional: se ausente, feedbacks são exibidos no idioma original
GOOGLE_AI_API_KEY=

# SonarCloud (necessário para rodar os scripts sonar-check.sh localmente)
SONAR_TOKEN=
```

> Valores do Supabase: dashboard do Supabase → Project Settings → API.
> `GOOGLE_AI_API_KEY`: aistudio.google.com → "Get API key" (free tier, sem cartão de crédito).
> `SONAR_TOKEN` gerado em sonarcloud.io → My Account → Security.

---

## Banco de Dados

Execute os scripts SQL abaixo no **SQL Editor do Supabase** (Project → SQL Editor → New query) na ordem indicada.

### [Issue #73] Tabela `contact_requests`

Criada para armazenar solicitações de contato recebidas pelo modal "Falar com Especialista" da landing page.

```sql
-- Tabela de solicitações de contato (freelance/consulting)
CREATE TABLE IF NOT EXISTS contact_requests (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         text        NOT NULL,
  email        text        NOT NULL,
  project_type text        NOT NULL,
  description  text        NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- RLS ativo: visitantes não têm acesso de leitura
-- Inserts são realizados via Server Action com service_role (bypass RLS)
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Necessário: service_role bypassa RLS mas ainda precisa de privilégio de objeto
GRANT INSERT ON public.contact_requests TO service_role;
```

### [Issue #98] Colunas `phone` e `whatsapp_preferred` em `contact_requests`

Adicionadas para capturar telefone/WhatsApp e preferência de canal de retorno no formulário de contato.

```sql
ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_preferred BOOLEAN NOT NULL DEFAULT FALSE;
```

> Script equivalente disponível em `supabase/migrations/003_contact_requests_phone.sql`.

### [Issue #101] Coluna `mensagem_locale` em `feedback` (migration 004)

Armazena o idioma de origem de cada feedback enviado. O painel admin usa esse campo para traduzir on-demand via Gemini ao visualizar em outro idioma.

```sql
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS mensagem_locale TEXT;
```

> Script completo disponível em `supabase/migrations/004_feedback_translation.sql` (também adiciona `mensagem_traduzida`, removida pela migration 005).

### [Issue #101] Remove coluna `mensagem_traduzida` de `feedback` (migration 005)

Tradução passou a ser feita on-demand no painel admin — sem armazenamento em banco.

```sql
ALTER TABLE public.feedback
  DROP COLUMN IF EXISTS mensagem_traduzida;
```

> Script equivalente disponível em `supabase/migrations/005_drop_mensagem_traduzida.sql`.

---

## CI/CD

O pipeline GitHub Actions requer os seguintes secrets configurados no repositório
(Settings → Secrets and variables → Actions):

| Secret | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role (nunca expor no cliente) |
| `SONAR_TOKEN` | Token de autenticação SonarCloud |
| `SONAR_PROJECT_KEY` | Chave do projeto no SonarCloud |
| `E2E_EMAIL` | E-mail de usuário de teste para specs E2E de autenticação |
| `E2E_PASSWORD` | Senha do usuário de teste E2E |
| `GOOGLE_AI_API_KEY` | Chave da Google AI Studio para tradução on-demand de feedbacks no painel admin via Gemini (opcional — sem ela, feedbacks são exibidos no idioma original) |

---

## Scripts disponíveis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm test             # suite de testes unitários (Jest)
npm run test:e2e     # testes E2E (Playwright) — requer servidor rodando
npm run lint         # verificação ESLint
```
