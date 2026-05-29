import { createClient } from '@/lib/supabase/server'

export default async function ResumoDashboard() {
  const supabase = await createClient()

  const { data: sellers } = await supabase
    .from('sellers')
    .select('id, email, nome')
    .eq('ativo', true)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-slate-900">Resumo de Vendas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Mercado Livre · Maio 2026</p>
      </div>

      {/* KPI Cards placeholder */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Faturamento', value: 'R$ --', sub: 'Aguardando dados', color: '#f0fdf4' },
          { label: 'Pedidos',     value: '--',    sub: 'Aguardando dados', color: '#eff6ff' },
          { label: 'Ticket Médio',value: 'R$ --', sub: 'Aguardando dados', color: '#fff7ed' },
          { label: 'Conversão',   value: '--%',   sub: 'Aguardando dados', color: '#fdf4ff' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background:'rgba(255,255,255,0.90)', border:'1px solid rgba(5,150,105,0.10)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{k.label}</div>
            <div className="text-xl font-black text-slate-900">{k.value}</div>
            <div className="text-[10px] text-slate-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Sellers disponíveis */}
      {sellers && sellers.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.90)', border:'1px solid rgba(5,150,105,0.10)' }}>
          <div className="text-sm font-bold text-slate-900 mb-3">Sellers com acesso</div>
          <div className="flex flex-wrap gap-2">
            {sellers.map(s => (
              <div key={s.id} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                   style={{ background:'#f0fdf4', border:'1px solid rgba(5,150,105,0.2)', color:'#059669' }}>
                🏪 {s.nome} ({s.email})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
