import { GitBranch } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

// BL-09: AUDIT Trace — KPI lineage map (sesuai AUDIT_Trace sheet Excel)
// Static: lineage tidak berubah antar survey, hanya formula/sumber yang sama

const getTraceRows = (lang: string) => [
    {
        kpi: lang === 'en' ? 'Top Risk & Weight' : 'Top Risk & Bobot',
        kpiCard: 'KPIGrid: Top Risk',
        fungsi: 'calculateFAHP() → weights',
        stepInput: lang === 'en' ? 'Step 4: FAHP 15 pairs' : 'Step 4: FAHP 15 pasangan',
        formula: 'LARGE(weights, 1) → INDEX/MATCH',
    },
    {
        kpi: 'CR (Consistency Ratio)',
        kpiCard: 'KPIGrid: CR',
        fungsi: 'calculateFAHP() → cr, crPass',
        stepInput: lang === 'en' ? 'Step 4: FAHP 15 pairs' : 'Step 4: FAHP 15 pasangan',
        formula: 'CI / RI; CI = (λmax − n) / (n − 1)',
    },
    {
        kpi: lang === 'en' ? 'Average Exposure' : 'Rata-rata Keterjadian',
        kpiCard: 'KPIGrid: Avg Exposure',
        fungsi: 'calculateLCM() → stats.avg',
        stepInput: lang === 'en' ? 'Step 5: LCM-01 Exposure Score' : 'Step 5: LCM-01 Skor Eksposur',
        formula: lang === 'en' ? 'AVERAGE(6 exposure scores)' : 'AVERAGE(6 skor eksposur)',
    },
    {
        kpi: lang === 'en' ? 'Dominant Phase' : 'Fase Dominan',
        kpiCard: 'KPIGrid: Fase Dominan',
        fungsi: 'calculateLCM() → stats.dominantPhase',
        stepInput: lang === 'en' ? 'Step 5: LCM-02 Critical Phase' : 'Step 5: LCM-02 Fase Kritis',
        formula: lang === 'en' ? 'INDEX/MATCH on MAX phase count' : 'INDEX/MATCH pada MAX count fase',
    },
    {
        kpi: lang === 'en' ? 'PAT Tier-1 Score' : 'Skor PAT Tier-1',
        kpiCard: 'KPIGrid: PAT T1',
        fungsi: 'calculatePAT() → tier1.overallScore',
        stepInput: lang === 'en' ? 'Step 6: PAT T1 (12 items × 6 risks)' : 'Step 6: PAT T1 (12 item × 6 risiko)',
        formula: lang === 'en' ? 'Grand mean 6 constructs (reverse coding: 6 − raw)' : 'Grand mean 6 konstruk (reverse coding: 6 − raw)',
    },
    {
        kpi: lang === 'en' ? 'PAT Tier-2 Score' : 'Skor PAT Tier-2',
        kpiCard: 'KPIGrid: PAT T2',
        fungsi: 'calculatePAT() → tier2.overallScore',
        stepInput: lang === 'en' ? 'Step 7: PAT T2 (8 items × 6 risks)' : 'Step 7: PAT T2 (8 item × 6 risiko)',
        formula: lang === 'en' ? 'Grand mean 4 constructs' : 'Grand mean 4 konstruk',
    },
    {
        kpi: lang === 'en' ? 'Tier-1 Allocation' : 'Alokasi Tier-1',
        kpiCard: 'KPIGrid: Alokasi T1',
        fungsi: 'determineAllocation() → tier1',
        stepInput: 'CALC_PAT: Control, Verif, Incentives, Extern',
        formula: 'IF(Extern≥4 OR Ctrl<3 → Gov; Ctrl≥4 AND ... → BU/SPV; else Shared)',
    },
    {
        kpi: lang === 'en' ? 'Tier-2 Allocation' : 'Alokasi Tier-2',
        kpiCard: 'KPIGrid: Alokasi T2',
        fungsi: 'determineAllocation() → tier2',
        stepInput: 'CALC_PAT: Control T2, Verif T2',
        formula: 'IF(Gov-lead → N/A; Ctrl≥4 AND Verif≥4 → EPC; Ctrl≥3 AND Verif≥3 → Shared)',
    },
    {
        kpi: 'Governance Locks',
        kpiCard: 'KPIGrid: Gov Locks',
        fungsi: 'strictLockCount() in utils.ts',
        stepInput: lang === 'en' ? 'Tier-1/Tier-2 allocation result' : 'Hasil alokasi Tier-1/Tier-2',
        formula: lang === 'en' ? 'COUNTIF 5 strict lock types (tariff, reserve, joint, 3rd-party, perf)' : 'COUNTIF 5 tipe lock kondisi ketat (tariff, reserve, joint, 3rd-party, perf)',
    },
    {
        kpi: lang === 'en' ? 'Shared Risk' : 'Risiko Shared',
        kpiCard: 'KPIGrid: Risiko Shared',
        fungsi: 'allocations[] dari results',
        stepInput: lang === 'en' ? 'determineAllocation result per risk' : 'Hasil determineAllocation per risiko',
        formula: 'COUNT dimana tier1 = "Shared"',
    },
]

export default function AuditTraceTable() {
    const { t, lang } = useLang()
    const rows = getTraceRows(lang)
    return (
        <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitBranch size={18} /> {t.auditTraceTitle}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                {t.auditTraceSubtitle}
            </p>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                        <tr>
                            <th>{t.colKPI}</th>
                            <th>{t.colFunction}</th>
                            <th>{t.colInputStep}</th>
                            <th>{t.colFormula}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.kpi}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.74rem', color: '#2563eb' }}>{row.fungsi}</td>
                                <td style={{ color: '#6b7280' }}>{row.stepInput}</td>
                                <td style={{ fontSize: '0.74rem' }}>{row.formula}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
