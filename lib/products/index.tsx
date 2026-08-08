import type { Product } from "./types";

// ─────────────────────────────────────────────────────────────
// Dados dos produtos
//
// Esta é a única fonte de verdade para dados de produto no
// ecossistema Kairos Labs.
//
// Ponto de integração futura: quando o DevPrint estiver em
// produção, `getProducts()` passará a fazer fetch à sua API
// (com cache estático via `next: { revalidate: 3600 }`) sem
// nenhuma alteração nos componentes consumidores.
// ─────────────────────────────────────────────────────────────

const products: Product[] = [
  {
    slug: "devprint",
    nome: "DevPrint",
    tagline: "Seu currículo cresce com você.",
    descricao:
      "Transforma seu histórico real de desenvolvimento — commits, PRs e aprendizados manuais — em um currículo vivo, narrativo e verificável. Cada projeto é uma prova.",
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
    stack: [
      "Next.js 15",
      "TypeScript",
      "Tailwind CSS v4",
      "Supabase",
      "GitHub API",
      "Gemini API",
    ],
    publicoAlvo: [
      "Dev sem experiência de mercado que quer provar capacidade com projetos reais",
      "Dev em transição de stack que precisa comprovar o que aprendeu",
      "Dev júnior/pleno acelerando para posições sênior",
      "Dev sênior com anos de projetos privados não visíveis no GitHub",
    ],
    cor: "#4a90e2",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    status: "Em breve",
    statusTipo: "breve",
    cta: "Garantir Acesso Antecipado",
  },

  {
    slug: "ascend",
    nome: "Ascend",
    tagline: "Acelere sua evolução técnica.",
    descricao:
      "Plataforma de crescimento profissional para devs que querem sair do júnior ao sênior com clareza — trilhas personalizadas, metas e evidências de progresso.",
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
    cor: "#10b981",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    status: "Em breve",
    statusTipo: "breve",
    cta: "Garantir Acesso Antecipado",
  },

  {
    slug: "elucya-talk",
    nome: "Elucya Talk",
    tagline: "Comunicação inteligente por IA.",
    descricao:
      "Solução de AIaaS para comunicação empresarial — automação de atendimento, análise de sentimento e respostas contextuais com modelos de linguagem de ponta.",
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
    stack: [
      "Next.js 16",
      "React 19",
      "Tailwind CSS v4",
      "Whisper / AssemblyAI",
      "OpenAI GPT-4o / Anthropic Claude",
    ],
    publicoAlvo: [
      "Pessoas que buscam autoconhecimento em suas dinâmicas de comunicação",
      "Terapeutas de casal e mediadores familiares que precisam de análise objetiva",
      "Gestores de RH avaliando clima e denúncias de assédio em ambientes corporativos",
    ],
    cor: "#8b5cf6",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    status: "Em breve",
    statusTipo: "breve",
    cta: "Garantir Acesso Antecipado",
  },

  {
    slug: "agora-global",
    nome: "Plataforma Ágora Global",
    tagline: "Governança democrática para a era digital.",
    descricao:
      "Infraestrutura open-source de governança pública digital — participação cidadã, transparência orçamentária em tempo real e democracia direta para Estados soberanos.",
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
    stack: [
      "Microsserviços (Docker/Kubernetes)",
      "Blockchain / Ledger Imutável",
      "APIs RESTful e GraphQL",
      "Open Source Global",
    ],
    publicoAlvo: [
      "Cidadãos que querem participação real nas decisões públicas",
      "Gestores públicos e auditores que precisam de ferramentas analíticas robustas",
      "Desenvolvedores open source comprometidos com governança ética e constitucional",
    ],
    cor: "#f59e0b",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    status: "Em breve",
    statusTipo: "breve",
    cta: "Contribuir com o Projeto",
  },

  {
    slug: "talvrix",
    nome: "Talvrix",
    tagline: "O falcão que enxerga a oportunidade certa antes de qualquer outro.",
    descricao:
      "Plataforma SaaS que usa IA para fazer matching inteligente entre seu currículo e vagas de emprego em múltiplos sites, ordenando os resultados por salário e compatibilidade de perfil — em segundos.",
    descricaoLonga:
      "Talvrix automatiza a busca de emprego do início ao fim: extrai e estrutura as skills do seu currículo via IA, faz scraping das vagas nos sites configurados e gera um score de compatibilidade por vaga, ordenando os resultados por salário e aderência ao seu perfil — em menos de 60 segundos.",
    problema:
      "Encontrar vagas relevantes é manual, fragmentado e ineficiente: o candidato acessa múltiplos sites separadamente, as buscas por palavra-chave ignoram o perfil real do currículo, não há ordenação por salário agregada entre sites e o candidato não sabe se é competitivo para a vaga antes de se candidatar.",
    solucao:
      "Talvrix automatiza todo o processo: o usuário faz upload do currículo em PDF, a IA extrai e estrutura skills, experiência e nível de senioridade, um scraper coleta vagas nos sites configurados, a IA faz o match e gera score de compatibilidade por vaga, e os resultados são exibidos ordenados por salário + score.",
    funcionalidades: [
      {
        titulo: "Upload e Análise de Currículo por IA",
        descricao:
          "Faça upload do seu currículo em PDF. A IA extrai automaticamente skills, experiências, nível de senioridade e perfil profissional — sem formulários manuais.",
      },
      {
        titulo: "Scraping Inteligente de Vagas",
        descricao:
          "Configure os sites de vagas desejados (LinkedIn, Indeed, Gupy, etc.) e o Talvrix coleta automaticamente as oportunidades relevantes em tempo real.",
      },
      {
        titulo: "Matching por IA com Score de Compatibilidade",
        descricao:
          "Cada vaga recebe um score de compatibilidade calculado pela IA com base no seu perfil. Saiba antes de se candidatar se você é competitivo para a vaga.",
      },
      {
        titulo: "Ranking por Salário e Compatibilidade",
        descricao:
          "Os resultados são ordenados por salário e score de aderência ao seu perfil. As melhores oportunidades aparecem primeiro — sem ruído, sem esforço manual.",
      },
    ],
    stack: [
      "Next.js 15",
      "TypeScript",
      "Python (Scraping)",
      "Google Gemini API",
      "Supabase",
      "Playwright",
    ],
    publicoAlvo: [
      "Devs em busca de recolocação que querem encontrar vagas tech bem pagas sem perder tempo",
      "Profissionais sênior que buscam vagas compatíveis com experiência, sem filtrar manualmente",
      "Recém-formados que querem entender onde se encaixam no mercado",
      "Qualquer profissional que queira automatizar a busca em múltiplos sites simultaneamente",
    ],
    cor: "#f97316",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
    status: "Em breve",
    statusTipo: "breve",
    cta: "Garantir Acesso Antecipado",
  },

  {
    slug: "kairos-labs",
    nome: "Kairos Labs",
    tagline: "O ecossistema que conecta tudo.",
    descricao:
      "Portal institucional e central de validação de demanda. A marca registrada que une todas as soluções — e o ponto de partida para o futuro do ecossistema.",
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
    stack: [
      "Next.js 15 (App Router)",
      "TypeScript",
      "Tailwind CSS v4",
      "shadcn/ui",
      "Supabase (Auth + PostgreSQL + RLS)",
      "Vercel",
    ],
    publicoAlvo: [
      "Recrutadores técnicos e tech leads avaliando padrão de código e arquitetura",
      "Potenciais clientes e testadores beta de cada produto do ecossistema",
      "Fundador (Cesar Pizarro) para decisões de roadmap baseadas em demanda real",
    ],
    cor: "#d4a017",
    icone: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    status: "Ativo",
    statusTipo: "ativo",
    cta: "Garantir Acesso Antecipado",
  },
];

/**
 * Retorna a lista de todos os produtos do ecossistema Kairos Labs.
 *
 * Ponto de integração: hoje retorna dados estáticos. Quando o DevPrint
 * estiver em produção, esta função passará a fazer fetch à API do DevPrint
 * sem necessidade de alterações nos componentes consumidores.
 */
export function getProducts(): Product[] {
  return products;
}

/**
 * Mapa de product_id → nome de exibição.
 * Derivado automaticamente de `getProducts()` — nunca editado manualmente.
 */
export const productNames: Record<string, string> = Object.fromEntries(
  products.map((p) => [p.slug, p.nome])
);
