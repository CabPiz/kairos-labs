import { useTranslations } from "next-intl";

const stackKeys = [
  { key: "nextjs", name: "Next.js 15", color: "#ffffff" },
  { key: "typescript", name: "TypeScript", color: "#3178c6" },
  { key: "supabase", name: "Supabase", color: "#3ecf8e" },
  { key: "tailwind", name: "Tailwind CSS", color: "#38bdf8" },
  { key: "playwright", name: "Playwright", color: "#e2552c" },
  { key: "sonarcloud", name: "SonarCloud", color: "#cb6015" },
] as const;

export function TecnologiaSection() {
  const t = useTranslations("tecnologia");

  return (
    <section
      id="tecnologia"
      className="px-4 sm:px-10 py-20"
      style={{ backgroundColor: "#050a14" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <p className="mb-3 text-[#d4a017] text-[0.75rem] font-bold tracking-[0.22em] uppercase">
            {t("eyebrow")}
          </p>
          <h2 className="mb-4 font-[var(--font-orbitron),sans-serif] font-extrabold tracking-[0.04em] uppercase leading-[1.15] text-[clamp(1.6rem,2.5vw,2.2rem)] text-white">
            {t("title")}
          </h2>
          <p className="text-white/55 text-base leading-[1.7] max-w-[520px]">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stackKeys.map(({ key, name, color }) => (
            <div
              key={key}
              className="rounded-xl p-6 flex flex-col gap-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${color}22`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-[var(--font-orbitron),sans-serif] text-[0.9rem] font-bold tracking-[0.05em]"
                  style={{ color }}
                >
                  {name}
                </span>
                <span
                  className="text-[0.65rem] font-semibold tracking-[0.14em] uppercase rounded px-2 py-[0.2rem]"
                  style={{
                    color: `${color}cc`,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  {t(`stack.${key}.category`)}
                </span>
              </div>
              <p className="text-white/50 text-[0.85rem] leading-[1.65]">
                {t(`stack.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
