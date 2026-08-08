# CLAUDE.md — Kairos Labs

Arquivo de contexto lido automaticamente pelo Claude Code a cada sessão.
Repositório: `CabPiz/kairos-labs` | Owner: `CabPiz` | Project Board: nº 3

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

# 2. Atribuir e mover para In Progress
gh issue edit [NUMERO] --add-assignee "@me"
gh issue edit [NUMERO] --add-label "status: in progress"

# 3. Capturar IDs do Board e mover card para "In Progress"
PROJECT_NUMBER=3
OWNER="CabPiz"
ISSUE_NUM=[NUMERO]

ITEM_ID=$(gh project item-list $PROJECT_NUMBER --owner "$OWNER" --format json | jq -r ".items[] | select(.content.number==$ISSUE_NUM) | .id")

PROJECT_META=$(gh api graphql -f query='
query {
  user(login: "'"$OWNER"'") {
    projectV2(number: '$PROJECT_NUMBER') {
      id
      field(name: "Status") {
        ... on ProjectV2SingleSelectField {
          id
          options { id name }
        }
      }
    }
  }
}')

PROJECT_ID=$(echo $PROJECT_META | jq -r '.data.user.projectV2.id')
STATUS_FIELD_ID=$(echo $PROJECT_META | jq -r '.data.user.projectV2.field.id')
IN_PROGRESS_OPTION_ID=$(echo $PROJECT_META | jq -r '.data.user.projectV2.field.options[] | select(.name=="In Progress") | .id')
IN_REVIEW_OPTION_ID=$(echo $PROJECT_META | jq -r '.data.user.projectV2.field.options[] | select(.name=="In Review") | .id')

gh project item-edit --id $ITEM_ID --project-id $PROJECT_ID --field-id $STATUS_FIELD_ID --single-select-option-id $IN_PROGRESS_OPTION_ID
```

---

### FASE 1 — Entendimento e Proposta Técnica (PAUSA OBRIGATÓRIA)

**Executada após a FASE 0, com o card já em "In Progress".**

1. **Leitura e Confirmação de Escopo**
   - Ler os requisitos da issue, identificar dependências, fronteiras com outras issues e ambiguidades.
   - Apresentar resumo do entendimento e fazer perguntas de clarificação necessárias.

2. **Proposta Técnica Detalhada**
   - Propor solução completa: arquivos a criar/modificar, arquitetura, decisões de design e justificativas.
   - Apresentar alternativas quando houver trade-offs relevantes.
   - Encerrar sempre com: *"A proposta técnica está alinhada com o esperado para prosseguirmos com a implementação?"* — e **PARAR**.

> **ATENÇÃO:** Respostas do usuário que fornecem dados solicitados (links, e-mails, nomes) **não constituem aprovação**. A aprovação explícita é obrigatória — palavras como "sim", "pode ir", "aprovado", "prossiga". Enquanto não houver aprovação explícita, o Claude Code permanece em FASE 1.

---

### FASE 2 — Código-Fonte (Claude Code edita os arquivos diretamente)

- O Claude Code edita os arquivos diretamente no disco.
- **Antes de editar qualquer arquivo**, o Claude Code aplica proativamente todas as regras da seção `🔍 PADRÕES SONAR` deste arquivo. O código gerado já deve estar em conformidade — nunca delegar a verificação Sonar para o usuário.
- O Claude Code é responsável pela conformidade Sonar. O usuário nunca revisa o checklist manualmente.
- **Para issues que envolvem qualquer artefato que o usuário precise validar** (UI/UX, documentos `.md`, conteúdo gerado): apresentar o que foi criado/modificado e encerrar com *"Você validou o resultado? Pode prosseguir?"* — e **PARAR até receber validação explícita**.
- Essa é a **única pausa obrigatória de validação no fluxo**. Todas as demais etapas (build, testes, CI, merge, diário) são executadas autonomamente pelo Claude Code.

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

---

### FASE 3 — Commits Atômicos (Claude Code executa diretamente)

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

Após Quality Gate verde, o Claude Code executa o merge **autonomamente**:

```bash
gh pr merge --squash --delete-branch
git checkout main
git pull origin main
gh issue view [NUMERO]
```

Em seguida, **sem aguardar confirmação**, move os cards para Done e gera o Diário de Aprendizado.

---

### Encerramento da sessão

Imediatamente após o merge, o Claude Code executa de forma autônoma:

1. Verificar se houve erros de build novos na sessão. Se sim, **adicionar as entradas correspondentes no `BUILD_ERRORS.md`** antes do Diário.
2. Gerar o Diário de Aprendizado — **sem solicitar confirmação**.

O Claude Code **edita o arquivo `1.diario_de_aprendizado.md` diretamente no disco**, inserindo a nova entrada imediatamente após o cabeçalho do arquivo (logo abaixo da linha `---` que segue o parágrafo introdutório). O arquivo é ordenado em ordem decrescente — a entrada mais recente sempre no topo. Nunca adicionar ao final.

- **`[N]`** é um número sequencial que reseta para `1` a cada novo dia. Primeira entrada do dia = `1`, segunda = `2`, e assim por diante. Nunca usar `[N]` como placeholder — sempre substituir pelo número real.
- O Claude Code escolhe automaticamente o formato mais adequado (A, B ou C) com base no tipo de issue resolvida e indica o formato escolhido antes de editar o arquivo.

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

### Sem imports mortos
```tsx
// ✅ Remover qualquer import não utilizado no arquivo
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
*CLAUDE.md v1.7 — CI monitorado e merge executados autonomamente; única pausa obrigatória é validação do usuário na FASE 2*
