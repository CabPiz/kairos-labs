# Kairos Labs

[![CI](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=alert_status)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=coverage)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
![INPI](https://img.shields.io/badge/Marca_Registrada_INPI-Proc._944610498-16a34a?style=flat)

> Portal institucional, vitrine de inovação e hub de validação de demanda para um ecossistema de soluções em tecnologia — DevPrint, Elucya Talk, Ágora Global, Ascend e Talvrix.

🇺🇸 [Read in English](./README.md)

---

## O que é o Kairos Labs?

Kairos Labs é uma aplicação web full-stack que serve como portal institucional e hub de validação de demanda para o ecossistema de soluções em tecnologia — DevPrint, Elucya Talk, Ágora Global, Ascend e Talvrix.

A plataforma também funciona como um **portfólio de engenharia ao vivo**, demonstrando práticas de nível produção: código full-stack tipado, pipeline de testes automatizado, quality gate com SonarCloud e infraestrutura de custo zero.

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

> **Banco de dados:** a aplicação requer um projeto Supabase. No SQL Editor do Supabase, execute [`supabase/migrations/001_schema.sql`](./supabase/migrations/001_schema.sql) — esse único arquivo cria todas as tabelas, ativa o RLS, define os grants e cria a função `get_dashboard_kpis()`.

Para o guia completo de setup, comandos de teste e padrões de contribuição, veja [docs/CONTRIBUTING.pt-BR.md](./docs/CONTRIBUTING.pt-BR.md).

---

## Licença

**Todos os Direitos Reservados** — Cesar Antonio Brito Pizarro / Kairos Labs

Marca registrada no INPI, Processo nº 944610498, Classe 42.
Contribuições externas não são aceitas. Veja [LICENSE](./LICENSE) para detalhes.
