# COVERAGE_GAPS.md — Base de Conhecimento de Gaps de Cobertura

> Arquivo acumulativo. Cada vez que um gap de coverage é detectado e corrigido, o padrão é registrado aqui.
> O Claude Code consulta este arquivo na FASE 1 (eixo 5 — Testes) para antecipar gaps antes de escrever código.
> Ordenado do mais recente para o mais antigo.

---

## Como usar este arquivo

**Na FASE 1 (Testes):** antes de propor os testes, o Claude Code lê este arquivo e verifica se algum padrão da proposta se encaixa nos gaps conhecidos. Se sim, os testes preventivos correspondentes são incluídos na proposta.

**Na FASE 2.5 (após `npm test`):** rodar `node scripts/check-coverage.mjs` para detectar gaps nos arquivos modificados. Se um novo gap aparecer que não está documentado aqui, registrá-lo antes de fechar a issue.

---

## Gaps Conhecidos

### GAP-005 — Funções internas de componente (handlers não exportados)

- **Arquivo-exemplo:** `components/sections/NavBar.tsx`
- **Issue:** `#86`
- **Data:** `09/08/2026`
- **Padrão:** Funções declaradas dentro do componente (`handleNavLink`, `handleContactClick`) que não são exportadas. Testes que apenas renderizam o componente e clicam em elementos externos nunca disparam essas funções.
- **Linhas típicas sem cobertura:** handlers que fecham modais e menus simultaneamente (ex: `setMobileOpen(false); setContactOpen(true)`).
- **Solução:** Para cada função interna que combina múltiplas ações de estado, escrever um teste que:
  1. Abre o contexto que a função fecha (ex: abre o menu mobile)
  2. Dispara o elemento que chama a função (ex: clica em "Contato" no menu mobile)
  3. Afirma o estado após (menu fechado + modal aberto)
- **Teste preventivo:**
  ```tsx
  it("fecha o menu e abre o modal ao clicar em Contato no mobile", () => {
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: /menu de navegação/i }));
    const btns = screen.getAllByRole("button", { name: /contato/i });
    fireEvent.click(btns[btns.length - 1]);
    expect(screen.queryByRole("button", { name: /fechar menu/i })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  ```

---

### GAP-004 — Event handlers de hover/focus em elementos interativos

- **Arquivo-exemplo:** `components/sections/NavBar.tsx`
- **Issue:** `#86`
- **Data:** `09/08/2026`
- **Padrão:** Handlers `onMouseOver`, `onFocus`, `onMouseOut`, `onBlur` aplicados inline em `<Link>` e `<button>`. Testes de render básico não disparam esses eventos.
- **Linhas típicas sem cobertura:** blocos como `(e) => (e.currentTarget.style.color = "#fff")` e `(e) => (e.currentTarget.style.color = "rgba(...)")`.
- **Solução:** Usar `fireEvent.mouseOver`, `fireEvent.focus`, `fireEvent.mouseOut`, `fireEvent.blur` explicitamente. Agrupar em `it.each` para evitar Sonar S5976:
  ```tsx
  it.each(["mouseOver", "focus"] as const)(
    "altera cor do link %s no evento %s",
    (event) => {
      render(<Component />);
      const el = screen.getByRole("link", { name: /texto/i });
      fireEvent[event](el);
      expect(el.style.color).toBe("rgb(255, 255, 255)");
    }
  );
  it.each(["mouseOut", "blur"] as const)(/* restaura cor */);
  ```

---

### GAP-003 — Arquivos de script em `scripts/` incluídos na análise Sonar

- **Arquivo-exemplo:** `scripts/take-mobile-screenshots.mjs`
- **Issue:** `#86`
- **Data:** `09/08/2026`
- **Padrão:** Arquivos `.mjs` em `scripts/` não têm testes unitários (são executáveis de automação, não lógica de produto). Se não estiverem na exclusion list do Sonar, puxam 0% de coverage para a análise.
- **Solução:** Adicionar `scripts/**` a `sonar.coverage.exclusions` em `sonar-project.properties`. Já configurado no projeto — verificar ao criar novos scripts.
- **Regra:** todo arquivo em `scripts/` criado durante uma issue deve ser adicionado à exclusion list no mesmo commit.

---

### GAP-002 — Renders condicionais com `&&` e estado não inicializado

- **Arquivo-exemplo:** `components/contact/ContactModal.tsx` (padrão geral)
- **Issue:** Múltiplas
- **Data:** `08/08/2026`
- **Padrão:** `{condition && <Componente />}` — o branch `false` do `&&` nunca é testado explicitamente. O Sonar conta como branch não coberto.
- **Solução:** Para cada render condicional crítico, escrever dois testes: um com a condição verdadeira e um com a condição falsa:
  ```tsx
  it("não renderiza quando condition=false", () => {
    render(<Comp condition={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("renderiza quando condition=true", () => {
    render(<Comp condition={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  ```

---

### GAP-001 — Server Actions com múltiplos caminhos de retorno

- **Arquivo-exemplo:** `lib/contact/actions.ts`
- **Issue:** `#73`
- **Data:** `08/08/2026`
- **Padrão:** Server Actions que retornam `{ success: true }` no caminho feliz e `{ success: false, error: "..." }` nos caminhos de erro. Testes que só cobrem o caminho feliz deixam os branches de erro descobertos.
- **Solução:** Mockar o cliente Supabase para retornar erro e testar cada branch de retorno:
  ```tsx
  it("retorna erro quando o insert falha", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "DB error" } });
    const result = await submitAction({ email: "a@b.com" });
    expect(result.success).toBe(false);
  });
  ```
- **Atenção:** Server Actions usam `createServerAdminClient()` — mockar no nível do módulo com `jest.mock("@/lib/supabase/server-admin")`.

---

## Checklist de Prevenção (FASE 1 — Eixo 5)

Antes de propor testes para qualquer issue, verificar:

- [ ] O componente tem funções internas (handlers não exportados)? → **GAP-005**
- [ ] O componente tem `onMouseOver/onFocus/onMouseOut/onBlur` inline? → **GAP-004**
- [ ] A issue cria arquivos em `scripts/`? → **GAP-003** (adicionar à exclusion list)
- [ ] O componente tem renders condicionais com `&&` ou ternários? → **GAP-002**
- [ ] A issue cria ou modifica Server Actions com múltiplos paths de retorno? → **GAP-001**
