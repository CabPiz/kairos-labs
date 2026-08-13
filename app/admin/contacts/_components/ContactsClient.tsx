"use client";

import { useState } from "react";
import { Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";
import { ContactDrawer } from "./ContactDrawer";
import type { Database } from "@/lib/types";

type ContactRequest = Database["public"]["Tables"]["contact_requests"]["Row"];
type ContactAttachment = Database["public"]["Tables"]["contact_attachments"]["Row"];
type ContactWithAttachments = ContactRequest & { attachments: ContactAttachment[] };

type StatusFilter = "all" | "novo" | "visualizado" | "respondido";

interface ContactsClientProps {
  readonly contacts: ContactWithAttachments[];
}

const STATUS_FILTERS: StatusFilter[] = ["all", "novo", "visualizado", "respondido"];

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  novo: { text: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)" },
  visualizado: { text: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" },
  respondido: { text: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
};

export function ContactsClient({ contacts }: ContactsClientProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedContact, setSelectedContact] = useState<ContactWithAttachments | null>(null);
  const [localStatuses, setLocalStatuses] = useState<Record<string, ContactRequest["status"]>>({});

  const filtered = contacts.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      q === "" ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  function handleOpenContact(contact: ContactWithAttachments) {
    setSelectedContact(contact);
    if (contact.status === "novo") {
      setLocalStatuses((prev) => ({ ...prev, [contact.id]: "visualizado" }));
    }
  }

  function getEffectiveStatus(contact: ContactWithAttachments): ContactRequest["status"] {
    return localStatuses[contact.id] ?? contact.status;
  }

  return (
    <>
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className="text-[0.68rem] font-bold tracking-[0.12em] uppercase rounded-[5px] px-3 py-1.5 transition-colors"
              style={{
                background: statusFilter === f ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                border: statusFilter === f ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                color: statusFilter === f ? "#60a5fa" : "rgba(255,255,255,0.4)",
              }}
            >
              {t(`contacts.filter.${f}`)}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("contacts.searchPlaceholder")}
          className="bg-white/5 border border-white/10 rounded px-3 py-1.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-blue-500/60 transition-colors w-full sm:w-64"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-white/35 text-[0.88rem]">{t("contacts.noContacts")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm" style={{ minWidth: "640px" }}>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {(["colName", "colEmail", "colType", "colMessage", "colDate", "colStatus", "colAttachments"] as const).map((col) => (
                  <th
                    key={col}
                    className="text-left text-[0.65rem] font-bold tracking-[0.16em] uppercase text-white/30 pb-3 pr-4 last:pr-0"
                  >
                    {t(`contacts.${col}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => {
                const status = getEffectiveStatus(contact);
                const colors = STATUS_COLORS[status] ?? STATUS_COLORS.visualizado;
                return (
                  <tr
                    key={contact.id}
                    onClick={() => handleOpenContact(contact)}
                    className="border-b border-white/[0.04] cursor-pointer transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-4 text-white/80 font-medium">{contact.name}</td>
                    <td className="py-3 pr-4 text-white/50 text-xs">{contact.email}</td>
                    <td className="py-3 pr-4 text-white/40 text-xs">{contact.project_type}</td>
                    <td className="py-3 pr-4 text-white/50 text-xs max-w-[200px] truncate">
                      {contact.description}
                    </td>
                    <td className="py-3 pr-4 text-white/30 text-xs whitespace-nowrap">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className="text-[0.62rem] font-bold tracking-[0.12em] uppercase rounded-[4px] px-[0.55rem] py-[0.18rem]"
                        style={{ color: colors.text, background: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        {t(`contacts.status.${status}`)}
                      </span>
                    </td>
                    <td className="py-3">
                      {contact.attachments.length > 0 ? (
                        <span className="flex items-center gap-1 text-white/40 text-xs">
                          <Paperclip size={11} />{" "}{contact.attachments.length}
                        </span>
                      ) : (
                        <span className="text-white/15 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ContactDrawer
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </>
  );
}
