import { Download, FileText, Printer } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

type ExportButtonsProps = {
    onDownloadJSON: () => void
    onDownloadCSV: () => void
    onPrint: () => void
}

export default function ExportButtons({ onDownloadJSON, onDownloadCSV, onPrint }: ExportButtonsProps) {
    const { t } = useLang()
    return (
        <div className="export-buttons">
            <button className="btn btn-primary" onClick={onDownloadJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> {t.downloadJSON}
            </button>
            <button className="btn btn-secondary" onClick={onDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> {t.downloadCSV}
            </button>
            <button className="btn btn-outline" onClick={onPrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} /> {t.print}
            </button>
        </div>
    )
}
