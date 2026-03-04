'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    RISKS, PHASES, STEPS, PAT1_ITEMS, PAT2_ITEMS,
    ROLE_OPTIONS, EXPERIENCE_OPTIONS, PROJECT_STATUS_OPTIONS,
    FAHP_SCALE
} from '@/lib/constants'
import type { SurveyState } from '@/lib/types'
import StepConsent from '@/components/survey/StepConsent'
import StepScreening from '@/components/survey/StepScreening'
import StepProjectRef from '@/components/survey/StepProjectRef'
import StepFAHP from '@/components/survey/StepFAHP'
import StepLCM from '@/components/survey/StepLCM'
import StepPAT from '@/components/survey/StepPAT'
import StepReview from '@/components/survey/StepReview'


const initialState: SurveyState = {
    consent: false,
    role: '',
    experience: '',
    phases: [],
    dualRole: false,
    projectType: '',
    projectLocation: '',
    projectPayment: '',
    projectStatus: '',
    projectPhase: '',
    fahpPairwise: {},
    lcmExposure: {},
    lcmPhaseCritical: {},
    pat1Data: {},
    pat2Data: {},
    additionalNotes: '',
    respondentName: '',
    respondentEmail: '',
}

export default function SurveyPage() {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(0)
    const [data, setData] = useState<SurveyState>(initialState)
    const [saving, setSaving] = useState(false)
    const [activePat1Tab, setActivePat1Tab] = useState('R1')
    const [activePat2Tab, setActivePat2Tab] = useState('R1')

    // Generate FAHP pairs
    const fahpPairs: { r1: typeof RISKS[number]; r2: typeof RISKS[number] }[] = []
    for (let i = 0; i < 6; i++) {
        for (let j = i + 1; j < 6; j++) {
            fahpPairs.push({ r1: RISKS[i], r2: RISKS[j] })
        }
    }

    // Auto-save to database
    const saveToDatabase = useCallback(async (surveyData: SurveyState) => {
        setSaving(true)
        try {
            const res = await fetch('/api/survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData),
            })
            const result = await res.json()
            if (result.id && !surveyData.id) {
                setData(prev => ({ ...prev, id: result.id }))
            }
        } catch (e) {
            console.error('Save failed:', e)
        }
        setSaving(false)
    }, [])

    // Debounced save
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.consent) {
                saveToDatabase(data)
            }
        }, 1000)
        return () => clearTimeout(timer)
    }, [data, saveToDatabase])

    // Update handlers
    const updateField = <K extends keyof SurveyState>(field: K, value: SurveyState[K]) => {
        setData(prev => ({ ...prev, [field]: value }))
    }

    const updateFahp = (pair: string, value: string) => {
        setData(prev => ({
            ...prev,
            fahpPairwise: { ...prev.fahpPairwise, [pair]: value }
        }))
    }

    const updateLcmExposure = (code: string, value: number) => {
        setData(prev => ({
            ...prev,
            lcmExposure: { ...prev.lcmExposure, [code]: value }
        }))
    }

    const updateLcmPhase = (code: string, value: string | number) => {
        setData(prev => ({
            ...prev,
            lcmPhaseCritical: { ...prev.lcmPhaseCritical, [code]: value }
        }))
    }

    const updatePat1 = (riskCode: string, itemCode: string, value: number | 'TT') => {
        setData(prev => ({
            ...prev,
            pat1Data: {
                ...prev.pat1Data,
                [riskCode]: { ...prev.pat1Data[riskCode], [itemCode]: value }
            }
        }))
    }

    const updatePat2 = (riskCode: string, itemCode: string, value: number | 'TT') => {
        setData(prev => ({
            ...prev,
            pat2Data: {
                ...prev.pat2Data,
                [riskCode]: { ...prev.pat2Data[riskCode], [itemCode]: value }
            }
        }))
    }

    const togglePhase = (phase: string) => {
        setData(prev => ({
            ...prev,
            phases: prev.phases.includes(phase)
                ? prev.phases.filter(p => p !== phase)
                : [...prev.phases, phase]
        }))
    }

    // Validation checks for each page
    const isScreeningValid = data.screening01 === 'Ya' && !!data.role && !!data.experience && data.phases.length > 0
    const isProjectValid = !!data.projectType && !!data.projectPhase

    // Navigation
    const nextPage = () => setCurrentPage(p => Math.min(p + 1, 9))
    const prevPage = () => setCurrentPage(p => Math.max(p - 1, 0))
    const goToPage = (n: number) => setCurrentPage(n)

    // Submit survey
    const submitSurvey = async () => {
        if (!data.respondentName) {
            alert('Mohon isi nama Anda sebelum submit.')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, isSubmitted: true }),
            })
            const result = await res.json()
            if (result.surveyId) {
                router.push(`/results/${result.surveyId}`)
            }
        } catch (e) {
            console.error('Submit failed:', e)
            alert('Gagal submit survey. Silakan coba lagi.')
        }
        setSaving(false)
    }

    // FAHP completeness
    const fahpCount = Object.keys(data.fahpPairwise).filter(k => data.fahpPairwise[k]).length
    const isFahpValid = fahpCount === 15

    // LCM completeness
    const lcmExpCount = Object.keys(data.lcmExposure).length
    const lcmPhaseCount = Object.keys(data.lcmPhaseCritical).length
    const isLcmValid = lcmExpCount === 6 && lcmPhaseCount === 6

    // Render current page
    const renderPage = () => {
        switch (currentPage) {
            case 0: // Landing
                return (
                    <div className="card">
                        <h2 className="card-title">Selamat Datang</h2>
                        <p className="card-subtitle">Klik tombol di bawah untuk memulai survey.</p>
                        <div className="btn-group" style={{ justifyContent: 'center' }}>
                            <button className="btn btn-primary btn-lg" onClick={nextPage}>Mulai Survey →</button>
                        </div>
                    </div>
                )

            case 1: // Consent
                return (
                    <StepConsent
                        consent={data.consent}
                        onConsentChange={v => updateField('consent', v)}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                )

            case 2: // Screening
                return (
                    <StepScreening
                        data={{ screening01: data.screening01, role: data.role, experience: data.experience, phases: data.phases, dualRole: data.dualRole }}
                        isValid={isScreeningValid}
                        onUpdateField={(f, v) => updateField(f, v as SurveyState[typeof f])}
                        onTogglePhase={togglePhase}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                )

            case 3: // Project Reference
                return (
                    <StepProjectRef
                        data={{ projectType: data.projectType, projectLocation: data.projectLocation, projectPayment: data.projectPayment, projectStatus: data.projectStatus, projectPhase: data.projectPhase }}
                        isValid={isProjectValid}
                        onUpdateField={(f, v) => updateField(f, v)}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                )

            case 4: // FAHP
                return (
                    <StepFAHP
                        fahpPairwise={data.fahpPairwise}
                        fahpPairs={fahpPairs}
                        fahpCount={fahpCount}
                        isFahpValid={isFahpValid}
                        onUpdateFahp={updateFahp}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                )

            case 5: // LCM
                return (
                    <StepLCM
                        lcmExposure={data.lcmExposure}
                        lcmPhaseCritical={data.lcmPhaseCritical}
                        lcmExpCount={lcmExpCount}
                        lcmPhaseCount={lcmPhaseCount}
                        isLcmValid={isLcmValid}
                        onUpdateLcmExposure={updateLcmExposure}
                        onUpdateLcmPhase={updateLcmPhase}
                        onNext={nextPage}
                        onPrev={prevPage}
                    />
                )

            case 6: // PAT Tier-1
                return (
                    <StepPAT
                        tier={1}
                        items={PAT1_ITEMS}
                        patData={data.pat1Data}
                        activeTab={activePat1Tab}
                        onTabChange={setActivePat1Tab}
                        onUpdate={updatePat1}
                        onNext={nextPage}
                        onPrev={prevPage}
                        nextLabel="Lanjutkan ke Tier-2 →"
                    />
                )

            case 7: // PAT Tier-2
                return (
                    <StepPAT
                        tier={2}
                        items={PAT2_ITEMS}
                        patData={data.pat2Data}
                        activeTab={activePat2Tab}
                        onTabChange={setActivePat2Tab}
                        onUpdate={updatePat2}
                        onNext={nextPage}
                        onPrev={prevPage}
                        nextLabel="Review & Submit →"
                    />
                )

            case 8: // Review & Submit
                return (
                    <StepReview
                        data={data}
                        fahpCount={fahpCount}
                        lcmExpCount={lcmExpCount}
                        lcmPhaseCount={lcmPhaseCount}
                        saving={saving}
                        onUpdateField={(f, v) => updateField(f, v)}
                        onSubmit={submitSurvey}
                        onPrev={prevPage}
                    />
                )

            default:
                return null
        }
    }

    return (
        <>
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        <span>Survey Alokasi Risiko KPBU SPAM</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {saving && <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Menyimpan...</span>}
                    </div>
                </div>
            </header>

            <div className="stepper-container">
                <div className="stepper">
                    {STEPS.map((s, i) => (
                        <div key={i} className={`step ${i === currentPage ? 'active' : ''} ${i < currentPage ? 'completed' : ''}`} onClick={() => goToPage(i)}>
                            <div className="step-number">{i}</div>
                            <div className="step-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(currentPage / 9) * 100}%` }} />
                </div>
                <div className="progress-text">Halaman {currentPage} dari 9</div>
            </div>

            <main className="main">
                {renderPage()}
            </main>
        </>
    )
}
