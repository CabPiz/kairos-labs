-- Adiciona campos de telefone e preferência de WhatsApp à tabela contact_requests
-- Issue #98 — navegabilidade e seção Contato

ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_preferred BOOLEAN NOT NULL DEFAULT FALSE;
