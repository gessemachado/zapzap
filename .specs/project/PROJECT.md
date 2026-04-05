# ZapZap — Disparador de Marketing via WhatsApp

**Vision:** Aplicação web para empresas enviarem mensagens de marketing para listas de clientes via WhatsApp Business API, com suporte a imagem de produto, link para folheto promocional e acompanhamento de status.  
**For:** Uso interno da empresa — operadores que gerenciam campanhas e listas de clientes.  
**Solves:** Elimina o envio manual de mensagens de marketing, centralizando listas de contatos, criação de mensagens e acompanhamento de disparos em uma única interface.

## Goals

- Enviar mensagens de marketing para N contatos com 1 clique, reduzindo tempo de operação de horas para minutos.
- Rastrear 100% dos envios (sucesso/falha) por campanha para garantir que nenhum cliente seja esquecido.

## Tech Stack

**Core:**

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- Deploy: Vercel (servidor) + execução local via `next dev`

**Key dependencies:**

- `@supabase/supabase-js` — client do banco de dados e storage (arquivos)
- WhatsApp Business API (Meta Cloud API) — envio de mensagens com mídia
- `@supabase/auth-helpers-nextjs` — autenticação
- Tailwind CSS — estilização
- Zod — validação de formulários

## Scope

**v1 inclui:**

- Cadastro e gerenciamento de lista de contatos (nome + número), com importação via Excel (.xlsx) ou CSV
- Criação e edição de mensagens de marketing com texto e variáveis (`{{nome}}`)
- Upload de **imagem do produto** enviada diretamente no WhatsApp ao cliente
- Upload de **folheto promocional** (imagem ou PDF) com geração de link público para incluir na mensagem
- Disparo de mensagem para toda a lista ou grupos selecionados
- Acompanhamento de status por envio (enviado / falhou / pendente)
- Autenticação básica (login para proteger o painel)

**Explicitamente fora do escopo:**

- Agendamento automático de campanhas (futuro)
- Respostas / chatbot (futuro)
- Múltiplas contas WhatsApp
- App mobile nativo
- Relatórios avançados / analytics

## Constraints

- Timeline: sem prazo fixo
- Technical: WhatsApp Business API exige conta Meta Business verificada com número aprovado
- Deploy: Vercel (produção) + local (`next dev`) para desenvolvimento
- Repositório: GitHub
