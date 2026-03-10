import { CheckCircle, AlertTriangle } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

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
    const { t } = useLang()
    return (
        <div className="kpi-grid">
            <div className={`kpi-card ${crPass ? 'success' : 'warning'}`}>
                <div className="kpi-value">{crPercent}</div>
                <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {crPass
                        ? <><CheckCircle size={14} color="#059669" /> {t.kpiLoleCR}</>
                        : <><AlertTriangle size={14} color="#d97706" /> {t.kpiCR}</>}
                </div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{topRiskCode}</div>
                <div className="kpi-label">{t.kpiTopRisk} ({topRiskWeightLabel})</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{avgExposureLabel}</div>
                <div className="kpi-label">{t.kpiAvgExposure}</div>
            </div>
            <div className={`kpi-card ${sharedCount > 3 ? 'warning' : ''}`}>
                <div className="kpi-value">{sharedCount}</div>
                <div className="kpi-label">{t.kpiSharedRisk}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{t.phases[dominantPhase] ?? dominantPhase}</div>
                <div className="kpi-label">{t.kpiDomPhase}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{surveyPAT1Label}</div>
                <div className="kpi-label">{t.kpiPatT1}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{surveyPAT2Label}</div>
                <div className="kpi-label">{t.kpiPatT2}</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value" style={{ fontSize: '0.95rem' }}>{t.allocations[topTier1Allocation] ?? topTier1Allocation}</div>
                <div className="kpi-label">{t.kpiAllocT1} ({topRiskCode})</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value" style={{ fontSize: '0.95rem' }}>{t.allocations[topTier2Allocation] ?? topTier2Allocation}</div>
                <div className="kpi-label">{t.kpiAllocT2} ({topRiskCode})</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-value">{totalLockCount}</div>
                <div className="kpi-label">{t.kpiGovLocks}</div>
            </div>
        </div>
    )
}
