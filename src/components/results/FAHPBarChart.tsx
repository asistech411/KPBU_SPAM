/**
 * FAHPBarChart.tsx — FAHP Weights Bar Chart
 *
 * Menampilkan bobot 6 risiko sebagai bar chart horizontal.
 * Bar panjang = weight × 100 × 3 (skala visual)
 */
import { RISKS } from '@/lib/constants'
import { fmtPct } from '@/lib/utils'
import type { FAHPResult } from '@/lib/types'

type Props = {
    fahp: FAHPResult
}

export default function FAHPBarChart({ fahp }: Props) {
    return (
        <div className="chart-container">
            <div className="chart-title">Bobot FAHP 6 Risiko</div>
            <div className="bar-chart">
                {RISKS.map((ri, i) => (
                    <div key={ri.code} className="bar-item">
                        <div className="bar-label"><strong>{ri.code}</strong> {ri.name}</div>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${fahp.weights[i] * 100 * 3}%`, background: ri.color }} />
                        </div>
                        <div className="bar-value" style={{ minWidth: '90px', textAlign: 'right' }}>
                            <strong>{fmtPct(fahp.weights[i])}</strong>
                            {fahp.geometricMeans && (
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                                    GM: {fahp.geometricMeans[i].toFixed(4)}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
