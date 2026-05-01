# 📖 Manual do Administrador — solucoesrkm.com

Guia completo para administradores da landing page corporativa.  
Tudo que pode ser feito pelo painel admin, sem precisar de código.

> **Acesso**: `https://solucoesrkm.com/admin/settings`  
> **Roles**: EDITOR, ADMIN ou SUPERADMIN

---

## Sumário

1. [Acessar o Painel](#1-acessar-o-painel)
2. [Editar Textos da Landing](#2-editar-textos-da-landing)
3. [Gerenciar Features e Seções](#3-gerenciar-features-e-seções)
4. [Configurar Preços e Planos](#4-configurar-preços-e-planos)
5. [Gerenciar FAQ e Depoimentos](#5-gerenciar-faq-e-depoimentos)
6. [Configurar Freshdesk / Suporte](#6-configurar-freshdesk--suporte)
7. [Sincronizar Artigos de Help](#7-sincronizar-artigos-de-help)
8. [Histórico de Alterações](#8-histórico-de-alterações)
9. [Gerenciar API Keys](#9-gerenciar-api-keys)
10. [Configurar Tradução Automática](#10-configurar-tradução-automática)

---

## 1. Acessar o Painel

1. Acesse `https://solucoesrkm.com/admin/login`
2. Use seu email e senha corporativos
3. Após login, você será redirecionado para `/admin/settings`

**Perda de acesso?** Contate o SUPERADMIN ou use o script de reset via Prisma Studio.

---

## 2. Editar Textos da Landing

Em **Admin → Configurações → Landing Page**:

### Hero (Topo da Página)

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| **Título** | Headline principal (H1) | `Tracka` |
| **Subtítulo** | Frase de impacto abaixo do título | `Inventário inteligente para sua casa` |
| **Texto do botão CTA primário** | Botão verde de ação | `Começar Grátis` |
| **Texto do botão CTA secundário** | Link de features | `Ver funcionalidades` |
| **Badge "NOVO"** | Pílula de destaque no topo | `NOVO` |
| **Badge subtítulo** | Texto ao lado do badge | `Inventário inteligente` |

### Seção de Preços

| Campo | Descrição |
|-------|-----------|
| **Título da seção** | Aparece antes dos cards de planos |
| **Subtítulo** | Descrição da seção |
| **Label "Incluído"** | Texto de "O que está incluído" nos cards |
| **Label de herança** | `"Tudo do {plan}, mais:"` |

### Rodapé (CTA Final)

| Campo | Descrição |
|-------|-----------|
| **Título** | Headline final de conversão |
| **Subtítulo** | Frase de reforço |
| **Texto do botão** | CTA de ação final |

---

## 3. Gerenciar Features e Seções

Em **Admin → Configurações → Features**:

### Ativar/Desativar Seções

Cada seção da landing pode ser habilitada ou desabilitada:

| Toggle | Efeito |
|--------|--------|
| **Mostrar seção Hero** | Mostra/oculta o topo com título e CTAs |
| **Mostrar Preços** | Mostra/oculta os cards de planos |
| **Mostrar Depoimentos** | Mostra/oculta a seção de testemunhos |
| **Mostrar FAQ** | Mostra/oculta perguntas frequentes |
| **Mostrar Features** | Mostra/oculta a grade de funcionalidades |
| **Mostrar CTA Final** | Mostra/oculta o banner de conversão no rodapé |

### Feature Cards

Cada feature card tem:
- **Ícone** (seletor de ícones Lucide)
- **Título** — nome da feature
- **Descrição** — aparece no hover (desktop) ou sempre (mobile)
- **Destaque** — se marcado, o card ocupa mais espaço (`wide`)

**Ordem**: drag & drop para reordenar os cards.

---

## 4. Configurar Preços e Planos

> **Importante**: os preços e limites dos planos são definidos no **admin do Tracka** (`tracka.solucoesrkm.com/admin`). O que configura aqui é a **visibilidade** de features por plano na landing.

Em **Admin → Configurações → Pricing**:

### Visibilidade de Features

Para cada plano, você pode definir quais features aparecem no card:
1. Clique no plano a editar
2. Marque/desmarque as features que devem aparecer
3. Salve — a landing reflete em até 60 segundos

### Ativar Enterprise

O plano Enterprise é exibido automaticamente quando ativo no Tracka.  
Se o admin ativar o Enterprise lá, ele aparece na landing em até 60 segundos.

**Automático**: herança de planos é calculada em tempo real (ex: `"Tudo do Pro, mais: Suporte prioritário"`).

---

## 5. Gerenciar FAQ e Depoimentos

### FAQ

Em **Admin → Configurações → FAQ**:

1. Clique em **+ Adicionar pergunta**
2. Preencha **Pergunta** (PT e EN)
3. Preencha **Resposta** (PT e EN)
4. Use as setas ↑↓ para reordenar
5. Clique em 🗑 para remover

**Dica**: máximo de 10 perguntas recomendado para manter a página limpa.

### Depoimentos

Em **Admin → Configurações → Depoimentos**:

| Campo | Descrição |
|-------|-----------|
| **Nome** | Nome do cliente |
| **Cargo/Empresa** | Ex: `"Gerente de compras, Casa Silva"` |
| **Depoimento** | Texto livre (max 200 chars para exibição limpa) |
| **Foto** | URL de imagem (Cloudinary ou CDN próprio) |
| **Destaque** | Aparece em posição proeminente |

---

## 6. Configurar Freshdesk / Suporte

Em **Admin → Configurações → Suporte**:

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| **API Key** | ✅ | Gerada em `Freshdesk → Perfil → API` |
| **Domain** | ✅ | Seu subdomínio Freshdesk: `seuapp.freshdesk.com` |
| **Widget ID** | ✅ | ID do widget no Freshdesk → Admin → Widgets |
| **Locale padrão** | ✅ | `pt` ou `en` — idioma dos artigos no Freshdesk |

### Verificar Conexão

Após preencher, clique em **Testar Conexão**. O sistema valida a API Key e retorna o número de artigos encontrados.

---

## 7. Sincronizar Artigos de Help

O sistema sincroniza os tópicos de help do Tracka com os artigos do Freshdesk.

### Sync Automático

Ocorre todos os dias às **03:30 UTC (00:30 BRT)** via Cron.

### Sync Manual

Em **Admin → Help → Sincronizar**:
1. Selecione o locale (`PT` ou `EN`)
2. Clique em **Sincronizar agora**
3. Aguarde — o resultado aparece:
   - ✅ `X artigos atualizados`
   - ⚠️ `Y artigos ignorados (sem alteração)`
   - ❌ `Z erros`

### Status dos Artigos

| Status | Significado |
|--------|-------------|
| 🟢 **Sincronizado** | Artigo no Freshdesk está atualizado |
| 🟡 **Pendente** | Conteúdo local mudou, aguarda próximo sync |
| 🔴 **Erro** | Falhou na última tentativa — ver logs |
| ⚫ **Rascunho** | Novo tópico ainda não sincronizado |

---

## 8. Histórico de Alterações

Em **Admin → Histórico**:

### Como funciona

Toda alteração feita pelo painel gera uma entrada no histórico com:
- **Data/hora** da alteração
- **Usuário** que alterou (email)
- **Campos alterados** — antes e depois
- API keys aparecem mascaradas (`****`) por segurança

### Reverter alteração

O histórico é **apenas leitura** — não há "desfazer" automático.  
Para reverter, copie o valor anterior e cole no campo correspondente manualmente.

> **Rotação**: as últimas 30 entradas são mantidas. Mais antigas são removidas automaticamente.

---

## 9. Gerenciar API Keys

> **Role necessária**: ADMIN ou SUPERADMIN

Em **Admin → Configurações → API Keys**:

| Key | Para que serve |
|-----|----------------|
| **Google Places API Key** | Autocompletar de endereços (se usado) |
| **Tracka Landing API Key** | Autenticar a leitura de planos do Tracka |

**Segurança**: as keys são mascaradas na UI e no histórico. Após salvar, não é possível ver o valor completo.

---

## 10. Configurar Tradução Automática

> **Role necessária**: ADMIN ou SUPERADMIN

Em **Admin → Configurações → Tradução**:

1. Selecione o provider: **Google Translate** ou **DeepL**
2. Informe a API Key do provider
3. Habilite a tradução automática
4. Nos formulários de edição, clique em 🔄 ao lado dos campos EN para traduzir do PT automaticamente

> **Nota**: a tradução automática é sugestão — sempre revisar antes de salvar.

---

## 11. Dicas de Boas Práticas

- **Prefira textos curtos**: títulos e subtítulos são mais eficazes com ≤ 80 caracteres
- **Sempre preencha PT e EN**: a landing é bilíngue — deixar EN em branco exibe o texto em PT para usuários EN
- **Verifique o histórico** antes de grandes mudanças — você pode ver o que foi alterado por quem
- **Sync Freshdesk**: após grandes atualizações de help, faça um sync manual para não aguardar o cron noturno
- **API Keys**: nunca compartilhe as API keys por email — use o campo de API Keys do admin exclusivamente
