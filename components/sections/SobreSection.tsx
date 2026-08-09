import { useTranslations } from "next-intl";

const pillarKeys = ["missao", "abordagem", "qualidade"] as const;

export function SobreSection() {
  const t = useTranslations("sobre");

  return (
    <section id="sobre" className="px-4 sm:px-10 py-20" style={{ backgroundColor: "#060c1a" }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <p className="mb-3 text-[#d4a017] text-[0.75rem] font-bold tracking-[0.22em] uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="mb-4 font-[var(--font-orbitron),sans-serif] font-extrabold tracking-[0.04em] uppercase leading-[1.15] text-[clamp(1.6rem,2.5vw,2.2rem)] text-white">
            {t("title")}
          </h2>
          <p className="text-white/55 text-base leading-[1.7] max-w-[560px]">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pillarKeys.map((key) => (
            <div
              key={key}
              className="rounded-xl p-7 flex flex-col gap-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <h3
                className="font-[var(--font-orbitron),sans-serif] text-[0.85rem] font-bold tracking-[0.08em] uppercase"
                style={{ color: "#d4a017" }}
              >
                {t(`pillars.${key}.title`)}
              </h3>
              <p className="text-white/55 text-[0.88rem] leading-[1.7]">
                {t(`pillars.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-3 text-white/30 text-[0.72rem] tracking-[0.14em] uppercase">
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ background: "#d4a017", boxShadow: "0 0 6px #d4a017" }}
          />{" "}
          {t("marca")}
        </div>
      </div>
    </section>
  );
}
