# ATC BI Analytics — Design Spec

**Data:** 2026-05-29  
**Status:** Aprovado pelo usuário  
**Stack:** Next.js 14 + Supabase + Vercel

---

## 1. Visão Geral

Plataforma SaaS de Business Intelligence para sellers do Mercado Livre (e futuramente Shopee). Permite que múltiplos sellers acessem dados de vendas, anúncios e conversão em um painel web centralizado. Administrado centralmente — o admin conecta as contas e cria os logins dos sellers.

**Fase 1 (este spec):** Mercado Livre (`canal_venda = 1`) apenas.  
**Fase futura:** Shopee (`canal_venda = 2`) e outros canais.

---

## 2. Usuários e Permissões

### Papéis
| Papel | Descrição |
|-------|-----------|
| `admin` | Cria usuários, cadastra sellers, atribui permissões |
| `viewer` | Acessa apenas os sellers que o admin liberou |

### Fluxo de acesso
1. Admin cria conta do usuário no Supabase Auth (email + senha)
2. Admin associa o usuário a um ou mais sellers na tabela `user_seller_permissions`
3. Usuário faz login → vê apenas os sellers autorizados
4. Usuário seleciona o seller ativo via dropdown na sidebar
5. Todos os dados são filtrados pelo seller ativo + `canal_venda = 1`

**Não há auto-cadastro.** O link da tela de login informa: _"Entre em contato com o administrador para solicitar acesso."_

---

## 3. Modelo de Dados (Supabase)

### Tabelas de controle (gerenciadas pelo sistema)

```sql
-- Sellers cadastrados
CREATE TABLE sellers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text UNIQUE NOT NULL,   -- identificador único do seller nos dados
  nome        text NOT NULL,
  ativo       boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- Permissões: qual usuário pode ver qual seller
CREATE TABLE user_seller_permissions (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id  uuid REFERENCES sellers(id) ON DELETE CASCADE,
  role       text DEFAULT 'viewer',
  PRIMARY KEY (user_id, seller_id)
);
```

### Tabelas de dados (migradas do PostgreSQL local)

```sql
-- Vendas/Pedidos
CREATE TABLE vendas (
  id            bigserial PRIMARY KEY,
  email_seller  text NOT NULL,        -- FK lógica para sellers.email
  canal_venda   int NOT NULL,         -- 1=ML, 2=Shopee
  pedido_id     text,
  data_pedido   date NOT NULL,
  produto       text,
  valor         numeric(12,2),
  status        text,
  -- demais colunas da sua tabela atual
  created_at    timestamptz DEFAULT now()
);

-- Anúncios / Items
CREATE TABLE anuncios (
  id            bigserial PRIMARY KEY,
  email_seller  text NOT NULL,
  canal_venda   int NOT NULL,
  item_id       text,
  titulo        text,
  visitas       int DEFAULT 0,
  vendas        int DEFAULT 0,
  faturamento   numeric(12,2) DEFAULT 0,
  updated_at    timestamptz DEFAULT now()
);
```

### Row Level Security (RLS)
Cada query do frontend é automaticamente filtrada pelo Supabase:

```sql
-- Usuário só vê vendas de sellers que tem permissão
CREATE POLICY "vendas_by_permission" ON vendas
  FOR SELECT USING (
    email_seller IN (
      SELECT s.email FROM sellers s
      JOIN user_seller_permissions p ON p.seller_id = s.id
      WHERE p.user_id = auth.uid()
    )
  );
```

---

## 4. Arquitetura

```
Vercel (Next.js 14 App Router)
  ├── app/(auth)/login          → Tela de login
  ├── app/(dashboard)/          → Layout com sidebar + topbar
  │   ├── page.tsx              → Resumo de vendas
  │   ├── vendas/               → Listagem e filtros de pedidos
  │   ├── anuncios/             → Performance por anúncio
  │   └── visitas/              → Funil visitas × conversão
  └── app/admin/                → Gestão de usuários e sellers (só admin)

Supabase
  ├── Auth                      → Login/senha, sessão JWT
  ├── PostgreSQL                → Todas as tabelas
  ├── RLS Policies              → Filtro automático por seller
  └── Storage (futuro)          → Exportações PDF/Excel
```

**Fluxo de dados:**
1. Dados migram do PostgreSQL local → Supabase via script Python ou `pg_dump + restore`
2. Next.js faz queries diretamente no Supabase usando `@supabase/ssr`
3. Middleware Next.js valida sessão em todas as rotas protegidas
4. Sem backend próprio — Supabase é o BFF

---

## 5. Páginas e Funcionalidades

### 5.1 Login (`/login`)
- Design: glassmorphism, painel esquerdo verde esmeralda, formulário branco à direita
- Campos: e-mail + senha
- Link "Esqueci minha senha" → Supabase reset por e-mail
- Sem link de cadastro (acesso restrito)

### 5.2 Resumo de Vendas (`/`)
- KPI cards: Faturamento total, Nº de pedidos, Ticket médio, Taxa de conversão
- Variação vs período anterior (mês/semana anterior)
- Gráfico de barras: vendas por dia no período
- Top 5 anúncios por faturamento (com mini barra de progresso)
- Tabela: últimos pedidos (pedido, produto, canal, data, valor, status)
- Filtros: seletor de período (mês atual por padrão) + seller ativo (na sidebar)

### 5.3 Vendas (`/vendas`)
- Tabela completa de pedidos com paginação
- Filtros: período, status, busca por produto/pedido
- Métricas agregadas no topo (mesmo que resumo, para o período filtrado)
- Exportação futura: CSV/Excel

### 5.4 Anúncios (`/anuncios`)
- Tabela de anúncios com: título, visitas, pedidos, conversão (%), faturamento
- Ordenação por qualquer coluna
- Destaque visual para anúncios com conversão abaixo da média
- Filtro por período

### 5.5 Visitas × Vendas (`/visitas`)
- Tabela/gráfico mostrando funil por anúncio: visitas → pedidos → conversão
- Ranking de melhor e pior conversão
- Filtro por período

### 5.6 Admin — Usuários (`/admin/usuarios`)
- Listar usuários cadastrados
- Criar novo usuário (nome, email, senha temporária)
- Atribuir/remover acesso a sellers
- Desativar usuário

### 5.7 Admin — Sellers (`/admin/sellers`)
- Listar sellers cadastrados
- Cadastrar novo seller (nome, email identificador)
- Ativar/desativar seller

---

## 6. Design System

| Token | Valor |
|-------|-------|
| Cor primária | `#059669` (verde esmeralda) |
| Cor secundária | `#0d9488` (teal) |
| Cor escura | `#065f46` |
| Background | `linear-gradient(135deg, #f0fdf4, #ecfdf5, #e0f2fe)` |
| Cards | `rgba(255,255,255,0.90)`, border `rgba(5,150,105,0.10)` |
| Sidebar | `rgba(255,255,255,0.75)`, `backdrop-filter: blur(16px)` |
| Font | Inter (400–900) |
| Border radius | cards: 14px, botões: 10px, inputs: 10px |
| Sombra card | `0 2px 8px rgba(0,0,0,0.04)` |

Estilo aprovado: **Glassmorphism Light** com acento verde esmeralda.

---

## 7. Tecnologias e Serviços

| Camada | Tecnologia | Plano gratuito |
|--------|-----------|---------------|
| Frontend | Next.js 14 (App Router, TypeScript) | — |
| Estilização | Tailwind CSS + shadcn/ui | — |
| Banco de dados | Supabase (PostgreSQL) | 500 MB / 50k req/mês |
| Autenticação | Supabase Auth | 50k MAU |
| Hospedagem | Vercel | Hobby plan |
| Gráficos | Recharts | — |
| Ícones | Lucide React | — |

**Custo inicial: R$ 0** — todos os serviços no plano gratuito.

---

## 8. Migração de Dados

Script Python para migrar do PostgreSQL local para Supabase:

```
scripts/
  migrate_vendas.py       # migra tabela de vendas
  migrate_anuncios.py     # migra tabela de anúncios
```

Passos:
1. Criar tabelas no Supabase (SQL Editor)
2. Rodar scripts de migração com `DATABASE_URL` local e `SUPABASE_URL` + `SERVICE_ROLE_KEY`
3. Ativar RLS nas tabelas
4. Testar queries via Supabase Table Editor

---

## 9. Fora do Escopo (Fase 1)

- Integração direta com API do Mercado Livre (OAuth)
- Canal Shopee (fase 2)
- Exportação PDF/Excel
- Notificações por email
- Planos/billing para sellers
- Modo escuro
