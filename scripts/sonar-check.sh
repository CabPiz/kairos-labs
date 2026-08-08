#!/usr/bin/env bash
# Consulta a API REST do SonarCloud para Quality Gate e issues de uma PR.
# Uso:
#   ./scripts/sonar-check.sh gate   [PR_NUMBER]
#   ./scripts/sonar-check.sh issues [PR_NUMBER]
#
# Variáveis de ambiente necessárias:
#   SONAR_TOKEN       — token de acesso gerado em sonarcloud.io/account/security
#   SONAR_PROJECT_KEY — chave do projeto (padrão: CabPiz_kairos-labs)

set -euo pipefail

SONAR_API="https://sonarcloud.io/api"
PROJECT_KEY="${SONAR_PROJECT_KEY:-CabPiz_kairos-labs}"
TOKEN="${SONAR_TOKEN:-}"
PR_NUMBER="${2:-}"

if [[ -z "$TOKEN" ]]; then
  echo "ERRO: variável SONAR_TOKEN não definida." >&2
  echo "Defina em .env.local ou exporte: export SONAR_TOKEN=<seu_token>" >&2
  exit 1
fi

if [[ -z "$PR_NUMBER" ]]; then
  echo "ERRO: número da PR é obrigatório." >&2
  echo "Uso: ./scripts/sonar-check.sh gate <PR_NUMBER>" >&2
  exit 1
fi

sonar_gate() {
  local response
  response=$(curl -sf \
    -u "${TOKEN}:" \
    "${SONAR_API}/qualitygates/get_by_project?project=${PROJECT_KEY}&pullRequest=${PR_NUMBER}")

  local status
  status=$(echo "$response" | jq -r '.qualityGate.status // "UNKNOWN"')

  echo "=== Quality Gate — PR #${PR_NUMBER} ==="
  if [[ "$status" == "OK" ]]; then
    echo "STATUS: OK (passou)"
  elif [[ "$status" == "ERROR" ]]; then
    echo "STATUS: FAILED (bloqueado)"
  else
    echo "STATUS: ${status}"
  fi

  echo ""
  echo "Condições:"
  echo "$response" | jq -r '
    .qualityGate.conditions[]? |
    "  [" + .status + "] " + .metricKey +
    " — valor: " + (.actualValue // "n/a") +
    " (limite: " + (.errorThreshold // "n/a") + ")"
  '
}

sonar_issues() {
  local page=1
  local total=1
  local shown=0

  echo "=== Issues abertas — PR #${PR_NUMBER} ==="

  while [[ $shown -lt $total ]]; do
    local response
    response=$(curl -sf \
      -u "${TOKEN}:" \
      "${SONAR_API}/issues/search?componentKeys=${PROJECT_KEY}&pullRequest=${PR_NUMBER}&resolved=false&ps=50&p=${page}")

    total=$(echo "$response" | jq -r '.total // 0')

    if [[ "$total" -eq 0 ]]; then
      echo "Nenhuma issue aberta encontrada."
      return
    fi

    echo "$response" | jq -r '
      .issues[]? |
      "[" + .severity + "] " + .message + "\n" +
      "  Arquivo : " + (.component | split(":") | last) + "\n" +
      "  Linha   : " + (.line // "n/a" | tostring) + "\n" +
      "  Regra   : " + .rule + "\n"
    '

    local count
    count=$(echo "$response" | jq '.issues | length')
    shown=$((shown + count))
    page=$((page + 1))
  done

  echo "Total: ${total} issue(s)"
}

case "${1:-}" in
  gate)   sonar_gate ;;
  issues) sonar_issues ;;
  *)
    echo "Uso: ./scripts/sonar-check.sh <gate|issues> <PR_NUMBER>"
    exit 1
    ;;
esac
