# M1 — MVP ZapZap Tasks

**Status:** In Progress  
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Supabase + Vercel + WhatsApp Business Cloud API

---

## Execution Plan

```
Phase 1 — Foundation (Sequential):
  T1 → T2 → T3 → T4

Phase 2 — Contatos + Campanhas (Parallel after T4):
  T4 complete, then:
    ├── T5 → T6 → T7         (Contatos: listagem → modal → API)
    ├── T8                    (Grupos)
    ├── T9                    (Importação Excel)
    ├── T10                   (Campanhas: listagem)
    └── T11 → T12 → T13 → T14 → T15 → T16 → T17  (Nova Campanha)

Phase 3 — Disparo (Sequential after T17):
  T18 → T19 → T20 → T21

Phase 4 — Status & Polish (after T20):
  T22 → T23 → T24 → T25
```

---

## Phase 1 — Foundation

### T1: Setup projeto Next.js + Tailwind + Supabase client

**What:** Criar projeto Next.js 14 com TypeScript, Tailwind, instalar dependências base  
**Where:** `C:\aplicativos\zapzap\` (raiz do projeto)  
**Depends on:** Nenhum  

**Comandos:**
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
npm install @supabase/supabase-js @supabase/ssr zod
```

**Done when:**
- [ ] `npm run dev` sobe sem erros em localhost:3000
- [ ] Tailwind funcionando (classe de cor aplicada)
- [ ] `.env.local` criado com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Repositório GitHub criado e primeiro commit feito

---

### T2: Criar schema do banco no Supabase

**What:** Criar todas as tabelas via migration SQL no Supabase  
**Where:** Supabase Dashboard (SQL Editor) + `supabase/migrations/001_initial.sql`  
**Depends on:** T1  

**Tabelas:**
```sql
-- profiles (usuários da empresa)
-- contact_groups (grupos: Maquiagem, Roupa Masculina, etc.)
-- contacts (nome, número, ativo, criado_em)
-- contact_group_members (N:N contatos ↔ grupos)
-- campaigns (nome, mensagem, status, público, custo_estimado)
-- campaign_sends (status por contato: pendente/enviado/entregue/lido/falhou)
-- media_files (imagens e folhetos com URL pública)
-- app_settings (token Meta, phone_id, waba_id)
```

**Done when:**
- [ ] Todas as tabelas criadas no Supabase
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS: usuário autenticado acessa apenas dados da própria empresa
- [ ] Foreign keys e indexes criados

---

### T3: Autenticação Supabase + middleware de rotas

**What:** Login/logout com Supabase Auth + proteção de todas as rotas do painel  
**Where:** `src/app/login/page.tsx`, `src/middleware.ts`, `src/lib/supabase/`  
**Depends on:** T2  

**Done when:**
- [ ] Tela de login funcional (email + senha)
- [ ] Rotas `/dashboard`, `/contatos`, `/campanhas`, etc. redirecionam para `/login` se não autenticado
- [ ] Logout funciona e limpa sessão
- [ ] `src/lib/supabase/client.ts` e `server.ts` criados

---

### T4: Layout base com sidebar de navegação

**What:** Layout raiz com sidebar fixa, tema dark Obsidian (#131313), verde WhatsApp (#25D366)  
**Where:** `src/app/(dashboard)/layout.tsx`, `src/components/sidebar.tsx`  
**Depends on:** T3  

**Itens da sidebar:** Dashboard, Contatos, Campanhas, Histórico de Envios, Configurações  

**Done when:**
- [ ] Sidebar renderiza em todas as páginas do painel
- [ ] Item ativo destacado com indicador verde
- [ ] Responsivo (sidebar recolhível)
- [ ] Fontes Manrope + Inter carregadas via `next/font`

---

## Phase 2A — Gestão de Contatos

### T5: Página listagem de contatos

**What:** Tabela de contatos com busca, filtro por grupo/status e paginação  
**Where:** `src/app/(dashboard)/contatos/page.tsx`, `src/components/contacts/contacts-table.tsx`  
**Depends on:** T4  

**Done when:**
- [ ] Lista contatos do Supabase com paginação (20 por página)
- [ ] Busca por nome ou número funciona
- [ ] Filtro por status (Ativo/Inativo) funciona
- [ ] Filtro por grupo funciona
- [ ] Coluna de grupos exibe badges coloridos

---

### T6: Modal criar/editar contato

**What:** Modal com formulário de cadastro/edição de contato  
**Where:** `src/components/contacts/contact-modal.tsx`  
**Depends on:** T5  

**Campos:** Nome completo, Número WhatsApp (+55), Status (toggle), Grupos (multi-select)  

**Done when:**
- [ ] Modal abre ao clicar "Novo Contato" ou ícone de editar
- [ ] Validação com Zod (número no formato +55XXXXXXXXXXX)
- [ ] Salva/atualiza no Supabase e atualiza a lista
- [ ] Toast de sucesso/erro exibido

---

### T7: API routes CRUD contatos

**What:** Endpoints Next.js para criar, listar, editar e excluir contatos  
**Where:** `src/app/api/contacts/route.ts`, `src/app/api/contacts/[id]/route.ts`  
**Depends on:** T2  

**Done when:**
- [ ] `GET /api/contacts` retorna lista paginada com filtros
- [ ] `POST /api/contacts` cria contato
- [ ] `PUT /api/contacts/[id]` atualiza contato
- [ ] `DELETE /api/contacts/[id]` remove contato
- [ ] Todas as rotas validam sessão autenticada

---

### T8: Gestão de grupos de contatos

**What:** Drawer lateral para criar/editar/excluir grupos e associar contatos a grupos  
**Where:** `src/components/contacts/groups-drawer.tsx`, `src/app/api/groups/route.ts`  
**Depends on:** T5  

**Done when:**
- [ ] Drawer abre ao clicar "Gerenciar Grupos"
- [ ] CRUD de grupos (criar com nome + cor, editar, excluir)
- [ ] Contador de contatos por grupo atualizado em tempo real
- [ ] Na edição de contato (T6), multi-select de grupos funciona

---

### T9: Importação de contatos via Excel

**What:** Modal 3 etapas: upload `.xlsx` → mapear colunas → confirmar importação  
**Where:** `src/components/contacts/import-excel-modal.tsx`, `src/app/api/contacts/import/route.ts`  
**Depends on:** T6  
**Lib:** `xlsx` (SheetJS)  

**Done when:**
- [ ] Upload de arquivo `.xlsx` ou `.csv` funciona
- [ ] Sistema detecta colunas do arquivo automaticamente
- [ ] Usuário mapeia "Nome" e "Número" para as colunas corretas
- [ ] Preview mostra 3 linhas de exemplo + count válidos/inválidos
- [ ] Importação salva contatos válidos em batch no Supabase
- [ ] Duplicados (mesmo número) são ignorados com aviso

---

## Phase 2B — Campanhas

### T10: Página listagem de campanhas

**What:** Grid de cards de campanhas com status, filtros por tab e ações  
**Where:** `src/app/(dashboard)/campanhas/page.tsx`, `src/components/campaigns/campaign-card.tsx`  
**Depends on:** T4  

**Status:** Em Andamento (azul) | Concluída (verde) | Rascunho (cinza) | Com Falhas (vermelho)  

**Done when:**
- [ ] Grid 3 colunas com cards de campanha
- [ ] Tabs: Todas / Em Andamento / Concluídas / Rascunhos / Com Falhas
- [ ] Barra de progresso de envio por card
- [ ] Botões contextuais por status (Pausar, Duplicar, Editar, Reenviar falhas)

---

### T11: Formulário de nova campanha — texto e variáveis

**What:** Formulário com nome da campanha, textarea de mensagem e chips de variáveis  
**Where:** `src/app/(dashboard)/campanhas/nova/page.tsx`, `src/components/campaigns/campaign-form.tsx`  
**Depends on:** T10  

**Variáveis suportadas:** `{{nome}}`, `{{link}}`  

**Done when:**
- [ ] Campo nome da campanha com validação
- [ ] Textarea com contador de caracteres
- [ ] Chips clicáveis inserem `{{variável}}` na posição do cursor
- [ ] Estado do formulário gerenciado (React Hook Form ou useState)

---

### T12: Upload de imagem do produto

**What:** Área drag-and-drop para upload de imagem, armazenada no Supabase Storage  
**Where:** `src/components/campaigns/product-image-upload.tsx`, `src/app/api/upload/image/route.ts`  
**Depends on:** T11  

**Done when:**
- [ ] Drag-and-drop ou clique para selecionar imagem (jpg/png/webp, max 5MB)
- [ ] Preview da imagem após upload
- [ ] Imagem salva no bucket `product-images` do Supabase Storage
- [ ] URL pública retornada e salva no estado do formulário

---

### T13: Upload de folheto + geração de link público

**What:** Upload do folheto (PDF ou imagem) + rota pública `/f/[slug]` para visualizar  
**Where:** `src/components/campaigns/flyer-upload.tsx`, `src/app/f/[slug]/page.tsx`, `src/app/api/upload/flyer/route.ts`  
**Depends on:** T11  

**Done when:**
- [ ] Upload de PDF ou imagem aceito (max 20MB)
- [ ] Slug único gerado (ex: `promo-abc123`)
- [ ] Rota pública `/f/[slug]` exibe o folheto sem autenticação
- [ ] Badge "Link gerado" com URL copiável exibido no formulário
- [ ] Folheto salvo no bucket `flyers` do Supabase Storage

---

### T14: Seleção de público da campanha

**What:** Componente de seleção: Todos / Seleção Manual / Filtrar por Grupo  
**Where:** `src/components/campaigns/audience-selector.tsx`  
**Depends on:** T8  

**Done when:**
- [ ] 3 opções em radio cards visuais
- [ ] "Todos": mostra total de contatos ativos
- [ ] "Por Grupo": dropdown com grupos disponíveis + count por grupo
- [ ] "Seleção Manual": tabela com busca e checkboxes
- [ ] Contador de contatos selecionados atualizado dinamicamente

---

### T15: Card de estimativa de custo

**What:** Cálculo em tempo real do custo estimado com base nos contatos selecionados  
**Where:** `src/components/campaigns/cost-estimate-card.tsx`  
**Depends on:** T14  

**Fórmula:** `contatos_selecionados × R$ 0,13` (marketing Brasil — Meta)  

**Done when:**
- [ ] Custo atualiza em tempo real ao mudar público
- [ ] Exibe: contatos, tipo (Marketing), custo/conversa, total em destaque verde
- [ ] Aviso sobre cobrança por conversa de 24h
- [ ] Link para tabela de preços Meta

---

### T16: Preview de celular WhatsApp

**What:** Componente visual de smartphone Android com simulação do chat WhatsApp  
**Where:** `src/components/campaigns/whatsapp-phone-preview.tsx`  
**Depends on:** T11, T12, T13  

**Done when:**
- [ ] Mockup de celular Android renderizado em CSS/SVG
- [ ] Interface WhatsApp interna: header verde, fundo de chat, balão de mensagem
- [ ] Imagem do produto exibida no balão (se carregada)
- [ ] Texto da mensagem com `{{nome}}` substituído por "João"
- [ ] Link do folheto exibido em azul no balão
- [ ] Atualiza em tempo real conforme o formulário é preenchido

---

### T17: API routes CRUD campanhas

**What:** Endpoints para criar, listar, editar e buscar campanhas  
**Where:** `src/app/api/campaigns/route.ts`, `src/app/api/campaigns/[id]/route.ts`  
**Depends on:** T2  

**Done when:**
- [ ] `GET /api/campaigns` retorna lista com status e progresso
- [ ] `POST /api/campaigns` cria campanha (rascunho)
- [ ] `PUT /api/campaigns/[id]` atualiza campanha
- [ ] `DELETE /api/campaigns/[id]` remove rascunho
- [ ] Retorna contagem de enviados/falhas/pendentes por campanha

---

## Phase 3 — Disparo

### T18: Tela de configurações + salvar credenciais Meta

**What:** Tela para inserir e salvar Token, Phone ID, WABA ID da Meta  
**Where:** `src/app/(dashboard)/configuracoes/page.tsx`, `src/app/api/settings/route.ts`  
**Depends on:** T4  

**Done when:**
- [ ] Formulário com todos os campos da Meta API
- [ ] Credenciais salvas encriptadas na tabela `app_settings`
- [ ] Botão "Testar Conexão" chama Meta API e exibe badge Conectado/Falhou
- [ ] URL e token do webhook exibidos para copiar
- [ ] Configurações de rate limit salvas (intervalo ms, máx/hora)

---

### T19: Serviço de envio via WhatsApp Business API

**What:** Função que envia uma mensagem (texto + imagem) para um número via Meta Cloud API  
**Where:** `src/lib/whatsapp/send-message.ts`  
**Depends on:** T18  

**Done when:**
- [ ] Envia mensagem de texto simples para um número
- [ ] Envia mensagem com imagem (media message)
- [ ] Substitui variáveis `{{nome}}` pelo valor real do contato
- [ ] Retorna `{ success: boolean, messageId?: string, error?: string }`
- [ ] Trata erros da Meta API (rate limit, número inválido, token expirado)

---

### T20: Fila de disparo com rate limiting

**What:** Endpoint que processa o disparo de uma campanha para N contatos com controle de taxa  
**Where:** `src/app/api/campaigns/[id]/dispatch/route.ts`, `src/lib/whatsapp/dispatch-queue.ts`  
**Depends on:** T19  

**Done when:**
- [ ] `POST /api/campaigns/[id]/dispatch` inicia o disparo
- [ ] Cria registros em `campaign_sends` com status `pendente` para cada contato
- [ ] Processa envios com intervalo configurável entre mensagens (default 1000ms)
- [ ] Atualiza status de cada envio (enviado/falhou) no Supabase em tempo real
- [ ] Campanha muda status para "Em Andamento" durante disparo e "Concluída" ao finalizar

---

### T21: Webhook Meta para atualização de status

**What:** Endpoint público que recebe callbacks da Meta e atualiza status de entrega/leitura  
**Where:** `src/app/api/webhook/route.ts`  
**Depends on:** T20  

**Done when:**
- [ ] `GET /api/webhook` responde ao challenge de verificação da Meta
- [ ] `POST /api/webhook` processa eventos `messages`, `message_deliveries`, `message_reads`
- [ ] Atualiza `campaign_sends.status` para `entregue` ou `lido` conforme o evento
- [ ] Valida assinatura HMAC do webhook (segurança)

---

## Phase 4 — Status & Polish

### T22: Página histórico de envios

**What:** Tabela com status individual por contato/campanha com filtros  
**Where:** `src/app/(dashboard)/historico/page.tsx`  
**Depends on:** T21  

**Done when:**
- [ ] Tabela com colunas: Nome, Número, Campanha, Data, Status (badge), Ações
- [ ] Filtros: por campanha, por status, busca por nome/número
- [ ] Cards de resumo no topo (total/enviados/entregues/lidos/falhas)
- [ ] Exportar CSV funcional

---

### T23: Reenvio de mensagens que falharam

**What:** Botão "Reenviar falhas" que re-processa apenas os contatos com status `falhou`  
**Where:** `src/app/api/campaigns/[id]/retry/route.ts`, botão em `campaign-card.tsx` e `historico/page.tsx`  
**Depends on:** T22  

**Done when:**
- [ ] `POST /api/campaigns/[id]/retry` reenvia apenas os `falhou`
- [ ] Status volta para `pendente` antes de reenviar
- [ ] Botão "Reenviar falhas" visível apenas em campanhas com falhas
- [ ] Contador de falhas atualizado após reenvio

---

### T24: Dashboard com métricas e gráfico

**What:** Página dashboard com cards de resumo e gráfico de envios dos últimos 7 dias  
**Where:** `src/app/(dashboard)/dashboard/page.tsx`  
**Depends on:** T22  

**Done when:**
- [ ] Cards: Total Contatos, Campanhas Ativas, Mensagens Hoje, Taxa de Sucesso
- [ ] Tabela de últimas 5 campanhas com status
- [ ] Gráfico de barras (últimos 7 dias) usando dados reais do Supabase

---

### T25: Deploy Vercel + variáveis de ambiente

**What:** Configurar deploy automático no Vercel conectado ao repositório GitHub  
**Where:** Vercel Dashboard + `.env.local` → Vercel Environment Variables  
**Depends on:** T24  

**Variáveis necessárias:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
META_WEBHOOK_VERIFY_TOKEN
NEXT_PUBLIC_APP_URL
```

**Done when:**
- [ ] Push para `main` faz deploy automático no Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] URL de produção funcionando
- [ ] Webhook Meta configurado com URL de produção

---

## Resumo

| Total | Phase 1 | Phase 2A | Phase 2B | Phase 3 | Phase 4 |
|-------|---------|----------|----------|---------|---------|
| 25 tarefas | T1-T4 | T5-T9 | T10-T17 | T18-T21 | T22-T25 |
