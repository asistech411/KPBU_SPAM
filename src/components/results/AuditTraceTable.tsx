import { GitBranch } from '@/lib/icons'

// BL-09: AUDIT Trace — KPI lineage map (sesuai AUDIT_Trace sheet Excel)
// Static: lineage tidak berubah antar survey, hanya formula/sumber yang sama

const TRACE_ROWS = [
    {
        kpi: 'Top Risk & Bobot',
        kpiCard: 'KPIGrid: Top Risk',
        fungsi: 'calculateFAHP() → weights',
        stepInput: 'Step 4: FAHP 15 pasangan',
        formula: 'LARGE(weights, 1) → INDEX/MATCH',
    },
    {
        kpi: 'CR (Consistency Ratio)',
        kpiCard: 'KPIGrid: CR',
        fungsi: 'calculateFAHP() → cr, crPass',
        stepInput: 'Step 4: FAHP 15 pasangan',
        formula: 'CI / RI; CI = (λmax − n) / (n − 1)',
    },
    {
        kpi: 'Rata-rata Keterjadian',
        kpiCard: 'KPIGrid: Avg Exposure',
        fungsi: 'calculateLCM() → stats.avg',
        stepInput: 'Step 5: LCM-01 Skor Eksposur',
        formula: 'AVERAGE(6 skor eksposur)',
    },
    {
        kpi: 'Fase Dominan',
        kpiCard: 'KPIGrid: Fase Dominan',
        fungsi: 'calculateLCM() → stats.dominantPhase',
        stepInput: 'Step 5: LCM-02 Fase Kritis',
        formula: 'INDEX/MATCH pada MAX count fase',
    },
    {
        kpi: 'Skor PAT Tier-1',
        kpiCard: 'KPIGrid: PAT T1',
        fungsi: 'calculatePAT() → tier1.overallScore',
        stepInput: 'Step 6: PAT T1 (12 item × 6 risiko)',
        formula: 'Grand mean 6 konstruk (reverse coding: 6 − raw)',
    },
    {
        kpi: 'Skor PAT Tier-2',
        kpiCard: 'KPIGrid: PAT T2',
        fungsi: 'calculatePAT() → tier2.overallScore',
        stepInput: 'Step 7: PAT T2 (8 item × 6 risiko)',
        formula: 'Grand mean 4 konstruk',
    },
    {
        kpi: 'Alokasi Tier-1',
        kpiCard: 'KPIGrid: Alokasi T1',
        fungsi: 'determineAllocation() → tier1',
        stepInput: 'CALC_PAT: Control, Verif, Incentives, Extern',
        formula: 'IF(Extern≥4 OR Ctrl<3 → Gov; Ctrl≥4 AND ... → BU/SPV; else Shared)',
    },
    {
        kpi: 'Alokasi Tier-2',
        kpiCard: 'KPIGrid: Alokasi T2',
        fungsi: 'determineAllocation() → tier2',
        stepInput: 'CALC_PAT: Control T2, Verif T2',
        formula: 'IF(Gov-lead → N/A; Ctrl≥4 AND Verif≥4 → EPC; Ctrl≥3 AND Verif≥3 → Shared)',
    },
    {
        kpi: 'Governance Locks',
        kpiCard: 'KPIGrid: Gov Locks',
        fungsi: 'strictLockCount() in utils.ts',
        stepInput: 'Hasil alokasi Tier-1/Tier-2',
        formula: 'COUNTIF 5 tipe lock kondisi ketat (tariff, reserve, joint, 3rd-party, perf)',
    },
    {
        kpi: 'Risiko Shared',
        kpiCard: 'KPIGrid: Risiko Shared',
        fungsi: 'allocations[] dari results',
        stepInput: 'Hasil determineAllocation per risiko',
        formula: 'COUNT dimana tier1 = "Shared"',
    },
]

export default function AuditTraceTable() {
    return (
        <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitBranch size={18} /> Audit Trace — KPI Lineage
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                Peta asal-usul setiap KPI: dari input survey → fungsi kalkulasi → dashboard.
            </p>
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.78rem' }}>
                    <thead>
                        <tr>
                            <th>KPI</th>
                            <th>Fungsi (calculations.ts)</th>
                            <th>Input (Step Survey)</th>
                            <th>Formula / Logika</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TRACE_ROWS.map((row, i) => (
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
