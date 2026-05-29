'use client'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

const titles: Record<string, { title: string; sub: string }> = {
  '/':               { title: 'Resumo de Vendas',    sub: '/ Mercado Livre' },
  '/vendas':         { title: 'Vendas',              sub: '/ Pedidos' },
  '/anuncios':       { title: 'Anúncios',            sub: '/ Performance' },
  '/visitas':        { title: 'Visitas × Vendas',    sub: '/ Funil' },
  '/catalogo':       { title: 'Análise de Catálogo', sub: '/ Mapeados ML' },
  '/admin/usuarios': { title: 'Usuários',            sub: '/ Admin' },
  '/admin/sellers':  { title: 'Sellers',             sub: '/ Admin' },
}

export default function Topbar({ user }: { user: User }) {
  const pathname = usePathname()
  const page = titles[pathname] ?? { title: 'Dashboard', sub: '' }
  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase()

  return (
    <header className="flex items-center gap-3 px-6 flex-shrink-0"
            style={{ height:52, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(5,150,105,0.08)' }}>
      <div>
        <span className="text-[15px] font-black text-slate-900">{page.title}</span>
        <span className="text-[11px] text-slate-400 ml-1">{page.sub}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Período */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-semibold cursor-pointer"
             style={{ background:'#f0fdf4', border:'1px solid rgba(5,150,105,0.2)', color:'#059669' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="#059669" strokeWidth="1.2"/><path d="M1 5h10" stroke="#059669" strokeWidth="1.2"/><path d="M4 1v2M8 1v2" stroke="#059669" strokeWidth="1.2" strokeLinecap="round"/></svg>
          Maio 2026 ▾
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
             style={{ background:'linear-gradient(135deg,#059669,#0d9488)' }}>
          {initials}
        </div>
      </div>
    </header>
  )
}
