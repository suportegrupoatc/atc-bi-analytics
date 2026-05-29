'use client'
import * as XLSX from 'xlsx'

type Row = Record<string, any>

export default function ExportButton({ rows }: { rows: Row[] }) {
  function exportar() {
    const data = rows.map(r => ({
      'MLB':           r.id_anuncio,
      'SKU':           r.sku,
      'Descrição':     r.desc_simples,
      'Fornecedor':    r.fornecedor,
      'Linha/Marca':   r.linha_marca,
      'Vendedor':      r.nome_vendedor,
      'ID Vendedor':   r.id_vendedor,
      'Reputação':     r.reputacao,
      'Medalha':       r.medalha,
      'Cidade':        r.cidade,
      'PV Cheio':      r.preco_cheio,
      'Valor Desc.':   r.valor_desconto,
      '% Desc.':       r.percentual_desconto,
      'PV Final':      r.preco_desconto_final,
      'PV Ref.':       r.preco_tabela,
      'Tipo Anúncio':  r.tipo_anuncio,
      'Dif. Preço':    r.diferenca_preco,
      'Status Preço':  r.status_preco,
      'Status ADM':    r.status_adm,
      'Status ATC':    r.status_atc,
      'Status B4B':    r.status_b4b,
      'Frete Grátis':  r.frete_gratis,
      'Entrega':       r.forma_entrega,
      'Vis. 7d':       r.visitas_7d,
      'Vis. 15d':      r.visitas_15d,
      'Vis. 30d':      r.visitas_30d,
      'Vis. 60d':      r.visitas_60d,
      'Vis. 90d':      r.visitas_90d,
      'Link':          r.link_anuncio,
      'Atualizado':    r.dta_ultma_atz,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Catálogo')

    const hoje = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `catalogo_ml_${hoje}.xlsx`)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={exportar}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all"
        style={{ background: 'linear-gradient(135deg,#059669,#0d9488)', boxShadow: '0 3px 10px rgba(5,150,105,0.25)' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v7M3 5.5L6 8.5l3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 9.5v1a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-1" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        Exportar Excel
      </button>
    </div>
  )
}
