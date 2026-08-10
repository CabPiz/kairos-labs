-- =============================================
-- Migration 003 — Tradução automática de feedbacks
-- Issue #101 — 2026-08-10
-- Adiciona colunas para armazenar o locale de origem
-- e as traduções automáticas geradas via Gemini API.
-- =============================================

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS mensagem_locale TEXT,
  ADD COLUMN IF NOT EXISTS mensagem_traduzida JSONB;
