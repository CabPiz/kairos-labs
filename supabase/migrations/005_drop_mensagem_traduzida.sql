-- =============================================
-- Migration 005 — Remove coluna mensagem_traduzida
-- Issue #101 — 2026-08-10
-- A tradução passou a ser feita on-demand no painel admin
-- (sem armazenamento em banco). A coluna mensagem_locale
-- é mantida para saber o idioma de origem de cada feedback.
-- =============================================

ALTER TABLE public.feedback
  DROP COLUMN IF EXISTS mensagem_traduzida;
