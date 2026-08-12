# CLAUDE.md — Kairos Labs

Arquivo de contexto lido automaticamente pelo Claude Code a cada sessão.
Repositório: `CabPiz/kairos-labs` | Owner: `CabPiz` | Project Board: nº 3

### 📓 Diário de Aprendizado — Repositório Central
O diário centralizado de todos os projetos fica em **`CabPiz/concentrador`** (privado).
O arquivo `1.diario_de_aprendizado.md` deste projeto está no `.gitignore` — **nunca sobe para o GitHub do projeto**.
Ao encerrar cada sessão, o Claude Code escreve a entrada **apenas no repo central**:

```bash
cd /tmp/concentrador && git pull origin main
# inserir entrada no topo do arquivo 1.diario_de_aprendizado.md
git add 1.diario_de_aprendizado.md
git commit -m "diario(kairos-labs): [título curto da entrada]"
git push origin main
```

### 📋 Business Plan — Localização
O business plan deste projeto está em **`CabPiz/concentrador`** (privado), no caminho:
`kairos-labs/business_plan.md`

O arquivo `docs/business_plan.md` deste projeto está no `.gitignore` — **nunca sobe para o GitHub do projeto**.

**Campo obrigatório em toda entrada do diário:** `* **Projeto:** \`Kairos Labs\`` — inserir antes de `* **Issue:**`.

---

## ⚙️ PERMISSÕES DO CLAUDE CODE NESTA SESSÃO

### ✅ PERMITIDO — execução autônoma pelo Claude Code
- Ler qualquer arquivo do repositório
- Criar e editar arquivos de código-fonte diretamente no disco
- Criar e editar arquivos de documentação (`.md`) diretamente no disco
- Rodar `npm run build` para validar o build
- Rodar `npm test` para rodar a suite de testes
- Rodar `npm run test:e2e 2>&1 | tee saida.log` para rodar os testes E2E
- Rodar `npm run lint` para verificar conformidade ESLint
- Ler issues do GitHub com `gh issue view [NUMERO]` e `gh issue list`
- Ler o arquivo `saida.log` na raiz do projeto para analisar resultados de comandos
- Rodar `gh pr checks [N] --watch` para acompanhar CI
- Executar o bloco de merge da FASE 4: `gh pr merge --squash --delete-branch`, `git checkout main`, `git pull origin main`, `gh issue view [N]`
- Executar commits atômicos da FASE 3: `git add`, `git commit`
- Executar push da branch: `git push origin [branch]`
- Abrir PR: `gh pr create`
- Adicionar issues ao board: `gh project item-add 3 --owner CabPiz --url [url]`
- Consultar labels reais com `gh label list` antes de criar issues
- Consultar milestones reais com `gh api repos/CabPiz/kairos-labs/milestones --jq '.[].title'` antes de criar issues
- Executar `gh issue edit` (labels, assignees)
- Executar `gh project item-edit` (movimento de card no Board)
- Executar queries `gh api graphql`
- Postar comentários em issues: `gh issue comment [NUMERO] --body "[texto]"`

### 📋 PADRÃO DE SAÍDA DE COMANDOS — tee para saida.log

Todo comando executado pelo Claude Code cujo resultado precise ser analisado deve usar `tee saida.log`:

```bash
comando 2>&1 | tee saida.log
```

O arquivo `saida.log` é sobrescrito a cada execução (sem acumulação).

---

## 📋 PROTOCOLO DE SESSÃO — FLUXO OBRIGATÓRIO

### Abertura da sessão
O usuário inicia sempre com:
> "issue #[número]"

Ao receber isso, o Claude Code executa **imediatamente e de forma autônoma**, nesta ordem:
```bash
gh issue view [NUMERO]
```
para ler o escopo completo da issue. Em seguida, **obrigatoriamente**, lê o arquivo `BUILD_ERRORS.md` na raiz do projeto.

**Verificação de milestone:** ainda na abertura, o Claude Code verifica se a issue é a última do seu milestone, consultando a sequência definida no `ROADMAP.md`. Issues finais de cada milestone: **#12** (M2), **#39** (M5), **#16** (M3), **#20** (M4). Se for a última, o Claude Code já inclui a atualização do `ROADMAP.md` no escopo da sessão — e comunica isso ao usuário na FASE 1.

---

### FASE 0 — Versionamento Imediato (executado ANTES de propor qualquer solução)

**Obrigatória para TODAS as issues, sem exceção. Executada de forma autônoma assim que o usuário indica a issue.**

> **Motivo:** detalhar uma solução já é trabalhar na issue — a issue já saiu do backlog no momento em que começa a ser analisada. O card deve refletir isso imediatamente.

O Claude Code executa diretamente, nesta ordem:

```bash
# 1. Atualizar a main e criar branch
git checkout main
git pull origin main
git checkout -b tipo/[NUMERO]-descricao-curta
```

**Passo 2 — Atribuir e marcar como In Progress (depende do ambiente):**

**Ambiente local** (`gh` CLI disponível — sessão desktop):
```bash
gh issue edit [NUMERO] --add-assignee "@me"
gh issue edit [NUMERO] --add-label "status: in progress"
gh project item-add 3 --owner CabPiz --url [url-da-issue]
# mover card para "In Progress" via gh project item-edit (ver FASE 3 para IDs)
```

**Ambiente remoto** (`gh` indisponível — sessão web/celular):
- Usar `mcp__github__issue_write` com `assignees: ["CabPiz"]` e `labels: [..., "status: in progress"]`
- Movimentação de card no board: **não disponível** — o label `status: in progress` é o mecanismo de rastreio
- **Done é aplicado automaticamente pelo GitHub Projects na FASE 4 (merge do PR)** — esse é o estado mais importante

> **Regra de ouro do board em sessão remota:** In Progress = label `status: in progress` (visível na issue). Done = automação do GitHub Projects no merge. In Review = label `status: ready for review` (aplicado na FASE 3).

---

### FASE 1 — Entendimento e Proposta Técnica (PAUSA OBRIGATÓRIA)

**Executada após a FASE 0, com o card já em "In Progress".**

1. **Leitura e Confirmação de Escopo**
   - Ler os requisitos da issue, identificar dependências, fronteiras com outras issues e ambiguidades.
   - Apresentar resumo do entendimento e fazer perguntas de clarificação necessárias.

2. **Auditoria Interna de Boas Práticas (executada pelo Claude Code antes de propor qualquer solução)**

   > **PROIBIDO apresentar a proposta técnica ao usuário antes de concluir esta auditoria.** A solução só é exibida após passar por todos os critérios abaixo.

   O Claude Code avalia internamente a solução candidata contra os seguintes eixos, **nesta ordem**:

   | # | Eixo | Critério mínimo |
   |---|---|---|
   | 1 | **Reutilização de componentes** | Verificar se já existe componente, hook, action ou utilitário que atende parcial ou totalmente o requisito. Reusar antes de criar. (lição ERR-004) |
   | 2 | **Padrões Sonar** | Checar toda a solução candidata contra cada regra da seção `🔍 PADRÕES SONAR` deste arquivo: props `readonly`, `button type`, acessibilidade de mouse, espaçamento JSX, testes parametrizados, index como key, `prefetch={false}`, imports mortos. |
   | 3 | **Dependências entre camadas** | Confirmar que `lib/` não importa de `components/` ou `app/`; `components/` não importa de `app/`; Client Components não importam de `supabase-server` ou `server-only`. |
   | 4 | **Segurança Supabase** | Writes usam `createServerAdminClient()`; reads usam SSR client + RPC com `SECURITY DEFINER`. Cast `as any` onde necessário (ERR-002). |
   | 5 | **Cobertura de testes** | A proposta DEVE listar explicitamente cada teste unitário que será criado ou atualizado para cobrir 100% das linhas novas/modificadas — Sonar reprova PRs com cobertura de código novo abaixo do threshold. Spec E2E obrigatória para todo fluxo com submit ou autenticação. Toda nova spec Playwright (`*.spec.ts`) criada na FASE 2 deve ser adicionada a `sonar.coverage.exclusions` em `sonar-project.properties` (padrão `e2e/**,**/*.spec.ts` já configurado). **Antes de propor os testes, ler `COVERAGE_GAPS.md` e verificar o checklist de prevenção — qualquer padrão da solução candidata que constar nos gaps conhecidos (GAP-001 a GAP-005) exige inclusão do teste preventivo correspondente na proposta.** |
   | 6 | **Consistência de estilo** | Tailwind para valores estáticos; `style={{}}` apenas para valores dinâmicos de runtime. Novos componentes seguem o padrão visual existente. |
   | 7 | **Convenções de código** | Conventional Commits em português, branch no padrão correto, sem comentários desnecessários, sem abstrações prematuras. |
   | 8 | **Performance** | A solução introduz queries extras, N+1, re-renders desnecessários ou aumento relevante de bundle? Se sim, propor alternativa mais eficiente ou documentar o trade-off explicitamente na justificativa. |

   Se qualquer eixo reprovar, o Claude Code ajusta a solução candidata internamente até aprovação em todos os eixos. **O usuário nunca vê uma proposta que não passou pela auditoria.**

3. **Proposta Técnica Detalhada** (exibida somente após auditoria interna aprovada)
   - Propor solução completa: arquivos a criar/modificar, arquitetura, decisões de design e justificativas.
   - Apresentar alternativas quando houver trade-offs relevantes.
   - Incluir obrigatoriamente ao final a seção **"✅ Justificativa de Boas Práticas"** — ver formato abaixo.
   - Encerrar sempre com: *"A proposta técnica está alinhada com o esperado para prosseguirmos com a implementação?"* — e **PARAR**.

4. **Registro na Issue (executado após aprovação explícita do usuário, antes de iniciar a FASE 2)**

   O Claude Code posta **dois comentários na issue**, nesta ordem obrigatória:

   **Comentário 1 — Proposta Técnica** (resumo do que foi apresentado ao usuário):
   ```bash
   gh issue comment [NUMERO] --body "$(cat <<'EOF'
   ## 📋 Proposta Técnica — [título curto]

   [resumo dos arquivos a criar/modificar, decisões de design e justificativas apresentadas ao usuário]

   *Proposta apresentada e aprovada pelo fundador — CLAUDE.md v[X]*
   EOF
   )"
   ```

   **Comentário 2 — Auditoria de Boas Práticas**:
   ```bash
   gh issue comment [NUMERO] --body "$(cat <<'EOF'
   ## ✅ Auditoria de Boas Práticas — Proposta Aprovada

   [conteúdo da seção Justificativa de Boas Práticas]

   *Auditoria executada pelo Claude Code antes da implementação — CLAUDE.md v[X]*
   EOF
   )"
   ```

   > **Ordem obrigatória:** a proposta técnica sempre precede a auditoria. O histórico da issue deve refletir o fluxo real: primeiro o que foi proposto, depois a checagem de boas práticas que validou a proposta. Postar apenas a auditoria sem a proposta deixa o histórico incompleto — um dev futuro vê que a proposta "passou" mas não consegue reconstruir o que foi proposto.

   Esses dois comentários são a evidência de que a solução foi apresentada, aprovada e auditada antes de qualquer linha de código ser escrita.

#### Formato da seção "✅ Justificativa de Boas Práticas"

Incluir ao final de toda proposta técnica, com uma linha por eixo auditado:

```markdown
## ✅ Justificativa de Boas Práticas

| Eixo | Decisão adotada | Por quê atende a melhor prática |
|---|---|---|
| Reutilização | [componente/padrão reusado ou motivo de criação nova] | [justificativa] |
| Sonar | [conformidades garantidas] | [quais regras foram verificadas] |
| Camadas | [ausência de violações de dependência] | [estrutura respeitada] |
| Segurança Supabase | [client usado para cada operação] | [alinhamento com padrão do projeto] |
| Testes | [unitários + E2E previstos] | [cobertura dos fluxos críticos] |
| Estilo | [Tailwind vs inline styles] | [critério de uso de cada abordagem] |
| Convenções | [commits, branch, comentários] | [conformidade com o padrão estabelecido] |
| Performance | [impacto em queries, re-renders, bundle] | [ausência de N+1, re-renders ou trade-off documentado] |
```

> **ATENÇÃO:** Respostas do usuário que fornecem dados solicitados (links, e-mails, nomes) **não constituem aprovação**. A aprovação explícita é obrigatória — palavras como "sim", "pode ir", "aprovado", "prossiga". Enquanto não houver aprovação explícita, o Claude Code permanece em FASE 1.

---

### FASE 2 — Código-Fonte (Claude Code edita os arquivos diretamente)

#### Regra de Desvio da Solução Proposta

Durante a implementação, pode surgir a necessidade de ajustar a solução proposta na FASE 1 — por bug encontrado na prática, incompatibilidade de tipos, comportamento inesperado de biblioteca, restrição do CI ou refinamento de abordagem.

**Sempre que a implementação real divergir da solução aprovada na FASE 1**, o Claude Code deve:

1. Identificar exatamente o que mudou e por quê (causa raiz, não sintoma).
2. Aplicar a correção nos arquivos.
3. Postar um comentário na issue documentando o desvio:

```bash
gh issue comment [NUMERO] --body "$(cat <<'EOF'
## 🔄 Desvio de Implementação — [título curto do ajuste]

**O que foi proposto:** [descrição da abordagem original aprovada]

**O que foi implementado:** [descrição da abordagem real]

**Motivo do desvio:** [causa raiz — bug, incompatibilidade de tipos, CI, refinamento técnico]

**Impacto:** [nenhum impacto funcional / comportamento ajustado / trade-off aceito]

*Registrado pelo Claude Code durante a FASE 2 — CLAUDE.md v1.9*
EOF
)"
```

> **Motivo:** a issue é o registro histórico da decisão técnica. Se a solução real diverge da proposta, o histórico fica inconsistente e um dev futuro que leia a issue terá uma visão incorreta do que foi feito e por quê. O comentário de desvio fecha esse gap de rastreabilidade.

- O Claude Code edita os arquivos diretamente no disco.
- **Antes de editar qualquer arquivo**, o Claude Code aplica proativamente todas as regras da seção `🔍 PADRÕES SONAR` deste arquivo. O código gerado já deve estar em conformidade — nunca delegar a verificação Sonar para o usuário.
- O Claude Code é responsável pela conformidade Sonar. O usuário nunca revisa o checklist manualmente.
- **Para issues que envolvem qualquer artefato que o usuário precise validar** (UI/UX, documentos `.md`, conteúdo gerado): apresentar o que foi criado/modificado e encerrar com *"Você validou o resultado? Pode prosseguir?"* — e **PARAR até receber validação explícita**.
- Essa é uma das **pausas obrigatória de validação no fluxo**. Todas as demais etapas (build, testes, CI, merge, diário) são executadas autonomamente pelo Claude Code.

---

#### Regra de Varredura de Impacto em Testes (obrigatória a cada edição de arquivo)

**Princípio:** toda mudança de contrato de interface — ARIA roles, textos visíveis, URLs, assinatura de props, nomes de funções exportadas — quebra testes existentes de forma previsível e óbvia. O Claude Code não descobre isso no CI; descobre **antes de commitar**, varrendo os testes imediatamente após cada edição.

**Gatilho:** sempre que a FASE 2 editar qualquer arquivo de código-fonte, o Claude Code executa a varredura correspondente nos diretórios `__tests__/` e `e2e/` **antes de avançar para o próximo arquivo ou para os commits**:

| O que foi alterado no arquivo | O que grep nos testes |
|---|---|
| `role="X"` trocado por `role="Y"` | `getByRole("X"` — atualizar para o novo papel |
| `aria-label` ou texto visível alterado | `getByRole(..., {name:})`, `getByText(`, `getByLabelText(` com o texto antigo |
| Rota ou `href` alterado | `goto(`, `toHaveURL(`, `navigate(` com a URL antiga |
| Props renomeadas ou removidas | Todos os locais onde o componente é instanciado nos testes |
| Função exportada renomeada ou removida | Todos os `import` e chamadas nos testes |
| Estrutura de resposta de Server Action alterada | Testes que fazem `expect(resultado.campo)` |

**Procedimento:**

```bash
# Exemplo: ao trocar role="listbox" por role="menu" no LanguageSwitcher
grep -rn "listbox\|getByRole.*option" __tests__/ e2e/ --include="*.ts" --include="*.tsx"
# → atualizar TODOS os matches antes de avançar
```

**Regra de ouro:** se o arquivo editado exporta um contrato (componente, função, rota, ARIA) e existem testes para ele, esses testes fazem parte da mesma mudança lógica e **devem ser atualizados no mesmo commit**. Nunca são descobertos no CI — são responsabilidade do Claude Code durante a FASE 2.

> **Motivo (lição da issue #88):** ao corrigir `role="listbox"→"menu"` no `LanguageSwitcher` (Sonar S6819), os testes unitários do componente foram atualizados mas os locators E2E (`e2e/i18n.spec.ts`) foram ignorados — porque estavam em outro arquivo. Resultado: 3 ciclos de CI extras e horas desnecessárias. Um engenheiro sênior atualiza tudo na mesma tacada; o Claude Code deve ter o mesmo reflexo institucionalizado.

---

### FASE 2.5 — Validação Local Obrigatória (usuário executa)

**Passo 1 — Build do projeto**

O Claude Code instrui o usuário a rodar:

```bash
npm run build
```

> **Regressão obrigatória após qualquer alteração de fonte:** sempre que a FASE 2 modificar arquivos de código-fonte (`.ts`, `.tsx`), o Claude Code instrui o usuário a rodar a suite completa de testes unitários **antes** dos testes manuais. O objetivo é detectar regressões nos testes já existentes antes de prosseguir.

```bash
npm test 2>&1 | tee saida.log
```

O Claude Code lê o `saida.log` e confirma que **todos os test suites passaram** antes de avançar. Se algum teste existente quebrar, o Claude Code investiga e corrige o arquivo causador antes de prosseguir.

**Verificação de cobertura local (executada pelo Claude Code imediatamente após `npm test`):**

```bash
node scripts/check-coverage.mjs 2>&1 | tee saida.log
```

O script lê `coverage/coverage-final.json`, filtra apenas os arquivos modificados na branch e lista quais estão abaixo de 80% — com linhas e funções exatas sem cobertura. **Se qualquer arquivo aparecer na lista, o Claude Code corrige os testes imediatamente antes de avançar para commits.** O usuário nunca vê um gap de coverage que o Sonar detectaria — é resolvido localmente, nesta etapa. Se o gap revelado for um padrão novo (não listado no `COVERAGE_GAPS.md`), o Claude Code registra o padrão no arquivo antes de prosseguir.

> **Hook de pre-commit ativo (desde a issue #34):** Husky + lint-staged estão configurados. Ao executar `git commit`, o hook `.husky/pre-commit` roda automaticamente `npx lint-staged`, que executa `eslint --max-warnings=0` nos arquivos `.ts` e `.tsx` modificados. Se houver erro ou warning de lint, o commit é bloqueado. O Claude Code deve garantir conformidade ESLint antes de entregar os blocos de commit da FASE 3.

- Se falhar: Claude Code analisa o erro, corrige os arquivos e **documenta o erro no `BUILD_ERRORS.md`** se for um padrão novo, depois solicita novo build.
- **PROIBIDO** avançar para testes manuais ou commits enquanto houver erros de build.

Após build verde, o Claude Code realiza internamente a validação Sonar de todos os arquivos editados na sessão, verificando cada regra da seção `🔍 PADRÕES SONAR` deste arquivo. Se detectar qualquer não-conformidade, corrige os arquivos antes de prosseguir. O usuário não precisa revisar nada — o Claude Code confirma: *"Build verde e conformidade Sonar validada. Pronto para os testes manuais."*

**Passo 2 — Testes manuais (após build verde)**

O Claude Code descreve objetivamente o que deve ser testado na interface/funcionalidade implementada, incluindo:
- O fluxo principal (caminho feliz) a validar.
- Os casos de borda relevantes para a issue.
- Critérios claros de sucesso para cada cenário.

O usuário executa os testes e **envia prints que comprovem os resultados** (tela, console, rede — conforme aplicável). O Claude Code aguarda esses prints antes de prosseguir.

Após receber e analisar os prints:
- O Claude Code confirma se os critérios foram atendidos.
- O trabalho de teste é **registrado no Diário de Aprendizado** da sessão para dar visibilidade ao esforço de validação do desenvolvedor/testador.
- Se houver falha identificada nos prints, o Claude Code corrige os arquivos, solicita novo build e nova rodada de testes.

**Passo 3 — Testes E2E com Playwright (quando aplicável)**

Para issues que envolvem fluxos de UI críticos (formulários, modais, autenticação, navegação protegida), o Claude Code **executa diretamente** os testes E2E após os testes manuais:

```bash
npm run test:e2e 2>&1 | tee saida.log
```

O Claude Code lê o `saida.log` para confirmar resultado. **O usuário nunca roda este comando — é responsabilidade exclusiva do Claude Code.** Se o fluxo implementado ainda não tiver spec E2E, o Claude Code cria ou atualiza o arquivo correspondente em `e2e/` como parte da FASE 2 — **nunca** delegar a criação de specs para depois. Issues que **exigem** spec E2E nova ou atualizada: qualquer fluxo que envolva submit de formulário, autenticação, redirecionamento protegido ou confirmação visual de ação do usuário.

**Passo 4 — Testes Visuais Mobile (obrigatório para issues com componentes de UI)**

Para qualquer issue que crie ou modifique componentes visíveis na interface (seções, header, nav, modal, cards, layout responsivo), o Claude Code **executa diretamente** o script de screenshots mobile antes de iniciar a FASE 3:

```bash
node --experimental-vm-modules scripts/take-mobile-screenshots.mjs 2>&1 | tee saida.log
```

O script captura screenshots automatizados nos seguintes viewports padrão:

| Dispositivo | Largura | Altura | Tipo |
|---|---|---|---|
| iPhone SE | 375px | 667px | mobile |
| iPhone 14 Pro Max | 430px | 932px | mobile |
| Pixel 8 | 412px | 915px | mobile |
| iPad Mini | 768px | 1024px | tablet |
| Surface Pro 7 | 912px | 1368px | tablet |

Os screenshots são salvos em `C:/Users/Cesar/AppData/Local/Temp/claude/kairos-mobile-screenshots/` e o Claude Code analisa cada imagem **antes** de abrir PR. Checklist visual obrigatório:

- [ ] Logo sem quebra de linha em nenhum viewport
- [ ] Menu mobile full-screen sem conteúdo sangrando por baixo
- [ ] Nav links visíveis e funcionais no desktop (≥640px)
- [ ] Hamburger visível e funcional no mobile (<640px)
- [ ] Seções adicionadas com layout correto em cada breakpoint (1 coluna mobile → grid desktop)
- [ ] Textos não cortados nos containers

Se qualquer item falhar: corrigir o arquivo, rodar `npm run build` e re-executar o script antes de prosseguir.

> **Resultado dos testes visuais mobile deve ser incluído no comentário de certificação de qualidade pré-merge** (FASE 4), com a lista de viewports validados — isso mantém o carimbo de qualidade rastreável na issue.

---

### FASE 3 — Commits Atômicos (Claude Code executa diretamente)

**Verificação obrigatória antes do primeiro `git add`:**

```bash
git branch --show-current
```

Confirmar que a branch ativa é a branch da issue (ex: `feature/107-descricao`). Se retornar `main`, parar imediatamente e mudar para a branch correta antes de qualquer commit. Commits na branch errada exigem recuperação com `merge --ff-only` + `reset --hard` — evitável com 1 segundo de verificação.

**Regra:** cada commit cobre UMA mudança lógica. Commits intermediários usam `Ref #[NUMERO]`. Apenas o último usa `Closes #[NUMERO]`.

```bash
git add .
git commit -m "feat(escopo): descrição curta no imperativo em português

Corpo explicando o porquê da mudança.

Ref #[NUMERO]"

# (repetir para cada mudança lógica)

git add .
git commit -m "feat(escopo): descrição do último commit

Corpo explicando o porquê.

Closes #[NUMERO]"
```

Após os commits, o Claude Code executa diretamente o bloco de abertura de PR:

```bash
# Enviar branch
git push origin tipo/[NUMERO]-descricao

# Atualizar labels
gh issue edit [NUMERO] --add-label "status: ready for review"
gh issue edit [NUMERO] --remove-label "status: in progress"

# Mover card para "In Review"
gh project item-edit --id $ITEM_ID --project-id $PROJECT_ID --field-id $STATUS_FIELD_ID --single-select-option-id $IN_REVIEW_OPTION_ID

# Abrir PR
gh pr create \
  --title "tipo(escopo): descrição curta em português" \
  --body "## O que foi feito
[descrição em português]

## Por que foi feito
[justificativa em português]

Closes #[NUMERO]" \
  --base main \
  --head tipo/[NUMERO]-descricao \
  --label "type: [tipo]"

# Verificar PR e aguardar CI
gh pr diff
gh pr checks [N] --watch 2>&1 | tee saida.log
```

Após `gh pr checks --watch` retornar com todos os checks verdes, o Claude Code prossegue **automaticamente** para a FASE 4 sem aguardar instrução do usuário.

---

### FASE 4 — Resolução de Issues do Sonar na PR

- **PROIBIDO fazer merge** enquanto houver issues do Sonar abertas.
- O Claude Code consulta as issues **de forma autônoma** via CLI, sem depender do browser ou do usuário:

```bash
# Verificar Quality Gate
./scripts/sonar-check.sh gate [NUMERO_PR] 2>&1 | tee saida.log

# Listar issues com arquivo e linha
./scripts/sonar-check.sh issues [NUMERO_PR] 2>&1 | tee saida.log
```

> **Pré-requisito:** `SONAR_TOKEN` deve estar definido em `.env.local`. Em CI, o secret já está configurado no repositório.

- O Claude Code lê o `saida.log`, identifica as issues apontadas e então:
  1. **Atualiza a seção `🔍 PADRÕES SONAR` deste `CLAUDE.md`** para contemplar as novas regras detectadas, garantindo que não se repitam em issues futuras.
  2. **Corrige os arquivos afetados** diretamente no disco.
- Após correção: usuário roda `npm run build` + push. Aguardar novo ciclo do Sonar.

### Regra de Documentação para Qualquer Falha de CI

**Antes de executar o merge**, o Claude Code verifica: houve algum check de CI que falhou e exigiu correção nesta sessão?

Se sim — independente do tipo — a falha deve ser documentada no local adequado:

| Tipo de falha | Onde documentar |
|---|---|
| Nova regra Sonar detectada | `🔍 PADRÕES SONAR` no CLAUDE.md *(protocolo já existente acima)* |
| Erro de build TypeScript / ESLint bloqueado no CI | `BUILD_ERRORS.md` — nova entrada com sintoma, causa raiz e fix |
| Gap de cobertura detectado pelo CI | `COVERAGE_GAPS.md` — novo padrão de gap |
| Step de GitHub Actions falhou (npm ci, Action externa, timeout, permissão) | `BUILD_ERRORS.md` — seção `## CI Workflow Failures` |
| Secret ausente no repositório | `docs/setup.md` → seção `CI/CD` + `BUILD_ERRORS.md` |
| Playwright passou localmente mas falhou em CI (diferença de ambiente) | `BUILD_ERRORS.md` — seção `## CI Workflow Failures` |
| Vercel build falhou por variável de ambiente ausente | `docs/setup.md` → seção `Variáveis de Ambiente` + `BUILD_ERRORS.md` |

**PROIBIDO executar o bloco de merge enquanto qualquer falha de CI da sessão não estiver documentada.**

> **Motivo:** uma falha que já aconteceu no CI uma vez tem alta probabilidade de se repetir no mesmo projeto ou em projetos futuros que usem este CLAUDE.md como base. A documentação transforma o erro em aprendizado institucional permanente — não um remendo pontual, mas um padrão unificado que cobre 100% dos tipos de falha.

Após Quality Gate verde e documentação de falhas concluída, o Claude Code posta um **comentário de certificação de qualidade** na issue antes de executar o merge:

```bash
gh issue comment [NUMERO] --body "$(cat <<'EOF'
## 🏆 Certificação de Qualidade — Pronto para Merge

Todo o código desta issue passou pela seguinte esteira de qualidade antes de ser aceito:

### 🔬 Testes Unitários
- **[N] testes em [N] suites** — 100% passando (Jest + React Testing Library)
- Cobertura: [lista dos componentes/actions testados]

### 🎭 Testes E2E
- **[N] cenários Playwright** — 100% passando em ambiente de produção (Vercel Preview)
- Fluxos validados: [lista dos fluxos cobertos]

### 📱 Testes Visuais Mobile (quando aplicável a issues de UI)
- Screenshots automatizados via `scripts/take-mobile-screenshots.mjs`
- Viewports validados: iPhone SE (375px) · iPhone 14 Pro Max (430px) · Pixel 8 (412px) · iPad Mini (768px) · Surface Pro 7 (912px)
- Checklist: logo sem quebra · menu mobile full-screen · nav funcional desktop · hamburger funcional mobile · layout responsivo · textos não cortados

### 🔁 CI Pipeline (GitHub Actions)
- ✅ Build TypeScript — sem erros de tipo
- ✅ ESLint `--max-warnings=0` — zero warnings
- ✅ Husky pre-commit — lint-staged aprovado em todos os commits

### ☁️ Deploy
- ✅ Vercel Preview — build e deploy bem-sucedidos

### 🔍 Análise Estática — SonarCloud Quality Gate
- ✅ Zero issues abertas na PR
- Regras verificadas: [lista das regras Sonar aplicáveis — S1874, S8786, S6479, S5976, etc.]

### 📋 Auditoria de Boas Práticas (CLAUDE.md v[X])
- ✅ 8 eixos auditados antes da implementação (reutilização, Sonar, camadas, segurança, testes, estilo, convenções, performance)
- Proposta técnica registrada: [link para o comentário de auditoria]

*Certificação gerada pelo Claude Code — CLAUDE.md v[X]*
EOF
)"
```

Após Quality Gate verde, o Claude Code executa o merge **autonomamente**:

```bash
gh pr merge --squash --delete-branch
git checkout main
git pull origin main
gh issue view [NUMERO]
```

Em seguida, **sem aguardar confirmação**, move os cards para Done e gera o Diário de Aprendizado.

---

### FASE 4.5 — Controle de Dívida Técnica (executada ao fechar cada Milestone)

Esta fase não é por issue — é executada **uma vez por milestone**, após o merge da última issue do milestone, antes de iniciar o próximo.

#### Checklist obrigatório

**1. Code Review Ultra (multi-agente)**

```bash
/code-review ultra
```

Revisão independente de toda a branch desde o início do milestone. Detecta problemas que o Sonar não vê: acoplamento entre camadas, responsabilidades mal alocadas, abstrações ausentes ou prematuras. O Claude Code lê o relatório e abre issues de dívida técnica para tudo que for acionável.

**2. Auditoria de dependências entre camadas**

Violações a detectar (via `grep`):
- `lib/` importando de `components/` ou `app/` → inversão de dependência
- `components/` importando de `app/` → componente acoplado a rota específica
- Client Component com `"use client"` importando de `supabase-server` ou `server-only`

```bash
grep -rE "from.*@/(components|app)" lib/ --include="*.ts" --include="*.tsx" -l
grep -r "from.*@/app" components/ --include="*.ts" --include="*.tsx" -l
grep -rl '"use client"' components/ --include="*.tsx" | xargs grep -l "supabase-server\|server-only" 2>/dev/null
```

**3. Auditoria de consistência de estilo**

O projeto adota Tailwind para layout/tipografia estática e `style={{}}` apenas para valores dinâmicos de runtime (ex: cor de produto). Arquivos que misturam os dois sem necessidade são candidatos a refatoração:

```bash
# Arquivos com MUITOS inline styles que deveriam ser Tailwind:
grep -rc "style={{" app/ components/ --include="*.tsx" | sort -t: -k2 -rn | head -15
```

Threshold: mais de 5 `style={{` num arquivo que não lida com valores dinâmicos → candidato a migração.

**4. Auditoria de cobertura de testes por camada**

Arquivos de lógica crítica sem teste unitário:

```bash
# Arquivos sem teste correspondente em __tests__/
# Exclui Next.js special files (basename ambíguo — cobertos por testes PascalCase da rota)
for f in $(find app components lib -name "*.tsx" -o -name "*.ts" | grep -v "node_modules\|\.test\.\|__tests__\|__mocks__\|\.d\.ts\|types\.ts\|page\.tsx\|layout\.tsx\|route\.ts\|loading\.tsx\|error\.tsx\|not-found\.tsx\|template\.tsx\|default\.tsx"); do
  name=$(basename "$f" .tsx); name=$(basename "$name" .ts)
  if ! find __tests__ -name "${name}.test.*" 2>/dev/null | grep -q .; then
    echo "SEM TESTE: $f"
  fi
done
```

Prioridade de cobertura: middleware (`proxy.ts`), route handlers, Server Actions, lib utilities. Pages e layouts têm menor prioridade se já cobertos por E2E.

**5. Registro de ADR para decisões não óbvias**

Toda decisão arquitetural que um dev novo não conseguiria deduzir lendo o código deve ter uma entrada em `docs/architecture.md` na seção `## Key Architectural Decisions`, no formato:

```markdown
### [Decisão tomada]
**Alternativa descartada:** [O que foi considerado e por que foi rejeitado].
**Motivo:** [Constraint real — performance, segurança, custo, prazo].
```

---

### FASE 4.6 — Melhoria Contínua do Workflow (responsabilidade permanente do Claude Code)

Esta não é uma fase com gatilho fixo — é uma **responsabilidade ativa em toda sessão**.

O objetivo é que o workflow de desenvolvimento do Kairos Labs seja exemplar: que qualquer desenvolvedor ou recrutador que leia o código, os PRs, os commits e o histórico de issues veja um padrão de qualidade consistente, com rastreabilidade de decisões e ausência de atalhos não documentados.

#### Quando agir

O Claude Code **deve** sinalizar e propor melhoria do workflow sempre que perceber qualquer um dos seguintes sinais durante o desenvolvimento de uma issue:

- Um padrão novo de problema que se repetiria em issues futuras (candidato a entrada em `🔍 PADRÕES SONAR` ou `BUILD_ERRORS.md`)
- Um eixo de auditoria da FASE 1 que não cobriria o problema encontrado (candidato a novo eixo ou refinamento de eixo existente)
- Uma etapa do protocolo que, se executada de forma diferente, teria evitado retrabalho
- Uma decisão de design que deveria ser registrada em `docs/architecture.md` mas não tem local definido no fluxo atual
- Qualquer acumulação silenciosa de dívida técnica que nenhuma fase atual capturaria antes de virar problema

#### Como agir

O Claude Code **não espera** o usuário perceber. A sinalização é proativa, feita no mesmo turno em que o problema é identificado:

1. **Nomear o problema:** descrever exatamente o que foi observado e por que representa risco de dívida futura.
2. **Propor a melhoria:** sugerir a alteração concreta no `CLAUDE.md` (novo eixo de auditoria, nova regra Sonar, novo passo no protocolo, etc.).
3. **Aguardar aprovação** antes de editar o `CLAUDE.md` — a melhoria do workflow é sempre uma decisão do usuário.
4. **Após aprovação:** editar o `CLAUDE.md` diretamente e registrar a mudança no Diário de Aprendizado com Formato C.

> **Princípio:** o `CLAUDE.md` é um documento vivo. Cada sessão é uma oportunidade de torná-lo mais preciso. Um projeto exemplar não é aquele que nunca erra — é aquele que aprende sistematicamente com cada erro e encurta o caminho para os próximos.

---

### FASE 4.7 — Autocrítica de Execução (executada após cada merge, antes do Diário)

Esta fase é uma **retrospectiva estruturada por sessão**. Complementa a FASE 4.6 (proativa, durante o desenvolvimento) com uma análise pós-merge do que de fato aconteceu versus o que o protocolo descreve.

#### Gatilho

Executada **imediatamente após o merge** da issue, antes de gerar o Diário de Aprendizado. Não tem exceções — se houve merge, há autocrítica.

#### As 6 perguntas de autocrítica

O Claude Code responde internamente às perguntas 1–5 e faz a pergunta 6 ao usuário:

| # | Pergunta | Quem responde |
|---|---|---|
| 1 | **Desvios de execução:** houve algum passo do protocolo que precisou ser tentado mais de uma vez antes de funcionar? (ex: movimentação de card, comandos CLI, queries GraphQL) | Claude Code |
| 2 | **Tentativas desnecessárias:** houve sequências de comandos que falharam antes do correto? O protocolo documenta isso de forma a evitar as tentativas falhas? | Claude Code |
| 3 | **Ambiguidades não cobertas:** o texto do CLAUDE.md cobria o que foi feito de forma precisa — ou o Claude Code teve que inferir ou improvisar? | Claude Code |
| 4 | **Velocidade e performance:** algum passo poderia ter sido eliminado ou paralelizado sem perda de qualidade? | Claude Code |
| 5 | **Novos padrões detectados:** surgiu algum padrão novo (erro, limitação de API, comportamento de ferramenta) ainda não documentado? | Claude Code |
| 6 | **Observação do usuário:** *"Você observou algo no fluxo desta sessão que poderia ser melhorado? (Sim — descreva / Não)"* | Usuário |

#### Fluxo para cada resposta positiva

Qualquer pergunta com resposta "sim" ativa o seguinte fluxo:

1. **Nomear o desvio com precisão:** o que aconteceu vs o que o protocolo descreve.
2. **Propor a alteração concreta** no CLAUDE.md (texto exato a adicionar, modificar ou remover).
3. **Aguardar aprovação explícita** do usuário antes de editar.
4. **Após aprovação:** editar o CLAUDE.md diretamente e registrar no Diário (Formato C).

Se todas as respostas forem negativas, o Claude Code registra: *"Autocrítica concluída — nenhum desvio identificado nesta sessão."* e prossegue para o Diário.

#### Exemplo de desvio de alta frequência

**Problema:** movimentação de card (Backlog → In Progress) acumula tentativas falhas antes de chegar à sequência GraphQL correta — o ITEM_ID retorna vazio na primeira tentativa porque a issue foi adicionada ao board recentemente e não aparece na listagem padrão.

**Diagnóstico pelo filtro da autocrítica:**
- Pergunta 1: sim — o passo foi tentado mais de uma vez.
- Pergunta 2: sim — a sequência correta é buscar com `--limit 100` e filtrar pelo número da issue; o protocolo não documentava isso.

**Correção aplicada:** a query de ITEM_ID na FASE 0 foi atualizada para `--limit 100`, garantindo que issues recém-adicionadas ao board sejam encontradas na primeira tentativa. Desvio registrado no Diário (Formato C) e corrigido na mesma sessão via autocrítica da FASE 4.7.

> **Princípio:** cada sessão que termina sem autocrítica é uma oportunidade perdida de tornar a próxima mais rápida. O custo de 2 minutos de retrospectiva é zero comparado ao retrabalho evitado em todas as sessões seguintes.

---

### Regra de Setup Local — Documentação Obrigatória de Mudanças de Ambiente

**Toda alteração que modifique o ambiente local de desenvolvimento do projeto deve ser documentada antes de avançar para a FASE 3.**

Exemplos de mudanças que ativam esta regra:

| Tipo de mudança | Onde documentar |
|---|---|
| Novo arquivo `.sql` (criação de tabela, função, policy RLS, trigger, nova coluna) | `docs/setup.md` → seção `Banco de Dados` + `README.md` → lista de migrations + `CONTRIBUTING.md` → seção "Run the database migrations" + `docs/CONTRIBUTING.pt-BR.md` → seção "Executar as migrations do banco" |
| Nova variável de ambiente obrigatória | `docs/setup.md` → seção `Variáveis de Ambiente` + `.env.example` (sem o valor) + `CONTRIBUTING.md` → seção de variáveis + `docs/CONTRIBUTING.pt-BR.md` |
| Nova dependência com setup manual (CLI, serviço externo, credencial) | `docs/setup.md` → seção pertinente + `CONTRIBUTING.md` + `docs/CONTRIBUTING.pt-BR.md` |
| Novo script npm ou comando de setup | `docs/setup.md` + `package.json` com descrição no campo `scripts` |
| Mudança em configuração de CI (secrets, permissões) | `docs/setup.md` → seção `CI/CD` + comentário no workflow YAML |
| Novos specs E2E adicionados | `CONTRIBUTING.md` → tabela "Covered flows" + `docs/CONTRIBUTING.pt-BR.md` → tabela "Fluxos cobertos" |

#### Fluxo obrigatório

```
FASE 2 (código) → detectar mudança de ambiente → documentar ANTES do commit → FASE 3
```

O Claude Code **não pode entregar os commits da FASE 3 sem ter documentado toda mudança de ambiente introduzida na sessão**. Se `docs/setup.md` não existir, criá-lo antes de prosseguir.

> **Motivo:** um dev que clonar o repositório ou retornar ao projeto após semanas deve conseguir reproduzir o ambiente local sem recorrer ao histórico de chat ou de issues. A rastreabilidade de setup é parte da qualidade do projeto — não um detalhe operacional.

---

### Encerramento da sessão (por issue)

Imediatamente após o merge, o Claude Code executa de forma autônoma:

1. Verificar se houve erros de build novos na sessão. Se sim, **adicionar as entradas correspondentes no `BUILD_ERRORS.md`** antes do Diário.
2. Gerar o Diário de Aprendizado — **sem solicitar confirmação**.

O Claude Code **edita o arquivo `1.diario_de_aprendizado.md` diretamente no disco**, inserindo a nova entrada imediatamente após o cabeçalho do arquivo (logo abaixo da linha `---` que segue o parágrafo introdutório). O arquivo é ordenado em ordem decrescente — a entrada mais recente sempre no topo. Nunca adicionar ao final.

- **`[N]`** é um número sequencial que reseta para `1` a cada novo dia. Primeira entrada do dia = `1`, segunda = `2`, e assim por diante. Nunca usar `[N]` como placeholder — sempre substituir pelo número real.
- O Claude Code avalia todos os formatos (A, B, C) e **usa todos os que forem aplicáveis** à sessão — uma única sessão pode gerar múltiplas entradas. Por exemplo, se houve uma decisão arquitetural importante (A) E um bug complexo corrigido sob pressão (B), ambas as entradas devem ser escritas. O Claude Code indica os formatos escolhidos antes de editar o arquivo.

---

#### Formato A — A Virada de Chave Arquitetural
**Quando usar:** escolhas estruturais difíceis — Server vs Client Components, isolamento de escopo, escolha de banco, padrão de design system. O ganho não foi apenas "fazer funcionar", mas garantir manutenibilidade e escala.

````markdown
### 1. [Título: decisão arquitetural tomada]

* **Issue:** `[#N - Título da Issue]` *(incluir apenas quando o chat se tratar da resolução de uma issue do GitHub)*
* **Data:** `[DD/MM/AAAA]`
* **Formato:** `A — Virada de Chave Arquitetural`
* **Stack Envolvida:** `[tecnologias relevantes]`
* **Dilema Técnico:** [Contexto do problema e por que a decisão era difícil].
* **Alternativas Descartadas:** [O que foi considerado e por que foi rejeitado].
* **Decisão Final:** [O que foi escolhido e qual o impacto na arquitetura].
* **Lição Documentada:** [Princípio reutilizável extraído da decisão].
````

---

#### Formato B — O Bug Sob Pressão & Resolução Cirúrgica
**Quando usar:** falhas complexas em ambiente real — incompatibilidades, erros de tipo, bloqueios de pipeline CI/CD, comportamentos inesperados de biblioteca.

````markdown
### 1. [Título: o bug e como foi resolvido]

* **Issue:** `[#N - Título da Issue]` *(incluir apenas quando o chat se tratar da resolução de uma issue do GitHub)*
* **Data:** `[DD/MM/AAAA]`
* **Formato:** `B — Bug Sob Pressão & Resolução Cirúrgica`
* **Stack Envolvida:** `[tecnologias relevantes]`
* **Sintoma & Impacto:** [O que quebrou e qual era o efeito visível].
* **Diagnóstico (Causa Raiz):** [O que realmente causou o problema — nível profundo].
* **Resolução Aplicada:** [A correção cirúrgica implementada].
* **Protocolo Preventivo:** [O que foi documentado ou alterado para evitar recorrência].
````

---

#### Formato C — Governança, CI/CD & Engenharia Proativa
**Quando usar:** automações de infraestrutura, Quality Gates, esteiras GitHub Actions/CLI, segurança de credenciais, proteção de IP, processos de governança.

````markdown
### 1. [Título: automação ou processo implementado]

* **Issue:** `[#N - Título da Issue]` *(incluir apenas quando o chat se tratar da resolução de uma issue do GitHub)*
* **Data:** `[DD/MM/AAAA]`
* **Formato:** `C — Governança, CI/CD & Engenharia Proativa`
* **Stack Envolvida:** `[tecnologias relevantes]`
* **Gargalo Identificado:** [O problema operacional ou risco que motivou a ação].
* **Automação Implementada:** [O que foi construído ou configurado para resolver].
* **Resultado:** [Ganho concreto em velocidade, robustez ou segurança institucional].
````

---

## 🔍 PADRÕES SONAR — REFERÊNCIA RÁPIDA

### Supabase: `service_role` exclusivo para writes; reads via SECURITY DEFINER

```ts
// ✅ Leituras do dashboard admin — usar SSR client + RPC
const supabase = await createServerSupabaseClient();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data } = await (supabase as any).rpc("get_dashboard_kpis");

// ✅ Writes/operações admin (INSERT, UPDATE, DELETE) — usar admin client
const supabase = createServerAdminClient();
await (supabase as any).from("tabela").insert({ ... });

// ❌ Errado — service_role (BYPASSRLS) para leituras de agregação
const supabase = createServerAdminClient();
const { data } = await supabase.from("waitlist").select("*");
```

Funções PostgreSQL de leitura do dashboard devem usar `SECURITY DEFINER` + `SET search_path = public` e ter `GRANT EXECUTE ... TO authenticated`.

### Props `readonly`
```tsx
// ✅ Correto
interface Props {
  readonly open: boolean;
  readonly productId: string;
}
// ou
function Component({ open }: Readonly<Props>) { ... }
```

### `<button>` com type explícito
```tsx
// ✅ Correto
<button type="button" onClick={handle}>OK</button>
<button type="submit">Enviar</button>
```

### Eventos de mouse com acessibilidade
```tsx
// ✅ Correto
<div
  onMouseOver={handler}
  onFocus={handler}
  onMouseOut={handler}
  onBlur={handler}
>
```

### Espaçamento JSX explícito
```tsx
// ✅ Correto — espaço antes do elemento
<p>E-mail{" "}<span>{email}</span>{" "}foi cadastrado.</p>

// ✅ Correto — espaçamento/pontuação após </span> deve ficar na MESMA LINHA que a tag
<p>
  Feedback sobre{" "}
  <span>{produto}</span>{". "}
  Obrigado pelo retorno.
</p>

// ❌ Errado — pontuação em linha separada após </span> gera "Ambiguous spacing" no Sonar
<p>
  Feedback sobre{" "}
  <span>{produto}</span>
  {". "}Obrigado pelo retorno.
</p>

// ❌ Errado — ponto solto sem espaçamento explícito
<p>
  Feedback sobre{" "}
  <span>{produto}</span>
  . Obrigado pelo retorno.
</p>
```

### Testes similares devem ser parametrizados (`typescript:S5976`)
```tsx
// ❌ Errado — Sonar aponta Consistency/Medium: testes repetitivos devem ser agrupados
it("exibe o link do GitHub", () => { ... });
it("exibe o link do LinkedIn", () => { ... });
it("exibe o link do E-mail", () => { ... });

// ✅ Correto — usar it.each para testes com mesmo padrão e dados diferentes
it.each(["GitHub", "LinkedIn", "E-mail"])(
  "exibe o link %s com aria-label",
  (label) => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
  }
);
```

### Testes E2E com credenciais obrigatórias (`typescript:S1607`)
```ts
// ❌ Errado — Sonar S1607: test.skip condicional torna o teste abandonado
const EMAIL = process.env.E2E_EMAIL ?? "";
test.skip(!EMAIL, "variável não definida");

// ✅ Correto — credenciais são requisito; se ausentes, o teste falha explicitamente
const EMAIL = process.env.E2E_EMAIL!;
// sem test.skip — as variáveis devem estar em .env.local ou nos secrets do CI
```

### Zod: `.email()` como método de `ZodString` é deprecated (`typescript:S1874`)

Em Zod v4, o método `.email()` encadeado em `z.string()` foi marcado como deprecated pelo Sonar (S1874). Usar `.refine()` com regex, que é estável em todas as versões:

```ts
// ❌ Errado — Sonar S1874: .email() deprecated em Zod v4
email: z.string().min(1, "E-mail é obrigatório.").email("Formato de e-mail inválido.")

// ✅ Correto — verificação de string pura, sem regex (evita S8786 e S1874)
email: z.string().min(1, "E-mail é obrigatório.").refine(
  (val) => { const at = val.indexOf("@"); return at > 0 && val.indexOf(".", at) > at + 1; },
  { message: "Formato de e-mail inválido." }
),
// Motivo: regex com [^\s@]+ gera risco de backtracking superlinear (Sonar S8786)
```

### Server Actions: usar objeto tipado, não FormData, quando invocadas via `useTransition`

Next.js serializa `FormData` corretamente **apenas** quando a Server Action é invocada via atributo `action` de um `<form>` nativo. Quando chamada programaticamente via `useTransition`, o `FormData` chega vazio (`{}`) ao servidor.

```ts
// ❌ Errado — FormData chega vazio ao servidor quando chamada via useTransition
export async function minhaAction(formData: FormData) { ... }

// No componente:
const formData = new FormData();
formData.set("campo", valor);
startTransition(async () => {
  await minhaAction(formData); // formData = {} no servidor
});

// ✅ Correto — objeto tipado serializa corretamente em qualquer contexto
export interface MeuFormData { campo: string; }
export async function minhaAction(data: MeuFormData) { ... }

// No componente:
startTransition(async () => {
  await minhaAction({ campo: valor }); // dados chegam corretamente
});
```

### Novas tabelas Supabase: GRANT obrigatório para service_role

`service_role` bypassa RLS mas ainda precisa de privilégio de objeto (GRANT). Toda DDL de tabela nova que for escrita via Server Action **deve** incluir o grant explícito, ou o insert falhará com `code: 42501 — permission denied`.

```sql
-- ✅ DDL completa para tabela escrita por Server Action
CREATE TABLE minha_tabela (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  -- campos...
);
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.minha_tabela TO service_role;  -- obrigatório
```

### Sem imports mortos
```tsx
// ✅ Remover qualquer import não utilizado no arquivo
```

### Espaçamento após elemento self-closing seguido de texto (`typescript:S6772`)
Sonar S6772 aponta "Ambiguous spacing" quando texto segue diretamente após um elemento self-closing (`<span />`) sem espaço explícito.

```tsx
// ❌ Errado — Sonar S6772: espaçamento ambíguo após <span />
<span className="dot" />
Texto que segue

// ✅ Correto — espaço explícito com {" "}
<span className="dot" />{" "}
Texto que segue
```

### Imagens externas: usar `<Image>` do Next.js, nunca `<img>` (`@next/next/no-img-element`)

```tsx
// ❌ Errado — ESLint bloqueia o commit com warning @next/next/no-img-element
<img src="https://flagcdn.com/w20/br.png" alt="" width={20} height={15} />

// ✅ Correto — usar next/image e registrar o hostname em next.config.ts
import Image from "next/image";
<Image src="https://flagcdn.com/w20/br.png" alt="" width={20} height={15} />
```

Em `next.config.ts`, adicionar o domínio externo ao `remotePatterns`:

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
};
```

> **Escopo da varredura de impacto em testes (FASE 2):** mudanças de estrutura ARIA — troca de `role="group"` com botões filhos por `role="menu"` com `role="menuitem"`, por exemplo — quebram specs E2E que usam `getByRole("group")`. A varredura de impacto deve incluir `e2e/` além de `__tests__/` sempre que a estrutura semântica do componente mudar, mesmo que o texto visível permaneça igual.

### Imports de módulos Node.js com prefixo `node:` (`javascript:S7772`)
Sonar S7772 exige o prefixo `node:` em imports de módulos nativos do Node.js em arquivos `.mjs`.

```js
// ❌ Errado — Sonar S7772
import { mkdirSync } from 'fs';

// ✅ Correto
import { mkdirSync } from 'node:fs';
```

### Array index como key é proibido (`typescript:S6479`)
```tsx
// ❌ Errado — Sonar S6479: index não é estável se a lista mudar
{lista.map((item, i) => <div key={i}>{item.titulo}</div>)}

// ✅ Correto — usar valor único e estável do item
{lista.map((item) => <div key={item.titulo}>{item.titulo}</div>)}
// Para strings simples em arrays de texto:
{lista.map((str) => <li key={str}>{str}</li>)}
```

### `<Link>` para rotas de ação (logout) deve ter `prefetch={false}` (`next/link`)
```tsx
// ❌ Errado — Link com href de route handler (GET action) faz prefetch automático,
//            o que executa a action antes do clique (ex: signOut() no handler /admin/logout)
<Link href="/admin/logout">Sair</Link>

// ✅ Correto — desativa prefetch para rotas que disparam ações com efeito colateral
<Link href="/admin/logout" prefetch={false}>Sair</Link>
```

### `npm ci` em workflows GitHub Actions
```yaml
# ✅ Correto — evita execução de lifecycle scripts de pacotes durante instalação
- name: Instalar dependências
  run: npm ci --ignore-scripts

# ❌ Errado — Sonar aponta Security Medium: lifecycle scripts podem rodar
- name: Instalar dependências
  run: npm ci
```

### Sem `npx` em workflows GitHub Actions (S6505 + S8543)
`npx` pode baixar e executar pacotes on-demand em versões não verificadas — Sonar aponta Security Medium nos dois casos.
Use sempre o binário local instalado pelo `npm ci`, que já tem versão travada no `package-lock.json`.

```yaml
# ✅ Correto — usa binário local com versão travada
- name: Instalar Playwright Chromium
  run: ./node_modules/.bin/playwright install --with-deps chromium

- name: Aguardar servidor
  run: ./node_modules/.bin/wait-on http://localhost:3000 --timeout 60000

# ❌ Errado — Sonar S6505 + S8543: npx pode baixar versão não verificada
- run: npx playwright install --with-deps chromium
- run: npx wait-on http://localhost:3000
```

### Actions externas devem ser fixadas no SHA completo (`githubactions:S7637`)
Sonar aponta Security High quando uma GitHub Action usa tag de versão (ex: `@v3`) em vez do SHA completo do commit. O SHA é imutável; a tag pode ser reescrita.

```yaml
# ✅ Correto — SHA completo garante imutabilidade
- name: Análise SonarCloud
  uses: SonarSource/sonarcloud-github-action@383f7e52eae3ab0510c3cb0e7d9d150bbaeab838

# ❌ Errado — Sonar S7637: tag mutável, risco de supply chain
- name: Análise SonarCloud
  uses: SonarSource/sonarcloud-github-action@v3
```

Para descobrir o SHA de qualquer Action: olhar o log do CI — o step "Set up job" exibe `(SHA:xxxxxxxx)` ao baixar a Action.

---

### ARIA roles em elementos não-nativos: preferir tag HTML nativa (`typescript:S6819`)
Sonar S6819 proíbe ARIA roles em elementos não-nativos quando existe um elemento HTML com role implícita equivalente. Regra geral: **prefira a tag HTML semântica sobre `role="..."`**.

```tsx
// ❌ Errado — Sonar S6819: listbox em elemento não-nativo
<ul role="listbox">
  <li role="option" aria-selected={isActive}>...</li>
</ul>
<button aria-haspopup="listbox">...</button>

// ✅ Correto — semântica de menu para dropdowns customizados
<ul role="menu">
  <li role="menuitem" aria-current={isActive ? "true" : undefined}>...</li>
</ul>
<button aria-haspopup="menu">...</button>

// ❌ Errado — Sonar S6819: role="group" em <div> — <fieldset> tem role "group" implícito
<div role="group" aria-label="Language" className="flex gap-1">
  {/* botões */}
</div>

// ✅ Correto — usar <fieldset> (role "group" implícito) + <legend> para accessible name
<fieldset className="flex gap-1 border-none p-0 m-0">
  <legend className="sr-only">Language</legend>
  {/* botões */}
</fieldset>
```

**Mapeamento de roles para tags nativas:**

| `role="..."` | Tag HTML nativa equivalente |
|---|---|
| `group` | `<fieldset>` (com `<legend>` para accessible name) |
| `listbox` | Usar `role="menu"` + `role="menuitem"` em dropdowns custom |
| `list` | `<ul>` ou `<ol>` |
| `article` | `<article>` |

### Testes RTL: não envolver `fireEvent` em `await act()` (`typescript:S8980`)
React Testing Library já envolve `fireEvent` em `act()` internamente. Adicionar `await act(async () => { fireEvent.click(...) })` é redundante e gera S8980.

```tsx
// ❌ Errado — Sonar S8980: act() redundante — fireEvent já faz act() internamente
it("clica no botão", async () => {
  render(<Component />);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "English" }));
  });
  expect(mockFn).toHaveBeenCalled();
});

// ✅ Correto — fireEvent sem act() explícito; remover async do test se não há mais await
it("clica no botão", () => {
  render(<Component />);
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  expect(mockFn).toHaveBeenCalled();
});
```

**Nota:** Handlers que chamam `startTransition(async () => { await action(...) })` funcionam corretamente sem `act()` explícito porque `action(...)` é invocado sincronamente (antes do primeiro `await` da função async), então `expect().toHaveBeenCalledWith()` captura a chamada imediatamente após o `fireEvent`.

### `String.match()` deve ser substituído por `RegExp.exec()` (`typescript:S6594`)
Sonar S6594 prefere `RegExp.exec()` sobre `String.match()`. Na prática, a melhor solução é evitar o regex quando `indexOf`/`lastIndexOf` resolve o problema sem backtracking (resolve S8786 e S6594 simultaneamente).

```ts
// ❌ Errado — Sonar S6594 + S8786: .match() com regex de backtracking superlinear
const match = text.match(/\{[\s\S]*\}/);
if (!match) return null;
return JSON.parse(match[0]);

// ✅ Correto — sem regex, sem backtracking, sem S6594
const start = text.indexOf("{");
const end = text.lastIndexOf("}");
if (start === -1 || end <= start) return null;
return JSON.parse(text.slice(start, end + 1));
```

### Regex em config Next.js: `String.raw` não pode ser usado em `config.matcher` (`typescript:S7780`)
Sonar S7780 aponta quando `\\` em uma string poderia ser `\` com `String.raw`. Porém, em `config.matcher` do middleware Next.js, `String.raw` quebra a análise estática e causa "Invalid segment configuration". Usar `// NOSONAR` para suprimir a issue nesse contexto específico.

```ts
// ❌ Errado — String.raw quebra análise estática do Next.js em config.matcher
matcher: [String.raw`/((?!api|_next|.*\..*).*)`],

// ✅ Correto — manter string literal com NOSONAR para suprimir S7780 no único contexto onde String.raw é inviável
matcher: ["/((?!api|_next|.*\\..*).*)"], // NOSONAR — Next.js exige string literal aqui
```

### Não modificar arquivos com baixa cobertura apenas para anotações de tipo (new_coverage Sonar)

Sonar PR analysis mede `new_coverage` como a porcentagem de **linhas no diff da PR** cobertas por testes. Mesmo mudanças puramente de tipo (`Readonly<>`, `readonly`, interfaces) adicionam linhas ao diff — e se essas linhas estão em funções sem teste, elas entram como "new uncovered code".

**Regra:** antes de aplicar `Readonly<>` ou `readonly` em qualquer arquivo, verificar a cobertura atual desse arquivo:

```bash
node scripts/check-coverage.mjs 2>&1 | grep "nome-do-arquivo"
```

Se o arquivo tiver funções sem cobertura (linhas sem teste), **não modificá-lo** apenas para conformidade de tipo. O Sonar tratará as assinaturas de função como linhas novas não cobertas e reprovará `new_coverage`.

**Exceção:** se já existe teste cobrindo todas as funções do arquivo, a mudança de tipo é segura.

> **Motivo (lição da issue #108):** adicionar `Readonly<>` a `dialog.tsx` arrastou `new_coverage` de 80.0% para 77.8% porque `DialogTrigger`, `DialogClose` e `DialogFooter` não tinham testes. Foram necessários 3 ciclos de CI para identificar e reverter a mudança.

### `async function` + `FormEventHandler<void>` gera S6544 (Unhandled Promise)

`React.FormEventHandler<T>` é tipado como `(event: FormEvent<T>) => void`. Uma `async function` retorna `Promise<void>`, que não é atribuível a `void` no contexto do Sonar — resulta em S6544 (Unhandled Promise = novo bug).

```tsx
// ❌ Errado — Sonar S6544: FormEventHandler é void, async retorna Promise<void>
const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
  e.preventDefault();
  await algumaAction();
};

// ✅ Correto — declaração de função direta, sem tipagem explícita de FormEventHandler
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  await algumaAction();
}
```

---

## 📝 DOCUMENTAÇÃO INLINE

Documentação inline é obrigatória para: funções de `lib/`, Server Actions, hooks customizados e qualquer lógica não trivial. Usar JSDoc com `@param`, `@returns` e `@throws` quando aplicável. Não documentar o óbvio — documentar o **porquê**.

### Quando adicionar JSDoc

| Caso | Obrigatório? |
|---|---|
| Funções exportadas em `lib/` | ✅ Sempre |
| Server Actions (`"use server"`) | ✅ Sempre — descrever efeito colateral e parâmetros |
| Route handlers (`route.ts`) com efeito colateral | ✅ Sempre |
| Hooks customizados (`use*.ts`) | ✅ Sempre |
| Lógica não-óbvia (workarounds, restrições, decisões de design) | ✅ Sempre |
| Componentes React simples | ❌ Nome do componente já documenta |
| Funções utilitárias com nome auto-explicativo (ex: `cn()`) | ❌ Desnecessário |
| Arquivos de convenção Next.js (`page.tsx`, `layout.tsx`, `robots.ts`) | ❌ Desnecessário |

### Checklist de verificação (FASE 1 — Eixo 2, Sonar)

O Claude Code verifica se toda função criada ou modificada na sessão que se enquadra nos casos "Obrigatório" tem JSDoc antes de avançar para a FASE 3. Ausência de JSDoc obrigatório é tratada como não-conformidade equivalente a uma violação Sonar.

---

## 🌿 CONVENÇÕES DE BRANCHES

| Tipo | Padrão |
|---|---|
| Nova funcionalidade | `feature/[N]-descricao-curta` |
| Correção de bug | `fix/[N]-descricao-curta` |
| Setup / config | `chore/[N]-descricao-curta` |
| Documentação | `docs/[N]-descricao-curta` |

---

## 💬 CONVENTIONAL COMMITS — TIPOS VÁLIDOS

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Setup, config, dependências |
| `docs` | Documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem mudança funcional |
| `test` | Adição ou correção de testes |
| `ci` | Mudanças em CI/CD |

> **Regra de ouro:** descrição curta sempre no imperativo em português.
> "adiciona", "cria", "corrige", "atualiza".
> Todo texto de commit, PR (título e corpo) em **português**.

---

*Kairos Labs — Cesar Antonio Brito Pizarro*
*CLAUDE.md v3.0 — adiciona padrões Sonar: não modificar arquivos com baixa cobertura para anotações de tipo (new_coverage), S6544 async+FormEventHandler*
