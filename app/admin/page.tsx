export const dynamic = "force-dynamic";

import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/lib/supabase-server";
import type { Database, FeedbackWithMeta } from "@/lib/types";
import { getMostDemandedProduct } from "@/lib/admin/analytics";
import { KPICard } from "@/components/admin/KPICard";
import { DemandChart } from "@/components/admin/DemandChart";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { FeedbackList } from "@/components/admin/FeedbackList";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];

interface DashboardKpis {
  all_leads: WaitlistRow[];
  recent_count: number;
}

export default async function AdminPage() {
  const [supabase, t, locale] = await Promise.all([
    createServerSupabaseClient(),
    getTranslations("admin"),
    getLocale(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc("get_dashboard_kpis");
  const kpis = (data ?? { all_leads: [], recent_count: 0 }) as DashboardKpis;

  const allLeads: WaitlistRow[] = kpis.all_leads ?? [];
  const recentCount: number = kpis.recent_count ?? 0;

  const adminClient = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: feedbackData } = await (adminClient as any).rpc("get_feedback_with_meta");
  const sugestoes: FeedbackWithMeta[] = (feedbackData ?? []) as FeedbackWithMeta[];

  const topProduct = getMostDemandedProduct(allLeads);

  return (
    <main
      className="min-h-screen bg-[#050a14] text-white px-10 py-12"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="flex items-start justify-between mb-8 gap-3">
        <h1
          className="m-0 text-[1.2rem] font-black tracking-[0.06em] uppercase text-[#d4a017]"
          style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
        >
          {t("title")}
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          <AdminLanguageSwitcher />
          <Link
            href="/admin/logout"
            prefetch={false}
            className="text-xs font-semibold tracking-[0.08em] uppercase text-white/40 no-underline border border-white/[0.12] rounded-[6px] px-[0.9rem] py-[0.4rem]"
          >
            {t("signOut")}
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="m-0 mb-5 text-[0.72rem] font-bold tracking-[0.22em] uppercase text-white/35">
          {t("kpis")}
        </h2>
        <div className="flex gap-5 flex-wrap">
          <KPICard
            label={t("kpi.totalWaitlist")}
            value={allLeads.length}
            sublabel={t("kpi.totalWaitlistSub")}
          />
          <KPICard
            label={t("kpi.last7days")}
            value={recentCount}
            sublabel={t("kpi.last7daysSub")}
          />
          <KPICard
            label={t("kpi.topDemand")}
            value={topProduct}
            sublabel={t("kpi.topDemandSub")}
            highlight
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="m-0 mb-5 text-[0.72rem] font-bold tracking-[0.22em] uppercase text-white/35">
          {t("demandSection")}
        </h2>
        <DemandChart leads={allLeads} />
      </section>

      <section className="mb-12">
        <h2 className="m-0 mb-5 text-[0.72rem] font-bold tracking-[0.22em] uppercase text-white/35">
          {t("leadsSection")}
        </h2>
        <LeadsTable leads={allLeads} />
      </section>

      <section className="mb-12">
        <h2 className="m-0 mb-5 text-[0.72rem] font-bold tracking-[0.22em] uppercase text-white/35">
          {t("feedbackSection", { count: sugestoes.length })}
        </h2>
        <FeedbackList
          feedbacks={sugestoes}
          locale={locale}
          noFeedbackText={t("noFeedback")}
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="m-0 text-[0.72rem] font-bold tracking-[0.22em] uppercase text-white/35">
            {t("contactsSection")}
          </h2>
          <Link
            href="/admin/contacts"
            prefetch={false}
            className="text-[0.7rem] font-semibold tracking-[0.1em] text-blue-400/70 hover:text-blue-300 no-underline transition-colors"
          >
            {t("viewContacts")}
          </Link>
        </div>
      </section>
    </main>
  );
}
