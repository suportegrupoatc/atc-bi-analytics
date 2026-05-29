export default function CatalogoPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-black text-slate-900">Análise de Catálogo</h1>
        <p className="text-sm text-slate-500 mt-0.5">Mercado Livre · Mapeados</p>
      </div>
      <div className="rounded-2xl p-8 flex items-center justify-center" style={{ background:'rgba(255,255,255,0.90)', border:'1px solid rgba(5,150,105,0.10)', minHeight:300 }}>
        <div className="text-center">
          <div className="text-4xl mb-3">📊</div>
          <div className="text-sm font-bold text-slate-600">Em desenvolvimento</div>
          <div className="text-xs text-slate-400 mt-1">Análise de catálogo mapeado em breve</div>
        </div>
      </div>
    </div>
  )
}
