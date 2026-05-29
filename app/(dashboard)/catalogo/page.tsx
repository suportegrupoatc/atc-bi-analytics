import { createClient } from '@/lib/supabase/server'
import CatalogoClient from '@/components/catalogo/CatalogoClient'

export default async function CatalogoPage() {
  const supabase = await createClient()

  // Busca todos os dados do catálogo (RLS filtra automaticamente pelo seller do usuário)
  const { data: rows, error } = await supabase
    .from('catalogo_mapeado')
    .select('*')
    .eq('canal_venda', 1)
    .order('visitas_30d', { ascending: false })

  if (error) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p className="text-sm font-bold text-red-600">Erro ao carregar dados: {error.message}</p>
      </div>
    )
  }

  // KPIs agregados no servidor
  const total     = rows?.length ?? 0
  const abaixo    = rows?.filter(r => r.status_preco === 'ABAIXO TABELA').length ?? 0
  const acima     = rows?.filter(r => r.status_preco === 'ACIMA').length ?? 0
  const igual     = rows?.filter(r => r.status_preco === 'IGUAL').length ?? 0
  const mediaVis  = total > 0
    ? Math.round((rows?.reduce((s, r) => s + (r.visitas_30d ?? 0), 0) ?? 0) / total)
    : 0

  const kpis = { total, abaixo, acima, igual, mediaVis }

  return <CatalogoClient rows={rows ?? []} kpis={kpis} />
}
