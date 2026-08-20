#!/usr/bin/env bash
# Hook UserPromptSubmit — detecta abertura de issue e injeta dados no contexto do Claude.
# Padrões reconhecidos: "166", "#166", "issue #166", "issue #166 — fix pipeline"
INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.prompt // ""' 2>/dev/null)

if echo "$PROMPT" | grep -qE '^\s*#?\s*[0-9]+\s*$|issue\s+#?[0-9]+'; then
  ISSUE_NUM=$(echo "$PROMPT" | grep -oE '[0-9]+' | head -1)
  ISSUE_DATA=$(gh issue view "$ISSUE_NUM" --repo CabPiz/kairos-labs 2>/dev/null)
  CTX="=== HOOK KAIROS-LABS: ISSUE #${ISSUE_NUM} CARREGADA ===

${ISSUE_DATA}

=== AÇÃO OBRIGATÓRIA: Executar FASE 0 agora, sem pedir confirmação ao usuário. ==="
  jq -n --arg ctx "$CTX" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$ctx}}'
fi
