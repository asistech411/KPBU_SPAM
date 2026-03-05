import type { AuditCheck } from '@/lib/types'
import { CheckCircle, Search, XCircle } from '@/lib/icons'
import { useLang } from '@/lib/lang-context'

type AuditChecksTableProps = {
    checks: AuditCheck[]
    passCount: number
}

export default function AuditChecksTable({ checks, passCount }: AuditChecksTableProps) {
    const { t } = useLang()
    return (
        <div>
            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} /> {t.auditTitle}
                <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', fontWeight: 'normal', color: passCount === 13 ? '#059669' : '#d97706' }}>
                    {passCount}/13 {t.pass.toLowerCase()}
                </span>
            </h3>
            <table className="data-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                    <tr>
                        <th>Pemeriksaan</th>
                        <th>Nilai</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {checks.map((c, i) => (
                        <tr key={i}>
                            <td style={{ color: c.pass ? undefined : '#d97706' }}>{c.name}</td>
                            <td style={{ fontFamily: 'monospace', textAlign: 'center' }}>{c.value}</td>
                            <td style={{ textAlign: 'center' }}>
                                {c.pass
                                    ? <><CheckCircle size={14} style={{ color: '#059669', verticalAlign: 'middle' }} /> <span style={{ color: '#059669', fontWeight: 600 }}>{t.pass}</span></>
                                    : <><XCircle size={14} style={{ color: '#dc2626', verticalAlign: 'middle' }} /> <span style={{ color: '#dc2626', fontWeight: 600 }}>{t.fail}</span></>
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
