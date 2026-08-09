const pillars = [
  {
    title: "Missão",
    description:
      "Construir produtos digitais que resolvem problemas reais com tecnologia de ponta, segurança nativa e experiência excepcional.",
  },
  {
    title: "Abordagem",
    description:
      "Cada solução nasce de uma análise profunda do problema. Priorizamos arquitetura limpa, performance e manutenibilidade a longo prazo.",
  },
  {
    title: "Qualidade",
    description:
      "Cobertura de testes, análise estática, CI/CD e revisão contínua de código fazem parte do nosso processo desde o primeiro commit.",
  },
];

export function SobreSection() {
  return (
    <section
      id="sobre"
      className="px-4 sm:px-10 py-20"
      style={{ backgroundColor: "#060c1a" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-12">
          <p className="mb-3 text-[#d4a017] text-[0.75rem] font-bold tracking-[0.22em] uppercase">
            Quem somos
          </p>
          <h2 className="mb-4 font-[var(--font-orbitron),sans-serif] font-extrabold tracking-[0.04em] uppercase leading-[1.15] text-[clamp(1.6rem,2.5vw,2.2rem)] text-white">
            Sobre a Kairos Labs
          </h2>
          <p className="text-white/55 text-base leading-[1.7] max-w-[560px]">
            Somos um laboratório de tecnologia especializado em desenvolvimento
            de software sob medida — com foco em SaaS, automação e inteligência
            de dados para empresas que precisam de soluções sólidas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {pillars.map(({ title, description }) => (
            <div
              key={title}
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
                {title}
              </h3>
              <p className="text-white/55 text-[0.88rem] leading-[1.7]">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-10 flex items-center gap-3 text-white/30 text-[0.72rem] tracking-[0.14em] uppercase"
        >
          <span
            className="inline-block w-[6px] h-[6px] rounded-full"
            style={{ background: "#d4a017", boxShadow: "0 0 6px #d4a017" }}
          />{" "}
          Marca Registrada · INPI Nº 944610498
        </div>
      </div>
    </section>
  );
}
