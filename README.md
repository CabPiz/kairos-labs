# Kairos Labs

[![CI](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=alert_status)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=coverage)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
![INPI](https://img.shields.io/badge/Marca_Registrada_INPI-Proc._944610498-16a34a?style=flat)

> Institutional portal, innovation showcase, and demand validation hub for a technology solutions ecosystem — DevPrint, Elucya Talk, Ágora Global, Ascend and Talvrix.

🇧🇷 [Leia em Português](./README.pt-BR.md)

---

## What is Kairos Labs?

Kairos Labs is a full-stack web application serving as the institutional portal and demand validation hub for the technology solutions ecosystem — DevPrint, Elucya Talk, Ágora Global, Ascend and Talvrix.

The platform also functions as a **live engineering portfolio**, demonstrating production-grade practices: typed full-stack code, automated testing pipeline, SonarCloud quality gate, and zero-cost infrastructure.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Backend | Supabase (PostgreSQL + Auth + Row Level Security) |
| Forms | React Hook Form + Zod |
| Testing | Jest + React Testing Library + Playwright (E2E) |
| CI/CD | GitHub Actions + Vercel (Hobby Tier) |
| Quality | SonarCloud (Quality Gate enforced on every PR) |
| Commits | Husky + lint-staged (ESLint blocks commit on warnings) |

---

## Local Setup

**Prerequisites:** Node.js >= 22, npm >= 10, a [Supabase](https://supabase.com) account.

```bash
# 1. Clone the repository
git clone https://github.com/CabPiz/kairos-labs.git
cd kairos-labs

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials (URL, anon key, service role key)

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Database:** the app requires a Supabase project. In the Supabase SQL Editor, run [`supabase/migrations/001_schema.sql`](./supabase/migrations/001_schema.sql) — this single file creates all tables, enables RLS, sets grants, and creates the `get_dashboard_kpis()` function.

For the full setup guide, test commands, and contribution standards, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

**All Rights Reserved** — Cesar Antonio Brito Pizarro / Kairos Labs

Trademark registered with INPI, Process nº 944610498, Class 42.
External contributions are not accepted. See [LICENSE](./LICENSE) for details.
