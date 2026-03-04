/**
 * types.ts — Shared TypeScript types for KPBU SPAM
 *
 * Diextract dari results/[id]/page.tsx untuk reusability.
 * Import LCMStats dari calculations.ts (sudah di-export dari sana).
 */
import type { LCMStats } from './calculations'

// Re-export agar consumer hanya perlu import dari satu tempat
export type { LCMStats }

// LCM mapping: riskCode → exposure + phase label
export interface LCMMapping {
    [riskCode: string]: { exposure: number | null; phase: string | null }
}

// PAT Tier-1 construct means per risiko
// Externality = adjusted (6−raw), sesuai CALC_PAT Excel baris 9 → nilai 2.50
// ExternalityRaw = raw sebelum reverse coding, untuk referensi saja
export interface Tier1 {
    Control: number | null
    Info: number | null
    Verifiability: number | null
    Externality: number | null    // adjusted (6−raw), sesuai CALC_PAT Excel
    ExternalityRaw: number | null // raw sebelum reverse
    Capacity: number | null
    Incentives: number | null
    ttCount: number
    totalItems: number
    overallScore: number | null   // grand mean 6 konstruk (target: 3.50)
}

// PAT Tier-2 construct means per risiko (Tier-2 uses direct scores, no reverse coding)
export interface Tier2 {
    Control: number | null
    Verifiability: number | null
    Incentives: number | null
    Capacity: number | null
    ttCount: number
    totalItems: number
    overallScore: number | null   // grand mean 4 konstruk (target: 3.75)
}

// Shape of the FAHP result stored in DB/returned by API
export interface FAHPResult {
    weights: number[]
    geometricMeans?: number[]
    CR: number
    CRPass: boolean
    lambdaMax?: number
}

// Full results object returned by /api/calculate and stored in DB
// lcm field supports both new { mapping, stats } format and old flat format (backward compat)
export interface Results {
    fahp: FAHPResult
    // Supports both new { mapping, stats } and old flat { R1: {...}, ... } format
    lcm: { mapping: LCMMapping; stats: LCMStats } | LCMMapping
    pat: Record<string, { tier1: Tier1; tier2: Tier2 }>
    allocations: Record<string, {
        tier1: { allocation: string; reason: string }
        tier2: { allocation: string; reason: string; mitigationControls?: string[] }
    }>
    governanceLocks: Record<string, string[]>
    confidence: Record<string, { level: string; reason: string }>
}

// Survey record from DB
export interface Survey {
    id: string
    respondentName: string
    respondentEmail?: string
    results: Results
    createdAt: string
}

// Audit check item (BL-07: 13 integrity tests)
export interface AuditCheck {
    name: string
    value: string
    pass: boolean
}
