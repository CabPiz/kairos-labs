import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { WaitlistCTAButton } from "@/components/waitlist/WaitlistCTAButton";
import { FeedbackCTAButton } from "@/components/feedback/FeedbackCTAButton";

// ─────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────
interface Produto {
  nome: string;
  tagline: string;
  cor: string;
  status: string;
  statusTipo: "ativo" | "breve";
  descricaoLonga: string;
  problema: string;
  solucao: string;
  funcionalidades: { titulo: string; descricao: string }[];
  stack?: string[];
  publicoAlvo?: string[];
  cta: string;
}

// ─────────────────────────────────────────────────────────────
// Dados por slug (extraídos dos PRDs)
// ─────────────────────────────────────────────────────────────
const produtos: Record<string, Produto> = {
  devprint: {
    nome: "DevPrint",
    tagline: "Seu currículo cresce com você.",
    cor: "#4a90e2",
    status: "Em breve",
    statusTipo: "breve",
    descricaoLonga:
      "Plataforma web que transforma o histórico real de desenvolvimento de um programador — commits, pull requests, diffs e registros manuais de aprendizado — em um currículo vivo, narrativo e auto-atualizável, validado por evidências reais de trabalho.",
    problema:
      "Currículos estáticos não refletem o crescimento real, especialmente em projetos privados e de longa duração. Recrutadores leem afirmações não verificáveis, sem evidências reais do que o dev aprendeu e construiu.",
    solucao:
      "O DevPrint lê seu repositório, integra registros manuais de aprendizado e atualiza seu currículo automaticamente, sprint a sprint. Em vez de autodeclaração, o recrutador vê experiências rastreáveis — o que foi aprendido, em qual projeto e com qual evidência.",
    funcionalidades: [
      {
        titulo: "Currículo Vivo Auto-Atualizável",
        descricao:
          "A seção de experiências é atualizada automaticamente com base nos projetos analisados. Cada experiência vem com referência rastreável ao código ou ao Diário de Aprendizado.",
      },
      {
        titulo: "Diário de Aprendizado",
        descricao:
          "Registre aprendizados que não geram commits: gestão de Kanban, criação de PRD, decisões de arquitetura, configuração de ferramentas. Eles aparecem na linha do tempo com o mesmo peso que os commits.",
      },
      {
        titulo: "Análise de Evolução por Projeto",
        descricao:
          "Para cada repositório conectado, o sistema detecta o que foi praticado, o que foi aprendido de novo e gera uma linha do tempo por sprint com destaques narrativos em linguagem natural.",
      },
      {
        titulo: "Perfil Público Verificável",
        descricao:
          "URL pública em devprint.io/username. O dev controla o que é visível. Repositórios privados nunca aparecem — apenas as experiências derivadas, se autorizado.",
      },
    ],
    stack: ["Next.js 15", "TypeScript", "Tailwind CSS v4", "Supabase", "GitHub API", "Gemini API"],
    publicoAlvo: [
      "Dev sem experiência de mercado que quer provar capacidade com projetos reais",
      "Dev em transição de stack que precisa comprovar o que aprendeu",
      "Dev júnior/pleno acelerando para posições sênior",
      "Dev sênior com anos de projetos privados não visíveis no GitHub",
    ],
    cta: "Garantir Acesso Antecipado",
  },

  ascend: {
    nome: "Ascend",
    tagline: "Acelere sua evolução técnica.",
    cor: "#10b981",
    status: "Em breve",
    statusTipo: "breve",
    descricaoLonga:
      "Plataforma de preparação adaptativa de alto desempenho para concursos públicos e seleções de TI de alta remuneração e modalidade 100% remota. O Ascend cruza seu perfil com os editais das vagas-alvo e gera um plano personalizado de evolução.",
    problema:
      "Candidatos estudam sem saber exatamente o que falta. O gap entre o currículo atual e o exigido pela vaga-alvo raramente é mapeado com precisão — o resultado é desperdício de tempo e energia nos estudos.",
    solucao:
      "O Ascend lê seu currículo, identifica a vaga de alto rendimento desejada e cruza automaticamente seus dados com o edital para gerar um plano de melhoria de skills, indicações de pós-graduação e alertas sobre as pegadinhas da banca.",
    funcionalidades: [
      {
        titulo: "Onboarding Inteligente",
        descricao:
          "Wizard em 3 passos: upload do perfil profissional, escolha da vaga-alvo e geração do plano estratégico de evolução com base no cruzamento entre perfil e edital.",
      },
      {
        titulo: "Análise de Gap por IA",
        descricao:
          "A IA identifica exatamente quais habilidades faltam para a vaga escolhida, priorizando o que tem maior peso na seleção da banca (ex: Cebraspe).",
      },
      {
        titulo: "Trilhas Personalizadas",
        descricao:
          "Planos de estudo adaptativos com metas, prazos baseados no calendário do edital e evidências de progresso registradas ao longo da preparação.",
      },
      {
        titulo: "Alertas de Edital e Banca",
        descricao:
          "Contagem regressiva para prazos de inscrição e alertas sobre padrões recorrentes da banca escolhida — o que costuma cair, como as questões são formuladas e onde os candidatos erram mais.",
      },
    ],
    stack: ["Next.js", "React 19", "Tailwind CSS v4", "Google Gemini API"],
    publicoAlvo: [
      "Profissionais de TI mirando concursos de alta remuneração e regime remoto",
      "Candidatos que querem saber exatamente o que estudar, sem desperdício",
      "Devs em transição para o setor público",
    ],
    cta: "Garantir Acesso Antecipado",
  },

  "elucya-talk": {
    nome: "Elucya Talk",
    tagline: "Comunicação inteligente por IA.",
    cor: "#8b5cf6",
    status: "Em breve",
    statusTipo: "breve",
    descricaoLonga:
      "Plataforma web baseada em IA que analisa conversas interpessoais — via áudio ou texto — identificando padrões de comunicação tóxica, agressividade, manipulação e violência verbal, com feedback empático e recomendações práticas de Comunicação Não-Violenta.",
    problema:
      "Em relacionamentos pessoais, profissionais e familiares, conflitos verbais escalam por padrões não percebidos. As partes envolvidas têm dificuldade de avaliar a dinâmica de forma isenta, e agressões passivas ou manipulações raramente são catalogadas.",
    solucao:
      "O Elucya Talk atua como um mediador isento alimentado por IA: processa o áudio ou texto, diariza os participantes, classifica cada fala segundo padrões comportamentais, calcula um Índice de Conflito de 0 a 100 e oferece feedback educativo individualizado com dicas práticas de CNV.",
    funcionalidades: [
      {
        titulo: "Transcrição com Diarização",
        descricao:
          "Conversão automática de áudio em texto com separação por locutor (Whisper / AssemblyAI). Cada fala é associada ao participante correto e exibida em uma timeline cronológica.",
      },
      {
        titulo: "Classificação de Padrões Verbais",
        descricao:
          "Identificação de: tom agressivo, ameaça, agressão passiva, linguagem de culpa, generalizações ('você sempre'), esquiva, ironia velada, interrupções e escuta ativa.",
      },
      {
        titulo: "Gauge de Conflito (0 a 100)",
        descricao:
          "Índice visual calculado por IA que representa o nível geral de conflito da conversa, com destaque dos picos e trechos de maior tensão.",
      },
      {
        titulo: "Feedback Empático por Participante",
        descricao:
          "Cards individuais com diagnóstico de tom predominante, pontos positivos detectados e recomendações práticas baseadas nos princípios da Comunicação Não-Violenta.",
      },
    ],
    stack: ["Next.js 16", "React 19", "Tailwind CSS v4", "Whisper / AssemblyAI", "OpenAI GPT-4o / Anthropic Claude"],
    publicoAlvo: [
      "Pessoas que buscam autoconhecimento em suas dinâmicas de comunicação",
      "Terapeutas de casal e mediadores familiares que precisam de análise objetiva",
      "Gestores de RH avaliando clima e denúncias de assédio em ambientes corporativos",
    ],
    cta: "Garantir Acesso Antecipado",
  },

  "agora-global": {
    nome: "Plataforma Ágora Global",
    tagline: "Governança democrática para a era digital.",
    cor: "#f59e0b",
    status: "Em breve",
    statusTipo: "breve",
    descricaoLonga:
      "Sistema open-source de governança pública digital que transforma a participação cidadã e a transparência orçamentária em pilares reais do Estado. Cada nação hospeda sua própria instância soberana, interoperável com uma rede global de democracias digitais.",
    problema:
      "O principal obstáculo para o desenvolvimento humano integral não é tecnológico ou econômico — é o conflito de interesses políticos que gera corrupção estrutural, inércia legislativa e a anestesia da população diante dos rumos do Estado.",
    solucao:
      "A Ágora Global cria um fórum digital seguro para proposição e votação de leis por cidadãos, auditoria orçamentária em tempo real por IA e infraestrutura descentralizada para governança transparente — onde o cidadão é ator, não apenas eleitor.",
    funcionalidades: [
      {
        titulo: "Ágora Cidadã (Democracia Direta)",
        descricao:
          "Fórum digital com identidade soberana (Zero-Knowledge Proofs), proposição de leis por abaixo-assinado digital qualificado e votação em tempo real. Assembleias temáticas moderadas por IA sintetizam argumentos contrários e favoráveis de forma imparcial.",
      },
      {
        titulo: "Auditoria Orçamentária por IA",
        descricao:
          "Algoritmos de machine learning cruzam dados de licitações, notas fiscais e entregas físicas, detectando sobrepreço, desvios e ineficiências em tempo real com emissão automática de alertas para órgãos de controle.",
      },
      {
        titulo: "Instâncias Soberanas ('Forks' Nacionais)",
        descricao:
          "Cada país hospeda e gerencia sua própria instância com total controle sobre legislação, diretrizes e privacidade dos cidadãos, mantendo interoperabilidade opcional com a rede global.",
      },
      {
        titulo: "Rastreamento de Gastos Públicos",
        descricao:
          "Painel com visualização em grafos e mapas de calor de cada unidade monetária pública, com 100% dos gastos rastreáveis em tempo real até o beneficiário ou fornecedor final.",
      },
    ],
    stack: ["Microsserviços (Docker/Kubernetes)", "Blockchain / Ledger Imutável", "APIs RESTful e GraphQL", "Open Source Global"],
    publicoAlvo: [
      "Cidadãos que querem participação real nas decisões públicas",
      "Gestores públicos e auditores que precisam de ferramentas analíticas robustas",
      "Desenvolvedores open source comprometidos com governança ética e constitucional",
    ],
    cta: "Contribuir com o Projeto",
  },

  "kairos-labs": {
    nome: "Kairos Labs",
    tagline: "O ecossistema que conecta tudo.",
    cor: "#d4a017",
    status: "Ativo",
    statusTipo: "ativo",
    descricaoLonga:
      "Portal institucional, vitrine de inovação e central de validação de demanda por dados para o ecossistema de soluções em tecnologia da Kairos Labs. Marca registrada no INPI (Processo nº 944610498, Classe 42), operando como o ponto de encontro entre o fundador, os produtos e o mercado.",
    problema:
      "Ecossistemas de múltiplos produtos precisam de um ponto de presença que comprove existência comercial, mostre o portfólio em construção e colete dados reais de demanda para priorizar o que deve ser desenvolvido primeiro.",
    solucao:
      "A Kairos Labs funciona como a marca-mãe: garante presença pública registrada, apresenta cada produto do ecossistema com clareza, captura listas de espera segmentadas por produto e entrega ao fundador um dashboard analítico privado para decisões baseadas em dados.",
    funcionalidades: [
      {
        titulo: "Vitrine de Produtos",
        descricao:
          "Cards interativos para cada produto do ecossistema com status, descrição, tagline e botão de acesso antecipado — permitindo que o mercado declare interesse antes do lançamento.",
      },
      {
        titulo: "Captura Segmentada de Leads (Waitlist)",
        descricao:
          "Cada produto possui sua própria lista de espera. O e-mail do interessado é atrelado ao product_id correspondente, gerando dados precisos de demanda por solução.",
      },
      {
        titulo: "Founder Dashboard (/admin)",
        descricao:
          "Painel privado e protegido por Supabase Auth com KPIs em tempo real: total de inscritos, ranking de demanda por produto, crescimento semanal e tabela de leads com exportação CSV.",
      },
      {
        titulo: "Comprovação de Marca Pública",
        descricao:
          "Presença institucional com exibição do logotipo, badge do INPI (Processo nº 944610498) e histórico de engenharia público no GitHub — demonstrando maturidade técnica para recrutadores e tech leads.",
      },
    ],
    stack: ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS v4", "shadcn/ui", "Supabase (Auth + PostgreSQL + RLS)", "Vercel"],
    publicoAlvo: [
      "Recrutadores técnicos e tech leads avaliando padrão de código e arquitetura",
      "Potenciais clientes e testadores beta de cada produto do ecossistema",
      "Fundador (Cesar Pizarro) para decisões de roadmap baseadas em demanda real",
    ],
    cta: "Garantir Acesso Antecipado",
  },
};

// ─────────────────────────────────────────────────────────────
// Estilos de status
// ─────────────────────────────────────────────────────────────
const statusStyles: Record<string, React.CSSProperties> = {
  ativo: {
    background: "rgba(16,185,129,0.15)",
    color: "#10b981",
    border: "1px solid rgba(16,185,129,0.4)",
  },
  breve: {
    background: "rgba(212,160,23,0.12)",
    color: "#d4a017",
    border: "1px solid rgba(212,160,23,0.35)",
  },
};

// ─────────────────────────────────────────────────────────────
// Componentes auxiliares
// ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 0.75rem",
        color: "rgba(255,255,255,0.35)",
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid rgba(59,130,246,0.12)",
        margin: "3rem 0",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface Props {
  params: Promise<{ slug: string }>;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default async function ProdutoDetalhe({ params }: Props) {
  const { slug } = await params;
  const produto = produtos[slug];

  if (!produto) {
    notFound();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050a14",
        color: "#fff",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {/* ── Breadcrumb ────────────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid rgba(59,130,246,0.15)",
          padding: "1.4rem 2.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1.2rem",
        }}
      >
        <Link
          href="/solucoes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "rgba(255,255,255,0.55)",
            fontSize: "0.82rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          Soluções
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "1rem" }}>/</span>
        <span
          style={{
            color: produto.cor,
            fontSize: "0.82rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {produto.nome}
        </span>
      </div>

      {/* ── Conteúdo Principal ────────────────────────── */}
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "4rem 2.5rem 6rem",
        }}
      >
        {/* Hero do produto */}
        <div style={{ marginBottom: "3rem" }}>
          {/* Status */}
          <span
            style={{
              display: "inline-block",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              borderRadius: "4px",
              padding: "0.28rem 0.7rem",
              marginBottom: "1.2rem",
              ...statusStyles[produto.statusTipo],
            }}
          >
            {produto.status}
          </span>

          <h1
            style={{
              margin: "0 0 0.6rem",
              fontFamily: "var(--font-orbitron), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1.1,
              color: "#fff",
            }}
          >
            {produto.nome}
          </h1>

          <p
            style={{
              margin: "0 0 1.5rem",
              color: produto.cor,
              fontSize: "1.05rem",
              fontWeight: 500,
              fontStyle: "italic",
            }}
          >
            {produto.tagline}
          </p>

          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.65)",
              fontSize: "1rem",
              lineHeight: 1.8,
              maxWidth: "680px",
            }}
          >
            {produto.descricaoLonga}
          </p>
        </div>

        <Divider />

        {/* Problema / Solução */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "3rem",
          }}
        >
          {/* Problema */}
          <div
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.18)",
              borderRadius: "10px",
              padding: "1.5rem",
            }}
          >
            <SectionLabel>O Problema</SectionLabel>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
              }}
            >
              {produto.problema}
            </p>
          </div>

          {/* Solução */}
          <div
            style={{
              background: `${produto.cor}08`,
              border: `1px solid ${produto.cor}25`,
              borderRadius: "10px",
              padding: "1.5rem",
            }}
          >
            <SectionLabel>A Solução</SectionLabel>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
              }}
            >
              {produto.solucao}
            </p>
          </div>
        </div>

        <Divider />

        {/* Funcionalidades */}
        <div style={{ marginBottom: "3rem" }}>
          <SectionLabel>Funcionalidades Principais</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {produto.funcionalidades.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(59,130,246,0.14)",
                  borderRadius: "10px",
                  padding: "1.25rem 1.4rem",
                }}
              >
                {/* Número decorativo */}
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-orbitron), sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: produto.cor,
                    marginBottom: "0.6rem",
                    opacity: 0.7,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  style={{
                    margin: "0 0 0.5rem",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "0.02em",
                  }}
                >
                  {f.titulo}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                  }}
                >
                  {f.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Público-Alvo */}
        {produto.publicoAlvo && produto.publicoAlvo.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: "3rem" }}>
              <SectionLabel>Para Quem É</SectionLabel>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                {produto.publicoAlvo.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "0.88rem",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        marginTop: "0.35rem",
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: produto.cor,
                        display: "inline-block",
                      }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Stack */}
        {produto.stack && produto.stack.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: "3rem" }}>
              <SectionLabel>Stack Técnica</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {produto.stack.map((tech, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "rgba(255,255,255,0.65)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "5px",
                      padding: "0.3rem 0.75rem",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        <Divider />

        {/* CTA final */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "1.5rem",
            padding: "2rem",
            background: `${produto.cor}08`,
            border: `1px solid ${produto.cor}20`,
            borderRadius: "12px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 0.4rem",
                color: produto.cor,
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Acesso Antecipado
            </p>
            <h2
              style={{
                margin: "0 0 0.6rem",
                fontFamily: "var(--font-orbitron), sans-serif",
                fontSize: "1.1rem",
                fontWeight: 800,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#fff",
              }}
            >
              Entrar na Lista de Espera
            </h2>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
              }}
            >
              Cadastre-se para ser notificado no lançamento e ajudar a priorizar o desenvolvimento.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <WaitlistCTAButton
              productId={slug}
              productName={produto.nome}
              productColor={produto.cor}
              ctaLabel={produto.cta}
            />

            <FeedbackCTAButton
              productId={slug}
              productName={produto.nome}
              productColor={produto.cor}
            />

            <Link
              href="/solucoes"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.7rem 1.6rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "6px",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={14} />
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(produtos).map((slug) => ({ slug }));
}