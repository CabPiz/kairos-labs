# Kairos Labs — Compliance Framework

**Versão:** 1.0 | **Data:** 2026-08-15  
**Aplica-se a:** Todos os produtos do ecossistema Kairos Labs (atuais e futuros)  
**Mantenedor:** Cesar Pizarro (cab.pizarro@gmail.com)

---

## 1. Legislação Aplicável

| Lei | Jurisdição | Vigor | Aplica quando |
|---|---|---|---|
| **LGPD** (Lei 13.709/2018) | Brasil | Ago/2020 | Qualquer produto com usuários brasileiros |
| **GDPR** (Reg. 2016/679) | União Europeia | Mai/2018 | Qualquer produto acessível a usuários da UE |
| **EU AI Act** (Reg. 2024/1689) | União Europeia | Ago/2024 | Qualquer produto com IA acessível a usuários da UE |
| **DSA** (Reg. 2022/2065) | União Europeia | Fev/2024 | Plataformas online com usuários da UE |
| **Marco Civil** (Lei 12.965/2014) | Brasil | Abr/2014 | Produtos online com usuários brasileiros |

**Regra geral:** todos os produtos Kairos Labs devem estar em conformidade com LGPD + GDPR + EU AI Act desde o primeiro commit com funcionalidade de usuário.

---

## 2. Classificação de Risco (EU AI Act)

### 2.1 Como Classificar

Antes de projetar qualquer produto, responda:

1. A IA toma ou influencia decisões que afetam emprego, crédito, saúde, habitação, educação, ou acesso a serviços essenciais? → **Alto Risco (Anexo III)**
2. A IA é usada em infraestrutura crítica ou governança pública? → **Alto Risco**
3. A IA opera como chatbot conversacional ou gera conteúdo para usuários? → **Risco Limitado**
4. A IA é ferramenta interna de desenvolvimento (ex: Claude Code)? → **Risco Mínimo**

### 2.2 Classificação dos Produtos Kairos Labs

| Produto | Classificação Inicial | Classificação Pós-Redesign | Motivo |
|---|---|---|---|
| **Talvrix** | Alto Risco (scoring de emprego) | **Risco Limitado** | Redesign: IA sugere, humano decide |
| **Ágora Global** | Alto Risco (governança pública) | **Risco Limitado** | Redesign: IA sintetiza, humano vota/decide |
| **Elucya Talk** | Risco Limitado | Risco Limitado | Análise informativa, não decisória |
| **Ascend** | Risco Limitado | Risco Limitado | Plano gerado por IA, humano executa |
| **DevPrint** | Risco Limitado | Risco Limitado | Narrativa de portfólio, não decisão |
| **Kairos Labs Portal** | Risco Mínimo | Risco Mínimo | Sem IA chegando ao usuário final |

### 2.3 Princípio de Design: IA Assistiva

**REGRA OBRIGATÓRIA para todos os produtos:**

> "A IA informa, sugere e apresenta. O ser humano decide, age e assume responsabilidade."

**Padrões proibidos:**
- ❌ "Sua pontuação de compatibilidade é 87% — você está qualificado"
- ❌ "O sistema detectou fraude nesta licitação"
- ❌ "A IA moderou e removeu este conteúdo"

**Padrões corretos:**
- ✅ "Com base no seu perfil, estas vagas podem ser relevantes — avalie e decida"
- ✅ "Anomalia detectada nesta licitação — aguarda revisão do auditor humano"
- ✅ "Resumo dos argumentos gerado por IA — vote após sua própria leitura"

---

## 3. Obrigações por Nível de Risco

### 3.1 Risco Mínimo (uso interno de IA)
- [x] Nenhuma obrigação específica com usuários
- [x] Política de Privacidade cobrindo dados coletados

### 3.2 Risco Limitado (conteúdo IA para usuários) — EU AI Act Art. 50
- [ ] **Badge "Gerado por IA"** visível em todo output de IA entregue ao usuário
- [ ] **Footer disclosure** na página/seção onde IA é usada
- [ ] **Termos de Uso** declarando uso de IA e suas limitações
- [ ] **Política de Privacidade** mencionando processamento por IA de terceiros
- [ ] **Log de chamadas IA** (usar `lib/ai/observe.ts` — já implementado no portal)

### 3.3 Risco Limitado com dados sensíveis (GDPR Art. 9)
Aplica-se a Elucya Talk (análise comportamental/emocional):
- [ ] Consentimento explícito reforçado (não apenas checkbox)
- [ ] Explicação clara de quais dados são processados e por quê
- [ ] Opção de exclusão completa dos dados a qualquer momento
- [ ] Não compartilhar dados de análise com terceiros sem consentimento adicional

### 3.4 Alto Risco (NUNCA usar — redesign obrigatório antes de lançar)
Se por qualquer motivo um produto atingir Alto Risco antes do lançamento:
- Parar e redesenhar para Risco Limitado antes de qualquer usuário real
- Se redesign não for possível: contratar assessoria jurídica especializada em EU AI Act

---

## 4. Checklist de Lançamento (por Produto)

Use este checklist antes do primeiro usuário real em qualquer produto:

### 4.1 Dados e Privacidade
- [ ] Política de Privacidade publicada e linkada no footer
- [ ] Termos de Uso publicados e linkados no footer
- [ ] Formulário de cadastro com checkbox de aceite dos Termos (não pré-marcado)
- [ ] Formulário de cadastro com link para Política de Privacidade
- [ ] Todos os campos coletados são justificados por uma finalidade declarada
- [ ] Dados de menores de 18 anos não são coletados sem consentimento parental
- [ ] Mecanismo de exclusão de dados funcional ("Excluir minha conta")
- [ ] Mecanismo de exportação de dados funcional ("Baixar meus dados")
- [ ] E-mail do encarregado de dados (DPO) publicado: cab.pizarro@gmail.com

### 4.2 Transparência de IA
- [ ] Badge "Gerado por IA" em todo output de IA visível ao usuário
- [ ] Texto explicando o que a IA faz e o que ela NÃO faz no produto
- [ ] Link/botão "Falar com humano" ou equivalente onde aplicável
- [ ] Termos de Uso descrevem os modelos de IA usados (Anthropic, Gemini, etc.)
- [ ] Logging de chamadas IA ativo (`tracedLLMCall()`)

### 4.3 Direitos do Usuário (LGPD Art. 18 / GDPR Cap. III)
- [ ] Canal de contato para exercer direitos: cab.pizarro@gmail.com
- [ ] Prazo de resposta definido e comunicado: 15 dias (LGPD) / 30 dias (GDPR)
- [ ] Processo interno para atender pedidos de: acesso, correção, exclusão, portabilidade
- [ ] Para decisões automatizadas: processo de revisão humana disponível (LGPD Art. 20 / GDPR Art. 22)

### 4.4 Segurança (requer implementação técnica)
- [ ] RLS ativo em todas as tabelas Supabase com dados de usuários
- [ ] Dados em trânsito: HTTPS obrigatório
- [ ] Dados em repouso: criptografia ativa (padrão Supabase)
- [ ] Logs de acesso a dados sensíveis
- [ ] Nenhuma chave de API exposta no frontend

### 4.5 Documentação Interna
- [ ] Registro de Atividades de Tratamento (RAT) atualizado para o produto
- [ ] Relação de subprocessadores de dados listada (Supabase, Anthropic, Google, etc.)

---

## 5. Registro de Atividades de Tratamento (RAT)

Exigido pelo GDPR Art. 30 e recomendado pela LGPD. Atualizar a cada novo produto.

| Produto | Dados Coletados | Finalidade | Base Legal | Retenção | Subprocessadores |
|---|---|---|---|---|---|
| Kairos Labs Portal | E-mail, nome, mensagem de contato | Waitlist, contato comercial | Consentimento (LGPD Art. 7, I) | 2 anos | Supabase, Vercel |
| DevPrint | E-mail, dados de repositórios GitHub | Geração de portfólio | Contrato (LGPD Art. 7, V) | Enquanto conta ativa | Supabase, GitHub API, Google Gemini |
| Ascend | E-mail, currículo (PDF) | Análise de lacunas e plano de estudo | Consentimento | Enquanto conta ativa | Supabase, Google Gemini |
| Elucya Talk | E-mail, áudio/texto de conversas | Análise de comunicação | **Consentimento explícito reforçado** | Sessão + 30 dias | Supabase, Anthropic, AssemblyAI |
| Ágora Global | Identidade soberana (ZKP), votos, propostas | Participação cívica | Contrato + Interesse público | Permanente (blockchain) | Supabase, instância nacional |
| Talvrix | E-mail, currículo (PDF), preferências de emprego | Matching de vagas | Consentimento | Enquanto conta ativa | Supabase, Google Gemini |

---

## 6. Padrões de Código (Implementação)

### 6.1 Todo endpoint de IA deve usar o logger existente
```typescript
import { tracedLLMCall } from "@/lib/ai/observe";

const result = await tracedLLMCall({
  product: "talvrix",
  operation: "job-match",
  call: () => gemini.generateContent(prompt),
});
```

### 6.2 Todo output de IA para o usuário deve incluir o badge
```tsx
import { AIDisclosureBadge } from "@/components/legal/AIDisclosureBadge";

// Na UI, após cada resposta de IA:
<AIDisclosureBadge />
```

### 6.3 Todo formulário de cadastro deve incluir aceite de termos
```tsx
<label>
  <input type="checkbox" required />
  Aceito os{" "}
  <Link href="/terms">Termos de Uso</Link> e a{" "}
  <Link href="/privacy">Política de Privacidade</Link>,
  incluindo o uso de inteligência artificial descrito nesses documentos.
</label>
```

### 6.4 Decisões assistivas — sempre apresentar como sugestão
```typescript
// ERRADO — IA decide
return { decision: "approved", reason: "..." };

// CORRETO — IA informa, humano decide
return {
  suggestions: [...],
  disclaimer: "Esta análise é gerada por IA e não substitui avaliação humana.",
  humanReviewAvailable: true,
};
```

---

## 7. Subprocessadores de Dados

Lista obrigatória para menção na Política de Privacidade:

| Empresa | Serviço | País | Garantia de Adequação |
|---|---|---|---|
| Supabase Inc. | Banco de dados, autenticação | EUA | Cláusulas Contratuais Padrão (SCCs) |
| Vercel Inc. | Hospedagem | EUA | Cláusulas Contratuais Padrão (SCCs) |
| Anthropic PBC | IA generativa (Claude) | EUA | Cláusulas Contratuais Padrão (SCCs) |
| Google LLC | IA generativa (Gemini), Translate | EUA | Cláusulas Contratuais Padrão (SCCs) |
| OpenAI LLC | IA generativa (GPT) — Elucya Talk | EUA | Cláusulas Contratuais Padrão (SCCs) |
| AssemblyAI | Transcrição de áudio | EUA | Cláusulas Contratuais Padrão (SCCs) |
| GitHub Inc. | Repositórios — DevPrint | EUA | Cláusulas Contratuais Padrão (SCCs) |

> Nota: transferências para EUA são legais sob GDPR desde que amparadas por SCCs ou adequação. Todos os subprocessadores acima mantêm SCCs publicadas.

---

## 8. Direitos do Usuário — Processos Internos

Para atender qualquer pedido de usuário (LGPD Art. 18 / GDPR Arts. 15-22):

1. **Recebimento:** cab.pizarro@gmail.com — confirmar recebimento em até 48h
2. **Verificação de identidade:** solicitar e-mail cadastrado + confirmação
3. **Prazo:** 15 dias (LGPD) / 30 dias (GDPR, extensível a 60 dias em casos complexos)
4. **Pedidos suportados:**
   - Acesso: exportar dados do Supabase por e-mail do usuário
   - Correção: atualizar via Supabase dashboard ou endpoint admin
   - Exclusão: DELETE em todas as tabelas + remoção de dados de subprocessadores
   - Portabilidade: exportar em formato CSV/JSON
   - Revisão de decisão automatizada: análise manual pelo fundador

---

## 9. Incidentes de Segurança

Em caso de vazamento ou acesso não autorizado a dados:

1. **Identificar e conter** o incidente
2. **Notificar a ANPD** (Brasil) em até **72 horas** (LGPD Art. 48)
3. **Notificar a autoridade supervisora da UE** em até **72 horas** (GDPR Art. 33)
4. **Notificar usuários afetados** sem demora injustificada se houver risco alto
5. **Documentar** o incidente, causa, impacto e medidas tomadas

Contato ANPD: anpd.gov.br | Contato DPA UE: depende do país do usuário afetado

---

## 10. Revisão Periódica

Este framework deve ser revisado:
- A cada novo produto antes do lançamento
- A cada mudança significativa em qualquer produto existente
- Anualmente, no mínimo
- Quando houver nova legislação relevante

**Próxima revisão programada:** 2027-08-15
