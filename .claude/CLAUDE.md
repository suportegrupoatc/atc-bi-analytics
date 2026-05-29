# gui_projeto_web_bi — Agente do Projeto ATC BI Analytics

Você é o agente especialista deste projeto. Foco total em construir e evoluir o **ATC BI Analytics** — plataforma SaaS de Business Intelligence para sellers do Mercado Livre.

---

## Projeto

**Nome:** ATC BI Analytics  
**Caminho:** `C:\Users\Guilherme\Desktop\Geral\0.2 - EMPRESA - GRUPO ATC\0.2 - PROJETOS\DEV\erp`  
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase + Vercel  
**Spec completo:** `docs/superpowers/specs/2026-05-29-atc-bi-analytics-design.md`  
**Mockups aprovados:** `docs/mockups/`

---

## Stack e Decisões Técnicas

- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Lucide React
- **Auth:** Supabase Auth (email/senha). Sem auto-cadastro — admin cria usuários
- **Banco:** Supabase (PostgreSQL). Dados migrados do PostgreSQL local via script Python
- **Hospedagem:** Vercel (frontend) + Supabase (banco + auth)
- **Gráficos:** Recharts
- **Export Excel:** biblioteca `xlsx` (SheetJS)
- **Custo inicial:** R$ 0 — todos os serviços no plano gratuito

---

## Design System (OBRIGATÓRIO em todas as páginas)

| Token | Valor |
|-------|-------|
| Cor primária | `#059669` |
| Cor secundária | `#0d9488` |
| Cor escura | `#065f46` |
| Background body | `linear-gradient(135deg, #f0fdf4, #ecfdf5, #e0f2fe)` |
| Cards | `bg-white/90 border border-emerald-500/10 rounded-2xl backdrop-blur-sm` |
| Sidebar | `bg-white/75 backdrop-blur-md border-r border-emerald-500/10` |
| Botão primário | `bg-gradient-to-r from-emerald-600 to-teal-600 text-white` |
| Font | Inter (400–900) — já incluída via next/font |
| Border radius | cards: 14px, botões: 10px, inputs: 10px |
| Estilo geral | **Glassmorphism Light** verde esmeralda |

Referência visual: `docs/mockups/02-dashboard-resumo.html`

---

## Estrutura de Pastas (Next.js App Router)

```
erp/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ← tela de login aprovada
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← sidebar + topbar
│   │   ├── page.tsx                ← resumo de vendas
│   │   ├── vendas/page.tsx
│   │   ├── anuncios/page.tsx
│   │   ├── visitas/page.tsx
│   │   └── catalogo/page.tsx       ← análise catálogo + export Excel
│   ├── admin/
│   │   ├── usuarios/page.tsx
│   │   └── sellers/page.tsx
│   └── api/
├── components/
│   ├── ui/                         ← shadcn/ui components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── dashboard/
│   │   ├── KpiCard.tsx
│   │   └── SalesChart.tsx
│   └── catalogo/
│       ├── CatalogoTable.tsx
│       └── ExportButton.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← browser client
│   │   ├── server.ts               ← server client (SSR)
│   │   └── types.ts                ← tipos gerados do Supabase
│   └── export/
│       └── excel.ts                ← lógica de export xlsx
├── scripts/
│   ├── migrate_inicial.py          ← migração histórica PostgreSQL → Supabase
│   └── sync_diario.py              ← sync diário de novos registros
├── middleware.ts                   ← protege rotas autenticadas
├── .env.local.example
└── docs/
    ├── mockups/                    ← HTMLs dos mockups aprovados
    └── superpowers/specs/          ← spec do projeto
```

---

## Modelo de Dados Supabase

### Tabelas de controle
```sql
sellers (id, email, nome, ativo, created_at)
user_seller_permissions (user_id, seller_id, role)
```

### Tabelas de dados (migradas do Postgres local)
```sql
vendas (id, email_seller, canal_venda, pedido_id, data_pedido, produto, valor, status, ...)
anuncios (id, email_seller, canal_venda, item_id, titulo, visitas, vendas, faturamento, ...)
catalogo_mapeado (
  id_anuncio, fornecedor, linha_marca, sku, desc_simples, qtd_un,
  id_catalogo, id_vendedor, nome_vendedor, reputacao, medalha, cidade,
  preco_cheio, valor_desconto, percentual_desconto, preco_desconto_final,
  preco_tabela, tipo_anuncio, diferenca_preco, status_preco,
  status_adm, status_atc, status_b4b, frete_gratis, forma_entrega,
  visitas_7d, visitas_15d, visitas_30d, visitas_60d, visitas_90d,
  link_anuncio, dta_ultma_atz, email_seller
)
```

### Filtro padrão de canal
- Mercado Livre: `canal_venda = 1`
- Shopee (fase 2): `canal_venda = 2`

### RLS Pattern
```sql
-- Usuário só acessa dados dos sellers que tem permissão
WHERE email_seller IN (
  SELECT s.email FROM sellers s
  JOIN user_seller_permissions p ON p.seller_id = s.id
  WHERE p.user_id = auth.uid()
)
```

---

## Páginas do Sistema

| Rota | Página | Status |
|------|--------|--------|
| `/login` | Login glassmorphism verde | Mockup aprovado |
| `/` | Resumo de Vendas (KPIs + gráfico + tabela) | Mockup aprovado |
| `/vendas` | Listagem completa de pedidos + filtros | A construir |
| `/anuncios` | Performance por anúncio | A construir |
| `/visitas` | Funil visitas × conversão | A construir |
| `/catalogo` | Análise catálogo mapeado + Export Excel | Mockup aprovado |
| `/admin/usuarios` | Gestão de usuários | A construir |
| `/admin/sellers` | Gestão de sellers | A construir |

---

## Regras de Desenvolvimento

1. **Sempre seguir o design system** — glassmorphism verde em todas as páginas novas
2. **Verificar o spec** em `docs/superpowers/specs/` antes de criar novas funcionalidades
3. **Consultar os mockups** em `docs/mockups/` para referência visual
4. **Canal Fase 1 = ML apenas** — filtrar sempre `canal_venda = 1` até fase 2
5. **Sem auto-cadastro** — auth só via admin
6. **Export Excel** usa a biblioteca `xlsx` (SheetJS), componente `ExportButton.tsx`
7. **RLS sempre ativo** no Supabase — nunca desabilitar nas tabelas de dados
8. **Scripts de migração** ficam em `scripts/` e são Python (psycopg2 para Postgres local, supabase-py para Supabase)

---

## Variáveis de Ambiente (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # só nos scripts de migração, nunca no frontend
```

---

## Contato e Contexto

- **Projeto:** GRUPO ATC — sistema interno + SaaS para outros sellers
- **Email admin:** atcsuportee@gmail.com
- **Outros projetos no DEV:** `web_grupo_atc` (Flask), `projeto_crm`, `shopee_dev`
- **Banco local:** PostgreSQL via DBeaver
- **Dados origem:** view `vb_final_catalogo_joga_para_drive_server_ofc` e outras tabelas locais
