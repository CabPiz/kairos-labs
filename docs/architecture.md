# Architecture — Kairos Labs

**Version:** 1.0.0
**Last updated:** 2026-08-08
**Stack:** Next.js 15 · Supabase · Vercel · GitHub Actions

---

## Overview

Kairos Labs is a statically-rendered public landing page with a server-rendered private founder dashboard. The architecture is optimized for zero infrastructure cost, maximum security, and full SEO indexability of the public surface.

---

## Component Map

```
app/
├── page.tsx                    ← Public landing page (Server Component, static)
├── layout.tsx                  ← Root layout (font, metadata)
├── robots.ts / sitemap.ts      ← SEO automation
├── solucoes/
│   ├── page.tsx                ← Solutions index (Server Component)
│   └── [slug]/page.tsx         ← Solution detail page (dynamic, Server Component)
└── admin/
    ├── page.tsx                ← Founder dashboard (Server Component, protected)
    ├── login/
    │   ├── page.tsx            ← Login page (Server Component)
    │   └── _components/
    │       └── LoginForm.tsx   ← Login form (Client Component — form interaction)
    └── logout/
        └── route.ts            ← Logout Route Handler

components/
├── sections/                   ← Public page sections (Server Components)
│   ├── Header.tsx
│   ├── HeroSection.tsx / HeroContent.tsx
│   ├── Products.tsx
│   ├── FeatureCards.tsx
│   ├── NavBar.tsx
│   └── Footer.tsx
├── waitlist/                   ← Lead capture (Client Components — modal + form)
│   ├── WaitlistModal.tsx
│   ├── WaitlistCTAButton.tsx
│   └── waitlist-action.ts      ← Server Action (INSERT to Supabase)
├── feedback/                   ← Suggestion capture (Client Components)
│   ├── FeedbackModal.tsx
│   ├── FeedbackCTAButton.tsx
│   └── feedback-action.ts      ← Server Action
├── admin/                      ← Dashboard widgets (Client Components — charts/tables)
│   ├── KPICard.tsx
│   ├── DemandChart.tsx
│   └── LeadsTable.tsx
└── ui/                         ← shadcn/ui primitives

lib/
├── supabase.ts                 ← Browser client (anon key, public insert only)
├── supabase-server.ts          ← Server clients (SSR + admin)
├── product-names.ts            ← Canonical product ID → display name mapping
└── types.ts                    ← Shared TypeScript interfaces
```

---

## Server vs Client Components

| Surface | Rendering | Reason |
|---|---|---|
| Landing page sections | **Server** | Static HTML, SEO-indexed, no interactivity needed |
| Waitlist modal / form | **Client** | User interaction, controlled input, optimistic UI |
| Feedback modal / form | **Client** | Same as above |
| `/admin` dashboard | **Server** | Data fetched server-side before render; no layout shift |
| Dashboard charts/table | **Client** | Recharts requires DOM access; data passed as props from server |
| Login form | **Client** | Form state, submission handling |

---

## Data Flow

### 1 — Visitor → Waitlist

```
Visitor
  │
  ├─ GET /  (static, CDN-cached)
  │     └─ Products section renders product cards
  │
  └─ clicks "Garantir Acesso Antecipado"
        │
        └─ WaitlistModal opens (Client Component)
              │
              └─ user submits email
                    │
                    └─ Server Action: waitlist-action.ts
                          │
                          └─ Supabase anon client
                                INSERT INTO waitlist (email, product_id)
                                RLS policy: "Allow public insert" (CHECK true)
                                │
                                └─ success toast ← user sees confirmation
```

### 2 — Founder → Dashboard

```
Founder
  │
  └─ GET /admin  (no session)
        │
        └─ middleware / server check → redirect to /admin/login
              │
              └─ LoginForm (Client Component)
                    │
                    └─ supabase.auth.signInWithPassword()
                          │
                          └─ Supabase Auth issues JWT
                                │
                                └─ redirect to /admin
                                      │
                                      └─ admin/page.tsx (Server Component)
                                            │
                                            ├─ supabase.rpc("get_dashboard_kpis")
                                            │     └─ SECURITY DEFINER function
                                            │           reads waitlist aggregate data
                                            │           without exposing raw table access
                                            │
                                            └─ renders KPICard + DemandChart + LeadsTable
                                                  (data passed as props → Client Components)
```

---

## Supabase Security Model

```
┌─────────────────────────────────────────────────────┐
│                     waitlist table                  │
│                                                     │
│  RLS: ENABLED                                       │
│                                                     │
│  Policy 1 — "Allow public insert"                   │
│    FOR INSERT: CHECK (true)                         │
│    → Any visitor can submit their email             │
│                                                     │
│  Policy 2 — "Founder-only access"                   │
│    FOR SELECT: auth.jwt()->>'email' = FOUNDER_EMAIL │
│    → Only the founder's authenticated session reads │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│             get_dashboard_kpis (RPC)                │
│                                                     │
│  SECURITY DEFINER                                   │
│  SET search_path = public                           │
│  GRANT EXECUTE TO authenticated                     │
│                                                     │
│  → Runs with function owner's privileges            │
│  → Returns only aggregated KPIs, never raw emails   │
│  → Prevents service_role from being used for reads  │
└─────────────────────────────────────────────────────┘
```

### Client selection rules

| Operation | Client used | Key |
|---|---|---|
| Public INSERT (waitlist/feedback) | `createBrowserClient` | `anon` |
| Dashboard reads (admin page) | `createServerSupabaseClient` + RPC | `anon` + JWT |
| Admin writes (future) | `createServerAdminClient` | `service_role` |

`service_role` is never used for read operations. It bypasses RLS entirely and is reserved exclusively for administrative writes that must skip row-level policies.

---

## CI/CD Pipeline

```
git push → GitHub
  │
  └─ GitHub Actions: ci.yml
        │
        ├─ npm ci --ignore-scripts
        ├─ eslint (0 warnings allowed)
        ├─ jest --coverage
        ├─ next build
        └─ SonarCloud analysis (Quality Gate must be green)
              │
              └─ Vercel deploy (automatic, on merge to main)
```

Pre-commit hook (Husky + lint-staged): ESLint runs on every `git commit` against staged `.ts`/`.tsx` files. Commit is blocked if any warning exists.

---

## Key Architectural Decisions

### App Router over Pages Router
Next.js 15 App Router enables granular Server/Client boundary control. Public pages are fully static (fast CDN delivery, perfect Lighthouse scores). The admin route fetches data server-side before the first paint, eliminating loading spinners on the dashboard.

### Supabase Free Tier as complete backend
PostgreSQL + Auth + RLS covers all MVP requirements at zero cost. RLS eliminates the need for a custom API layer — security is enforced at the database level, not the application layer.

### SECURITY DEFINER RPC for dashboard aggregations
Rather than granting the authenticated user direct SELECT on the waitlist table (which would expose all emails), the dashboard reads through a PostgreSQL function that returns only aggregated metrics. The function runs as its owner, not the caller.

### shadcn/ui over a full component library
shadcn/ui copies source into the repo. Components are owned, not imported — no dependency upgrades break the UI, and each component can be modified without forking.

### SonarCloud Quality Gate as merge blocker
No PR is merged with open Sonar issues. This keeps the codebase at a demonstrable professional standard, which is a core goal of the platform (the repo itself is a portfolio artifact).
