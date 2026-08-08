# PRD — Kairos Labs Landing Page & Founder Analytics
**Product Requirements Document**
Version: 1.2.0
Status: Ready for Execution
Last updated: 2026-08-08

---

## 1. Product Vision

**Kairos Labs** is the institutional portal, innovation showcase, and **demand validation hub** for the technology solutions ecosystem founded by Cesar Antonio Brito Pizarro.

The platform serves five strategic pillars:
1. **Public Brand Proof:** Guaranteed commercial presence and public use of the trademark registered with INPI (Process nº 944610498).
2. **Solutions Showcase & Portfolio:** Clear presentation of the ecosystem of products under development.
3. **Segmented Lead Capture (Waitlist per Product):** Converting visitors into waiting lists specific to each product in the ecosystem.
4. **Founder Dashboard (Founder Analytics):** Private panel protected by authentication for the founder to visualize real-time metrics, comparing demand across applications to guide development priority.
5. **DevPrint Integration Platform (Roadmap):** Future capability to consume product data directly from the DevPrint API, transforming Kairos Labs into a reusable portfolio platform for any developer.

---

## 2. Target Audience & Access Levels

### External Audience
- **Technical Recruiters and Tech Leads:** Evaluate software architecture, commit standards, code quality, and the founder's engineering skills through the public repository.
- **Potential Clients and Beta Testers:** Interested users who register on the waiting list for their product of choice.

### Internal Audience (Administrative)
- **Founder (Cesar Pizarro):** The sole authorized user to access the restricted `/admin` area to monitor waitlist volume and make strategic roadmap decisions based on data.

---

## 3. Core Value Proposition

> "Modern software engineering and data-driven decision making: prioritizing the development of solutions where real market demand exists."

---

## 4. MVP Features (Version 1.2.0)

### 4.1 Header & Hero Section (Public)
- **Branding:** Display of the official **Kairos Labs** logo and registered trade name.
- **Impactful Headline:** Value proposition focused on the technology ecosystem.
- **Status Badges:** Visual indicator of trademark filed with INPI.

### 4.2 Product Showcase & Segmented Capture (Public)

Interactive cards on both the landing page (`/`) and the solutions index (`/solucoes`), covering all ecosystem products:

| Product | Description |
|---|---|
| **DevPrint** | Living resume and verifiable portfolio platform. |
| **Ascend** | Adaptive preparation platform for high-paying remote tech roles. |
| **Elucya Talk** | AI-based platform for analysis and improvement of interpersonal communication. |
| **Plataforma Ágora Global** | Open-source public governance and citizen participation system. |
| **Talvrix** | AI-powered SaaS for intelligent resume-to-job matching across multiple sites. |
| **Kairos Labs** | The institutional portal and central demand validation hub. |

**Capture Behavior:**
- Each card on the landing page has its own *"Guarantee Early Access"* button linked to the segmented waitlist.
- Each card links to a dedicated detail page (`/solucoes/[slug]`) with full PRD content and CTAs.
- The registration modal sends the user's email to the database linked to the corresponding **`product_id`**.

### 4.3 Founder Dashboard (`/admin`) (Private / Restricted)
- **Secure Authentication:** Exclusive login via Supabase Auth (founder email/password).
- **Key Metrics (KPIs):**
  - Total waitlist subscribers overall.
  - Ranking of most demanded products (Bar chart / Demand ranking).
  - Weekly subscriber growth rate.
- **Leads Table:** Detailed list of registered emails, product of interest, and registration date, with CSV export option.

### 4.4 Footer & Institutional Transparency (Public)
- **Brand Data:** INPI process indication (`Process nº 944610498`).
- **Social Links:** GitHub, LinkedIn, and contact email.

---

## 5. Architecture & Tech Stack (100% Zero Cost)

### Frontend
- **Next.js 15 (App Router):** Enables static rendering for public pages (fast SEO) and protected Server Components for the admin route.
- **Tailwind CSS v4 + shadcn/ui:** Modern, responsive interface with accessible components.
- **Recharts / Lucide React:** Lightweight charting library for the metrics dashboard.

### Product Data Layer
- **`lib/products/`:** Single Source of Truth for all product data. The `getProducts()` function is the integration seam — today it returns a static array; in the future it will fetch from the DevPrint API with zero breaking changes to consuming components.

### Backend & Database
- **Supabase (Free Tier):**
  - **Database (PostgreSQL):** `waitlist` table (id, email, product_id, created_at).
  - **Auth:** Protection of the `/admin` route.
  - **Row Level Security (RLS):**
    - *Insert (Public):* Any visitor can insert a new email into the waiting list.
    - *Select (Private):* Only the authenticated founder email can read table data.

### Hosting & CI/CD
- **Vercel (Hobby Tier):** Automatic deploy connected to GitHub with free SSL/HTTPS and secure environment variables for Supabase keys.

---

## 6. Database Schema (Supabase / Postgres)

```sql
-- Waitlist Table
CREATE TABLE public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Founder-only access" ON public.waitlist
  FOR SELECT USING (auth.jwt() ->> 'email' = 'YOUR_EMAIL_HERE');
```

---

## 7. DevPrint Integration Platform (Roadmap)

### Vision

The current architecture anticipates a future where product data no longer lives in a static file but is consumed from the **DevPrint API** — a platform that reads GitHub repositories and generates structured product/portfolio data automatically.

This opens two business models:

| Model | Description |
|---|---|
| **Self-hosted** | Any developer can clone the Kairos Labs site, connect their DevPrint account, and automatically display their own GitHub projects as product cards — no manual data entry. |
| **Hosted Portfolio** | Developers without their own site subscribe to Kairos Labs as a white-label portfolio hosting service powered by DevPrint data. |

### Integration Point

The function `getProducts()` in `lib/products/index.tsx` is the seam. Today:

```ts
export function getProducts(): Product[] {
  return products; // static array
}
```

Post-DevPrint integration:

```ts
export async function getProducts(): Promise<Product[]> {
  return fetch("https://api.devprint.io/v1/products", {
    next: { revalidate: 3600 },
  }).then((r) => r.json());
}
```

All consuming components (`app/page.tsx`, `app/solucoes/page.tsx`, `app/solucoes/[slug]/page.tsx`, `DemandChart`) require **zero changes** — they call `getProducts()` and render whatever it returns.

---

## 8. Intellectual Property & License

- Source code: All Rights Reserved — Cesar Antonio Brito Pizarro
- Trademark: Registered with INPI, Process nº 944610498, Class 42
- External contributions: not accepted via Pull Request. Suggestions should be submitted through the site's interface and are incorporated at the founder's sole discretion.
