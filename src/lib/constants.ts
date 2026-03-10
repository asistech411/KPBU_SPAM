// Risk definitions
export const RISKS = [
    { code: 'R1', name: 'DCC', fullName: 'Design–Construction–Commissioning', color: '#3498db' },
    { code: 'R2', name: 'Financial', fullName: 'Financial', color: '#2ecc71' },
    { code: 'R3', name: 'Operations', fullName: 'Operations', color: '#9b59b6' },
    { code: 'R4', name: 'Revenue', fullName: 'Revenue', color: '#e74c3c' },
    { code: 'R5', name: 'Interface', fullName: 'Interface', color: '#f39c12' },
    { code: 'R6', name: 'Political', fullName: 'Political', color: '#1abc9c' },
] as const

export type RiskCode = typeof RISKS[number]['code']

export const PHASES = [
    { value: 1, label: 'Perencanaan', labelEN: 'Planning' },
    { value: 2, label: 'Penyiapan', labelEN: 'Preparation' },
    { value: 3, label: 'Transaksi', labelEN: 'Transaction' },
    { value: 4, label: 'Implementasi', labelEN: 'Implementation' },
] as const

export const PHASE_MAP: Record<string | number, typeof PHASES[number]> = {}
PHASES.forEach(p => {
    PHASE_MAP[p.value] = p
    PHASE_MAP[p.label] = p
})

// FAHP Scale with Triangular Fuzzy Numbers and Crisp Values
export const FAHP_SCALE = [
    { code: 'SI', labelID: 'Sama Penting', labelEN: 'Equal Importance', tfn: [1, 1, 1], crisp: 1 },
    { code: 'SLI', labelID: 'Sedikit Lebih Penting', labelEN: 'Slightly More Important', tfn: [1, 2, 3], crisp: 2 },
    { code: 'LI', labelID: 'Lebih Penting', labelEN: 'More Important', tfn: [2, 3, 4], crisp: 3 },
    { code: 'SVI', labelID: 'Sangat Lebih Penting', labelEN: 'Strongly More Important', tfn: [3, 4, 5], crisp: 4 },
    { code: 'EI', labelID: 'Ekstrem Lebih Penting', labelEN: 'Extremely More Important', tfn: [4, 5, 6], crisp: 5 },
    { code: '1/SLI', labelID: 'Kebalikan SLI', labelEN: 'Reciprocal SLI', tfn: [1 / 3, 1 / 2, 1], crisp: 0.6111 },
    { code: '1/LI', labelID: 'Kebalikan LI', labelEN: 'Reciprocal LI', tfn: [1 / 4, 1 / 3, 1 / 2], crisp: 0.3611 },
    { code: '1/SVI', labelID: 'Kebalikan SVI', labelEN: 'Reciprocal SVI', tfn: [1 / 5, 1 / 4, 1 / 3], crisp: 0.2611 },
    { code: '1/EI', labelID: 'Kebalikan EI', labelEN: 'Reciprocal EI', tfn: [1 / 6, 1 / 5, 1 / 4], crisp: 0.2056 },
]

// For backward compatibility and easier lookup
export const FAHP_MAP: Record<string, typeof FAHP_SCALE[number]> = {}
FAHP_SCALE.forEach(item => {
    FAHP_MAP[item.code] = item
    FAHP_MAP[item.crisp.toString()] = item
})

export const RI_TABLE: Record<number, number> = {
    1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24
}

// Survey steps
export const STEPS = [
    { label: 'Mulai', path: 0 },
    { label: 'Persetujuan', path: 1 },
    { label: 'Screening', path: 2 },
    { label: 'Proyek', path: 3 },
    { label: 'FAHP', path: 4 },
    { label: 'LCM', path: 5 },
    { label: 'PAT T1', path: 6 },
    { label: 'PAT T2', path: 7 },
    { label: 'Review', path: 8 },
    { label: 'Hasil', path: 9 },
] as const

// PAT Tier-1 Items
export const PAT1_ITEMS = [
    { code: 'PAT1-01', text: 'Keputusan teknis BU/SPV berpengaruh langsung mengurangi risiko.', textEN: 'Technical decisions of SPV directly reduce risk.', construct: 'Control' },
    { code: 'PAT1-02', text: 'Kewenangan BU/SPV memadai untuk mengelola risiko.', textEN: 'SPV has adequate authority to manage the risk.', construct: 'Control' },
    { code: 'PAT1-03', text: 'Informasi lebih lengkap di BU/SPV dibanding publik.', textEN: 'SPV holds more complete information than the public sector.', construct: 'Info' },
    { code: 'PAT1-04', text: 'Pengalaman lapangan BU/SPV lebih mampu merespons risiko.', textEN: 'SPV field experience makes it better at responding to the risk.', construct: 'Info' },
    { code: 'PAT1-05', text: 'Kinerja dapat diukur dengan indikator yang jelas.', textEN: 'Performance can be measured by clear indicators.', construct: 'Verifiability' },
    { code: 'PAT1-06', text: 'Biaya pemantauan kinerja masih wajar.', textEN: 'The cost of monitoring performance is reasonable.', construct: 'Verifiability' },
    { code: 'PAT1-07', text: 'Risiko terutama ditentukan faktor eksternal.', textEN: 'Risk is primarily determined by external factors.', construct: 'Externality', reverse: true },
    { code: 'PAT1-08', text: 'Perubahan risiko lebih dipengaruhi kebijakan/regulasi.', textEN: 'Changes in risk are more influenced by policies/regulations.', construct: 'Externality', reverse: true },
    { code: 'PAT1-09', text: 'BU/SPV punya kemampuan finansial memadai.', textEN: 'SPV has adequate financial capacity.', construct: 'Capacity' },
    { code: 'PAT1-10', text: 'BU/SPV punya kapasitas teknis memadai.', textEN: 'SPV has adequate technical capacity.', construct: 'Capacity' },
    { code: 'PAT1-11', text: 'Kontrak mengatur KPI/SLA yang jelas.', textEN: 'The contract stipulates clear KPIs/SLAs.', construct: 'Incentives' },
    { code: 'PAT1-12', text: 'Mekanisme pembayaran/penalti cukup jelas.', textEN: 'The payment/penalty mechanism is sufficiently clear.', construct: 'Incentives' },
] as const

// PAT Tier-2 Items
export const PAT2_ITEMS = [
    { code: 'PAT2-01', text: 'EPC/O&M memiliki pengaruh langsung terhadap faktor teknis.', textEN: 'EPC/O&M has direct influence over technical factors.', construct: 'Control' },
    { code: 'PAT2-02', text: 'Ruang lingkup kerja EPC/O&M memberi kendali cukup.', textEN: 'The scope of work provides EPC/O&M with adequate control.', construct: 'Control' },
    { code: 'PAT2-03', text: 'Kinerja EPC/O&M dapat diukur objektif.', textEN: 'EPC/O&M performance can be measured objectively.', construct: 'Verifiability' },
    { code: 'PAT2-04', text: 'Hubungan kualitas kerja dan outcome dapat ditelusuri.', textEN: 'The relationship between work quality and outcomes is traceable.', construct: 'Verifiability' },
    { code: 'PAT2-05', text: 'Kontrak memungkinkan pengalihan risiko via harga/LD.', textEN: 'The contract allows risk transfer via pricing/Liquidated Damages.', construct: 'Incentives' },
    { code: 'PAT2-06', text: 'Ada mekanisme asuransi/perlindungan kontraktual.', textEN: 'There are insurance mechanisms/contractual protections.', construct: 'Incentives' },
    { code: 'PAT2-07', text: 'EPC/O&M punya kapasitas finansial memadai.', textEN: 'EPC/O&M has adequate financial capacity.', construct: 'Capacity' },
    { code: 'PAT2-08', text: 'EPC/O&M punya rekam jejak teknis relevan.', textEN: 'EPC/O&M has a relevant technical track record.', construct: 'Capacity' },
] as const

// Role options
export const ROLE_OPTIONS = [
    { value: 'Pemerintah/PJPK/Unit KPBU', label: 'Pemerintah/PJPK/Unit KPBU' },
    { value: 'PDAM/Perumda', label: 'PDAM/Perumda' },
    { value: 'BU Pelaksana/SPV', label: 'BU Pelaksana/SPV' },
    { value: 'EPC/Kontraktor', label: 'EPC/Kontraktor' },
    { value: 'Operator/O&M', label: 'Operator/O&M' },
    { value: 'Konsultan', label: 'Konsultan (transaksi/teknis/hukum/keuangan)' },
    { value: 'Penjamin/Lender/Advisor', label: 'Penjamin/Lender/Advisor' },
    { value: 'Akademisi/LSM/Asosiasi', label: 'Akademisi/LSM/Asosiasi' },
    { value: 'Lainnya', label: 'Lainnya' },
] as const

export const EXPERIENCE_OPTIONS = [
    { value: '<3 tahun', label: '<3 tahun' },
    { value: '3-5 tahun', label: '3–5 tahun' },
    { value: '6-10 tahun', label: '6–10 tahun' },
    { value: '>10 tahun', label: '>10 tahun' },
] as const

export const PROJECT_STATUS_OPTIONS = [
    { value: 'Perencanaan', label: 'Perencanaan' },
    { value: 'Penyiapan', label: 'Penyiapan' },
    { value: 'Transaksi', label: 'Transaksi' },
    { value: 'Konstruksi', label: 'Konstruksi' },
    { value: 'Operasi', label: 'Operasi' },
    { value: 'Selesai/terminasi', label: 'Selesai/terminasi' },
] as const
