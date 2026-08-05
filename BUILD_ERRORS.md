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
