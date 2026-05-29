'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, ShoppingBag, Megaphone, Eye, BookOpen, Users, Store, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

const nav = [
  { href: '/',          label: 'Resumo',          icon: BarChart2,  section: 'Principal' },
  { href: '/vendas',    label: 'Vendas',           icon: ShoppingBag },
  { href: '/anuncios',  label: 'Anúncios',         icon: Megaphone },
  { href: '/visitas',   label: 'Visitas × Vendas', icon: Eye },
  { href: '/catalogo',  label: 'Análise Catálogo', icon: BookOpen,   section: 'Inteligência' },
  { href: '/admin/usuarios', label: 'Usuários',    icon: Users,      section: 'Admin' },
  { href: '/admin/sellers',  label: 'Sellers',     icon: Store },
]

export default function Sidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  let lastSection = ''

  return (
    <aside className="flex flex-col w-[220px] flex-shrink-0 py-4"
           style={{ background:'rgba(255,255,255,0.75)', backdropFilter:'blur(16px)', borderRight:'1px solid rgba(5,150,105,0.10)' }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pb-4 mb-2"
           style={{ borderBottom:'1px solid rgba(5,150,105,0.08)' }}>
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
             style={{ background:'linear-gradient(135deg,#059669,#0d9488)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="9" width="3" height="5" rx="1" fill="white"/>
            <rect x="6" y="5" width="3" height="9" rx="1" fill="white"/>
            <rect x="11" y="1" width="3" height="13" rx="1" fill="white"/>
          </svg>
        </div>
        <div>
          <div className="text-[13px] font-black text-slate-900">ATC BI</div>
          <div className="text-[9px] font-medium text-slate-400" style={{ letterSpacing:'0.4px', textTransform:'uppercase' }}>Analytics v1.0</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {nav.map(item => {
          const Icon    = item.icon
          const active  = pathname === item.href
          const showSec = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          return (
            <div key={item.href}>
              {showSec && (
                <div className="px-2 pt-3 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-[0.8px]">
                  {item.section}
                </div>
              )}
              <Link href={item.href}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-[9px] text-[12px] font-medium transition-all"
                    style={active
                      ? { background:'linear-gradient(135deg,rgba(5,150,105,0.12),rgba(13,148,136,0.10))', color:'#059669', fontWeight:700, border:'1px solid rgba(5,150,105,0.15)' }
                      : { color:'#64748b' }}>
                <Icon size={14} style={{ opacity: active ? 1 : 0.6 }} />
                {item.label}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Seller + Logout */}
      <div className="px-2 pt-3 mt-auto" style={{ borderTop:'1px solid rgba(5,150,105,0.08)' }}>
        <div className="rounded-[10px] p-2.5 mb-2"
             style={{ background:'rgba(5,150,105,0.07)', border:'1px solid rgba(5,150,105,0.12)' }}>
          <div className="text-[9px] text-slate-500 font-medium">Logado como</div>
          <div className="text-[11px] font-bold text-emerald-800 truncate">{user.email}</div>
        </div>
        <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-2.5 py-2 rounded-[9px] text-[11px] font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={13} />
          Sair
        </button>
      </div>
    </aside>
  )
}
