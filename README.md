#  KPBU SPAM Survey - Risk Allocation System

Aplikasi web survey untuk mengumpulkan dan menganalisis persepsi risiko pada proyek KPBU SPAM (Kerjasama Pemerintah dengan Badan Usaha - Sistem Penyediaan Air Minum).

##  Fitur Utama

- **Survey Multi-step** - 9 halaman survey terstruktur dengan auto-save
- **FAHP Analysis** - Fuzzy Analytic Hierarchy Process untuk bobot risiko
- **PAT Assessment** - Principal-Agent Theory untuk alokasi risiko 2-tier
- **Lifecycle Mapping** - Pemetaan fase kritis per risiko
- **Real-time Results** - Visualisasi hasil dengan charts & heatmap
- **Admin Dashboard** - Monitoring semua response survey
- **Export Data** - JSON & CSV export

##  Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Language**: TypeScript
- **Icons**: lucide-react

##  Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm atau yarn

##  Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/USERNAME/kpbu-spam-survey.git
cd kpbu-spam-survey
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kpbu_spam"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
npx prisma db push
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

## Default Admin

- **Username**: `admin`
- **Password**: `admin123`

>  Ganti password default untuk production!

##  Project Structure

```
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed admin user
├── src/
│   ├── app/
│   │   ├── admin/           # Admin pages
│   │   ├── api/             # API routes
│   │   ├── results/[id]/    # Results page (323 baris, -58%)
│   │   ├── survey/          # Survey wizard (160 baris, -80%)
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── results/         # 9 komponen hasil (KPIGrid, FAHPDetailTable, dll)
│   │   └── survey/          # 7 komponen step survey (StepFAHP, StepPAT, dll)
│   ├── lib/
│   │   ├── calculations.ts  # FAHP, PAT, LCM logic (JANGAN DIUBAH)
│   │   ├── constants.ts     # RISKS, PHASES, FAHP_SCALE, PAT items
│   │   ├── db.ts            # Prisma client
│   │   ├── icons.ts         # Centralized lucide-react re-exports
│   │   ├── types.ts         # Shared TypeScript interfaces (Results, SurveyState, dll)
│   │   └── utils.ts         # fmt1/fmt2/fmtPct, getLCMMapping, strictLockCount
│   └── styles/
│       └── globals.css      # All styles
└── package.json
```

### ⚠️ Catatan Refactor (branch `refactor`)

File-file di bawah ini adalah **hasil refaktor** — JSX-nya dipecah ke `components/`, **logikanya tidak berubah**:
- `src/app/results/[id]/page.tsx` — hanya berisi data fetch + state management
- `src/app/survey/page.tsx` — hanya berisi state + handlers + navigation
- `src/lib/types.ts` — semua interface dipindah ke sini (dari kedua page)
- `src/lib/utils.ts` — semua helper dipindah ke sini (dari results page)

**File yang TIDAK BOLEH diubah tanpa pemahaman penuh:**
- `src/lib/calculations.ts` — kalkulasi FAHP, PAT, LCM (tervalidasi vs Excel)
- `src/lib/constants.ts` — definisi risiko, fase, item PAT, skala FAHP


##  Security Notes

- `.env` file TIDAK boleh di-commit (sudah ada di .gitignore)
- Ganti `NEXTAUTH_SECRET` dengan random string yang kuat
- Ganti password admin default untuk production
- Gunakan HTTPS di production

## 📊 Survey Flow

1. **Consent** - Persetujuan partisipasi
2. **Screening** - Latar belakang responden
3. **Project Reference** - Proyek yang dijadikan referensi
4. **FAHP** - 15 perbandingan berpasangan 6 risiko
5. **LCM** - Lifecycle Mapping (keterjadian & fase kritis)
6. **PAT Tier-1** - 12 item × 6 risiko (Publik ↔ BU/SPV)
7. **PAT Tier-2** - 8 item × 6 risiko (BU/SPV ↔ EPC/O&M)
8. **Review** - Validasi & submit
9. **Results** - Visualisasi & rekomendasi alokasi

##  License

MIT License

---

Developed for KPBU SPAM risk allocation research.
