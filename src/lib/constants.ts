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

export const PHASES = ['Perencanaan', 'Penyiapan', 'Transaksi', 'Implementasi'] as const

// FAHP Scale with Triangular Fuzzy Numbers
export const FAHP_SCALE: Record<string, { tfn: [number, number, number] }> = {
    'SI': { tfn: [1, 1, 1] },
    'SLI': { tfn: [1, 2, 3] },
    'LI': { tfn: [2, 3, 4] },
    'SVI': { tfn: [3, 4, 5] },
    'EI': { tfn: [4, 5, 6] },
    '1/SLI': { tfn: [1 / 3, 1 / 2, 1] },
    '1/LI': { tfn: [1 / 4, 1 / 3, 1 / 2] },
    '1/SVI': { tfn: [1 / 5, 1 / 4, 1 / 3] },
    '1/EI': { tfn: [1 / 6, 1 / 5, 1 / 4] },
}

export const CRISP_SCALE: Record<string, number> = {
    'SI': 1,
    'SLI': 2,
    'LI': 3,
    'SVI': 4,
    'EI': 5,
    '1/SLI': 1 / 2,
    '1/LI': 1 / 3,
    '1/SVI': 1 / 4,
    '1/EI': 1 / 5,
}

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
    { code: 'PAT1-01', text: 'Keputusan teknis BU/SPV berpengaruh langsung mengurangi risiko.', construct: 'Control' },
    { code: 'PAT1-02', text: 'Kewenangan BU/SPV memadai untuk mengelola risiko.', construct: 'Control' },
    { code: 'PAT1-03', text: 'Informasi lebih lengkap di BU/SPV dibanding publik.', construct: 'Info' },
    { code: 'PAT1-04', text: 'Pengalaman lapangan BU/SPV lebih mampu merespons risiko.', construct: 'Info' },
    { code: 'PAT1-05', text: 'Kinerja dapat diukur dengan indikator yang jelas.', construct: 'Verifiability' },
    { code: 'PAT1-06', text: 'Biaya pemantauan kinerja masih wajar.', construct: 'Verifiability' },
    { code: 'PAT1-07', text: 'Risiko terutama ditentukan faktor eksternal.', construct: 'Externality', reverse: true },
    { code: 'PAT1-08', text: 'Perubahan risiko lebih dipengaruhi kebijakan/regulasi.', construct: 'Externality', reverse: true },
    { code: 'PAT1-09', text: 'BU/SPV punya kemampuan finansial memadai.', construct: 'Capacity' },
    { code: 'PAT1-10', text: 'BU/SPV punya kapasitas teknis memadai.', construct: 'Capacity' },
    { code: 'PAT1-11', text: 'Kontrak mengatur KPI/SLA yang jelas.', construct: 'Incentives' },
    { code: 'PAT1-12', text: 'Mekanisme pembayaran/penalti cukup jelas.', construct: 'Incentives' },
] as const

// PAT Tier-2 Items
export const PAT2_ITEMS = [
    { code: 'PAT2-01', text: 'EPC/O&M memiliki pengaruh langsung terhadap faktor teknis.', construct: 'Control' },
    { code: 'PAT2-02', text: 'Ruang lingkup kerja EPC/O&M memberi kendali cukup.', construct: 'Control' },
    { code: 'PAT2-03', text: 'Kinerja EPC/O&M dapat diukur objektif.', construct: 'Verifiability' },
    { code: 'PAT2-04', text: 'Hubungan kualitas kerja dan outcome dapat ditelusuri.', construct: 'Verifiability' },
    { code: 'PAT2-05', text: 'Kontrak memungkinkan pengalihan risiko via harga/LD.', construct: 'Incentives' },
    { code: 'PAT2-06', text: 'Ada mekanisme asuransi/perlindungan kontraktual.', construct: 'Incentives' },
    { code: 'PAT2-07', text: 'EPC/O&M punya kapasitas finansial memadai.', construct: 'Capacity' },
    { code: 'PAT2-08', text: 'EPC/O&M punya rekam jejak teknis relevan.', construct: 'Capacity' },
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
