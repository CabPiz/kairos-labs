# Diário de Aprendizado & Conquistas — Projeto Kairos Labs

> Documentação de atividades técnicas, arquiteturais e estratégicas que impactam diretamente a concepção e a entrega do ecossistema **Kairos Labs**. Entradas em ordem decrescente — a mais recente sempre no topo.

---

### 1. Documentação de variáveis de ambiente com separação de segurança

* **Issue:** `#33 - Adicionar .env.example e documentar variáveis de ambiente`
* **Data:** `05/08/2026`
* **Formato:** `C — Governança, CI/CD & Engenharia Proativa`
* **Stack Envolvida:** `Next.js, Supabase`
* **Gargalo Identificado:** O `.env.example` existia mas sem comentários por variável, sem instrução de uso e sem distinção visual entre variáveis seguras para o client-side e variáveis que bypassam o RLS. Um novo colaborador poderia expor o `SUPABASE_SERVICE_ROLE_KEY` ao browser sem perceber o risco.
* **Automação Implementada:** Arquivo reestruturado com cabeçalho de instruções, seções separadas para variáveis públicas (`NEXT_PUBLIC_*`) e privadas (service role), e aviso explícito de que `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser incluída em código client-side.
* **Resultado:** Onboarding mais seguro — qualquer pessoa que clonar o repositório entende imediatamente quais variáveis são seguras para expor e quais representam risco de segurança se mal configuradas.

---

### 1. Governança de Qualidade: BUILD_ERRORS.md, Sonar Duplication e Componentes Compartilhados de Modal

* **Issue:** `#12 — Interface de Feedback de Sugestões (Landing Page)`
* **Data:** `05/08/2026`
* **Formato:** `C — Governança, CI/CD & Engenharia Proativa`
* **Stack Envolvida:** `Next.js 15 (App Router), TypeScript, Supabase, SonarCloud, Zod, React Hook Form`
* **Gargalo Identificado:** Durante a entrega da issue #12, três erros de build e dois ciclos de falha no Quality Gate do Sonar revelaram lacunas sistêmicas na esteira: (1) erros de TypeScript que já haviam acontecido antes foram repetidos; (2) testes manuais foram executados antes do build, validando código que ainda tinha erros de tipo; (3) o FeedbackModal foi criado copiando estrutura do WaitlistModal, gerando 26.4% de duplicação (102 linhas) — acima do limite de 3% do Sonar. O Quality Gate falhou duas vezes antes de passar.
* **Automação Implementada:** Três ações de governança implementadas permanentemente na esteira: (1) **`BUILD_ERRORS.md`** criado na raiz do projeto como base de conhecimento de erros de build já resolvidos — lido obrigatoriamente no início de cada sessão antes de gerar qualquer código; (2) **CLAUDE.md v1.5** com ordem invertida na FASE 2.5 (build → Sonar → testes manuais) e gatilho de atualização do `BUILD_ERRORS.md` ao encerrar sessão; (3) **`ModalResultPanel` e `ModalErrorBanner`** criados em `components/ui/` como componentes compartilhados para todos os modais do projeto — eliminando a raiz estrutural da duplicação Sonar. O Sonar finalizou com 0.0% de duplicação no novo código.
* **Resultado:** A esteira agora previne ativamente os erros desta sessão antes que aconteçam: o desenvolvedor lê os padrões estabelecidos antes de codificar, o build valida o código antes dos testes manuais, e qualquer novo modal usa os componentes compartilhados de `components/ui/` em vez de copiar estrutura. O conhecimento deixou de ser tácito e passou a ser institucional.

---

### 1. Configuração de SEO completo com Next.js Metadata API

* **Issue:** `#11 - SEO e Metadata (Next.js Metadata API)`
* **Data:** `04/08/2026`
* **Formato:** `C — Governança, CI/CD & Engenharia Proativa`
* **Stack Envolvida:** `Next.js 15 App Router, TypeScript, sharp`
* **Gargalo Identificado:** A landing page pública não tinha nenhuma configuração de SEO — sem Open Graph, sem Twitter Card, sem robots.txt, sem sitemap e sem favicon institucional, o que comprometia o compartilhamento em redes sociais e a indexação por crawlers.
* **Automação Implementada:** Uso da Next.js Metadata API para gerar `robots.txt` e `sitemap.xml` como rotas nativas do App Router (`app/robots.ts`, `app/sitemap.ts`); metadata completa com template de título, Open Graph e Twitter Card no `layout.tsx`; favicon gerado via `sharp` a partir do `logo.png` institucional e servido automaticamente pelo Next.js via `app/favicon.ico`.
* **Resultado:** Todas as páginas públicas agora têm metadados completos para SEO e compartilhamento social; `robots.txt` protege `/admin` de indexação; sitemap cobre home, vitrine e os cinco slugs de produto; favicon institucional exibido na aba do browser.

---

### 2. Rastreabilidade Completa: Nenhum Commit sem Issue

* **Issue:** `#40 — Atualizar CLAUDE.md e reescrever ROADMAP.md com M5 Quality Engineering`
* **Data:** `04/08/2026`
* **Formato:** `C — Governança, CI/CD & Engenharia Proativa`
* **Stack Envolvida:** `gh CLI · Git · GitHub Projects v2 · Conventional Commits`
* **Gargalo Identificado:** Após modificar `CLAUDE.md` e `ROADMAP.md` durante o planejamento do M5, percebeu-se que essas alterações não tinham issue vinculada — o que violava a própria regra de rastreabilidade do projeto. Um desenvolvedor maduro reconhece que documentação e governança são trabalho real e merecem o mesmo rigor de versionamento que qualquer feature.
* **Automação Implementada:** Criação da issue #40 via `gh CLI` com label `type: docs`, associada ao milestone M5. Adição de todas as 8 issues novas da sessão (#33 a #40) ao Kanban do GitHub Projects via `gh project item-add`, corrigindo a lacuna de visibilidade no board. Execução completa da esteira: branch `docs/40-claude-md-roadmap-m5` → dois commits atômicos separando as mudanças por arquivo → PR #41 aberto e mergeado com squash após checks passando.
* **Resultado:** Issues #33 a #40 visíveis no Kanban, PR #41 mergeado com rastreabilidade completa. Lição consolidada: toda alteração que vai para o repositório — seja feature, fix, ou documentação de processo — precisa de uma issue que justifique o porquê. Isso é o que separa um repositório de portfólio de um repositório de trabalho profissional.

---

### 1. Virada de Mentalidade: de "Entregar Features" para "Engenheiro que Constrói com Qualidade"

* **Data:** `04/08/2026`
* **Formato:** `C — Governança, CI/CD & Engenharia Proativa`
* **Stack Envolvida:** `Jest · React Testing Library · Playwright · GitHub Actions · ESLint · Husky · lint-staged · gh CLI · Mermaid`
* **Gargalo Identificado:** O projeto estava crescendo em features sem nenhuma infraestrutura de testes automatizados, pipeline de CI validando PRs, ou documentação que permitisse a um desenvolvedor externo (ou recrutador técnico) rodar e contribuir com o projeto. A ausência dessas camadas é um dos principais red flags que engenheiros seniores identificam ao revisar um repositório público — e a próxima issue planejada (#11 — SEO) seria mais uma feature construída em cima de uma base sem rede de segurança.
* **Automação Implementada:** Decisão estratégica de pausar o avanço em features e criar um milestone inteiro de engenharia de qualidade (`M5 — Quality Engineering`) a ser executado entre o M2 e o M3. O milestone foi integralmente criado via `gh CLI` no terminal: 1 nova label (`type: test`), 1 novo milestone e 7 novas issues (#33 a #39) cobrindo `.env.example`, ESLint + Husky, Jest + RTL, GitHub Actions CI, `CONTRIBUTING.md`, testes unitários dos componentes principais e Playwright E2E. O `ROADMAP.md` foi reescrito do zero — o arquivo existente era um template genérico sem nenhuma correspondência com o projeto real — e passou a refletir a sequência de execução correta com diagrama Mermaid, tabelas de dependências e status atualizado por milestone. O protocolo de sessão no `CLAUDE.md` foi evoluído com duas melhorias: testes manuais com evidência visual passaram a ser obrigatórios antes do build (FASE 2.5), e o campo `Issue` foi adicionado ao Diário de Aprendizado para rastreabilidade completa entre sessão e backlog.
* **Resultado:** O projeto saiu de uma trajetória de "landing page sem rede de segurança" para uma esteira de entrega estruturada que qualquer engenheiro sênior reconhece como matura. A sequência de execução agora é: finalizar M2 → construir toda a infraestrutura de qualidade (M5) → evoluir com o M3 já protegido por testes e CI. O repositório público passou a comunicar uma narrativa de crescimento profissional deliberado: não apenas "sabe programar", mas "sabe construir software de forma sustentável e rastreável".

---

### 1. mailto: não abre nada — e o Lucide não tem o ícone que você quer

* **Data:** `03/08/2026`
* **Formato:** `B — Bug Sob Pressão & Resolução Cirúrgica`
* **Stack Envolvida:** `Next.js 15 App Router · TypeScript · lucide-react · HTML anchor`
* **Sintoma & Impacto:** O ícone de e-mail do footer abria uma aba em branco com o texto "mailto:contact.kairoslabs@gmail.com" — sem abrir cliente de e-mail. Os ícones Github e Linkedin importados do lucide-react quebravam o build com erro de export inexistente.
* **Diagnóstico (Causa Raiz):** Dois problemas independentes: (1) `target="_blank"` em links `mailto:` faz o navegador tentar abrir o protocolo em uma nova aba, que não sabe processá-lo — e sem cliente de e-mail padrão configurado no SO, o link simplesmente falha silenciosamente; (2) a versão do lucide-react instalada no projeto não exporta logos de marcas registradas (`Github`, `Linkedin`) — apenas ícones genéricos.
* **Resolução Aplicada:** Link de e-mail substituído por URL do Gmail Compose (`https://mail.google.com/mail/?view=cm&to=`), que abre o Gmail no browser com destinatário pré-preenchido, independente de SO ou cliente configurado. Ícones de marca substituídos por SVGs inline com os paths oficiais do GitHub e LinkedIn.
* **Protocolo Preventivo:** Links `mailto:` são inadequados para landing pages cujo público pode não ter cliente de e-mail configurado — preferir sempre Gmail Compose em contextos B2B/produto. Antes de importar ícones de marca do Lucide, verificar disponibilidade com `node -e "const l = require('lucide-react'); console.log(Object.keys(l).filter(k => /termo/i.test(k)))"`.

---

### 11. Abordagem Proativa com SonarCloud — Antecipar para não Remediar

* **Data:** `02/08/2026`
* **Categoria:** `Processo` | `Qualidade de Código` | `SonarCloud` | `Protocolo`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** A experiência da PR #31 mostrou que tratar o SonarCloud como uma etapa reativa (corrigir depois que a PR falha) gera retrabalho, commits corretivos desnecessários e histórico Git poluído. A mudança de postura foi criar o `sonar.md` como documento de referência proativa: a IA consulta os padrões exigidos pelo Quality Gate durante a FASE 0 (proposta técnica) e os aplica já na geração do código, antes de qualquer commit. O fluxo ganhou também a FASE 3.5, que torna obrigatória a resolução de issues do Sonar antes do merge — nunca postergando dívida técnica para issues futuras.
* **Atividade:** Criação do arquivo `sonar.md` com os 6 critérios do Quality Gate "Sonar way", checklist de padrões TypeScript/React exigidos, exemplos de código correto vs incorreto e instrução de como acessar issues de uma PR específica. Atualização do `kairos-labs-git-workflow.md` com o checklist Sonar na FASE 2.5 e a nova FASE 3.5.
* **Resultado:** A partir desta issue, o Sonar deixa de ser um obstáculo surpresa no final do ciclo e passa a ser um parceiro de qualidade consultado desde a proposta técnica. Issues do Sonar na PR são resolvidas antes do merge, mantendo o Quality Gate sempre verde e o histórico de commits limpo.

---

### 10. Protocolo de Sessão Atualizado — Build Obrigatório antes de Commits

* **Data:** `02/08/2026`
* **Categoria:** `Processo` | `Git` | `Protocolo`
* **Nível de Novidade:** Aprofundei
* **Descrição:** A experiência desta issue evidenciou que erros de TypeScript e de tipagem só são detectados no `npm run build` — não no `npm run dev` (que usa Turbopack e é mais permissivo). Commitar e fazer push sem rodar o build local resulta em checks falhando no Vercel/SonarCloud e commits de correção desnecessários que poluem o histórico. O protocolo de sessão foi atualizado para tornar o `npm run build` obrigatório antes de qualquer commit.
* **Atividade:** Atualização do `kairos-labs-git-workflow.md` com a FASE 2.5 (validação local obrigatória com build), a FASE 0 (entendimento e proposta técnica antes de qualquer código) e a nova regra de commits sequenciais com `Ref #` / `Closes #`.
* **Resultado:** Protocolo de sessão mais robusto, que previne retrabalho e mantém o histórico de commits limpo e significativo.

---

### 9. SonarCloud — Quality Gate e Interpretação de Resultados

* **Data:** `02/08/2026`
* **Categoria:** `CI/CD` | `Qualidade de Código` | `SonarCloud`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** O SonarCloud foi configurado no projeto e passou a fazer análise automática em cada PR. Na PR #31, o Quality Gate falhou por dois motivos: Reliability Rating B (causado pelo `as any` e outros padrões identificados como bugs potenciais) e Duplicated Lines 10.1% (acima do threshold de 3%, causado pelos blocos de estilos inline repetidos nos três painéis do modal). O Vercel (deploy) passou — o Sonar é uma camada de qualidade de código, não um bloqueador de produção.
* **Atividade:** Análise do relatório em `sonarcloud.io/summary/new_code?id=CabPiz_kairos-labs&pullRequest=31`. Decisão de fazer o merge mesmo com o Sonar falhando, registrando as issues para correção futura. Entendimento de que o Sonar tem thresholds padrão agressivos que precisam ser calibrados para o estágio atual do projeto.
* **Resultado:** Merge realizado com Vercel verde. Issues do Sonar documentadas para serem endereçadas em issues futuras do projeto.

---

### 8. Tipagem `never[]` do Supabase — Descompasso entre Tipos e Schema Real

* **Data:** `02/08/2026`
* **Categoria:** `TypeScript` | `Supabase` | `Debugging`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** O cliente Supabase tipado com `Database` (de `lib/types.ts`) infere o tipo da tabela como `never[]` quando a definição de tipos não bate exatamente com o schema real do banco. Isso aconteceu porque a tabela `waitlist` não havia sido criada quando os tipos foram definidos — gerando um descompasso entre o tipo TypeScript e a realidade do banco. O erro `Object literal may only specify known properties, and 'email' does not exist in type 'never[]'` bloqueou o build.
* **Atividade:** Tentativa de cast com `as { email: string; product_id: string }` (não funcionou). Solução via `(supabase as any).from("waitlist")` com comentário `eslint-disable` explícito para documentar a intenção. Identificação de issue futura: regenerar os tipos do Supabase com `supabase gen types` após a tabela estar criada no banco.
* **Resultado:** Build verde com workaround documentado. Issue futura criada para corrigir a tipagem corretamente usando os tipos gerados pelo Supabase CLI.

---

### 7. Zod v4 — Mudança de API: `.errors` virou `.issues`

* **Data:** `02/08/2026`
* **Categoria:** `TypeScript` | `Zod` | `Debugging`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** O projeto usa Zod v4 (instalado via `shadcn`). Na v4, o resultado de `safeParse` quando falha retorna `.error.issues` em vez de `.error.errors` como na v3. O build falhou com `Property 'errors' does not exist on type 'ZodError'` porque o código havia sido escrito com a API da v3. Essa mudança de API quebrou silenciosamente em runtime e só foi detectada no `npm run build`.
* **Atividade:** Erro identificado no output do `npm run build`. Correção de `.error.errors[0]?.message` para `.error.issues[0]?.message` na Server Action.
* **Resultado:** Build verde. Lição: sempre verificar a versão do Zod instalada e consultar o changelog ao migrar entre versões major.

---

### 6. GRANT de Permissão para o Role `anon` no Supabase

* **Data:** `02/08/2026`
* **Categoria:** `Banco de Dados` | `Supabase` | `Segurança`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** Habilitar RLS em uma tabela e criar políticas de INSERT não é suficiente para permitir inserções públicas. O role `anon` (usado pelo cliente Supabase com a `anon key`) também precisa de permissão explícita via `GRANT`. Sem isso, o Supabase retorna erro `42501: permission denied for table waitlist` mesmo com a política `WITH CHECK (true)` ativa.
* **Atividade:** Identificação do erro `42501` via `console.error` na Server Action. Leitura do hint retornado pelo Supabase: `Grant the required privileges to the current role with: GRANT INSERT ON public.waitlist TO anon`. Execução de `GRANT INSERT ON public.waitlist TO anon` e `GRANT INSERT ON public.feedback TO anon` no SQL Editor.
* **Resultado:** Inserções públicas funcionando corretamente. Entendimento da separação entre políticas RLS (quais linhas) e GRANT (quais operações) no PostgreSQL.

---

### 5. Migration não Executada — Diferença entre Código e Banco de Dados

* **Data:** `02/08/2026`
* **Categoria:** `Banco de Dados` | `Supabase` | `Debugging`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** O arquivo `supabase/migrations/001_initial_schema.sql` existia no repositório mas nunca havia sido executado no banco. O Supabase Free Tier não executa migrations automaticamente ao fazer push — elas precisam ser aplicadas manualmente via SQL Editor ou Supabase CLI. O erro `PGRST205: Could not find the table 'public.waitlist' in the schema cache` foi o sintoma, mas a causa raiz era simplesmente a ausência da tabela.
* **Atividade:** Diagnóstico via `console.error` na Server Action para expor o erro real do Supabase. Confirmação com `SELECT * FROM public.waitlist LIMIT 1` no SQL Editor, que retornou `relation does not exist`. Execução manual do SQL completo da migration no SQL Editor do painel Supabase.
* **Resultado:** Tabelas `waitlist` e `feedback` criadas com RLS e políticas corretas. Lição documentada: sempre verificar se as migrations foram aplicadas antes de testar integrações com o banco.

---

### 4. Tratamento Diferenciado de Erros do Supabase — Código 23505

* **Data:** `02/08/2026`
* **Categoria:** `Backend` | `Supabase` | `PostgreSQL`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** O Supabase retorna erros PostgreSQL com códigos padronizados. O código `23505` indica violação de constraint UNIQUE — no caso, o par `(email, product_id)` já existe na tabela. Tratar esse erro de forma diferenciada (estado `duplicate` em vez de `error` genérico) permite exibir uma mensagem específica e empática ao usuário ("Você já está na lista") em vez de uma mensagem de erro assustadora.
* **Atividade:** Verificação de `error.code === "23505"` na Server Action antes do fallback genérico. Criação de painel visual distinto para o estado `duplicate` no modal.
* **Resultado:** UX mais profissional e informativa para usuários que tentam se cadastrar mais de uma vez no mesmo produto.

---

### 3. Validação em Duas Camadas — Client-side e Server-side

* **Data:** `02/08/2026`
* **Categoria:** `Segurança` | `Arquitetura`
* **Nível de Novidade:** Aprofundei
* **Descrição:** A validação de e-mail foi implementada em duas camadas independentes: `react-hook-form + zod` no Client Component (feedback imediato ao usuário) e `zod` novamente na Server Action (defesa contra requisições diretas à action que bypassem o formulário). Isso segue o princípio de nunca confiar em dados vindos do cliente, mesmo em uma aplicação Next.js onde a action parece "interna".
* **Atividade:** Schema zod duplicado em `WaitlistModal.tsx` (client) e `waitlist-action.ts` (server), com tipos de retorno explícitos (`WaitlistActionState`) para cada cenário possível.
* **Resultado:** Formulário robusto contra manipulação direta de FormData e com feedback tipado para cada estado: `idle`, `success`, `duplicate`, `error`.

---

### 2. Server Components vs Client Components — Isolamento Cirúrgico

* **Data:** `02/08/2026`
* **Categoria:** `Arquitetura` | `Next.js`
* **Nível de Novidade:** Aprofundei
* **Descrição:** O arquivo `app/solucoes/[slug]/page.tsx` é um Server Component (`async function`) que usa `notFound()` e `generateStaticParams()` — funções exclusivas de Server Components. Adicionar `"use client"` no topo inteiro quebraria esses recursos. A solução foi criar um `WaitlistCTAButton.tsx` Client Component isolado, contendo apenas o estado do modal, enquanto o resto da página permanece Server Component.
* **Atividade:** Criação de `components/waitlist/WaitlistCTAButton.tsx` como wrapper client-side mínimo, recebendo `productId`, `productName`, `productColor` e `ctaLabel` como props serializáveis do Server Component pai.
* **Resultado:** Página de detalhe manteve todos os benefícios de Server Component (SSG, SEO, performance) sem abrir mão da interatividade do modal.

---

### 1. Fronteira de Escopo entre Issues é uma Decisão de Produto, não Técnica

* **Data:** `02/08/2026`
* **Categoria:** `Gestão de Produto` | `Arquitetura`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** A issue #8 (cards de produto) e a issue #9 (modal de waitlist) poderiam facilmente se sobrepor. A decisão de que o botão "Garantir Acesso Antecipado" só existiria na página de detalhe do produto (`/solucoes/[slug]`) e não nos cards da vitrine (`/solucoes`) foi uma decisão de produto — não técnica. Isso simplificou o escopo, eliminou duplicidade de fluxo e tornou a jornada do usuário mais intencional: o visitante precisa conhecer o produto antes de se cadastrar.
* **Atividade:** Discussão de escopo com o fundador antes de qualquer linha de código. Remoção do botão duplicado dos cards da vitrine como refatoração separada.
* **Resultado:** Fluxo de UX mais limpo, sem CTAs redundantes, e fronteira clara entre as duas issues.

---

### 7. Hero Section — Identidade Visual, Assets e Resolução de Falha no CI/CD

* **Data:** `01/08/2026`
* **Categoria:** `Frontend` | `UI/UX` | `CI/CD` | `TypeScript` | `Git Flow`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** Implementação completa da Hero Section da Kairos Labs, incluindo navbar responsiva, headline impactante, CTAs, cards de features e asset visual cyberpunk (hero-bg.webp). Durante o processo de PR, o CI/CD da Vercel identificou uma falha de build por erro de tipo TypeScript antes que o código chegasse à `main` — exatamente o papel do check automatizado.
* **Atividade:** Criação dos componentes `NavBar.tsx`, `HeroSection.tsx`, `HeroContent.tsx`, `FeatureCards.tsx` e adição dos assets `logo.png` e `hero-bg.webp`. Execução da esteira completa (branch → commit → push → PR). Ao identificar `1/2 checks failing` no `gh pr status`, utilizou-se `gh pr checks 29` para isolar o check com falha (Vercel Deployment), `npm run build` localmente para reproduzir o erro, diagnóstico do `Type error: Cannot find name 'Hero'` causado por texto inválido na linha 3 do `Hero.tsx`, remoção do arquivo problemático, novo commit de correção com `fix(hero):` e push para a mesma branch — disparando re-execução automática do CI que resultou em `All checks were successful`.
* **Resultado:** PR #29 merged com sucesso via `--squash`, issue #7 fechada automaticamente, branch deletada e `main` atualizada. Aprendizado prático do fluxo completo de debugging de CI/CD: do sinal de falha (`gh pr status`) até a resolução sem necessidade de fechar e reabrir o PR.

---

### 5. Vitrine de Produtos e Rotas Dinâmicas por Slug

* **Data:** `02/08/2026`
* **Categoria:** `Frontend` | `Next.js` | `Arquitetura de Rotas`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Implementação da vitrine pública de produtos do ecossistema Kairos Labs com roteamento dinâmico no Next.js 15 App Router. A pasta `app/solucoes/[slug]/` resolve cada produto por identificador único, permitindo páginas ricas sem duplicação de código. O conteúdo de cada página foi extraído dos PRDs reais de cada produto.
* **Atividade:** Criação de `app/solucoes/page.tsx` com grid de 5 cards interativos. Criação de `app/solucoes/[slug]/page.tsx` com mapa de dados tipado por produto (problema, solução, funcionalidades, público-alvo, stack e CTA). Uso de `generateStaticParams` para pré-gerar os slugs válidos em build time. Remoção de link redundante no NavBar após análise de UX — o botão "Explorar Soluções" no Hero já cumpria a função de navegação.
* **Resultado:** Cinco páginas de detalhe funcionais com conteúdo real baseado nos PRDs, navegação breadcrumb consistente e CTA de waitlist preparado para integração com o Supabase na Issue #9.

---

### 7. Design Orientado à Identidade de Marca — Hero Section com Ampulheta Animada

* **Data:** `31/07/2026`
* **Categoria:** `UI/UX` | `Frontend` | `Branding` | `Design de Produto`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Implementação da Hero Section completa da landing page pública da Kairos Labs. A decisão central do design foi usar a ampulheta (referência direta ao nome Kairos — "momento oportuno" em grego) como elemento signature visual animado, conectando a identidade da marca à sua proposta de valor de forma memorável e coerente. O sistema de cores dourado-âmbar (`#D4A853`) foi escolhido para evocar precisão e valor, diferenciando-se dos clichês de landings de tech (neón verde ou azul saturado).
* **Atividade:** Definição de um sistema de design próprio com paleta de 4 cores, tipografia pareada (Space Grotesk para display + Inter para corpo), e três decisões de risco calculado: efeito typewriter na headline, shimmer dourado animado no texto e canvas de partículas flutuantes como atmosfera ambient. Criação de componentes React: `HourglassSVG` (SVG animado com areia drenando em loop de 5s), `AmbientCanvas` (60 partículas douradas em requestAnimationFrame), `TypewriterText` (digitação caractere a caractere) e `HeroSection` (composição final com header sticky, seção hero, CTAs, stats e tags do ecossistema).
* **Resultado:** Componente `HeroSection.tsx` pronto para integração na rota pública `app/page.tsx`, com header sticky blur, dois CTAs funcionais (âncora de scroll e link GitHub), badge INPI, stats institucionais, tags dos 4 produtos do ecossistema e suporte completo a `prefers-reduced-motion` e responsividade mobile-first. Issue #7 do Milestone M2 entregue.

---

### 4. CI/CD Completo: Variáveis de Ambiente Seguras e Deploy Automático na Vercel

* **Data:** `31/07/2026`
* **Categoria:** `CI/CD` | `Infraestrutura` | `Segurança` | `Vercel` | `Supabase`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Configuração do pipeline de entrega contínua conectando o repositório GitHub ao projeto na Vercel, com gestão segura das variáveis de ambiente do Supabase. A separação entre `.env.example` (versionado, sem segredos) e `.env.local` (local, ignorado pelo Git) garante que as chaves da API nunca sejam expostas publicamente, seguindo o padrão da indústria para projetos com credenciais sensíveis.
* **Atividade:** Criação do `.env.example` com as três variáveis do Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`); linkagem do repositório à Vercel via CLI (`vercel link`); adição das variáveis nos ambientes Production e Preview via `vercel env add`; validação de deploy automático com push para `main`; confirmação de que `.env.local` está protegido pelo `.gitignore` nativo do Next.js.
* **Resultado:** Pipeline CI/CD 100% funcional — qualquer push para `main` dispara deploy automático na Vercel com SSL gratuito, zero custo de infraestrutura e credenciais do Supabase seguras fora do controle de versão.

---

### 3. Modelagem de Banco de Dados com RLS e Clientes Supabase Tipados

* **Data:** `31/07/2026`
* **Categoria:** `Backend` | `Banco de Dados` | `Segurança` | `TypeScript`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Criação do schema inicial do Supabase para o projeto Kairos Labs, cobrindo as tabelas `waitlist` e `feedback`. A decisão central foi habilitar Row Level Security (RLS) desde o primeiro dia, separando o que é público (insert) do que é restrito (select exclusivo do fundador autenticado via JWT). A constraint `UNIQUE(email, product_id)` foi adicionada para garantir integridade sem depender de validação apenas no frontend.
* **Atividade:** Escrita da migration SQL `001_initial_schema.sql` com criação de tabelas, habilitação de RLS e definição de quatro políticas de segurança. Criação do arquivo `lib/types.ts` com a interface `Database` tipada para uso com o cliente Supabase, incluindo o tipo `ProductId` com os quatro produtos do ecossistema. Implementação de `lib/supabase.ts` com três estratégias de cliente: `createClient` (browser), `createServerSupabaseClient` (SSR com cookies) e `createAdminClient` (service role para operações administrativas).
* **Resultado:** Backend de dados completamente configurado e seguro antes de qualquer feature de UI ser construída. As tabelas estão prontas para receber inscrições da waitlist pública e sugestões de feedback, com acesso administrativo restrito ao fundador. A tipagem TypeScript garante que erros de `product_id` inválido sejam capturados em tempo de compilação.

---

### 4. Scaffolding de Arquitetura: Pastas, Rotas e Contratos de Tipo

* **Data:** `31/07/2026`
* **Categoria:** `Arquitetura de Software` | `Next.js` | `TypeScript`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Definição e criação da estrutura completa de diretórios do projeto Kairos Labs usando Next.js 15 com App Router. A decisão de separar componentes por domínio (`sections/` para a landing page pública e `admin/` para o dashboard privado) e centralizar tipos TypeScript em `lib/types.ts` estabelece um contrato de arquitetura claro para todas as issues subsequentes.
* **Atividade:** Criação de todas as pastas (`app/admin/login`, `components/sections`, `components/admin`, `lib/`) e arquivos placeholder com comentários `TODO` referenciando a issue responsável pela implementação. Definição das interfaces TypeScript centrais (`WaitlistEntry`, `ProductId`, `FeedbackEntry`) e dos dois clientes Supabase (browser e server) em `lib/supabase.ts`. Commit e PR seguindo Conventional Commits em português.
* **Resultado:** Contrato de arquitetura do projeto consolidado e versionado no repositório público, desbloqueando o início paralelo das issues M2 (landing page) e M3 (dashboard). Recrutadores e tech leads já conseguem visualizar a separação de responsabilidades do sistema no primeiro olhar ao repositório.

---

### 2. Automação do Git Workflow com GraphQL e Estratégia de Commit Inicial

* **Data:** `31/07/2026`
* **Categoria:** `Processo` | `Git & Versionamento` | `Gestão de Produto`
* **Nível de Novidade:** Aprofundei / Aplicação Prática
* **Descrição:** Refinamento do protocolo de versionamento `kairos-labs-git-workflow.md` com fixação automática de variáveis de ambiente via query GraphQL na FASE 1, eliminando a busca manual de IDs do GitHub Projects v2. Remoção do comando explícito de movimentação para "Done" na FASE 4, delegando essa responsabilidade à automação nativa do GitHub acionada pelo `gh pr merge`. Decisão estratégica de incluir o `ROADMAP.md` no escopo da issue #21, garantindo que o repositório público seja inicializado com visão clara de execução do MVP v1.1.0 desde o primeiro commit.
* **Atividade:** Aplicação da query GraphQL (`gh api graphql`) para captura dinâmica de `PROJECT_ID`, `STATUS_FIELD_ID`, `IN_PROGRESS_OPTION_ID` e `IN_REVIEW_OPTION_ID` em variáveis locais de terminal reutilizáveis durante toda a sessão. Identificação e remoção do comando redundante de movimentação para "Done" (coberto pela automação nativa do GitHub Projects). Edição da issue #21 para incluir o `ROADMAP.md` junto ao `LICENSE`, com ambos sendo commitados juntos como primeiro commit do repositório. Aplicação da regra de usar `Closes #21` apenas no último commit ou no corpo do PR para evitar ruído no histórico.
* **Resultado:** Workflow de versionamento mais robusto, portável e livre de pontos de falha manuais. Repositório público da Kairos Labs inicializado com narrativa profissional (proteção legal + visão de produto visíveis desde o commit zero), aumentando a percepção de senioridade para recrutadores e tech leads. `ROADMAP.md` adicionado como arquivo de contexto persistente no projeto do Claude, reduzindo o tempo de onboarding nas sessões de trabalho das issues seguintes.

---

### 3. Recuperação de Arquivo Ausente no Repositório Pós-Merge

* **Data:** `31/07/2026`
* **Categoria:** `Processo` | `Git & Versionamento` | `Gestão de Produto`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** Identificação e correção de um arquivo de documentação (`ROADMAP.md`) que permaneceu local após o merge da issue #21, por ter sido esquecido no `git add` durante a FASE 2. A situação foi agravada por um erro de nomenclatura: o arquivo estava salvo como `roadmap.md` (minúsculas) em vez de `ROADMAP.md` (maiúsculas), padrão adotado para arquivos de documentação raiz do projeto Kairos Labs.
* **Atividade:** Diagnóstico da ausência do arquivo no repositório remoto após confirmação do merge. Renomeação local com `mv roadmap.md ROADMAP.md` para corrigir a capitalização. Commit direto na `main` com `git add ROADMAP.md` e mensagem no padrão Conventional Commits usando `Ref #21` (em vez de `Closes #21`) para vincular o commit à issue original sem tentar reabri-la. Push direto para `main` justificado pelo contexto: documentação fundacional que deveria ter entrado com a #21, não uma feature nova.
* **Resultado:** `ROADMAP.md` publicado corretamente no repositório com capitalização adequada e histórico vinculado à issue #21. Aprendizado consolidado de duas regras críticas: (1) arquivos de documentação raiz do projeto seguem o padrão de letras maiúsculas (`LICENSE`, `ROADMAP.md`, `README.md`); (2) quando uma issue já está fechada, usar `Ref #numero` no commit para manter a rastreabilidade sem efeitos colaterais no board.

---

### 2. Inicialização do Projeto Next.js 15 com App Router e Arquitetura de Pastas

* **Data:** `31/07/2026`
* **Categoria:** `Arquitetura` | `Frontend` | `Setup de Projeto`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Inicialização do repositório Kairos Labs com Next.js 15 utilizando App Router e Turbopack, estabelecendo a estrutura arquitetural base antes de qualquer funcionalidade. A decisão de organizar os componentes em `sections/`, `ui/` e `admin/` desde o início evita refatorações custosas nas próximas issues e sinaliza maturidade de engenharia para recrutadores que leem o repositório público.
* **Atividade:** Execução do `create-next-app@latest` com flags `--typescript --tailwind --app --no-src-dir`; configuração de aliases de paths no `tsconfig.json` (`@/*`); criação da estrutura de pastas (`components/ui`, `components/sections`, `components/admin`, `lib`, `types`); criação de placeholder files `lib/supabase.ts` e `lib/types.ts` com as interfaces `WaitlistEntry` e `ProductId`; `.env.example` com variáveis do Supabase; README atualizado com stack, setup local e licença. Instalação antecipada do `@supabase/supabase-js` para documentar a intenção arquitetural sem quebrar builds futuros. Resolução de conflito do `create-next-app` com arquivos pré-existentes no repositório via execução externa ao diretório.
* **Resultado:** Repositório público com estrutura profissional navegável, servidor rodando em `localhost:3000`, PR #23 mergeado via squash e issue #1 fechada automaticamente pelo GitHub. Base do ecossistema Kairos Labs pronta para receber as issues #2 (Tailwind + shadcn/ui) e #5 (arquitetura de rotas).

---

### 2. Configuração do Sistema de Design: Tailwind CSS v4 + shadcn/ui

* **Data:** `31/07/2026`
* **Categoria:** `Setup` | `Frontend` | `Design System` | `UI/UX`
* **Nível de Novidade:** Aprofundei
* **Descrição:** Configuração do sistema de design base da Kairos Labs com Tailwind CSS v4 e shadcn/ui. A principal distinção em relação à v3 é a migração da config para dentro do CSS via `@import "tailwindcss"`, eliminando o `tailwind.config.js`. O shadcn/ui foi inicializado com estilo Default e cor base Slate, com tokens de cor customizados para a identidade visual da Kairos Labs (roxo primário + fundo dark profundo).
* **Atividade:** Verificação da versão do Tailwind CSS (v4), substituição das diretivas `@tailwind` pelo `@import` de v4 em `globals.css`, execução do `npx shadcn@latest init` com configuração de estilo e CSS variables, definição dos tokens de cor da marca (purple-primary `262.1 83.3% 57.8%` e dark background `224 71.4% 4.1%`), instalação dos componentes base (Button, Card, Dialog, Input, Badge) e habilitação do dark mode por padrão no `app/layout.tsx`.
* **Resultado:** Sistema de design coeso e consistente estabelecido como base para toda a interface da Kairos Labs — landing page e dashboard do fundador compartilham os mesmos tokens, garantindo identidade visual unificada e manutenção facilitada.

---

### 3. Automação Unificada do Setup do Repositório e Gestão do GitHub Projects (Kanban)

* **Data:** `31/07/2026`
* **Categoria:** `Engenharia de Software` | `Ferramentas` | `Gestão de Produto`
* **Nível de Novidade:** Aprendi do zero / Aplicação Prática
* **Descrição:** Unificação de scripts de inicialização no repositório, isolamento de escopos e estratégias de gerenciamento de quadro Kanban (Projects v2) via CLI e extensões (`gh project`).
* **Atividade:** Consolidação das etapas de criação de Labels, Milestones e Issues em um único executável Shell (`kairos-labs-initial-setup.sh`), definição de estratégia de versionamento isolado para o commit da licença de propriedade intelectual (`LICENSE`) e mapeamento do fluxo de criação de colunas e vinculação em massa de cards no Kanban.
* **Resultado:** Script de inicialização zero-touch pronto para execução limpa, mantendo a integridade da árvore de commits e permitindo a importação estruturada do backlog completo no GitHub.

---

### 2. Otimização de Setup do GitHub via Shell Script e Automação de Kanban via CLI `gh`

* **Data:** `29/07/2026`
* **Categoria:** `Processo` | `DevOps` | `GitHub CLI` | `Gestão de Produto`
* **Nível de Novidade:** Aprendi do zero / Aplicação Prática
* **Descrição:** Identificação de gargalos no processo inicial de configuração do GitHub e na movimentação de tarefas no board Kanban durante as sessões de desenvolvimento com IA. Evolução da estratégia de setup manual/descritiva para automação 100% executável via script Bash e comandos nativos da CLI do GitHub (`gh`).
* **Atividade:**
  1. Análise do fluxo de geração do repositório, labels, milestones e projetos a partir do PRD, mapeando que instruções genéricas no prompt inicial resultavam em documentação estática em Markdown ao invés de automação executável.
  2. Estruturação do **Novo Padrão de Prompt Inicial** para concepção de novos projetos via IA: *"Baseado no meu PRD, gere um script Bash idempotente chamado `setup.sh` utilizando a CLI do GitHub (`gh`). O script deve automatizar 100% da criação do repositório, labels, milestones, GitHub Project (Kanban) e importação de todas as issues com seus respectivos checklists e metadados. Forneça também o arquivo `.md` apenas como documentação de apoio."*
  3. Mapeamento dos comandos GraphQL/CLI do GitHub (`gh project item-edit`) no arquivo de workflow para garantir que a IA forneça os comandos de movimentação real de cards entre colunas do Board (`Backlog` ➔ `In Progress` ➔ `Done`) em cada issue trabalhada.
* **Resultado:** Redução drástica do tempo de inicialização de novos projetos de software (passando de dezenas de minutos manuais para execução instantânea via terminal com `setup.sh`) e eliminação do trabalho manual de arrastar cards no Kanban do GitHub Projects durante o ciclo de vida das issues.

---

### 6. Diferença entre PowerShell e Git Bash no Windows

* **Data:** `28/07/2026`
* **Categoria:** `Engenharia de Software` | `Ambiente de Desenvolvimento` | `Processo`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** Identificação de que o Windows possui múltiplos ambientes de terminal com conjuntos de comandos distintos e incompatíveis. O PowerShell — terminal padrão do VS Code no Windows — não reconhece comandos Unix como `chmod` e `bash`, usados em scripts `.sh`. O Git Bash, instalado junto com o Git for Windows, emula o ambiente Linux dentro do Windows e permite executar scripts shell normalmente, sendo o ambiente correto para uso com `gh` CLI e automações de repositório.
* **Atividade:** Tentativa de execução do script `kairos-labs-create-issues.sh` no PowerShell, resultando em erro `chmod: comando não reconhecido`; diagnóstico do problema via `Get-Command bash`; instalação do Git for Windows; ativação do terminal Git Bash dentro do VS Code pelo seletor de terminal (`∨` ao lado do `+` no painel); compreensão de que caminhos Windows (`C:\pasta`) se convertem para o padrão Unix no Git Bash (`/c/pasta`).
* **Resultado:** Ambiente de terminal corretamente configurado com Git Bash no VS Code, pronto para executar scripts `.sh`, comandos `gh` e toda a esteira de versionamento documentada no projeto.

---

### 5. Criação de Issues via Shell Script e Execução Local com gh CLI

* **Data:** `28/07/2026`
* **Categoria:** `Engenharia de Software` | `Processo` | `Automação`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** Compreensão de que scripts `.sh` não são executados no GitHub, mas sim localmente no terminal do VS Code, usando o `gh` CLI como ponte entre a máquina local e a API do GitHub. Esse entendimento muda a forma de encarar automação: qualquer configuração repetível de repositório — issues, labels, milestones — pode ser codificada em um script e reexecutada em projetos futuros com um único comando.
* **Atividade:** Geração do script `kairos-labs-create-issues.sh` com os 21 comandos `gh issue create` completos, incluindo título, body com checklist, labels e milestone de cada issue; aprendizado do fluxo de execução local (`chmod +x` + `./script.sh` no terminal integrado do VS Code); compreensão da dependência de ordem — labels e milestones precisam existir antes das issues; identificação de que em projetos futuros o setup completo (labels + milestones + issues) pode ser consolidado em um único script de inicialização de repositório.
* **Resultado:** 21 issues prontas para serem criadas via terminal com um único comando, e repertório adquirido para automatizar o setup completo de repositórios GitHub em projetos futuros sem depender da interface visual.

---

### 4. Esteira Profissional de Versionamento com Git, GitHub e gh CLI

* **Data:** `28/07/2026`
* **Categoria:** `Engenharia de Software` | `Processo` | `Gestão de Produto`
* **Nível de Novidade:** Aprendi do zero / Aprofundei
* **Descrição:** Aprendizado e documentação da esteira completa de versionamento utilizada pelo mercado de desenvolvimento de software, desde a criação de uma branch até o merge e encerramento da issue, 100% executada via terminal sem uso da interface visual do GitHub. O domínio desse fluxo é um dos principais sinais que recrutadores e tech leads avaliam ao revisar um repositório público de um candidato.
* **Atividade:** Estudo do Git Flow simplificado e sua lógica de nunca commitar diretamente na `main`; definição da convenção de nomenclatura de branches (`tipo/numero-descricao`); aprendizado e aplicação do padrão Conventional Commits (feat, fix, chore, docs, refactor, ci) com mensagens no imperativo em inglês; mapeamento das 4 fases do ciclo de uma issue (início, desenvolvimento, PR, merge); substituição de todas as etapas de interface visual do GitHub pelos comandos equivalentes do `gh` CLI (`gh issue edit`, `gh pr create`, `gh pr diff`, `gh pr merge --squash --delete-branch`, `gh issue view`); documentação do protocolo de sessão de trabalho com o Claude; geração do documento `kairos-labs-git-workflow.md` v2.0 para uso como referência permanente e contexto do projeto.
* **Resultado:** Esteira de versionamento profissional documentada e pronta para execução, com referência rápida de comandos por fase, diagrama visual do fluxo e seção de comandos `gh` do dia a dia. O repositório da Kairos Labs seguirá esse padrão desde o primeiro commit, demonstrando maturidade de processo para qualquer avaliador técnico.

---

### 3. Decisão de Licença e Proteção da Propriedade Intelectual do Repositório

* **Data:** `28/07/2026`
* **Categoria:** `Propriedade Intelectual` | `Gestão de Produto` | `Processo`
* **Nível de Novidade:** Aprendi do zero
* **Descrição:** Compreensão das diferenças entre licenças de software open source (MIT, Apache, GPL) e a declaração de direitos reservados (All Rights Reserved), e identificação de que a licença MIT — padrão sugerido pelo GitHub — é incompatível com os objetivos de propriedade exclusiva da Kairos Labs. A decisão protege o código-fonte publicamente exposto sem conceder qualquer direito de uso, cópia ou modificação a terceiros, mantendo o repositório público apenas para fins de avaliação técnica por recrutadores.
* **Atividade:** Análise comparativa entre licenças open source e All Rights Reserved; decisão de não selecionar nenhuma licença no momento da criação do repositório; redação do conteúdo do arquivo LICENSE com proibições expressas de cópia, modificação, distribuição e engenharia reversa; definição de que sugestões externas devem ser enviadas pela interface do site, não por Pull Request; atualização da seção 7 do PRD v1.1.0 para refletir essa política; criação das issues #20 (LICENSE) e #21 (interface de feedback) e atualização da ordem de execução do backlog, posicionando a #20 como primeiro commit do repositório.
* **Resultado:** Repositório público com proteção legal explícita desde o primeiro commit, PRD atualizado com seção de propriedade intelectual, e backlog revisado com 21 issues na ordem correta de execução.

---

### 2. Automação de Backlog via GitHub CLI, Gestão de Milestones e Permissões de Repositório

* **Data:** `28/07/2026`
* **Categoria:** `Engenharia de Software` | `Ferramentas` | `Processo`
* **Nível de Novidade:** Aprendi do zero / Aplicação Prática
* **Descrição:** Identificação de dependências relacionais ao automatizar a criação de issues via `gh cli`. Compreensão dos escopos de permissão do GitHub (`delete_repo`), gerenciamento de remotos no Git e fluxo de reset e recriação limpa de repositórios.
* **Atividade:** Atualização dos escopos de autenticação do CLI (`gh auth refresh`), criação prévia de milestones via API (`gh api`), recriação do repositório remoto com descrição institucional da marca registrada no INPI e ressincronização das branches locais.
* **Resultado:** Resolução de falhas na esteira de setup, garantia da numeração sequencial perfeita das 21 issues (de #1 a #21) no Kanban e vinculação correta do projeto.

---

### 1. Instruções e Estruturação do Diário de Aprendizado da Marca

* **Data:** `28/07/2026`
* **Categoria:** `Processo` | `Gestão de Produto` | `PRD`
* **Nível de Novidade:** Aprendi do zero / Aprofundei
* **Descrição:** Definição da estrutura oficial e padronizada para o registro das entradas do Diário de Aprendizado do ecossistema Kairos Labs. Estabelecimento do guia visual com taxonomia rígida para categorias e níveis de novidade.
* **Atividade:** Criação do documento `diario_de_aprendizado_kairos_labs.md` com modelo reusável de preenchimento, metadados exigidos e instrução para atualização automática via IA ao fim de cada sessão.
* **Resultado:** Padrão definitivo estabelecido para a documentação de conquistas de produto e negócio, servindo como fonte de evidências para plataformas de portfólio como o DevPrint.
