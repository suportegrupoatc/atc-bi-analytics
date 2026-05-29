'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router  = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5,#e0f2fe)' }}>
      <div className="flex w-full max-w-[900px] min-h-[560px] rounded-[28px] overflow-hidden shadow-2xl"
           style={{ boxShadow: '0 40px 100px rgba(5,150,105,0.15), 0 0 0 1px rgba(5,150,105,0.12)' }}>

        {/* Painel esquerdo */}
        <div className="relative flex flex-col justify-between p-11 overflow-hidden"
             style={{ width:'44%', background:'linear-gradient(150deg,#065f46,#059669,#0d9488)' }}>
          <div className="absolute w-80 h-80 rounded-full -top-24 -right-24"
               style={{ background:'radial-gradient(circle,rgba(255,255,255,0.10),transparent 70%)' }} />
          <div className="absolute w-48 h-48 rounded-full -bottom-16 -left-10"
               style={{ background:'radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%)' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center border"
                   style={{ background:'rgba(255,255,255,0.15)', borderColor:'rgba(255,255,255,0.25)' }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="2" y="14" width="5" height="9" rx="2" fill="rgba(255,255,255,0.9)"/>
                  <rect x="10" y="9" width="5" height="14" rx="2" fill="rgba(255,255,255,0.9)"/>
                  <rect x="18" y="4" width="5" height="19" rx="2" fill="rgba(255,255,255,0.9)"/>
                  <path d="M4.5 13L10.5 8.5L15.5 11L22 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-black text-lg leading-none">ATC BI</div>
                <div className="text-xs font-medium mt-0.5" style={{ color:'rgba(255,255,255,0.6)', letterSpacing:'0.5px', textTransform:'uppercase' }}>Analytics Platform</div>
              </div>
            </div>
            <h1 className="text-white font-black text-2xl leading-tight mb-3" style={{ letterSpacing:'-0.5px' }}>
              Dados que<br/><span style={{ color:'rgba(255,255,255,0.65)' }}>geram</span> vendas
            </h1>
            <p className="text-sm leading-relaxed" style={{ color:'rgba(255,255,255,0.65)' }}>
              Painel de inteligência para sellers do Mercado Livre.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-2.5">
            {[
              { icon: '📊', t: 'Resumo de vendas', s: 'Faturamento, pedidos e ticket médio' },
              { icon: '📢', t: 'Performance de anúncios', s: 'Visitas, cliques e conversão' },
              { icon: '👁', t: 'Funil de conversão', s: 'Quantas visitas viram pedidos' },
              { icon: '🏪', t: 'Multi-contas', s: 'Vários sellers em um painel' },
            ].map(f => (
              <div key={f.t} className="flex items-center gap-3 p-2.5 rounded-[10px] border"
                   style={{ background:'rgba(255,255,255,0.08)', borderColor:'rgba(255,255,255,0.10)' }}>
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-sm flex-shrink-0"
                     style={{ background:'rgba(255,255,255,0.15)' }}>{f.icon}</div>
                <div>
                  <div className="text-white font-bold text-[11px]">{f.t}</div>
                  <div className="text-[9px] mt-0.5" style={{ color:'rgba(255,255,255,0.55)' }}>{f.s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel direito */}
        <div className="flex-1 flex flex-col justify-center px-11 py-12"
             style={{ background:'rgba(255,255,255,0.92)' }}>
          <div className="mb-7">
            <h2 className="text-2xl font-black text-slate-900" style={{ letterSpacing:'-0.5px' }}>Bem-vindo de volta 👋</h2>
            <p className="text-sm text-slate-500 mt-1">Insira suas credenciais para acessar o painel</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">E-mail</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 3.5A1.5 1.5 0 012.5 2h10A1.5 1.5 0 0114 3.5v8a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 011 11.5v-8z" stroke="#9ca3af" strokeWidth="1.2"/><path d="M1 4l6.5 4.5L14 4" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="seu@email.com.br"
                  className="w-full pl-9 pr-4 py-3 rounded-[10px] text-sm text-slate-900 outline-none transition-all"
                  style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb' }}
                  onFocus={e => e.target.style.borderColor='#059669'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="2.5" y="6" width="10" height="7.5" rx="1.5" stroke="#9ca3af" strokeWidth="1.2"/><path d="M4.5 6V4.5a3 3 0 016 0V6" stroke="#9ca3af" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7.5" cy="9.5" r="1" fill="#9ca3af"/></svg>
                </span>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-3 rounded-[10px] text-sm text-slate-900 outline-none transition-all"
                  style={{ background:'#f9fafb', border:'1.5px solid #e5e7eb' }}
                  onFocus={e => e.target.style.borderColor='#059669'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'} />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-[11px] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all mt-1"
              style={{ background:'linear-gradient(135deg,#059669,#0d9488)', boxShadow:'0 6px 24px rgba(5,150,105,0.30)' }}>
              {loading ? 'Entrando...' : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h10M8 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Entrar no painel
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-100" />
            <span className="text-[11px] text-gray-300">acesso controlado pelo administrador</span>
            <hr className="flex-1 border-gray-100" />
          </div>

          <div className="flex items-start gap-2 p-3 rounded-[10px]"
               style={{ background:'#f0fdf4', border:'1px solid #bbf7d0' }}>
            <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#16a34a" strokeWidth="1.2"/><path d="M7 4.5v3" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/><circle cx="7" cy="9.5" r="0.75" fill="#16a34a"/></svg>
            <p className="text-[11px] leading-relaxed" style={{ color:'#166534' }}>
              Não tem acesso? Entre em contato com o administrador para solicitar seu login.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
