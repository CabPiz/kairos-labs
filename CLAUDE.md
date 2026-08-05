# CLAUDE.md — Kairos Labs

Arquivo de contexto lido automaticamente pelo Claude Code a cada sessão.
Repositório: `CabPiz/kairos-labs` | Owner: `CabPiz` | Project Board: nº 3

---

## ⚙️ PERMISSÕES DO CLAUDE CODE NESTA SESSÃO

### ✅ PERMITIDO
- Ler qualquer arquivo do repositório
- Criar e editar arquivos de código-fonte diretamente no disco
- Criar e editar arquivos de documentação (`.md`) diretamente no disco
- Rodar `npm run build` para validar o build
- Ler issues do GitHub com `gh issue view [NUMERO]` e `gh issue list`

### 🚫 PROIBIDO — EXECUÇÃO AUTOMÁTICA
Os comandos abaixo **NUNCA** devem ser executados automaticamente.
O Claude Code deve **gerar o bloco de comandos formatado** para o usuário executar manualmente:

- Qualquer comando `git` (`checkout`, `add`, `commit`, `push`, `pull`, `merge`)
- Qualquer comando `gh issue edit` (labels, assignees)
- Qualquer comando `gh project item-edit` (movimento de card no Board)
- Qualquer comando `gh pr create`, `gh pr merge`, `gh pr diff`, `gh pr status`
- Qualquer query `gh api graphql`

**Regra:** o versionamento é 100% manual pelo usuário. O Claude Code entrega o bloco de comandos pronto, sequenciado e comentado — nunca executa.

---

## 📋 PROTOCOLO DE SESSÃO — FLUXO OBRIGATÓRIO

### Abertura da sessão
O usuário inicia sempre com:
> "Vou trabalhar na issue #[número] — [título]"

Ao receber isso, o Claude Code executa automaticamente, nesta ordem:
```bash
gh issue view [NUMERO]
```
para ler o escopo completo da issue.

Em seguida, **obrigatoriamente**, lê o arquivo `BUILD_ERRORS.md` na raiz do projeto para internalizar todos os erros já resolvidos e aplicar os padrões corretos antes de gerar qualquer código.

---

### FASE 0 — Entendimento e Proposta Técnica (PAUSA OBRIGATÓRIA)

**Obrigatória para TODAS as issues, sem exceção.**

1. **Leitura e Confirmação de Escopo**
   - Ler os requisitos da issue, identificar dependências, fronteiras com outras issues e ambiguidades.
   - Apresentar resumo do entendimento e fazer perguntas de clarificação necessárias.
   - **PROIBIDO** gerar código ou comandos antes desta etapa.

2. **Proposta Técnica Detalhada**
   - Propor solução completa: arquivos a criar/modificar, arquitetura, decisões de design e justificativas.
   - Apresentar alternativas quando houver trade-offs relevantes.
   - **PROIBIDO** gerar código ou comandos antes da aprovação explícita.
   - Encerrar sempre com: *"A proposta técnica está alinhada com o esperado para prosseguirmos com a implementação?"* — e **PARAR**.

> **ATENÇÃO:** Respostas do usuário que fornecem dados solicitados (links, e-mails, nomes) **não constituem aprovação**. A aprovação explícita é obrigatória — palavras como "sim", "pode ir", "aprovado", "prossiga". Enquanto não houver aprovação explícita, o Claude Code permanece em FASE 0.

---

### FASE 1 — Início do Versionamento (SOMENTE após aprovação explícita da Proposta Técnica)

Após aprovação explícita, o Claude Code entrega o bloco **completo** abaixo — incluindo captura de IDs do Board e movimentação do card. Nunca omitir nenhuma etapa:

```bash
# 1. Atualizar a main
git checkout main
git pull origin main

# 2. Criar a branch da issue
git checkout -b tipo/[NUMERO]-descricao-curta

# 3. Atribuir e mover para In Progress
gh issue edit [NUMERO] --add-assignee "@me"
gh issue edit [NUMERO] --add-label "status: in progress"

# 4. Capturar IDs do Board
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

# 5. Mover card para "In Progress"
gh project item-edit --id $ITEM_ID --project-id $PROJECT_ID --field-id $STATUS_FIELD_ID --single-select-option-id $IN_PROGRESS_OPTION_ID
```

**Somente após confirmação do usuário de que os comandos foram executados, o desenvolvimento começa.**

---

### FASE 2 — Código-Fonte (Claude Code edita os arquivos diretamente)

- O Claude Code edita os arquivos diretamente no disco.
- **Antes de editar qualquer arquivo**, o Claude Code aplica proativamente todas as regras da seção `🔍 PADRÕES SONAR` deste arquivo. O código gerado já deve estar em conformidade — nunca delegar a verificação Sonar para o usuário.
- O Claude Code é responsável pela conformidade Sonar. O usuário nunca revisa o checklist manualmente.
- Para issues de UI/UX: aguardar feedback visual antes de prosseguir para commits.
- Encerrar sempre com: *"A solução atendeu visualmente ao esperado para prosseguirmos?"* — e **PARAR**.

---

### FASE 2.5 — Validação Local Obrigatória (usuário executa)

**Passo 1 — Build do projeto**

O Claude Code instrui o usuário a rodar:

```bash
npm run build
```

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

---

### FASE 3 — Commits Atômicos (bloco gerado para o usuário executar)

**Regra:** cada commit cobre UMA mudança lógica. Commits intermediários usam `Ref #[NUMERO]`. Apenas o último usa `Closes #[NUMERO]`.

O Claude Code entrega os commits sequenciados prontos. Exemplo:

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

Após confirmação dos commits, o Claude Code entrega o bloco de abertura de PR:

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

# Verificar PR
gh pr diff
gh pr status
```

---

### FASE 4 — Resolução de Issues do Sonar na PR

- **PROIBIDO fazer merge** enquanto houver issues do Sonar abertas.
- URL para verificar: `sonarcloud.io/summary/new_code?id=CabPiz_kairos-labs&pullRequest=[NUMERO_PR]`
- O usuário compartilha prints ou descrição das issues apontadas. O Claude Code então:
  1. **Atualiza a seção `🔍 PADRÕES SONAR` deste `CLAUDE.md`** para contemplar as novas regras detectadas, garantindo que não se repitam em issues futuras.
  2. **Corrige os arquivos afetados** diretamente no disco.
- Após correção: usuário roda `npm run build` + push. Aguardar novo ciclo do Sonar.

Somente após Quality Gate verde, o Claude Code entrega o bloco de merge:

```bash
gh pr merge --squash --delete-branch
git checkout main
git pull origin main
gh issue view [NUMERO]
```

---

### Encerramento da sessão

O Diário de Aprendizado **só é gerado após o usuário confirmar que executou a FASE 4** (merge concluído).

Antes de gerar o Diário, o Claude Code verifica se houve erros de build novos na sessão. Se sim, **adiciona as entradas correspondentes no `BUILD_ERRORS.md`** (se ainda não foram adicionadas durante a FASE 2.5). O `BUILD_ERRORS.md` é atualizado antes do Diário de Aprendizado.

O Claude Code gera a entrada **dentro de um bloco de código markdown**, pronta para cópia direta.

- **`[N]`** é um número sequencial que reseta para `1` a cada novo dia. Primeira entrada do dia = `1`, segunda = `2`, e assim por diante. Nunca usar `[N]` como placeholder — sempre substituir pelo número real.
- O Claude Code escolhe automaticamente o formato mais adequado (A, B ou C) com base no tipo de issue resolvida e indica o formato escolhido antes do bloco.

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

// ✅ Correto — pontuação após </span> também exige espaçamento explícito
<p>
  Feedback sobre{" "}
  <span>{produto}</span>
  {". "}Obrigado pelo retorno.
</p>

// ❌ Errado — ponto solto após </span> gera "Ambiguous spacing" no Sonar
<p>
  Feedback sobre{" "}
  <span>{produto}</span>
  . Obrigado pelo retorno.
</p>
```

### Sem imports mortos
```tsx
// ✅ Remover qualquer import não utilizado no arquivo
```

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
*CLAUDE.md v1.5 — BUILD_ERRORS.md como base de conhecimento; build antes dos testes manuais na FASE 2.5*
