/**
 * AllocationMatrix.tsx — 2-Tier Risk Allocation Matrix Table
 *
 * Menampilkan tabel alokasi Tier-1 dan Tier-2 per risiko,
 * beserta Confidence level dan Fase Kritis dari LCM.
 *
 * * = N/A: Tier-2 tidak diterapkan untuk risiko Government/PDAM-lead
 */
import { RISKS } from '@/lib/constants'
import { fmtPct } from '@/lib/utils'
import { useLang } from '@/lib/lang-context'
import type { Results, LCMMapping } from '@/lib/types'

type Props = {
    fahpWeights: number[]
    allocations: Results['allocations']
    confidence: Results['confidence']
    lcmMap: LCMMapping
}

export default function AllocationMatrix({ fahpWeights, allocations, confidence, lcmMap }: Props) {
    const { t } = useLang()
    return (
        <div className="chart-container">
            <div className="chart-title">{t.allocMatrixTitle}</div>
            <div style={{ overflowX: 'auto' }}>
                <table className="allocation-matrix">
                    <thead>
                        <tr>
                            <th>{t.colRisk}</th>
                            <th>{t.colWeight}</th>
                            <th>{t.colPhase}</th>
                            <th>Tier-1</th>
                            <th>Tier-2</th>
                            <th>Conf</th>
                        </tr>
                    </thead>
                    <tbody>
                        {RISKS.map((ri, i) => {
                            const a = allocations[ri.code]
                            const c = confidence[ri.code]
                            const t1c = a.tier1.allocation === 'Publik/PDAM' ? 'alloc-public' : a.tier1.allocation === 'BU/SPV' ? 'alloc-spv' : 'alloc-shared'
                            const isGovLead = a.tier1.allocation === 'Publik/PDAM'
                            const t2c = isGovLead ? 'alloc-na' : a.tier2.allocation === 'EPC/O&M' ? 'alloc-epc' : a.tier2.allocation === 'BU/SPV-retain' ? 'alloc-spv' : 'alloc-shared'
                            const cc = c.level === 'Tinggi' ? 'confidence-high' : c.level === 'Sedang' ? 'confidence-medium' : 'confidence-low'
                            return (
                                <tr key={ri.code}>
                                    <td><strong>{ri.code}</strong> {ri.name}</td>
                                    <td>{fmtPct(fahpWeights[i])}</td>
                                    <td>{lcmMap[ri.code]?.phase || '-'}</td>
                                    <td className={t1c}>{a.tier1.allocation}</td>
                                    <td className={t2c}>{a.tier2.allocation}{isGovLead ? '*' : ''}</td>
                                    <td className={cc}>{c.level}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={6} style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'left', paddingTop: '1rem' }}>
                                {t.allocMatrixNote}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}
