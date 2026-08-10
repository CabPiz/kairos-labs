export const dynamic = "force-dynamic";

import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Database } from "@/lib/types";
import { productNames } from "@/lib/product-names";
import { getMostDemandedProduct } from "@/lib/admin/analytics";
import { translateFeedbacksForDisplay } from "@/lib/admin/translate-feedback";
import { type Locale } from "@/i18n/routing";
import { KPICard } from "@/components/admin/KPICard";
import { DemandChart } from "@/components/admin/DemandChart";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];
type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

interface DashboardKpis {
  all_leads: WaitlistRow[];
  recent_count: number;
  all_feedback: FeedbackRow[];
}

export default async function AdminPage() {
  const [supabase, t, locale] = await Promise.all([
    createServerSupabaseClient(),
    getTranslations("admin"),
    getLocale(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc("get_dashboard_kpis");
  const kpis = (data ?? { all_leads: [], recent_count: 0, all_feedback: [] }) as DashboardKpis;

  const allLeads: WaitlistRow[] = kpis.all_leads ?? [];
  const recentCount: number = kpis.recent_count ?? 0;
  const sugestoes: FeedbackRow[] = kpis.all_feedback ?? [];

  const topProduct = getMostDemandedProduct(allLeads);

  const feedbacksToTranslate = sugestoes.filter((s) => s.mensagem_locale !== locale);
  const translationMap =
    feedbacksToTranslate.length > 0
      ? await translateFeedbacksForDisplay(feedbacksToTranslate, locale as Locale)
      : new Map<string, string>();

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

      <section>
        <h2 className="m-0 mb-5 text-[0.72rem] font-bold tracking-[0.22em] uppercase text-white/35">
          {t("feedbackSection", { count: sugestoes.length })}
        </h2>

        {sugestoes.length === 0 && (
          <p className="text-white/35 text-[0.88rem]">
            {t("noFeedback")}
          </p>
        )}

        {sugestoes.length > 0 && (
          <div className="flex flex-col gap-4 max-w-[860px]">
            {sugestoes.map((s) => {
              const displayText = translationMap.get(s.id) ?? s.mensagem;
              return (
                <div
                  key={s.id}
                  className="bg-white/[0.03] border border-[rgba(59,130,246,0.14)] rounded-[10px] px-6 py-5"
                >
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-[0.68rem] font-bold tracking-[0.14em] uppercase text-[#d4a017] bg-[rgba(212,160,23,0.12)] border border-[rgba(212,160,23,0.3)] rounded-[4px] px-[0.6rem] py-[0.2rem]">
                      {productNames[s.product_id] ?? s.product_id}
                    </span>
                    <span className="text-white/30 text-[0.78rem]">
                      {new Date(s.created_at).toLocaleString(locale)}
                    </span>
                    {s.mensagem_locale && s.mensagem_locale !== locale && (
                      <span className="text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-white/30 border border-white/[0.1] rounded-[3px] px-[0.45rem] py-[0.15rem]">
                        {s.mensagem_locale.toUpperCase()}
                      </span>
                    )}
                    {s.nome && (
                      <span className="text-white/55 text-[0.78rem]">
                        {s.nome}
                      </span>
                    )}
                    {s.email && (
                      <span className="text-white/40 text-[0.78rem]">
                        {s.email}
                      </span>
                    )}
                  </div>
                  <p className="m-0 text-white/70 text-[0.88rem] leading-[1.7] whitespace-pre-wrap">
                    {displayText}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
