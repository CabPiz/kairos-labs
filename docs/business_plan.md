# Plano de Negócios — Kairos Labs

**Versão:** 1.1.0
**Data:** 2026-08-08
**Autor:** Cesar Antonio Brito Pizarro
**Marca registrada:** INPI Processo nº 944610498 · Classe 42

---

## 1. Situação Atual

O MVP do Kairos Labs está **ao vivo** com:

- Landing page pública com vitrine de produtos e captura segmentada de leads (waitlist)
- Dashboard privado do fundador com KPIs em tempo real: total de inscritos, ranking de demanda por produto, crescimento semanal e exportação CSV
- Infraestrutura de qualidade: CI/CD, cobertura de testes, SonarCloud Quality Gate, testes E2E
- Marca registrada no INPI (Classe 42 — serviços de tecnologia)
- Custo fixo de infraestrutura: **R$ 0** (Vercel Hobby + Supabase Free)

O site já cumpre sua função estratégica número um: **medir demanda real antes de construir qualquer produto.** Os dados da waitlist segmentada por produto são o ativo mais valioso do MVP.

---

## 2. O Ecossistema de Produtos

| Produto | Descrição | Status | Card no site |
|---|---|---|---|
| **DevPrint** | Portfólio vivo e verificável: transforma commits, PRs e aprendizados em currículo auto-atualizável com evidências rastreáveis | PRD v0.2 — em desenvolvimento | ✅ |
| **Talvrix** | Matching inteligente entre currículo e vagas em múltiplos sites, ordenado por salário + score de compatibilidade via IA | PRD v1.0 — em breve no site | 🔜 |
| **Elucya Talk** | Analisa conversas (áudio/texto), detecta padrões de comunicação tóxica e gera feedback psicológico individualizado | PRD v1.0 — protótipos prontos | ✅ (AI & SaaS) |
| **Ascend** | Preparação adaptativa para concursos públicos de TI: cruza currículo com edital e gera plano personalizado via IA | Em desenvolvimento | ✅ (AI & SaaS) |
| **Ágora Global** | Plataforma cívica open-source de democracia direta, auditoria orçamentária e soberania de dados públicos | Concepção estratégica | ✅ (Blockchain) |

---

## 3. Priorização de Produtos para Receita

A ordem abaixo não é arbitrária — é baseada em velocidade de validação, tamanho de mercado acessível e esforço de construção.

### Prioridade 1 — Talvrix

**Por que primeiro:**
- Resolve uma dor ativa e universal: buscar emprego é manual, fragmentado e frustrante
- Modelo de preços já definido e testável imediatamente
- A dor é recorrente (o candidato busca vagas toda semana) — isso gera retenção natural
- O mercado brasileiro tem ~14 milhões de desempregados ativos + milhões em recolocação passiva
- É o único produto do ecossistema onde o usuário paga **pelo resultado imediato**, não pelo hábito

**Risco principal:** sites de vagas bloqueando scraping. Mitigação: rotação de user-agent + rate limiting + priorizar sites que já têm APIs (LinkedIn, Indeed via parceria futura).

### Prioridade 2 — DevPrint

**Por que segundo:**
- Cesar é o usuário — o produto pode ser validado no próprio desenvolvimento do Kairos Labs
- Diferencial técnico claro sobre concorrentes (Bento.me, read.cv): verificação real por commits e PRs, não autodeclaração
- O Diário de Aprendizado é um produto dentro do produto — nenhum concorrente tem isso
- GitHub tem 27M+ devs; LinkedIn tem 1B+ usuários; a interseção que quer portfólio verificável é enorme
- domínio `devprint.io` disponível a R$0,01 no primeiro ano

### Prioridade 3 — Elucya Talk

**Por que terceiro:**
- Mercado B2B premium: psicólogos, mediadores de conflito e gestores de RH pagam mais e têm menor churn
- O produto não armazena dados (privacy-first) — isso elimina a barreira de confiança para usuários com conversas sensíveis
- Protótipos de UI prontos — o esforço está nas integrações backend (Whisper/AssemblyAI + LLM)
- Ciclo de venda é mais longo (B2B2C), mas o ticket é maior

### Prioridade 4 — Ascend

**Por que quarto:**
- O mercado de concursos públicos no Brasil é imenso: ~8 milhões de candidatos por ano
- Porém o ciclo de preparação é longo (meses) — o produto precisa de mais conteúdo para ser valioso
- A integração com editais reais requer curadoria constante

### Ágora Global — Projeto de Impacto (não monetização direta)

A Ágora Global é open-source por design e não deve ser tratada como produto comercial. Seu valor para o Kairos Labs é:
- Demonstração de ambição e capacidade técnica para parceiros institucionais
- Potencial de financiamento público ou via editais de inovação cívica (Fapesp, MCTI, fundações internacionais)
- Credibilidade institucional para os demais produtos

---

## 4. Modelo de Receita por Produto

### 4.1 Talvrix — Freemium SaaS

| Plano | Preço | O que inclui |
|---|---|---|
| **Free** | R$ 0 | 1 busca/semana · 1 site de vagas · 5 resultados por salário (sem matching IA) |
| **Basic** | R$ 29/mês | Buscas ilimitadas · 1 site · 20 resultados · exportação CSV |
| **Pro** | R$ 79/mês | 5 sites simultâneos · resultados ilimitados · alertas por e-mail · score de compatibilidade detalhado |
| **Enterprise** | R$ 299/mês | Sites ilimitados · IA recomenda sites · API para headhunters · suporte prioritário |

**Projeção conservadora (12 meses após lançamento):**

| Mês | Usuários Free | Basic (conv. 4%) | Pro (conv. 1%) | MRR |
|---|---|---|---|---|
| 3 | 300 | 12 | 3 | R$ 585 |
| 6 | 800 | 32 | 8 | R$ 1.560 |
| 9 | 1.500 | 60 | 15 | R$ 2.925 |
| 12 | 2.500 | 100 | 25 | R$ 4.875 |

---

### 4.2 DevPrint — Freemium SaaS

| Plano | Preço | O que inclui |
|---|---|---|
| **Free** | R$ 0 | Até 3 repositórios · perfil público `devprint.io/username` · currículo básico |
| **Pro** | R$ 39/mês ou R$ 349/ano | Repositórios ilimitados · exportação PDF avançada · analytics de visitantes · domínio personalizado · badge verificado |
| **Teams** | R$ 99/mês | Empresas avaliam candidatos com perfil DevPrint verificado |

---

### 4.3 Elucya Talk — Freemium + B2B

| Plano | Preço | O que inclui |
|---|---|---|
| **Free** | R$ 0 | 1 análise/mês · áudios até 5 min · relatório básico |
| **Pro** | R$ 49/mês | Análises ilimitadas · áudios até 60 min · exportação PDF · histórico de 90 dias |
| **Terapeuta/RH** | R$ 149/mês | Multi-paciente · comparativo evolutivo de sessões · relatório clínico formatado |

O plano B2B (Terapeuta/RH) tem o maior potencial: psicólogos cobram R$150–400/sessão e pagariam R$149/mês sem hesitar se o produto ajudar a conduzir melhores sessões.

---

### 4.4 Ascend — Assinatura

| Plano | Preço | O que inclui |
|---|---|---|
| **Free** | R$ 0 | Análise básica do perfil vs. edital · roadmap genérico |
| **Pro** | R$ 59/mês | Plano adaptativo personalizado · simulados · chat com professor IA · alertas de novos editais |

---

## 5. Receita Imediata — O Que Fazer Esta Semana

### 5.1 Consulting via portfólio (começa hoje)

O repositório `kairos-labs` demonstra arquitetura Next.js 15 + Supabase de nível profissional, pipeline CI/CD, Quality Gate SonarCloud, testes E2E e documentação técnica. Isso vale dinheiro imediatamente.

**Ação:** Adicionar na landing page uma seção ou link discreto para contato de projetos freelance. Devs com portfólio verificável cobram 30–50% mais.

**Potencial:** 1–2 projetos/mês · R$3.000–8.000 por projeto = **R$3.000–16.000/mês** enquanto os produtos SaaS amadurecem.

---

### 5.2 Founding Member Pre-Sale — Talvrix (próximos 30 dias)

Antes de escrever uma linha do Talvrix, enviar para a waitlist:

> *"Talvrix está sendo construído: IA que faz o matching perfeito entre o seu currículo e vagas em múltiplos sites, ordenado por salário. Os primeiros 50 que pagarem R$97 agora têm acesso vitalício ao plano Basic. Sem renovação mensal, para sempre."*

**Por que funciona:**
- Valida willingness to pay antes de investir meses de desenvolvimento
- 50 founding members × R$97 = **R$4.850** antes de escrever uma linha de código
- Cria beta testers comprometidos que vão relatar bugs e fazer marketing orgânico
- Plataforma de pagamento: Hotmart, Kiwify ou Stripe (sem CNPJ inicial)

---

### 5.3 Adicionar Talvrix ao Site (próximas 2 semanas)

O Talvrix ainda não tem card na landing page. Adicionar o card com o mesmo padrão dos outros produtos cria um quinto ponto de captura de leads — e a waitlist começa a revelar se há demanda antes de qualquer linha de código.

---

## 6. Go-to-Market Strategy

### Fase 1 — Awareness (Agora, com o que já existe)

1. **LinkedIn:** Postar sobre decisões técnicas do Kairos Labs. "Como usei o dashboard de waitlist para priorizar qual produto construir primeiro" — esse tipo de post atrai devs, recrutadores e potenciais clientes de consultoria.

2. **Twitter/X:** Thread "Construindo 5 produtos SaaS do zero como solo founder, custo R$0/mês". Viraliza na comunidade dev brasileira.

3. **GitHub:** Repositório bem documentado gera stars e aparece em buscas. O README é marketing.

### Fase 2 — Lead Nurturing (quando waitlist atingir 200 inscritos)

1. Segmentar por produto (o dashboard já faz isso)
2. Enviar email personalizado por produto com oferta founding member
3. Criar canal Discord/WhatsApp para early adopters de cada produto

### Fase 3 — Lançamento Talvrix (mês 2–4)

1. Product Hunt Launch (free para maximizar upvotes)
2. Post Hacker News "Show HN: Talvrix — AI job matcher for the Brazilian market"
3. Grupos de WhatsApp e Telegram de busca de emprego / recolocação de devs

### Fase 4 — Lançamento DevPrint (mês 4–8)

1. Product Hunt + Hacker News
2. Comunidades de devs: Rocketseat, Alura Alumni, Discord de Next.js Brasil

---

## 7. Estrutura de Custos

| Item | Custo atual | Custo pós-escala |
|---|---|---|
| Hosting Kairos Labs (Vercel) | R$ 0 | R$ 0–110/mês |
| Banco de dados (Supabase) | R$ 0 | R$ 110/mês (quando >500MB) |
| Domínio kairos-labs | ~R$ 60/ano | ~R$ 60/ano |
| Claude API / Gemini API (produtos AI) | Pay-per-use | R$ 200–600/mês |
| Whisper/AssemblyAI (Elucya Talk) | Pay-per-uso | R$ 100–300/mês |
| Domínio devprint.io | R$ 0,01 (1º ano) | ~R$ 80/ano |
| **Total atual** | **~R$ 5/mês** | **~R$ 600–1.200/mês** |

A arquitetura free-tier-first garante **zero custo fixo até atingir receita.**

---

## 8. Marcos de Validação

| Marco | Indicador | Prazo |
|---|---|---|
| Portfólio gerando leads | 1 contato de projeto freelance via site | Semana 1–2 |
| Talvrix no site | Card adicionado + waitlist ativa | Semana 2 |
| Waitlist com tração | 100 inscritos totais (todos os produtos) | Mês 1 |
| Willingness to pay validada | 10 founding members pagos (Talvrix) | Mês 1–2 |
| Talvrix MVP ao vivo | Usuário faz upload do currículo e recebe vagas ranqueadas | Mês 3–4 |
| Primeiro MRR | R$ 500/mês | Mês 4–5 |
| Produto sustentável | R$ 2.000 MRR | Mês 10–12 |
| Independência financeira parcial | R$ 8.000 MRR | Mês 20–24 |

> R$ 8.000 MRR é realista com: 100 usuários Basic Talvrix (R$2.900) + 60 usuários Pro DevPrint (R$2.340) + 20 licenças Elucya Terapeuta (R$2.980) = R$8.220 MRR com ~180 clientes pagantes.

---

## 9. Vantagens Competitivas

1. **Marca registrada (INPI):** Proteção legal da marca Kairos Labs em Classe 42 impede cópia direta no Brasil.
2. **Custo zero de infraestrutura:** Permite operar indefinidamente sem receita enquanto valida o mercado.
3. **Fundador é o usuário em múltiplos produtos:** Cesar usa DevPrint para documentar seu próprio crescimento, usa Talvrix para monitorar o mercado de vagas, usa Ascend para preparação. Isso elimina o risco de construir o que ninguém quer.
4. **Qualidade demonstrável:** O repositório Kairos Labs é um argumento de venda para clientes de consultoria.
5. **Data-driven prioritization:** O dashboard de demanda garante que nenhum produto é construído sem evidência de interesse real.
6. **Ecossistema, não produto isolado:** Cada produto lançado amplifica a credibilidade dos demais sob a marca Kairos Labs.

---

## 10. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Sites de vagas bloqueiam scraping (Talvrix) | Alta | Rotação de user-agent · rate limiting respeitoso · priorizar APIs públicas |
| Custo de IA por análise (Elucya Talk) | Média | IA restrita a planos pagos — receita da assinatura cobre o custo |
| Waitlist não converte em pagantes | Média | Pre-sale founding member valida antes de construir |
| Concorrente lança produto similar | Média | Velocidade de execução + marca registrada + foco no mercado BR |
| Solo founder burnout | Alta | Focar em 1 produto por vez; consulting gera renda enquanto SaaS matura |
| APIs de terceiros mudam preços (Whisper, AssemblyAI) | Baixa | Abstrair provider — trocar de API sem alterar produto |

---

## 11. Próximos 90 Dias — Plano de Ação

| Semana | Ação |
|---|---|
| 1–2 | Adicionar Talvrix ao site (card + waitlist). Adicionar CTA de contato freelance na landing. Postar primeiro conteúdo técnico no LinkedIn. |
| 3–4 | Enviar email para waitlist com oferta founding member Talvrix. Abrir canal de early adopters. |
| 5–10 | Construir Talvrix MVP: upload de currículo → 1 site de vagas → 10 vagas ranqueadas por salário + score. |
| 11–12 | Lançar Talvrix no Product Hunt. Ativar cobrança do plano Basic. |
| 13–16 | Iniciar DevPrint MVP usando o próprio Kairos Labs como primeiro projeto conectado. |

---

*Kairos Labs · Cesar Antonio Brito Pizarro · business_plan.md v1.1*
