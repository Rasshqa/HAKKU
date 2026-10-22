-- =====================================================================
-- HAKKU (Digital Legal Companion) - Production PostgreSQL Schema DDL
-- Sesuai Dokumen Arsitektur: agents/05-backend-scheme.md
-- Skalabilitas: Jutaan Pengguna, Partisi Kasus, Kepatuhan UU PDP No. 27/2022
-- =====================================================================

-- Ekstensi UUID jika diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL PENGGUNA (USERS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL DEFAULT 'Warga',
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL PERKARA UTAMA (CASES)
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_code VARCHAR(32) NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    category_label VARCHAR(128) NOT NULL,
    urgency_level VARCHAR(32) NOT NULL DEFAULT 'normal',
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'awaiting_help', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks performa pencarian perkara
CREATE INDEX IF NOT EXISTS idx_cases_case_code ON cases(case_code);
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- 3. TABEL INTAKE CERITA DAN KLARIFIKASI FAKTA (CASE_INTAKES)
CREATE TABLE IF NOT EXISTS case_intakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_statement TEXT NOT NULL,
    clarification_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    facts_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_intakes_case_id ON case_intakes(case_id);

-- 4. TABEL EVALUASI DASAR HUKUM BERSUMBER (CASE_EVALUATIONS)
CREATE TABLE IF NOT EXISTS case_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    legal_source_id VARCHAR(128) NOT NULL,
    legal_source_title TEXT NOT NULL,
    legal_source_url TEXT NOT NULL,
    articles_cited JSONB NOT NULL DEFAULT '[]'::jsonb,
    action_options JSONB NOT NULL DEFAULT '[]'::jsonb,
    uncertainties JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_evaluations_case_id ON case_evaluations(case_id);

-- 5. TABEL PERIKSA BUKTI INTERAKTIF (CASE_CHECKLISTS)
CREATE TABLE IF NOT EXISTS case_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    item_key VARCHAR(128) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    required BOOLEAN NOT NULL DEFAULT true,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_checklists_case_id ON case_checklists(case_id);

-- 6. TABEL LOG AUDIT PRIVASI & KEAMANAN (AUDIT_EVENTS)
-- Kepatuhan UU Pelindungan Data Pribadi (UU PDP No. 27/2022)
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_case_id ON audit_events(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
