-- =============================================
-- Kairos Labs — Schema Consolidado (Migration 001)
-- Atualizado em: 2026-08-08 (issue #64)
-- Reflete o estado real do banco após todas as
-- correções aplicadas via dashboard do Supabase.
-- =============================================

-- =============================================
-- TABELAS
-- =============================================

-- Tabela da Lista de Espera por Produto
-- product_id: devprint | ai-saas | audio-tech | blockchain |
--             ascend | elucya-talk | agora-global | kairos-labs
CREATE TABLE public.waitlist (
  id         UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT                     NOT NULL,
  product_id TEXT                     NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT waitlist_email_product_unique UNIQUE (email, product_id)
);

-- Tabela de Sugestões / Feedback
CREATE TABLE public.feedback (
  id         UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT                     NOT NULL,
  nome       TEXT,
  email      TEXT,
  mensagem   TEXT                     NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================
-- RLS — Row Level Security
-- =============================================

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback  ENABLE ROW LEVEL SECURITY;

-- Waitlist: qualquer visitante pode se cadastrar
CREATE POLICY "Permitir inserção pública na waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Waitlist: somente o fundador autenticado pode ler
CREATE POLICY "Acesso exclusivo do fundador à waitlist"
  ON public.waitlist FOR SELECT
  USING (auth.jwt() ->> 'email' = 'cab.pizarro@gmail.com');

-- Feedback: qualquer visitante pode enviar
CREATE POLICY "Permitir inserção pública no feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

-- Feedback: somente o fundador autenticado pode ler
CREATE POLICY "Acesso exclusivo do fundador ao feedback"
  ON public.feedback FOR SELECT
  USING (auth.jwt() ->> 'email' = 'cab.pizarro@gmail.com');

-- =============================================
-- GRANTS
-- =============================================

-- anon: permite INSERT público (usado pelas Server Actions via service role,
--       mas declarado explicitamente para documentar a intenção de acesso)
GRANT INSERT ON public.waitlist TO anon;
GRANT INSERT ON public.feedback  TO anon;

-- service_role: acesso total para o admin dashboard e Server Actions
GRANT ALL ON public.waitlist TO service_role;
GRANT ALL ON public.feedback  TO service_role;
