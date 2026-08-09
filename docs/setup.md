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

# SonarCloud (necessário para rodar os scripts sonar-check.sh localmente)
SONAR_TOKEN=
```

> Valores encontrados no dashboard do Supabase → Project Settings → API.
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

---

## Scripts disponíveis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm test             # suite de testes unitários (Jest)
npm run test:e2e     # testes E2E (Playwright) — requer servidor rodando
npm run lint         # verificação ESLint
```
