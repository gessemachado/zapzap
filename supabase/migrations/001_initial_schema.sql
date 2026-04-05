-- ZapZap — Schema inicial
-- Executado em: 2026-04-05

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- GRUPOS DE CONTATOS
-- =====================
CREATE TABLE IF NOT EXISTS contact_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#25D366',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- CONTATOS
-- =====================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone)
);

-- =====================
-- CONTATOS <-> GRUPOS (N:N)
-- =====================
CREATE TABLE IF NOT EXISTS contact_group_members (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, group_id)
);

-- =====================
-- CAMPANHAS
-- =====================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  product_image_url TEXT,
  flyer_url TEXT,
  flyer_slug TEXT UNIQUE,
  audience_type TEXT NOT NULL DEFAULT 'all' CHECK (audience_type IN ('all', 'group', 'manual')),
  audience_group_id UUID REFERENCES contact_groups(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'done', 'failed')),
  total_contacts INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  read_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  estimated_cost NUMERIC(10,2) DEFAULT 0,
  real_cost NUMERIC(10,2),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ENVIOS POR CONTATO
-- =====================
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  whatsapp_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, contact_id)
);

-- =====================
-- CONFIGURAÇÕES DO APP
-- =====================
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meta_access_token TEXT,
  meta_phone_number_id TEXT,
  meta_waba_id TEXT,
  meta_api_version TEXT DEFAULT 'v19.0',
  webhook_verify_token TEXT DEFAULT 'zapzap_wh_' || substr(md5(random()::text), 1, 8),
  send_interval_ms INT DEFAULT 1000,
  max_per_hour INT DEFAULT 200,
  auto_retry BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_active ON contacts(active);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_status ON campaign_sends(status);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_contact ON campaign_sends(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_flyer_slug ON campaigns(flyer_slug);

-- =====================
-- RLS
-- =====================
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY authenticated_all ON contact_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_all ON contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_all ON contact_group_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_all ON campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_all ON campaign_sends FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY authenticated_all ON app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY public_read_flyer ON campaigns FOR SELECT TO anon USING (flyer_slug IS NOT NULL);
CREATE POLICY service_all ON campaign_sends FOR ALL TO service_role USING (true) WITH CHECK (true);
