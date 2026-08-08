# Kairos Labs

[![CI](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=alert_status)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=coverage)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
![INPI](https://img.shields.io/badge/Marca_Registrada_INPI-Proc._944610498-16a34a?style=flat)

> Portal institucional, vitrine de inovação e hub de validação de demanda para um ecossistema de soluções em tecnologia — DevPrint, Elucya Talk, Ágora Global, Ascend e Talvrix.

🇺🇸 [Read in English](./README.md)

---

## O que é o Kairos Labs?

Kairos Labs é uma aplicação web full-stack construída para servir dois públicos simultaneamente:

- **Visitantes públicos** — navegam pela vitrine de produtos e entram em listas de espera segmentadas para cada solução em desenvolvimento.
- **O fundador** — acessa um dashboard privado de analytics (`/admin`) para acompanhar o crescimento da waitlist por produto e tomar decisões orientadas a dados sobre qual solução construir primeiro.

A plataforma também funciona como um **portfólio de engenharia ao vivo**, demonstrando práticas de nível produção: código full-stack tipado, pipeline de testes automatizado, quality gate com SonarCloud e infraestrutura de custo zero.

---

## Proposta de Valor

> "Engenharia de software moderna e tomada de decisão orientada a dados: priorizando o desenvolvimento das soluções onde a demanda do mercado é real."

A tese central: antes de escrever uma linha de código de produto, valide qual produto o mercado realmente quer. O Kairos Labs é o instrumento para essa validação.

---

## Stack Técnica

| Camada | Tecnologia |
| :--- | :--- |
| Framework | Next.js 16 (App Router, React Server Components) |
| Linguagem | TypeScript (strict) |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| Gráficos | Recharts |
| Backend | Supabase (PostgreSQL + Auth + Row Level Security) |
| Formulários | React Hook Form + Zod |
| Testes | Jest + React Testing Library + Playwright (E2E) |
| CI/CD | GitHub Actions + Vercel (Hobby Tier) |
| Qualidade | SonarCloud (Quality Gate obrigatório em cada PR) |
| Commits | Husky + lint-staged (ESLint bloqueia commit com warnings) |

---

## Arquitetura de Pastas

```
kairos-labs/
├── app/                    # Next.js App Router — páginas e layouts
│   ├── admin/              # Dashboard privado do fundador (/admin)
│   │   └── login/          # Página de login via Supabase Auth
│   ├── solucoes/           # Páginas públicas de produtos (/solucoes/[slug])
│   ├── layout.tsx          # Layout raiz (fontes, metadata)
│   └── page.tsx            # Landing page (Hero, Produtos, Footer)
├── components/             # Componentes React compartilhados
│   └── ui/                 # Primitivas reutilizáveis (modais, banners, gráficos)
├── lib/                    # Utilitários, clientes Supabase, Server Actions
├── e2e/                    # Specs E2E do Playwright
├── __tests__/              # Testes unitários Jest + RTL
├── supabase/               # Migrations e scripts de seed do banco
├── docs/                   # Documentação do projeto
│   ├── PRD.md              # Product Requirements Document
│   └── CONTRIBUTING.pt-BR.md
└── .github/workflows/      # Pipeline de CI/CD (ci.yml)
```

---

## Setup Local

**Pré-requisitos:** Node.js >= 22, npm >= 10, uma conta no [Supabase](https://supabase.com).

```bash
# 1. Clone o repositório
git clone https://github.com/CabPiz/kairos-labs.git
cd kairos-labs

# 2. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase (URL, anon key, service role key)

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

> **Banco de dados:** a aplicação requer um projeto Supabase. Execute os scripts de migration em ordem no SQL Editor do Supabase:
> 1. [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) — tabelas, políticas RLS e grants
> 2. [`supabase/migrations/002_dashboard_rpc.sql`](./supabase/migrations/002_dashboard_rpc.sql) — função `get_dashboard_kpis()` com SECURITY DEFINER

Para o guia completo de setup, comandos de teste e padrões de contribuição, veja [docs/CONTRIBUTING.pt-BR.md](./docs/CONTRIBUTING.pt-BR.md).

---

## Requisitos do Produto

O PRD completo — visão do produto, especificação de features, schema do banco e políticas de RLS — está disponível em [`docs/PRD.md`](./docs/PRD.md).

---

## Licença

**Todos os Direitos Reservados** — Cesar Antonio Brito Pizarro / Kairos Labs

Marca registrada no INPI, Processo nº 944610498, Classe 42.
Contribuições externas não são aceitas. Veja [LICENSE](./LICENSE) para detalhes.
