import { Download, FileText, Printer } from '@/lib/icons'

type ExportButtonsProps = {
    onDownloadJSON: () => void
    onDownloadCSV: () => void
    onPrint: () => void
}

export default function ExportButtons({ onDownloadJSON, onDownloadCSV, onPrint }: ExportButtonsProps) {
    return (
        <div className="export-buttons">
            <button className="btn btn-primary" onClick={onDownloadJSON} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={16} /> Unduh JSON
            </button>
            <button className="btn btn-secondary" onClick={onDownloadCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} /> Unduh CSV
            </button>
            <button className="btn btn-outline" onClick={onPrint} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} /> Cetak
            </button>
        </div>
    )
}
