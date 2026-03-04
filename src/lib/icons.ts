/**
 * icons.ts — Centralized icon re-exports from lucide-react
 *
 * Semua icon yang digunakan di KPBU SPAM dikumpulkan di sini.
 * Ganti emoji (📥, 🔒, ⚠️, dll) dengan komponen React yang proper.
 * Supaya konsisten dan tidak hardcode icon name di setiap file.
 */
export {
    Download,         // Unduh JSON / Download action
    FileText,         // Unduh CSV / File document
    Printer,          // Cetak / Print
    BarChart2,        // Hasil Analisis / Chart header
    Search,           // Audit Kelengkapan / Search/inspect
    Lock,             // Governance Locks (private allocation)
    AlertTriangle,    // Warning / Not Consistent / Gov-lead risk
    Wrench,           // Mitigation Controls / Tools
    Home,             // Kembali ke Beranda / Home
    ChevronLeft,      // ← Kembali / Back navigation
    ChevronDown,      // Accordion expand arrow
    CheckCircle,      // ✓ Lulus / Pass
    XCircle,          // ✗ Gagal / Fail
    Layers,           // Header logo (survey app layers metaphor)
    ClipboardList,    // PAT / Survey items
    Activity,         // LCM / Lifecycle exposure
} from 'lucide-react'
