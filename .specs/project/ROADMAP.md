# Roadmap

**Current Milestone:** M1 — MVP Funcional  
**Status:** Planning

---

## M1 — MVP Funcional

**Goal:** Usuário consegue cadastrar contatos, criar uma mensagem e disparar para a lista, vendo o status de cada envio.  
**Target:** Projeto pronto para uso interno

### Features

**Infraestrutura & Auth** — PLANNED

- Setup Next.js 14 + TypeScript + Tailwind
- Supabase: banco de dados + autenticação
- Deploy Vercel + repositório GitHub
- Configuração da WhatsApp Business Cloud API (Meta)

**Gestão de Contatos** — PLANNED

- Listar contatos (nome, número, ativo/inativo)
- Adicionar contato manualmente
- Editar / remover contato
- Importar contatos via Excel (.xlsx) ou CSV com mapeamento de colunas e preview antes de confirmar

**Campanhas & Mensagens** — PLANNED

- Criar campanha com nome e mensagem de texto
- Editar campanha
- Suporte a variáveis simples (ex: `{{nome}}`)
- Upload de imagem do produto (enviada diretamente no WhatsApp via media message)
- Upload de folheto promocional pronto (imagem ou PDF) — armazenado no Supabase Storage
- Geração de link público do folheto para inserir na mensagem da campanha

**Disparo de Mensagens** — PLANNED

- Selecionar campanha e lista de contatos
- Iniciar disparo com confirmação
- Envio via WhatsApp Business Cloud API
- Fila de envio com controle de rate limit

**Acompanhamento de Status** — PLANNED

- Painel por campanha: contatos enviados / falhou / pendente
- Webhook da Meta para atualizar status (entregue/lido)
- Reenvio manual para os que falharam

---

## M2 — Qualidade & Operação

**Goal:** Tornar a operação mais robusta e segura para uso contínuo.

### Features

**Histórico de Campanhas** — PLANNED  
**Notificações de falha por e-mail** — PLANNED  
**Paginação e busca na lista de contatos** — PLANNED  
**Logs de auditoria (quem disparou o quê)** — PLANNED

---

## M3 — Funcionalidades Avançadas

**Goal:** Aumentar alcance e automação.

### Features

**Agendamento de campanhas** — PLANNED  
**Segmentação de contatos por tags** — PLANNED  
**Templates aprovados pela Meta (HSM)** — PLANNED  
**Relatórios de engajamento (entregues/lidos)** — PLANNED

---

## Considerações Futuras

- Suporte a mídia (imagem, PDF) nas mensagens
- Chatbot básico para responder mensagens recebidas
- Multi-empresa / multi-usuário com permissões
- Integração com CRM externo
