'use client'
import { useState, useMemo } from 'react'
import ExportButton from './ExportButton'

type Row = Record<string, any>
type Kpis = { total: number; abaixo: number; acima: number; igual: number; mediaVis: number }

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  'ABAIXO TABELA': { bg: '#dcfce7', color: '#166534', label: '↓ Abaixo' },
  'ACIMA':         { bg: '#fef2f2', color: '#dc2626', label: '↑ Acima'  },
  'IGUAL':         { bg: '#fef9c3', color: '#854d0e', label: '= Igual'  },
}

export default function CatalogoClient({ rows, kpis }: { rows: Row[]; kpis: Kpis }) {
  const [filtroStatus, setFiltroStatus] = useState('TODOS')
  const [busca, setBusca]               = useState('')

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const okStatus = filtroStatus === 'TODOS' || r.status_preco === filtroStatus
      const okBusca  = busca === '' ||
        (r.id_anuncio    ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (r.nome_vendedor ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (r.desc_simples  ?? '').toLowerCase().includes(busca.toLowerCase()) ||
        (r.sku           ?? '').toLowerCase().includes(busca.toLowerCase())
      return okStatus && okBusca
    })
  }, [rows, filtroStatus, busca])

  const maxVis = Math.max(...rows.map(r => r.visitas_30d ?? 0), 1)

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900">Análise de Catálogo</h1>
        <p className="text-sm text-slate-500 mt-0.5">Mercado Livre · Mapeados</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
        {[
          { label: 'Total Sellers',    value: kpis.total,    sub: 'mapeados',          color: '#f0fdf4', ico: '📋' },
          { label: 'Abaixo Tabela',    value: kpis.abaixo,   sub: `${kpis.total > 0 ? ((kpis.abaixo/kpis.total)*100).toFixed(1) : 0}% do total`, color: '#fef2f2', ico: '🔴' },
          { label: 'Acima Tabela',     value: kpis.acima,    sub: `${kpis.total > 0 ? ((kpis.acima/kpis.total)*100).toFixed(1) : 0}% do total`,  color: '#f0fdf4', ico: '🟢' },
          { label: 'Na Tabela',        value: kpis.igual,    sub: `${kpis.total > 0 ? ((kpis.igual/kpis.total)*100).toFixed(1) : 0}% do total`,  color: '#fef9c3', ico: '🟡' },
          { label: 'Vis. Média 30d',   value: kpis.mediaVis, sub: 'por anúncio',       color: '#f0f9ff', ico: '👁' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4"
               style={{ background: 'rgba(255,255,255,0.90)', border: '1px solid rgba(5,150,105,0.10)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</span>
              <span className="text-sm">{k.ico}</span>
            </div>
            <div className="text-xl font-black text-slate-900">{k.value.toLocaleString('pt-BR')}</div>
            <div className="text-[10px] text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {['TODOS', 'ABAIXO TABELA', 'ACIMA', 'IGUAL'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
            style={filtroStatus === s
              ? { background: '#f0fdf4', border: '1px solid rgba(5,150,105,0.3)', color: '#059669' }
              : { background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', color: '#374151' }}>
            {s === 'TODOS' ? 'Todos' : s === 'ABAIXO TABELA' ? '↓ Abaixo tabela' : s === 'ACIMA' ? '↑ Acima tabela' : '= Na tabela'}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto rounded-lg px-3 py-1.5"
             style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="5" cy="5" r="3.5" stroke="#94a3b8" strokeWidth="1.2"/><path d="M8 8l2 2" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar MLB, vendedor, produto..."
            className="text-[11px] bg-transparent outline-none text-slate-700 w-52"
            style={{ fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl overflow-hidden flex flex-col"
           style={{ background: 'rgba(255,255,255,0.90)', border: '1px solid rgba(5,150,105,0.10)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

        {/* Header da tabela */}
        <div className="flex items-center justify-between px-4 py-3"
             style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div className="text-[13px] font-bold text-slate-900">Catálogo Mapeado — ML</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{filtered.length} de {kpis.total} anúncios</div>
          </div>
          <ExportButton rows={filtered} />
        </div>

        {/* Scroll da tabela */}
        <div className="overflow-auto" style={{ maxHeight: '55vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'rgba(248,250,252,0.98)', position: 'sticky', top: 0 }}>
                {['MLB','SKU','Descrição','Vendedor','Reputação','Medalha','PV Final','PV Ref','Dif','Status','Entrega','Vis 7d','Vis 30d','Vis 90d','Link'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={15} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
                  Nenhum resultado encontrado
                </td></tr>
              ) : filtered.map((r, i) => {
                const st      = STATUS_STYLE[r.status_preco] ?? { bg: '#f1f5f9', color: '#64748b', label: r.status_preco ?? '-' }
                const visPct  = Math.round(((r.visitas_30d ?? 0) / maxVis) * 100)
                const difPos  = (r.diferenca_preco ?? 0) > 0
                const rowBg   = r.status_preco === 'ACIMA' ? 'rgba(254,242,242,0.4)' : 'transparent'

                return (
                  <tr key={i} style={{ background: rowBg }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(5,150,105,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = rowBg)}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {r.id_anuncio ?? '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', color: '#7c3aed', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {r.sku ?? '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>
                      {r.desc_simples ?? '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#374151' }}>
                      {r.nome_vendedor ?? '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>
                        {r.reputacao ?? '-'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#ede9fe', color: '#4f46e5', padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>
                        {r.medalha ?? '-'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {r.preco_desconto_final != null ? `R$ ${Number(r.preco_desconto_final).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {r.preco_tabela != null ? `R$ ${Number(r.preco_tabela).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap', fontWeight: 700, color: difPos ? '#dc2626' : '#059669' }}>
                      {r.diferenca_preco != null ? `${difPos ? '+' : ''}R$ ${Number(r.diferenca_preco).toFixed(2)}` : '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' }}>
                      <span style={{ background: st.bg, color: st.color, padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 7px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>
                        {r.forma_entrega ?? '-'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {(r.visitas_7d ?? 0).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 600, minWidth: 36 }}>{(r.visitas_30d ?? 0).toLocaleString('pt-BR')}</span>
                        <div style={{ width: 40, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${visPct}%`, height: '100%', background: 'linear-gradient(90deg,#059669,#0d9488)', borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {(r.visitas_90d ?? 0).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap' }}>
                      {r.link_anuncio
                        ? <a href={r.link_anuncio} target="_blank" rel="noopener noreferrer"
                             style={{ color: '#059669', fontWeight: 600, textDecoration: 'none', fontSize: 9 }}>↗ Ver</a>
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
