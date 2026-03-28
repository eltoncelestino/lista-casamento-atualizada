-- Schema do banco de dados para Lista de Casamento
-- Execute este SQL no console do Neon: https://console.neon.tech

-- ===================================
-- TABELA DE PRESENTES
-- ===================================
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  product_url TEXT,
  image_url TEXT,
  selected BOOLEAN DEFAULT false,
  selected_by TEXT,
  selected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABELA DE CONTRIBUIÇÕES PIX
-- ===================================
CREATE TABLE IF NOT EXISTS pix_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABELA DE CONFIRMAÇÕES DE PRESENÇA
-- ===================================
CREATE TABLE IF NOT EXISTS confirmacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  mensagem TEXT,
  comparecera BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- TABELA DE USUÁRIOS ADMIN (AUTH)
-- ===================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================
CREATE INDEX IF NOT EXISTS idx_gifts_selected ON gifts(selected);
CREATE INDEX IF NOT EXISTS idx_pix_contributions_created ON pix_contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confirmacoes_created ON confirmacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ===================================
-- USUÁRIO ADMIN PADRÃO
-- ===================================
-- Email: eltongf2014@gmail.com
-- Senha: $Clarice2026
INSERT INTO admin_users (email, password_hash)
VALUES ('eltongf2014@gmail.com', '$2a$10$i/fRb02kgO0QxtmpLihT6uf7LdSWT5tQegoEVsp5gSR4K0kq7eHXy')
ON CONFLICT (email) DO NOTHING;
