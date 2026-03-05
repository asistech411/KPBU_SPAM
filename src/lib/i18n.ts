/**
 * i18n.ts — Bilingual dictionary: Indonesia (id) | English (en)
 *
 * BL-10: Bilingual toggle support for survey + results pages.
 * Usage: const { t } = useLang(); then use t.keyName
 *
 * Rules:
 * - Risk codes (DCC, Financial, dll) stay in EN — they are research codes
 * - Admin pages NOT included — admin-only, ID only
 * - calculations.ts / constants.ts / api/ — NOT touched
 */

export type Lang = 'id' | 'en'

export const T = {
    id: {
        // === COMMON ===
        back: 'Kembali',
        next: 'Lanjutkan',
        submit: 'Submit & Lihat Hasil',
        saving: 'Menyimpan...',

        // === SURVEY HEADER ===
        surveyTitle: 'Survey Alokasi Risiko KPBU SPAM',
        surveySubtitle: 'Selamat datang!',
        welcomeTitle: 'Selamat Datang',
        welcomeBody: 'Klik tombol di bawah untuk memulai survey.',
        startSurvey: 'Mulai Survey',

        // === STEP LABELS (stepper) ===
        stepLabelConsent: 'Persetujuan',
        stepLabelScreening: 'Screening',
        stepLabelProject: 'Proyek',
        stepLabelFAHP: 'FAHP',
        stepLabelLCM: 'LCM',
        stepLabelPAT1: 'PAT T1',
        stepLabelPAT2: 'PAT T2',
        stepLabelReview: 'Review',

        // === STEP CONSENT ===
        consentTitle: 'Lembar Informasi & Persetujuan',
        consentSubtitle: 'Silakan baca informasi berikut sebelum melanjutkan.',
        consentPurpose: 'Tujuan',
        consentPurposeText: 'Mengumpulkan persepsi tentang 6 risiko utama, fase kritis, dan indikator PAT untuk rekomendasi alokasi risiko.',
        consentConfidential: 'Kerahasiaan',
        consentConfidentialText: 'Jawaban rahasia, hasil disajikan agregat tanpa menyebut nama.',
        consentVoluntary: 'Sukarela',
        consentVoluntaryText: 'Partisipasi sukarela, Anda dapat berhenti kapan saja.',
        consentCheck: 'Saya telah membaca informasi di atas dan bersedia menjadi responden.',

        // === STEP SCREENING ===
        screeningTitle: 'Screening Responden',
        screeningSubtitle: 'Informasi latar belakang dan pengalaman Anda.',
        scr01: 'SCR-01. Apakah Anda pernah terlibat dalam proyek KPBU SPAM atau PPP sejenis?',
        scr01No: 'Maaf, survey ini ditujukan untuk responden yang pernah terlibat dalam proyek KPBU SPAM.',
        scr02: 'SCR-02. Peran utama Anda:',
        scr03: 'SCR-03. Lama pengalaman:',
        scr04: 'SCR-04. Fase KPBU yang pernah ditangani (boleh >1):',
        scr05: 'SCR-05. Apakah Anda memiliki dua peran/afiliasi yang berpotensi konflik?',
        yes: 'Ya',
        no: 'Tidak',

        // === STEP PROJECT REF ===
        projectTitle: 'Proyek Referensi Utama',
        projectSubtitle: 'Pilih 1 proyek yang paling Anda pahami. Jawab semua pertanyaan dengan konteks proyek ini.',
        projectAnon: 'Tidak perlu menyebutkan nama proyek/lembaga untuk menjaga kerahasiaan.',
        pr01: 'PR-01. Tipe proyek KPBU SPAM:',
        pr02: 'PR-02. Lokasi proyek:',
        pr03: 'PR-03. Skema pembayaran:',
        pr04: 'PR-04. Status proyek:',
        pr05: 'PR-05. Fase terakhir yang Anda tangani:',

        // === STEP FAHP ===
        fahpTitle: 'FAHP: Perbandingan Berpasangan',
        fahpSubtitle: 'Bandingkan tingkat kepentingan relatif antar risiko.',
        fahpScaleHint: 'Skala: SI=Sama | SLI=Sedikit Lebih | LI=Lebih | SVI=Sangat Lebih | EI=Ekstrem Lebih Penting',
        fahpFilled: 'Terisi',
        fahpWarningTitle: 'Perlu diisi lengkap!',
        fahpWarningBody: 'Semua 15 pasangan harus diisi agar perhitungan bobot FAHP valid.',
        riskDefTitle: 'Definisi 6 Risiko',
        riskDesc: {
            R1: 'Risiko desain, konstruksi, uji operasi (keterlambatan, cost overrun).',
            R2: 'Ketidakpastian pembiayaan, inflasi/kurs, struktur finansial.',
            R3: 'Layanan terhambat (pemeliharaan, cacat, teknologi usang).',
            R4: 'Pendapatan tidak memenuhi proyeksi (permintaan/tarif).',
            R5: 'Ketidakselarasan antar pihak (metode, standar layanan).',
            R6: 'Akibat kebijakan pemerintah (regulasi, perizinan, pajak).',
        },
        selectPlaceholder: '-- Pilih --',
        fahpSelectOption: (rCode: string, label: string, code: string) => `${rCode} ${label.replace(' Penting', '')} (${code})`,

        // === STEP LCM ===
        lcmTitle: 'Lifecycle Mapping',
        lcmSubtitle: 'Penilaian keterjadian risiko dan fase paling kritis.',
        lcm01Title: 'LCM-01. Skor Keterjadian (1–5)',
        lcm02Title: 'LCM-02. Fase Paling Kritis',
        lcmExposureHint: '(1=Sangat Jarang s/d 5=Sangat Sering)',
        lcmPhaseHint: 'Fase paling kritis:',
        lcmWarning: 'Isi semua skor eksposur (1–5) dan fase kritis untuk setiap risiko.',

        // === STEP PAT ===
        patTitle: (tier: 1 | 2) => tier === 1
            ? 'PAT Tier-1: Publik/PDAM ↔ BU/SPV'
            : 'PAT Tier-2: BU/SPV ↔ EPC/O&M',
        patSubtitle: (tier: 1 | 2) => tier === 1
            ? 'Penilaian kapasitas alokasi risiko antara Pemerintah/PDAM dan BU/SPV.'
            : 'Penilaian kapasitas alokasi risiko antara BU/SPV dan EPC/O&M.',
        patTabHint: 'Pilih risiko:',
        patScaleHint: '(1=Sangat Tidak Setuju, 5=Sangat Setuju, TT=Tidak Tahu)',
        patWarning: (tier: 1 | 2) => `Isi semua item PAT Tier-${tier} (atau pilih TT) untuk semua risiko.`,

        // === STEP REVIEW ===
        reviewTitle: 'Review & Submit',
        reviewSubtitle: 'Periksa kelengkapan sebelum mengirimkan jawaban.',
        reviewChecklist: 'Checklist Kelengkapan',
        reviewNameLabel: 'Nama Responden (opsional):',
        reviewEmailLabel: 'Email (opsional):',
        reviewNotesLabel: 'Catatan tambahan (opsional):',
        reviewNamePlaceholder: 'Nama Anda',
        reviewEmailPlaceholder: 'email@example.com',
        reviewNotesPlaceholder: 'Tuliskan catatan jika ada...',
        reviewReady: 'Semua terisi! Siap submit.',
        reviewIncomplete: 'Beberapa item belum terisi.',

        // === RESULTS PAGE ===
        resultsTitle: 'Hasil Analisis & Rekomendasi',
        resultsSubtitle: 'Berdasarkan jawaban Anda, berikut hasil analisis alokasi risiko KPBU SPAM.',
        kpiCR: 'CR',
        kpiTopRisk: 'Top Risk',
        kpiAvgExposure: 'Rata-rata Keterjadian',
        kpiDomPhase: 'Fase Dominan',
        kpiSharedRisk: 'Risiko Shared',
        kpiAllocT1: 'Alokasi T1',
        kpiAllocT2: 'Alokasi T2',
        kpiPatT1: 'Skor PAT Tier-1',
        kpiPatT2: 'Skor PAT Tier-2',
        kpiGovLocks: 'Governance Locks',
        kpiLoleCR: 'Lolos CR',
        outputSummaryTitle: 'Ringkasan Analisis',
        fahpDetailTitle: 'Detail Perhitungan FAHP',
        fahpDetailSubtitle: 'Sesuai CALC_FAHP sheet Excel — Step 2: Geometric Mean → Step 3: Bobot → Step 4: CR Check',
        fahpBarTitle: 'Bobot FAHP 6 Risiko',
        lcmHeatmapTitle: 'Lifecycle Mapping: Keterjadian & Fase Kritis',
        allocMatrixTitle: 'Matriks Alokasi Risiko 2-Tier',
        allocMatrixNote: '* N/A = Tier-2 tidak diterapkan. Untuk risiko dengan Government/PDAM-lead, tidak ada transfer risiko ke EPC/O&M.',
        riskDetailTitle: 'Detail per Risiko',
        auditTitle: 'Audit Kelengkapan & Konsistensi',
        auditTraceTitle: 'Audit Trace — KPI Lineage',
        auditTraceSubtitle: 'Peta asal-usul setiap KPI: dari input survey → fungsi kalkulasi → dashboard.',
        pass: 'LULUS',
        fail: 'GAGAL',
        consistent: 'KONSISTEN',
        inconsistent: 'TIDAK KONSISTEN',
        downloadJSON: 'Unduh JSON',
        downloadCSV: 'Unduh CSV',
        print: 'Cetak',
        backToDashboard: 'Kembali ke Admin Dashboard',

        // === PHASES ===
        phases: {
            '1': 'Perencanaan',
            '2': 'Penyiapan',
            '3': 'Transaksi',
            '4': 'Implementasi',
            Perencanaan: 'Perencanaan',
            Penyiapan: 'Penyiapan',
            Transaksi: 'Transaksi',
            Implementasi: 'Implementasi',
        } as Record<string, string>,

        // === RESULTS COMPONENTS ===
        lcmStatsTitle: 'LCM — Statistik Keterjadian Risiko',
        lcmStatAvg: 'Rata-rata',
        lcmStatMax: 'Maksimum',
        lcmStatMin: 'Minimum',
        lcmStatHigh: 'Risiko Tinggi (≥4)',
        lcmStatLow: 'Risiko Rendah (≤2)',
        lcmPhaseDist: 'Distribusi Fase Kritis',
        lcmPhaseDominant: 'Dominan',
        patSummaryTitle: 'PAT — Skor Per Risiko',
        colRisk: 'Risiko',
        colWeight: 'Bobot',
        colPhase: 'Fase',
        colAllocT1: 'Alokasi T1',
        colAllocT2: 'Alokasi T2',
        surveyAvgLabel: 'Rata-rata Survey',
        basedOnTopRisk: 'berdasarkan risiko tertinggi',
        riskWeightLabel: 'Bobot',
        riskExposureLabel: 'Keterjadian',
        riskPhaseLabel: 'Fase',
        riskRetained: 'RISIKO DITAHAN',
        mitigationTitle: 'Mitigation Controls untuk EPC/O&M:',
        govLocksPublic: 'Governance Locks (Risiko Ditahan Publik):',
        govLocksLabel: 'Governance Locks:',
        confidenceLabel: 'Confidence',
        colKPI: 'KPI',
        colFunction: 'Fungsi (calculations.ts)',
        colInputStep: 'Input (Step Survey)',
        colFormula: 'Formula / Logika',

        // === HOME PAGE ===
        homeTitle: 'Survey Alokasi Risiko Proyek KPBU SPAM',
        homeSubtitle: 'Selamat datang! Survey ini mengumpulkan persepsi Anda tentang kepentingan risiko, fase kritis, dan indikator untuk rekomendasi alokasi risiko yang adil pada proyek KPBU SPAM.',
        homeSurveyStructure: 'Struktur Survey',
        homeStartBtn: 'Mulai Survey Sekarang',
    },

    en: {
        // === COMMON ===
        back: 'Back',
        next: 'Continue',
        submit: 'Submit & View Results',
        saving: 'Saving...',

        // === SURVEY HEADER ===
        surveyTitle: 'KPBU SPAM Risk Allocation Survey',
        surveySubtitle: 'Welcome!',
        welcomeTitle: 'Welcome',
        welcomeBody: 'Click the button below to start the survey.',
        startSurvey: 'Start Survey',

        // === STEP LABELS (stepper) ===
        stepLabelConsent: 'Consent',
        stepLabelScreening: 'Screening',
        stepLabelProject: 'Project',
        stepLabelFAHP: 'FAHP',
        stepLabelLCM: 'LCM',
        stepLabelPAT1: 'PAT T1',
        stepLabelPAT2: 'PAT T2',
        stepLabelReview: 'Review',

        // === STEP CONSENT ===
        consentTitle: 'Information Sheet & Consent',
        consentSubtitle: 'Please read the following information before proceeding.',
        consentPurpose: 'Purpose',
        consentPurposeText: 'Collecting perceptions about 6 main risks, critical phases, and PAT indicators for risk allocation recommendations.',
        consentConfidential: 'Confidentiality',
        consentConfidentialText: 'Answers are confidential; results are presented in aggregate without naming respondents.',
        consentVoluntary: 'Voluntary',
        consentVoluntaryText: 'Participation is voluntary; you may stop at any time.',
        consentCheck: 'I have read the above information and agree to participate as a respondent.',

        // === STEP SCREENING ===
        screeningTitle: 'Respondent Screening',
        screeningSubtitle: 'Your background and experience.',
        scr01: 'SCR-01. Have you ever been involved in a KPBU SPAM or similar PPP project?',
        scr01No: 'Sorry, this survey is intended for respondents who have been involved in KPBU SPAM projects.',
        scr02: 'SCR-02. Your primary role:',
        scr03: 'SCR-03. Years of experience:',
        scr04: 'SCR-04. KPBU phases you have handled (select all that apply):',
        scr05: 'SCR-05. Do you have dual roles/affiliations with potential conflicts of interest?',
        yes: 'Yes',
        no: 'No',

        // === STEP PROJECT REF ===
        projectTitle: 'Primary Reference Project',
        projectSubtitle: 'Select 1 project you know best. Answer all questions in the context of this project.',
        projectAnon: 'You do not need to name the project or institution to preserve confidentiality.',
        pr01: 'PR-01. KPBU SPAM project type:',
        pr02: 'PR-02. Project location:',
        pr03: 'PR-03. Payment scheme:',
        pr04: 'PR-04. Project status:',
        pr05: 'PR-05. Last phase you handled:',

        // === STEP FAHP ===
        fahpTitle: 'FAHP: Pairwise Comparison',
        fahpSubtitle: 'Compare the relative importance of risks.',
        fahpScaleHint: 'Scale: EI=Equal | SLM=Slightly More | MI=More Important | SMI=Strongly More | EXM=Extremely More Important',
        fahpFilled: 'Filled',
        fahpWarningTitle: 'All pairs required!',
        fahpWarningBody: 'All 15 pairs must be filled for valid FAHP weight calculation.',
        riskDefTitle: 'Definition of 6 Risks',
        riskDesc: {
            R1: 'Design, construction, commissioning risk (delays, cost overrun).',
            R2: 'Financing uncertainty, inflation/exchange rate, financial structure.',
            R3: 'Service disruption (maintenance, defects, obsolete technology).',
            R4: 'Revenue below projection (demand/tariff risk).',
            R5: 'Misalignment between parties (methods, service standards).',
            R6: 'Due to government policy (regulations, permits, taxes).',
        },
        selectPlaceholder: '-- Select --',
        fahpSelectOption: (rCode: string, label: string, code: string) => `${rCode} ${label.replace(' Important', '')} (${code})`,

        // === STEP LCM ===
        lcmTitle: 'Lifecycle Mapping',
        lcmSubtitle: 'Assessment of risk occurrence and most critical phase.',
        lcm01Title: 'LCM-01. Occurrence Score (1–5)',
        lcm02Title: 'LCM-02. Most Critical Phase',
        lcmExposureHint: '(1=Very Rare to 5=Very Often)',
        lcmPhaseHint: 'Most critical phase:',
        lcmWarning: 'Fill all exposure scores (1–5) and critical phases for each risk.',

        // === STEP PAT ===
        patTitle: (tier: 1 | 2) => tier === 1
            ? 'PAT Tier-1: Government/PDAM ↔ BU/SPV'
            : 'PAT Tier-2: BU/SPV ↔ EPC/O&M',
        patSubtitle: (tier: 1 | 2) => tier === 1
            ? 'Assessment of risk allocation capacity between Government/PDAM and BU/SPV.'
            : 'Assessment of risk allocation capacity between BU/SPV and EPC/O&M.',
        patTabHint: 'Select risk:',
        patScaleHint: '(1=Strongly Disagree, 5=Strongly Agree, DK=Don\'t Know)',
        patWarning: (tier: 1 | 2) => `Fill all PAT Tier-${tier} items (or select DK) for all risks.`,

        // === STEP REVIEW ===
        reviewTitle: 'Review & Submit',
        reviewSubtitle: 'Check completeness before submitting your answers.',
        reviewChecklist: 'Completeness Checklist',
        reviewNameLabel: 'Respondent Name (optional):',
        reviewEmailLabel: 'Email (optional):',
        reviewNotesLabel: 'Additional notes (optional):',
        reviewNamePlaceholder: 'Your Name',
        reviewEmailPlaceholder: 'email@example.com',
        reviewNotesPlaceholder: 'Write any notes here...',
        reviewReady: 'All complete! Ready to submit.',
        reviewIncomplete: 'Some items are incomplete.',

        // === RESULTS PAGE ===
        resultsTitle: 'Analysis Results & Recommendations',
        resultsSubtitle: 'Based on your responses, here are the KPBU SPAM risk allocation analysis results.',
        kpiCR: 'CR',
        kpiTopRisk: 'Top Risk',
        kpiAvgExposure: 'Avg. Exposure',
        kpiDomPhase: 'Dominant Phase',
        kpiSharedRisk: 'Shared Risks',
        kpiAllocT1: 'Alloc T1',
        kpiAllocT2: 'Alloc T2',
        kpiPatT1: 'PAT Tier-1 Score',
        kpiPatT2: 'PAT Tier-2 Score',
        kpiGovLocks: 'Governance Locks',
        kpiLoleCR: 'CR Pass',
        outputSummaryTitle: 'Analysis Summary',
        fahpDetailTitle: 'FAHP Calculation Detail',
        fahpDetailSubtitle: 'Per CALC_FAHP Excel sheet — Step 2: Geometric Mean → Step 3: Weight → Step 4: CR Check',
        fahpBarTitle: 'FAHP Weights: 6 Risks',
        lcmHeatmapTitle: 'Lifecycle Mapping: Occurrence & Critical Phase',
        allocMatrixTitle: 'Risk Allocation Matrix 2-Tier',
        allocMatrixNote: '* N/A = Tier-2 not applicable. For Government/PDAM-lead risks, no risk transfer to EPC/O&M.',
        riskDetailTitle: 'Risk Detail',
        auditTitle: 'Completeness & Consistency Audit',
        auditTraceTitle: 'Audit Trace — KPI Lineage',
        auditTraceSubtitle: 'Traceability map of each KPI: from survey input → calculation function → dashboard.',
        pass: 'PASS',
        fail: 'FAIL',
        consistent: 'CONSISTENT',
        inconsistent: 'INCONSISTENT',
        downloadJSON: 'Download JSON',
        downloadCSV: 'Download CSV',
        print: 'Print',
        backToDashboard: 'Back to Admin Dashboard',

        // === PHASES ===
        phases: {
            '1': 'Planning',
            '2': 'Preparation',
            '3': 'Transaction',
            '4': 'Implementation',
            Perencanaan: 'Planning',
            Penyiapan: 'Preparation',
            Transaksi: 'Transaction',
            Implementasi: 'Implementation',
        } as Record<string, string>,

        // === RESULTS COMPONENTS ===
        lcmStatsTitle: 'LCM — Exposure Statistics',
        lcmStatAvg: 'Average',
        lcmStatMax: 'Maximum',
        lcmStatMin: 'Minimum',
        lcmStatHigh: 'High Risk (≥4)',
        lcmStatLow: 'Low Risk (≤2)',
        lcmPhaseDist: 'Critical Phase Distribution',
        lcmPhaseDominant: 'Dominant',
        patSummaryTitle: 'PAT — Score per Risk',
        colRisk: 'Risk',
        colWeight: 'Weight',
        colPhase: 'Phase',
        colAllocT1: 'Alloc T1',
        colAllocT2: 'Alloc T2',
        surveyAvgLabel: 'Survey Average',
        basedOnTopRisk: 'based on top risk',
        riskWeightLabel: 'Weight',
        riskExposureLabel: 'Occurrence',
        riskPhaseLabel: 'Phase',
        riskRetained: 'RISK RETAINED',
        mitigationTitle: 'Mitigation Controls for EPC/O&M:',
        govLocksPublic: 'Governance Locks (Public-Retained Risk):',
        govLocksLabel: 'Governance Locks:',
        confidenceLabel: 'Confidence',
        colKPI: 'KPI',
        colFunction: 'Function (calculations.ts)',
        colInputStep: 'Input (Survey Step)',
        colFormula: 'Formula / Logic',

        // === HOME PAGE ===
        homeTitle: 'KPBU SPAM Risk Allocation Survey',
        homeSubtitle: 'Welcome! This survey collects your perceptions on risk importance, critical phases, and indicators for fair risk allocation recommendations in KPBU SPAM projects.',
        homeSurveyStructure: 'Survey Structure',
        homeStartBtn: 'Start Survey Now',
    },
} as const

export type TDict = typeof T.id
