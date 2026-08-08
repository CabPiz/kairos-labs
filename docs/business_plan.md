# Plano de Negócios — Kairos Labs

**Versão:** 1.0.0
**Data:** 2026-08-08
**Autor:** Cesar Antonio Brito Pizarro
**Marca registrada:** INPI Processo nº 944610498 · Classe 42

---

## 1. Situação Atual

O MVP do Kairos Labs está **ao vivo** com:

- Landing page pública com vitrine de 4 produtos e captura segmentada de leads (waitlist)
- Dashboard privado do fundador com KPIs em tempo real: total de inscritos, ranking de demanda por produto, crescimento semanal e exportação CSV
- Infraestrutura de qualidade: CI/CD, cobertura de testes, SonarCloud Quality Gate, testes E2E
- Marca registrada no INPI (Classe 42 — serviços de tecnologia)
- Custo fixo de infraestrutura: **R$ 0** (Vercel Hobby + Supabase Free)

O site já cumpre sua função estratégica número um: **medir demanda real antes de construir qualquer produto.**

---

## 2. O Ecossistema de Produtos

| Produto | Descrição | Audiência-alvo |
|---|---|---|
| **DevPrint** | Portfólio vivo e verificável para desenvolvedores | Devs júnior/pleno, recrutadores tech |
| **AI & SaaS** | Automação e plataformas AIaaS | Startups, times pequenos, solopreneurs |
| **Audio Tech** | Software de processamento e medição acústica | Engenheiros de som, produtores, acústicos |
| **Blockchain** | Smart contracts e soluções descentralizadas | Empresas com necessidade de contratos auditáveis |

A waitlist segmentada já está coletando dados que dizem **qual produto construir primeiro**. Esse dado é o ativo mais valioso do MVP.

---

## 3. Modelo de Receita por Produto

### 3.1 DevPrint — Produto Flagship (construir primeiro)

**Por que DevPrint primeiro:**
- É o produto que Cesar melhor entende — ele é o usuário
- Audiência imensa: há ~27 milhões de desenvolvedores no GitHub; recrutadores buscam diferencial além do LinkedIn
- Concorrentes diretos (Bento.me, read.cv, Polywork) não têm verificação técnica integrada (commits, PRs, cobertura de testes)
- Cesar já construiu exatamente isso para si mesmo — o repositório `kairos-labs` **é** o produto

**Modelo de receita: Freemium SaaS**

| Plano | Preço | O que inclui |
|---|---|---|
| **Free** | R$ 0 | Perfil público, 1 projeto em destaque, URL `devprint.app/username` |
| **Pro** | R$ 29/mês ou R$ 249/ano | Domínio customizado, analytics de visitas, projetos ilimitados, badge verificado de commits |
| **Team** | R$ 79/mês | Até 5 membros, página de time, showcase coletivo |

**Projeção conservadora (12 meses após lançamento):**

| Mês | Usuários Free | Usuários Pro (conv. 3%) | MRR |
|---|---|---|---|
| 3 | 200 | 6 | R$ 174 |
| 6 | 600 | 18 | R$ 522 |
| 9 | 1.200 | 36 | R$ 1.044 |
| 12 | 2.000 | 60 | R$ 1.740 |

> Uma taxa de conversão de 3% free→paid é conservadora para SaaS de produtividade B2C. Produtos como Notion, Linear e Vercel operam entre 3-8%.

---

### 3.2 AI & SaaS — Receita por Projeto (fase 2)

Antes de construir um produto próprio, Cesar pode monetizar sua expertise em IA vendendo **serviços de implementação** para clientes que precisam de automação:

- Agentes LLM customizados (Claude API)
- Integrações n8n / Make com modelos de linguagem
- Dashboards de analytics com AI

**Modelo:** Projetos fixos R$ 3.000–15.000 + manutenção mensal R$ 500–2.000.

Isso não requer construir nada novo — apenas usar o Kairos Labs como porta de entrada para capturar leads de empresas interessadas.

---

### 3.3 Audio Tech e Blockchain — Validar antes de construir

Esses dois produtos têm nichos menores e ciclos de venda mais longos. A estratégia correta é:

1. Manter as páginas de waitlist ativas coletando leads
2. Quando a waitlist de algum deles atingir 100+ inscritos, iniciar uma entrevista de usuário com os 10 primeiros
3. Só então planejar construção

**Não construir o que não tem demanda comprovada** é a principal vantagem de ter construído o MVP desta forma.

---

## 4. Receita Imediata — O Que Fazer Esta Semana

O maior erro de fundadores solo é esperar o produto estar pronto para cobrar. A estratégia correta é cobrar antes de construir.

### 4.1 Consulting via portfólio (começa hoje, zero esforço)

O repositório `kairos-labs` demonstra:
- Arquitetura Next.js 15 + Supabase de nível profissional
- Pipeline CI/CD com Quality Gate (SonarCloud)
- Testes unitários, integração e E2E
- Conventional Commits, código limpo, documentação técnica

**Ação:** Adicionar na landing page uma seção "Contrate o Fundador" ou um link discreto no footer para um formulário de contato de projetos freelance. Devs com portfólio verificável cobram 30-50% mais.

**Potencial:** 1-2 projetos/mês · R$ 3.000–8.000 por projeto = R$ 3.000–16.000/mês de receita imediata enquanto os produtos SaaS amadurecem.

---

### 4.2 Founding Member Pre-Sale (próximos 30 dias)

Antes de construir qualquer linha de código do DevPrint, enviar um email para toda a waitlist com a seguinte oferta:

> *"DevPrint está sendo construído. Os primeiros 50 inscritos que pagarem R$ 97 agora ganham acesso vitalício ao plano Pro. Essa oferta não se repete."*

**Por que isso funciona:**
- Valida willingness to pay antes de investir meses de desenvolvimento
- Gera caixa imediato para cobrir domínios, custos opcionais e tempo de desenvolvimento
- Cria um grupo de early adopters comprometidos que vão dar feedback e fazer marketing boca a boca
- 50 founding members × R$ 97 = **R$ 4.850** antes de escrever uma linha de código do DevPrint

**Como executar:** Formulário de pagamento via Hotmart, Kiwify ou Stripe (todos aceitam sem CNPJ inicial como PF).

---

## 5. Go-to-Market Strategy

### Fase 1 — Awareness (Agora, com o que já existe)

O Kairos Labs em si **é** a estratégia de marketing. O repositório público demonstra competência. As ações:

1. **LinkedIn:** Postar sobre cada decisão técnica tomada durante a construção do projeto. "Como protegi meu dashboard com RLS no Supabase", "Por que escolhi App Router sobre Pages Router". Cada post é conteúdo técnico que atrai devs e recrutadores.

2. **GitHub:** O repositório bem documentado com README, CONTRIBUTING e arquitetura documentada aparece em buscas. Stars e forks são social proof.

3. **Twitter/X:** Thread sobre "Construindo um SaaS do zero, sem backend próprio, custo R$0/mês". Esse tipo de conteúdo viraliza na comunidade dev brasileira.

### Fase 2 — Lead Nurturing (Waitlist → Clientes)

Quando a waitlist atingir 200 inscritos totais:

1. Segmentar por produto (o dashboard já faz isso)
2. Enviar email personalizado por produto com oferta founding member
3. Criar um canal no Discord/WhatsApp para os founding members — comunidade antes de produto

### Fase 3 — Lançamento DevPrint (mês 3-6)

1. Product Hunt Launch (produto gratuito para maximizar upvotes e visibilidade)
2. Post no Hacker News "Show HN: DevPrint — verified portfolio for developers"
3. Lista de email dos founding members como primeiros promotores

---

## 6. Estrutura de Custos

| Item | Custo atual | Custo pós-escala |
|---|---|---|
| Hosting (Vercel) | R$ 0 | R$ 0–110/mês (Pro quando necessário) |
| Banco de dados (Supabase) | R$ 0 | R$ 110/mês (Pro quando >500MB) |
| Domínio | ~R$ 60/ano | ~R$ 60/ano |
| Claude API (AI & SaaS) | Pay-per-use | ~R$ 200–500/mês |
| Total | **~R$ 5/mês** | **~R$ 300–700/mês** |

A arquitetura free-tier-first foi uma decisão estratégica correta: **zero custo fixo até atingir receita**.

---

## 7. Marcos de Validação

| Marco | Indicador | Prazo |
|---|---|---|
| Portfólio gerando leads | 1 contato de projeto freelance via site | Semana 1–2 |
| Waitlist com tração | 100 inscritos totais | Mês 1 |
| Willingness to pay validada | 10 founding members pagos | Mês 1–2 |
| Produto com receita recorrente | R$ 500 MRR | Mês 6 |
| Produto sustentável | R$ 2.000 MRR | Mês 12 |
| Independência financeira parcial | R$ 8.000 MRR | Mês 24 |

> R$ 8.000 MRR ≈ 275 usuários Pro no DevPrint a R$ 29/mês. Alcançável com uma audiência de 10.000 usuários free (conv. 2,75%).

---

## 8. Vantagens Competitivas

1. **Marca registrada (INPI):** Proteção legal da marca Kairos Labs e DevPrint impede cópia direta no Brasil.
2. **Custo zero de infraestrutura:** Permite operar indefinidamente sem receita enquanto valida o mercado.
3. **Fundador é o usuário:** Cesar constrói ferramentas que ele mesmo precisaria — isso elimina o risco de construir algo que ninguém quer.
4. **Qualidade demonstrável:** O próprio repositório é um argumento de venda para clientes de consultoria.
5. **Data-driven prioritization:** O dashboard de demanda garante que nenhum produto é construído sem evidência de interesse real.

---

## 9. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Waitlist não converte em pagantes | Média | Pre-sale founding member valida antes de construir |
| Concorrente lança produto similar | Média | Velocidade de execução solo + marca registrada |
| Solo founder burnout | Alta | Focar em 1 produto por vez; consulting gera renda enquanto SaaS matura |
| Supabase Free atingir limite | Baixa | Migração para Pro (R$ 110/mês) só quando houver receita para cobrir |

---

## 10. Próximos 90 Dias — Plano de Ação

| Semana | Ação |
|---|---|
| 1–2 | Adicionar CTA de contato freelance na landing page. Postar primeiro conteúdo técnico no LinkedIn. |
| 3–4 | Enviar email para waitlist com oferta founding member DevPrint. Abrir canal de early adopters. |
| 5–8 | Iniciar construção do DevPrint MVP (perfil público + 1 projeto). Usar founding members como beta testers. |
| 9–12 | Lançar DevPrint no Product Hunt. Ativar cobrança do plano Pro. |

---

*Kairos Labs · Cesar Antonio Brito Pizarro · business_plan.md v1.0*
