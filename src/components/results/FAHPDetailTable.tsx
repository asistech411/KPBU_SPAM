/**
 * FAHPDetailTable.tsx — FAHP Calculation Step-by-Step Table
 *
 * Menampilkan CALC_FAHP sheet 3 step:
 *   Step 2: Geometric Mean per risiko
 *   Step 3: Normalized Weights + Rank
 *   Step 4: CR Check (λmax, CI, RI, CR, Status)
 *
 * Menjawab pertanyaan tim: "step ini bisa dilihat dimana di aplikasi?"
 */
import { RISKS } from '@/lib/constants'
import { fmtPct } from '@/lib/utils'
import type { FAHPResult } from '@/lib/types'
import { useLang } from '@/lib/lang-context'

type Props = {
    fahp: FAHPResult
}

export default function FAHPDetailTable({ fahp }: Props) {
    const { t } = useLang()
    // Rank: urutkan index berdasar weight descending
    const ranked = [...fahp.weights]
        .map((w, i) => ({ i, w }))
        .sort((a, b) => b.w - a.w)
    const rankMap: number[] = new Array(RISKS.length)
    ranked.forEach(({ i }, pos) => { rankMap[i] = pos + 1 })

    const weightSum = fahp.weights.reduce((a, b) => a + b, 0)

    // Step 4 CR check items (CI = (λmax−n)/(n−1), n=6, RI=1.24 from Saaty)
    const crItems = [
        { label: 'λmax', value: fahp.lambdaMax?.toFixed(4) ?? '-', note: 'rata-rata A×w/w' },
        { label: 'n', value: '6', note: 'jumlah risiko' },
        { label: 'CI', value: fahp.lambdaMax != null ? (((fahp.lambdaMax - 6) / 5)).toFixed(4) : '-', note: '(λmax−n)/(n−1)' },
        { label: 'RI (n=6)', value: '1.24', note: 'Saaty table' },
        { label: 'CR', value: fahp.CR.toFixed(4), note: 'CI / RI', highlight: true },
        { label: 'Status', value: fahp.CRPass ? `✓ ${t.consistent}` : `⚠ ${t.inconsistent}`, note: 'threshold < 0.10', pass: fahp.CRPass },
    ]

    return (
        <div className="chart-container">
            <div className="chart-title">{t.fahpDetailTitle}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                {t.fahpDetailSubtitle}
            </p>

            {/* Step 2 + 3 combined table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
                <table className="allocation-matrix">
                    <thead>
                        <tr>
                            <th>Risiko</th>
                            <th>Step 2: Geometric Mean</th>
                            <th>Step 3: Bobot (Weight)</th>
                            <th>Persentase</th>
                            <th>Rank</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RISKS.map((ri, i) => (
                            <tr key={ri.code} style={rankMap[i] === 1 ? { background: '#f0f9ff' } : {}}>
                                <td><strong style={{ color: ri.color }}>{ri.code}</strong> {ri.name}</td>
                                <td style={{ fontFamily: 'monospace' }}>
                                    {fahp.geometricMeans ? fahp.geometricMeans[i].toFixed(4) : '-'}
                                </td>
                                <td style={{ fontFamily: 'monospace' }}>
                                    {fahp.weights[i].toFixed(4)}
                                </td>
                                <td><strong>{fmtPct(fahp.weights[i])}</strong></td>
                                <td style={{ textAlign: 'center', fontWeight: 700 }}>{rankMap[i]}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 600 }}>
                            <td>CHECK SUM</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                {fahp.geometricMeans
                                    ? `Σ = ${fahp.geometricMeans.reduce((a, b) => a + b, 0).toFixed(4)}`
                                    : '-'}
                            </td>
                            <td style={{ fontFamily: 'monospace' }}>
                                {weightSum.toFixed(4)}
                            </td>
                            <td style={{ color: weightSum > 0.999 ? 'var(--success)' : 'var(--danger)' }}>
                                {weightSum > 0.999 ? '✓ Must = 1.0000' : '⚠ Error'}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Step 4: CR Check */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {crItems.map(item => (
                    <div key={item.label} style={{
                        flex: 1, minWidth: '100px', padding: '0.75rem',
                        background: 'pass' in item ? (item.pass ? '#e8f5e9' : '#ffebee') : 'var(--bg)',
                        borderRadius: '8px', textAlign: 'center',
                        border: item.highlight ? '2px solid var(--primary)' : 'none'
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'monospace' }}>{item.value}</div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '2px' }}>{item.label}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>{item.note}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
