import type { AuditCheck } from '@/lib/types'
import { CheckCircle, Search, XCircle } from '@/lib/icons'

type AuditChecksTableProps = {
    checks: AuditCheck[]
    passCount: number
}

export default function AuditChecksTable({ checks, passCount }: AuditChecksTableProps) {
    return (
        <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} /> Audit Kelengkapan &amp; Konsistensi
                <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', fontWeight: 'normal', color: passCount === 13 ? '#059669' : '#d97706' }}>
                    {passCount}/13 lulus
                </span>
            </h3>
            <table className="data-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                    <tr>
                        <th style={{ width: '60%' }}>Pemeriksaan</th>
                        <th style={{ textAlign: 'center' }}>Nilai</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {checks.map((c, i) => (
                        <tr key={i}>
                            <td>{c.name}</td>
                            <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{c.value}</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: c.pass ? '#059669' : '#dc2626' }}>
                                {c.pass
                                    ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><CheckCircle size={14} /> LULUS</span>
                                    : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><XCircle size={14} /> GAGAL</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
