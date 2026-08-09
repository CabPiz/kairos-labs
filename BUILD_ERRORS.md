# BUILD_ERRORS.md — Base de Conhecimento de Erros de Build

Arquivo lido obrigatoriamente pelo Claude Code antes de iniciar o desenvolvimento de qualquer issue.
Cada entrada documenta um erro já resolvido, sua causa raiz e o padrão correto a seguir.

---

## [ERR-001] ZodError: Property 'errors' does not exist

**Issue de origem:** #12  
**Sintoma:**
```
Type error: Property 'errors' does not exist on type 'ZodError<...>'
```
**Causa:** A API do Zod expõe os erros de validação pela propriedade `.issues`, não `.errors`.  
**Correção:** Substituir `.error.errors[0]` por `.error.issues[0]`.  
**Padrão a seguir:**
```ts
// ✅ Correto
const first = parsed.error.issues[0];
return { status: "error", message: first.message };
```

---

## [ERR-002] Supabase perde inferência de tipo em Server Components

**Issue de origem:** #12  
**Sintoma:**
```
Type error: Object literal may only specify known properties,
and 'product_id' does not exist in type 'never[]'.
```
**Causa:** `createServerSupabaseClient()` e `createAdminClient()` (baseados em `@supabase/ssr`) perdem a inferência do genérico `Database` em Server Components e Server Actions do Next.js App Router. O método `.from("tabela").insert(...)` é tipado como `never`.  
**Correção:** Cast `as any` no cliente antes de chamar `.from()`. Padrão já estabelecido no projeto desde o `waitlist-action.ts`.  
**Padrão a seguir:**
```ts
// ✅ Correto — Server Action
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { error } = await (supabase as any)
  .from("feedback")
  .insert({ product_id, nome, email, mensagem });

// ✅ Correto — Server Component (leitura)
import type { Database } from "@/lib/types";
type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

const { data } = await supabase.from("feedback").select("*");
const lista: FeedbackRow[] = (data as FeedbackRow[] | null) ?? [];
```

---

## [ERR-003] TypeScript não narra tipo em ternário JSX com dados Supabase

**Issue de origem:** #12  
**Sintoma:**
```
Type error: Property 'id' does not exist on type 'never'.
```
**Causa:** Quando `data` do Supabase é `null | Row[]`, o TypeScript não consegue estreitar o tipo corretamente dentro de um ternário JSX (`condition ? A : B`). O array fica inferido como `never` no branch verdadeiro.  
**Correção:** Substituir o ternário por dois blocos `&&` independentes.  
**Padrão a seguir:**
```tsx
// ❌ Evitar — TypeScript perde o tipo no branch
{sugestoes && sugestoes.length > 0 ? (
  sugestoes.map((s) => <div key={s.id}>...</div>)  // erro: 'id' não existe em 'never'
) : (
  <p>Vazio</p>
)}

// ✅ Correto — dois blocos independentes
{lista.length === 0 && <p>Vazio</p>}
{lista.length > 0 && (
  <div>
    {lista.map((s) => <div key={s.id}>...</div>)}
  </div>
)}
```

---

## [ERR-004] Sonar: duplicação de código entre componentes modais (> 3%)

**Issue de origem:** #12  
**Sintoma:** Quality Gate falha com `X% Duplicated Lines (%) — ≤ 3.0% required`.  
**Causa:** Componentes modais com estrutura visual semelhante (mesmo padrão de Dialog, painel de sucesso, banner de erro, botão de submit) geram blocos duplicados detectados pelo Sonar ao comparar arquivos diferentes. No projeto Kairos Labs, o `FeedbackModal` começou com 26.4% de duplicação com o `WaitlistModal`.

**Como o desenvolvedor deve pensar antes de codificar:**

> **Regra de ouro:** qualquer componente React que se parece visualmente com outro já existente deve reusar partes estruturais — não copiar. Antes de criar um novo modal, componente de lista ou card, pergunte: *"Já existe um componente que faz isso?"*

**Padrão a seguir — extração progressiva:**

1. **Painel de resultado (sucesso/erro/aviso):** sempre usar `ModalResultPanel` de `@/components/ui/ModalResultPanel`.
2. **Banner de erro genérico de action:** sempre usar `ModalErrorBanner` de `@/components/ui/ModalErrorBanner`.
3. **Novos padrões visuais recorrentes:** extrair para `components/ui/` antes de copiar para um segundo arquivo.

```tsx
// ❌ Errado — copiar o painel de sucesso do WaitlistModal para o FeedbackModal
// resulta em ~90 linhas duplicadas e falha no Quality Gate

// ✅ Correto — usar o componente compartilhado
import { ModalResultPanel } from "@/components/ui/ModalResultPanel";
import { ModalErrorBanner } from "@/components/ui/ModalErrorBanner";

// Painel de sucesso
if (actionState.status === "success") {
  return (
    <ModalResultPanel
      open={open}
      onOpenChange={handleOpenChange}
      icon={<CheckCircle size={30} color="#10b981" />}
      iconColor="#10b981"
      title="Ação concluída!"
      message={<>Mensagem de confirmação.</>}
      buttonColor="#10b981"
    />
  );
}

// Banner de erro dentro do formulário
{actionState.status === "error" && (
  <ModalErrorBanner message={actionState.message} />
)}
```

**Componentes compartilhados disponíveis em `components/ui/`:**

| Componente | Quando usar |
|---|---|
| `ModalResultPanel` | Painel de sucesso, aviso ou qualquer estado final de modal |
| `ModalErrorBanner` | Banner de erro inline dentro de formulários de modal |

---

## [ERR-007] Event handlers em Server Components causam falha de prerender

**Issue de origem:** #98  
**Sintoma:**
```
Error: Event handlers cannot be passed to Client Component props.
{href: "/", style: ..., onMouseOver: function onMouseOver, ...}
If you need interactivity, consider converting part of this to a Client Component.
digest: '2177826938'
Export encountered an error on /admin/login/page: /admin/login, exiting the build.
```
**Causa:** Arquivo em `app/` sem `"use client"` é um Server Component. O Next.js serializa o JSX para transferência ao cliente — funções (`onMouseOver`, `onClick`, `onFocus`, etc.) não são serializáveis e são rejeitadas no prerender estático.  
**Correção:** Remover os event handlers do elemento afetado, ou adicionar `"use client"` ao arquivo (somente se a interatividade for essencial — tem custo de bundle).  
**Padrão a seguir:**
```tsx
// ✅ Correto em Server Component — sem event handlers
<Link href="/" style={{ color: "rgba(255,255,255,0.4)" }}>
  ← Voltar ao site
</Link>

// ❌ Errado em Server Component — build falha
<Link
  href="/"
  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
>
  ← Voltar ao site
</Link>
```
**Prevenção:** Antes de adicionar qualquer `on*` handler a um elemento em `app/`, verificar se o arquivo tem `"use client"` no topo. Se não tiver, o componente é Server Component e event handlers são proibidos como props.
