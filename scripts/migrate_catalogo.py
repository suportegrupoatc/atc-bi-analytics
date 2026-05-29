"""
Migração: vb_final_catalogo_joga_para_drive_server_ofc → Supabase (catalogo_mapeado)
Uso: python scripts/migrate_catalogo.py

Estratégia: Truncate + Insert
  - Apaga os dados do seller no Supabase
  - Reinsere tudo da view local
  - Garante que o Supabase fica idêntico ao banco local
"""

import pg8000
import ssl
from datetime import datetime

# ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

LOCAL_DB = {
    "host":     "189.68.254.9",
    "port":     5432,
    "database": "postgres",
    "user":     "postgres",
    "password": "78459632",
}

SUPABASE = {
    "host":     "db.lvexlxqpmfthwwdanjtl.supabase.co",
    "port":     5432,
    "database": "postgres",
    "user":     "postgres",
    "password": "vSWBvZH4eGj34f_",
}

CODIGO_SELLER = "8080"
BATCH_SIZE    = 300

# ─────────────────────────────────────────────────────────────────────────────

COLUNAS = [
    "id_anuncio", "fornecedor", "linha_marca", "sku", "desc_simples", "qtd_un",
    "id_catalogo", "id_vendedor", "nome_vendedor", "reputacao", "medalha", "cidade",
    "preco_cheio", "valor_desconto", "percentual_desconto", "preco_desconto_final",
    "preco_tabela", "tipo_anuncio", "diferenca_preco", "status_preco",
    "status_adm", "status_atc", "status_b4b", "frete_gratis", "forma_entrega",
    "visitas_7d", "visitas_15d", "visitas_30d", "visitas_60d", "visitas_90d",
    "link_anuncio", "dta_ultma_atz",
]

INSERT_SQL = """
    INSERT INTO catalogo_mapeado (
        id_anuncio, fornecedor, linha_marca, sku, desc_simples, qtd_un,
        id_catalogo, id_vendedor, nome_vendedor, reputacao, medalha, cidade,
        preco_cheio, valor_desconto, percentual_desconto, preco_desconto_final,
        preco_tabela, tipo_anuncio, diferenca_preco, status_preco,
        status_adm, status_atc, status_b4b, frete_gratis, forma_entrega,
        visitas_7d, visitas_15d, visitas_30d, visitas_60d, visitas_90d,
        link_anuncio, dta_ultma_atz, codigo_seller, canal_venda
    ) VALUES (
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s
    )
"""


def conectar_supabase():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode    = ssl.CERT_NONE
    return pg8000.connect(**SUPABASE, ssl_context=ctx)


def migrate():
    # ── 1. Lê dados do banco local ──────────────────────────────────────────
    print(f"[{datetime.now():%H:%M:%S}] Conectando ao banco local...")
    conn_local = pg8000.connect(**LOCAL_DB)
    cur_local  = conn_local.cursor()

    print(f"[{datetime.now():%H:%M:%S}] Lendo view local...")
    cur_local.execute("""
        SELECT
            id_anuncio, fornecedor, linha_marca, sku, desc_simples, qtd_un,
            id_catalogo, id_vendedor, nome_vendedor, reputacao, medalha, cidade,
            preco_cheio, valor_desconto, percentual_desconto, preco_desconto_final,
            preco_tabela, tipo_anuncio, diferenca_preco, status_preco,
            status_adm, status_atc, status_b4b, frete_gratis, forma_entrega,
            visitas_7d, visitas_15d, visitas_30d, visitas_60d, visitas_90d,
            link_anuncio, dta_ultma_atz
        FROM public.vb_final_catalogo_joga_para_drive_server_ofc
    """)
    rows_raw = cur_local.fetchall()
    total    = len(rows_raw)
    print(f"[{datetime.now():%H:%M:%S}] {total} registros encontrados.")

    cur_local.close()
    conn_local.close()

    if total == 0:
        print("Nenhum dado encontrado. Encerrando.")
        return

    # Índices das colunas numéricas (0-based) que podem vir como "-" na view
    NUMERIC_COLS = {12, 13, 14, 15, 16, 18, 25, 26, 27, 28, 29}

    def limpar(row):
        r = list(row)
        for i in NUMERIC_COLS:
            v = r[i]
            if isinstance(v, str) and v.strip() in ("-", "", "N/A", "null"):
                r[i] = None
        return tuple(r) + (CODIGO_SELLER, 1)

    rows = [limpar(r) for r in rows_raw]

    # ── 2. Conecta no Supabase e substitui os dados ──────────────────────────
    print(f"[{datetime.now():%H:%M:%S}] Conectando ao Supabase...")
    conn_supa = conectar_supabase()
    cur_supa  = conn_supa.cursor()

    print(f"[{datetime.now():%H:%M:%S}] Limpando dados do seller {CODIGO_SELLER}...")
    cur_supa.execute(
        "DELETE FROM catalogo_mapeado WHERE codigo_seller = %s",
        (CODIGO_SELLER,)
    )
    conn_supa.commit()

    # ── 3. Insere em lotes ───────────────────────────────────────────────────
    inseridos = 0
    erros     = 0

    for i in range(0, total, BATCH_SIZE):
        lote = rows[i:i + BATCH_SIZE]
        try:
            cur_supa.executemany(INSERT_SQL, lote)
            conn_supa.commit()
            inseridos += len(lote)
            pct = (inseridos / total) * 100
            print(f"[{datetime.now():%H:%M:%S}] {inseridos}/{total} ({pct:.0f}%) ...")
        except Exception as e:
            conn_supa.rollback()
            erros += len(lote)
            print(f"  ERRO no lote {i}–{i+BATCH_SIZE}: {e}")

    print(f"\n✅ Concluído: {inseridos} inseridos, {erros} erros.")

    cur_supa.close()
    conn_supa.close()


if __name__ == "__main__":
    migrate()
