# Kairos Labs

[![CI](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml/badge.svg)](https://github.com/CabPiz/kairos-labs/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=alert_status)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=CabPiz_kairos-labs&metric=coverage)](https://sonarcloud.io/summary/overall?id=CabPiz_kairos-labs)
![INPI](https://img.shields.io/badge/Marca_Registrada_INPI-Proc._944610498-16a34a?style=flat)

> Institutional portal, innovation showcase, and demand validation hub for a technology solutions ecosystem — DevPrint, Elucya Talk, Ágora Global, Ascend and Talvrix.

🇧🇷 [Leia em Português](./README.pt-BR.md)

---

## What is Kairos Labs?

Kairos Labs is a full-stack web application built to serve two audiences simultaneously:

- **Public visitors** — browse a product showcase and join segmented waitlists for each solution under development.
- **The founder** — access a private analytics dashboard (`/admin`) to track waitlist growth per product and make data-driven decisions on which solution to build first.

The platform also functions as a **live engineering portfolio**, demonstrating production-grade practices: typed full-stack code, automated testing pipeline, SonarCloud quality gate, and zero-cost infrastructure.

---

## Value Proposition

> "Modern software engineering and data-driven decision making: prioritizing the development of solutions where real market demand exists."

The core thesis: before writing a line of product code, validate which product the market actually wants. Kairos Labs is the instrument for that validation.

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

## Folder Structure

```
kairos-labs/
├── app/                    # Next.js App Router — pages and layouts
│   ├── admin/              # Protected founder dashboard (/admin)
│   │   └── login/          # Supabase Auth login page
│   ├── solucoes/           # Public product pages (/solucoes/[slug])
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   └── page.tsx            # Landing page (Hero, Products, Footer)
├── components/             # Shared React components
│   └── ui/                 # Reusable primitives (modals, banners, charts)
├── lib/                    # Utilities, Supabase clients, Server Actions
├── e2e/                    # Playwright E2E specs
├── __tests__/              # Jest + RTL unit tests
├── supabase/               # Database migrations and seed scripts
├── docs/                   # Project documentation
│   ├── PRD.md              # Product Requirements Document
│   └── CONTRIBUTING.pt-BR.md
└── .github/workflows/      # CI/CD pipeline (ci.yml)
```

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

> **Database:** the app requires a Supabase project with the schema described in [`docs/PRD.md`](./docs/PRD.md#6-database-schema-supabase--postgres). A ready-to-run migration script is tracked as a [known issue](https://github.com/CabPiz/kairos-labs/issues).

For the full setup guide, test commands, and contribution standards, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Product Requirements

The full PRD — product vision, feature specs, database schema, and RLS policies — is available at [`docs/PRD.md`](./docs/PRD.md).

---

## License

**All Rights Reserved** — Cesar Antonio Brito Pizarro / Kairos Labs

Trademark registered with INPI, Process nº 944610498, Class 42.
External contributions are not accepted. See [LICENSE](./LICENSE) for details.
