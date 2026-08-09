const stack = [
  {
    name: "Next.js 15",
    category: "Framework",
    description: "App Router, Server Components e Server Actions — renderização híbrida com performance máxima.",
    color: "#ffffff",
  },
  {
    name: "TypeScript",
    category: "Linguagem",
    description: "Tipagem estrita end-to-end. Menos bugs em produção, refatoração segura, DX superior.",
    color: "#3178c6",
  },
  {
    name: "Supabase",
    category: "Backend & Banco",
    description: "PostgreSQL gerenciado com RLS nativo, Auth, Storage e funções SECURITY DEFINER.",
    color: "#3ecf8e",
  },
  {
    name: "Tailwind CSS",
    category: "Estilo",
    description: "Utility-first com design system próprio — consistência visual sem overhead de CSS global.",
    color: "#38bdf8",
  },
  {
    name: "Playwright",
    category: "Testes E2E",
    description: "Suite completa de testes end-to-end em ambiente de produção (Vercel Preview).",
    color: "#e2552c",
  },
  {
    name: "SonarCloud",
    category: "Qualidade",
    description: "Quality Gate obrigatório: zero issues por PR, cobertura de testes e análise de segurança.",
    color: "#cb6015",
  },
];

export function TecnologiaSection() {
  return (
    <section
      id="tecnologia"
      className="px-4 sm:px-10 py-20"
      style={{ backgroundColor: "#050a14" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <p className="mb-3 text-[#d4a017] text-[0.75rem] font-bold tracking-[0.22em] uppercase">
            Stack técnica
          </p>
          <h2 className="mb-4 font-[var(--font-orbitron),sans-serif] font-extrabold tracking-[0.04em] uppercase leading-[1.15] text-[clamp(1.6rem,2.5vw,2.2rem)] text-white">
            Tecnologia
          </h2>
          <p className="text-white/55 text-base leading-[1.7] max-w-[520px]">
            Escolhemos cada ferramenta com critério. Nossa stack garante
            segurança, observabilidade e velocidade de entrega sem abrir mão da
            manutenibilidade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stack.map(({ name, category, description, color }) => (
            <div
              key={name}
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
                  {category}
                </span>
              </div>
              <p className="text-white/50 text-[0.85rem] leading-[1.65]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
