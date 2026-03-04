/**
 * LCMHeatmap.tsx — Lifecycle Critical Phase Heatmap
 *
 * Menampilkan matrix risiko × fase kritis.
 * Warna sel menunjukkan level eksposur (heat-low → heat-critical).
 * Titik (●) menandai fase kritis yang dipilih responden.
 */
import { RISKS, PHASES } from '@/lib/constants'
import type { LCMMapping } from '@/lib/types'

type Props = {
    lcmMap: LCMMapping
}

export default function LCMHeatmap({ lcmMap }: Props) {
    return (
        <div className="chart-container">
            <div className="chart-title">Lifecycle Mapping: Keterjadian &amp; Fase Kritis</div>
            <div className="heatmap">
                <div className="heatmap-header"></div>
                {PHASES.map(p => <div key={p.value} className="heatmap-header">{p.label}</div>)}
                {RISKS.map(ri => {
                    const l = lcmMap[ri.code]
                    const heatClass = !l?.exposure
                        ? ''
                        : l.exposure <= 2 ? 'heat-low'
                            : l.exposure <= 3 ? 'heat-medium'
                                : l.exposure <= 4 ? 'heat-high'
                                    : 'heat-critical'
                    return (
                        <>
                            <div key={`${ri.code}-label`} className="heatmap-cell heatmap-risk">
                                <strong>{ri.code}</strong> {ri.name} ({l?.exposure || '-'})
                            </div>
                            {PHASES.map(p => (
                                <div key={`${ri.code}-${p.value}`} className={`heatmap-cell ${l?.phase === p.label ? heatClass : ''}`}>
                                    {l?.phase === p.label ? '●' : ''}
                                </div>
                            ))}
                        </>
                    )
                })}
            </div>
        </div>
    )
}
