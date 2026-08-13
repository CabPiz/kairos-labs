-- =============================================
-- Migration 006 — GRANT DELETE para service_role
-- Issue #120: permite remoção de dados de teste
-- via scripts e teardown E2E com service_role key
-- =============================================

-- Garante que service_role pode DELETE (necessário para scripts de limpeza E2E)
GRANT DELETE ON public.waitlist TO service_role;
GRANT DELETE ON public.feedback  TO service_role;

-- Política RLS de DELETE para o fundador autenticado (via painel Admin)
CREATE POLICY "Fundador pode deletar entradas da waitlist"
  ON public.waitlist FOR DELETE
  USING (auth.jwt() ->> 'email' = 'cab.pizarro@gmail.com');

CREATE POLICY "Fundador pode deletar entradas de feedback"
  ON public.feedback FOR DELETE
  USING (auth.jwt() ->> 'email' = 'cab.pizarro@gmail.com');
