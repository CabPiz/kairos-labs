# CLAUDE.md — Kairos Labs

Repositório: `CabPiz/kairos-labs` | Owner: `CabPiz` | Project Board: nº **3**
**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Supabase · Playwright · SonarCloud

---

## ⚙️ Config do Projeto

| Campo | Valor |
|---|---|
| `[BOARD_NUMBER]` | `3` |
| `[MILESTONES_API]` | `repos/CabPiz/kairos-labs/milestones` |
| `[DIARIO_PREFIX]` | `diario(kairos-labs)` |
| `[PROJETO]` | `kairos-labs` |
| Campo obrigatório no diário | `* **Projeto:** \`Kairos Labs\`` |

### Milestones — Issues Finais
**#12** (M2), **#39** (M5), **#16** (M3), **#20** (M4)

### Board
```bash
gh project item-add 3 --owner CabPiz --url [url]
gh api repos/CabPiz/kairos-labs/milestones --jq '.[].title'
```

---

## 📓 Diário de Aprendizado
Commitado **apenas** em `CabPiz/concentrador` (privado):
```bash
cd "C:/Users/Cesar/Documents/Desenvolvimento/projeto_concentrador/concentrador"
git pull origin main
# inserir entrada no topo de 1.diario_de_aprendizado.md
git add 1.diario_de_aprendizado.md
git commit -m "diario(kairos-labs): [título curto da entrada]"
git push origin main
```
O arquivo `1.diario_de_aprendizado.md` neste projeto está no `.gitignore`.

## 📋 Business Plan
Localização: `CabPiz/concentrador` → `kairos-labs/business_plan.md`
O arquivo `docs/business_plan.md` está no `.gitignore`.

---

## ⚖️ Conformidade Legal (Obrigatório)

Todos os produtos Kairos Labs devem estar em conformidade com **LGPD + GDPR + EU AI Act** desde o primeiro commit com funcionalidade de usuário.

Framework completo: `docs/compliance/FRAMEWORK.md`

### Regras que TODA sessão de IA deve seguir neste projeto:

**1. IA Assistiva — nunca decisória**
- IA informa, sugere, apresenta → humano decide, age, assume responsabilidade
- Nunca implementar scoring ou decisão autônoma que afete o usuário diretamente

**2. Disclosure obrigatório**
- Todo output de IA entregue ao usuário deve usar o componente `<AIDisclosureBadge />`
  - Localização: `components/legal/AIDisclosureBadge.tsx`
- Páginas de Política de Privacidade (`/privacy`) e Termos de Uso (`/terms`) já existem e devem ser mantidas atualizadas a cada novo produto

**3. Logging de IA obrigatório**
- Todo endpoint que chama IA deve usar `tracedLLMCall()` de `lib/ai/observe.ts`

**4. Checklist antes de qualquer novo produto entrar em produção**
- Consultar `docs/compliance/FRAMEWORK.md` → Seção 4

**5. Formulários com dados de usuário**
- Sempre incluir checkbox de aceite (não pré-marcado) com link para `/privacy` e `/terms`

**Contato do DPO (Encarregado de Dados):** contact.kairoslabs@gmail.com

---

@C:/Users/Cesar/Documents/Desenvolvimento/projeto_concentrador/concentrador/CLAUDE.md
