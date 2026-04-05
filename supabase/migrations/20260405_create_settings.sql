-- =============================================
-- WeCaHan Inbox - Settings Table Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(category, key)
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated users can read/write
CREATE POLICY "Authenticated users can read settings"
  ON public.settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON public.settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON public.settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed default values from env (optional, adjust as needed)
INSERT INTO public.settings (category, key, value) VALUES
  ('workspace', 'organization_name', 'WeCaHan'),
  ('workspace', 'language', 'tr'),
  ('workspace', 'timezone', 'Europe/Istanbul'),
  ('whatsapp', 'phone_number_id', ''),
  ('whatsapp', 'access_token', ''),
  ('whatsapp', 'webhook_url', ''),
  ('whatsapp', 'api_version', 'v20.0'),
  ('automation', 'ai_mode_rules', 'Türkçe yanıt ver. Resmi ve yardımcı ol.'),
  ('automation', 'n8n_webhook_secret', ''),
  ('automation', 'auto_reply_enabled', 'true')
ON CONFLICT (category, key) DO NOTHING;

-- Enable realtime for settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
