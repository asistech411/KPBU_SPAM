import { CheckCircle, AlertTriangle } from '@/lib/icons'

type KPIGridProps = {
    crPercent: string
    crPass: boolean
    topRiskCode: string
    topRiskWeightLabel: string
    avgExposureLabel: string
    sharedCount: number
    dominantPhase: string
    surveyPAT1Label: string
    surveyPAT2Label: string
    topTier1Allocation: string
    topTier2Allocation: string
    totalLockCount: number
}

export default function KPIGrid({
    crPercent,
    crPass,
    topRiskCode,
    topRiskWeightLabel,
    avgExposureLabel,
    sharedCount,
    dominantPhase,
    surveyPAT1Label,
    surveyPAT2Label,
    topTier1Allocation,
    topTier2Allocation,
    totalLockCount,
}: KPIGridProps) {
    return (
        <div className="kpi-grid">
            <div className={`kpi-card ${crPass ? 'success' : 'warning'}`}>
                <div className="kpi-value">{crPercent}</div>
                <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {crPass
                        ? <><CheckCircle size={14} color="#059669" /> Lolos CR</>
                        : <><AlertTriangle size={14} color="#d97706" /> Perlu Review</>}
                </div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{topRiskCode}</div>
                <div className="kpi-label">Top Risk ({topRiskWeightLabel})</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{avgExposureLabel}</div>
                <div className="kpi-label">Rata-rata Keterjadian</div>
            </div>
            <div className={`kpi-card ${sharedCount > 3 ? 'warning' : ''}`}>
                <div className="kpi-value">{sharedCount}</div>
                <div className="kpi-label">Risiko Shared</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{dominantPhase}</div>
                <div className="kpi-label">Fase Dominan</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{surveyPAT1Label}</div>
                <div className="kpi-label">Skor PAT Tier-1</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{surveyPAT2Label}</div>
                <div className="kpi-label">Skor PAT Tier-2</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value" style={{ fontSize: '0.95rem' }}>{topTier1Allocation}</div>
                <div className="kpi-label">Alokasi T1 ({topRiskCode})</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value" style={{ fontSize: '0.95rem' }}>{topTier2Allocation}</div>
                <div className="kpi-label">Alokasi T2 ({topRiskCode})</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{totalLockCount}</div>
                <div className="kpi-label">Governance Locks</div>
            </div>
        </div>
    )
}
