import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button 
                className="btn btn-secondary" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                style={{ padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
            >
                <ChevronLeft size={16} /> Sebelumnya
            </button>
            
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600, padding: '0 0.5rem' }}>
                Halaman {currentPage} dari {totalPages}
            </div>
            
            <button 
                className="btn btn-secondary" 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                style={{ padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
            >
                Selanjutnya <ChevronRight size={16} />
            </button>
        </div>
    )
}
