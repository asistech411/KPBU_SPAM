-- ============================================
-- KPBU SPAM Survey Database Schema
-- PostgreSQL Script
-- ============================================

-- Buat database (jalankan sebagai superuser/postgres)
-- CREATE DATABASE kpbu_spam;

-- ============================================
-- Tabel: Admin
-- Untuk menyimpan kredensial admin
-- ============================================
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "username" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Tabel: Survey
-- Untuk menyimpan semua data survey responden
-- ============================================
CREATE TABLE IF NOT EXISTS "Survey" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Respondent info (diisi di akhir survey)
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    
    -- Screening & Meta
    "screening01" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT,
    "experience" TEXT,
    "phases" JSONB NOT NULL DEFAULT '[]',
    "dualRole" BOOLEAN NOT NULL DEFAULT false,
    
    -- Project Reference
    "projectType" TEXT,
    "projectLocation" TEXT,
    "projectPayment" TEXT,
    "projectStatus" TEXT,
    "projectPhase" TEXT,
    
    -- Survey Data (JSON)
    "fahpPairwise" JSONB NOT NULL DEFAULT '{}',
    "lcmExposure" JSONB NOT NULL DEFAULT '{}',
    "lcmPhaseCritical" JSONB NOT NULL DEFAULT '{}',
    "pat1Data" JSONB NOT NULL DEFAULT '{}',
    "pat2Data" JSONB NOT NULL DEFAULT '{}',
    
    -- Results
    "results" JSONB,
    "additionalNotes" TEXT,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false
);

-- ============================================
-- Index untuk optimasi query
-- ============================================
CREATE INDEX IF NOT EXISTS "Survey_isSubmitted_idx" ON "Survey"("isSubmitted");
CREATE INDEX IF NOT EXISTS "Survey_createdAt_idx" ON "Survey"("createdAt");
CREATE INDEX IF NOT EXISTS "Admin_username_idx" ON "Admin"("username");

-- ============================================
-- Insert default admin user
-- Password: admin123 (hashed dengan bcrypt)
-- ============================================
INSERT INTO "Admin" ("id", "username", "password", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::TEXT,
    'admin',
    '$2a$10$8K1p/7F3kZ8fE4x5V3Y2HuXw9qR8sL6tN2mP4jK7gH1iO3cW5vB9S',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("username") DO NOTHING;

-- ============================================
-- Catatan:
-- 1. Pastikan PostgreSQL versi 13+ untuk gen_random_uuid()
-- 2. Password default: admin / admin123
-- 3. Ganti password admin di production!
-- ============================================
