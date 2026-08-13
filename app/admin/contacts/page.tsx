export const dynamic = "force-dynamic";

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createServerAdminClient } from "@/lib/supabase-server";
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher";
import { ContactsClient } from "./_components/ContactsClient";
import type { Database } from "@/lib/types";

type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];
type ContactAttachment = Database["public"]["Tables"]["contact_attachments"]["Row"];

export default async function AdminContactsPage() {
  const supabase = createServerAdminClient();
  const t = await getTranslations("admin");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: contactsData } = await (supabase as any)
    .from("contact_requests")
    .select("*, contact_attachments(*)")
    .order("created_at", { ascending: false });

  const contacts = ((contactsData ?? []) as (ContactRequest & { contact_attachments: ContactAttachment[] })[]).map(
    ({ contact_attachments, ...c }) => ({ ...c, attachments: contact_attachments ?? [] })
  );

  return (
    <main
      className="min-h-screen bg-[#050a14] text-white px-10 py-12"
      style={{ fontFamily: "var(--font-inter), sans-serif" }}
    >
      <div className="flex items-start justify-between mb-8 gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            prefetch={false}
            className="text-white/30 text-xs font-semibold tracking-[0.08em] uppercase no-underline hover:text-white/60 transition-colors"
          >
            ← Dashboard
          </Link>
          <h1
            className="m-0 text-[1.2rem] font-black tracking-[0.06em] uppercase text-[#d4a017]"
            style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
          >
            {t("contacts.title")}
          </h1>
        </div>
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

      <ContactsClient contacts={contacts} />
    </main>
  );
}
