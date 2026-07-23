# 🚀 Guia de Deploy — Vercel

Passo a passo para fazer deploy do `solucoesrkm.com` na Vercel.

---

## 1. Pré-requisitos

- Conta Vercel com acesso ao projeto
- Banco Turso criado (separado do Turso do Tracka)
- Projeto Tracka deployado em `tracka.solucoesrkm.com`
- API Key de integração gerada no admin do Tracka

---

## 2. Variáveis de Ambiente

Configure em **Vercel → Project → Settings → Environment Variables**:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | `libsql://seu-db.turso.io` |
| `TURSO_AUTH_TOKEN` | ✅ | Token de autenticação Turso |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://tracka.solucoesrkm.com` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://solucoesrkm.com` (URL da própria landing; usada em SEO/canonical) |
| `JWT_SECRET` | ✅ | Mínimo 32 chars — `openssl rand -base64 32` |
| `TRACKA_API_URL` | ✅ | `https://tracka.solucoesrkm.com` |
| `TRACKA_LANDING_API_KEY` | ✅ | Gerada no admin do Tracka → API Keys. Enviada no header `x-api-key` p/ buscar os planos. Ver **§10** para o que a API faz e o passo a passo. |
| `FRESHDESK_API_KEY` | ⚪ | Necessária para sync com Freshdesk |
| `FRESHDESK_DOMAIN` | ⚪ | Domínio da conta Freshdesk (usado no sync) |
| `CRON_SECRET` | ⚪ | Protege o endpoint `/api/cron/freshdesk-sync` |

> ⚠️ `JWT_SECRET` deve ser diferente entre `staging` e `production` para evitar conflito de sessões.

---

## 3. Primeiro Deploy

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm install -g vercel

# 2. Fazer login
vercel login

# 3. Linkar ao projeto (apenas na primeira vez)
vercel link

# 4. Deploy de produção
vercel --prod
```

---

## 4. Configurar Domínio

Em **Vercel → Project → Settings → Domains**:
1. Adicionar `solucoesrkm.com`
2. Adicionar `www.solucoesrkm.com` (redirect para raiz)
3. Configurar DNS no seu registrador conforme instruções da Vercel

---

## 5. Banco de Dados — Primeiro Setup

Após criar o banco Turso e configurar as env vars:

```bash
# Sincroniza o schema com o banco
npx prisma db push

# Verifica se as tabelas foram criadas
npx prisma studio
```

### Seed de usuário admin

Crie o primeiro usuário admin manualmente via Prisma Studio ou script:

```typescript
// scripts/seed-admin.mjs
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const email = 'admin@solucoesrkm.com';
const password = 'SuaSenhaForte123!';

const user = await prisma.user.create({
    data: {
        email,
        name: 'Admin',
        passwordHash: await bcrypt.hash(password, 12),
        role: 'SUPERADMIN',
        employee: {
            create: { role: 'SUPERADMIN' },
        },
    },
});

console.log('Admin criado:', user.id);
await prisma.$disconnect();
```

```bash
node scripts/seed-admin.mjs
```

---

## 6. Vercel Cron Job

O cron de sync com Freshdesk está configurado em `vercel.json`:

```json
{
    "crons": [
        {
            "path": "/api/cron/freshdesk-sync",
            "schedule": "30 3 * * *"
        }
    ]
}
```

- **Horário**: 03:30 UTC diariamente (00:30 BRT)
- **Autenticação**: header `Authorization: Bearer {CRON_SECRET}`
- **Verificação**: acesse a aba **Cron Jobs** no dashboard da Vercel para ver execuções

---

## 7. Deploy Contínuo (CI/CD)

O `.github/workflows/` pode ter um workflow de deploy automático. Caso não tenha:

1. Em Vercel, conecte o repositório GitHub
2. Configure:
   - **Production Branch**: `main`
   - **Preview Branch**: `develop` (opcional)
3. A cada push para `main`, o deploy é automático

---

## 8. Troubleshooting

### Build falha com "Cannot find module"

```bash
# Verificar se as dependências estão corretas
npm install
npx tsc --noEmit
```

### Erro "Invalid DATABASE_URL"

- Verificar se `DATABASE_URL` é `libsql://` (não `sqlite://`)
- Verificar se `DATABASE_AUTH_TOKEN` não está expirado no Turso

### Admin login retorna 401 sempre

- Verificar se o seed do usuário foi executado no banco de **produção** (não local)
- Verificar `JWT_SECRET` — deve ser o mesmo que foi usado para gerar as sessões

### Planos não aparecem na landing

1. Verificar se `TRACKA_API_URL` / `NEXT_PUBLIC_APP_URL` estão corretos
2. Verificar se `TRACKA_LANDING_API_KEY` (Vercel) == chave salva no admin do Tracka
3. Testar manualmente: `curl https://tracka.solucoesrkm.com/api/public/plans -H "x-api-key: SEU_KEY"`
4. Detalhes completos da integração (o que a API lê/escreve, variáveis, provisionamento): ver **§10**

### Widget Freshdesk não aparece

1. No admin da landing (`/admin/settings`), verificar seção **Suporte**
2. Garantir que `widgetId` e `domain` estão preenchidos
3. Verificar `FRESHDESK_API_KEY` nas env vars

### Cron não executa

- Verificar se `CRON_SECRET` está configurado na Vercel
- Verificar aba **Cron Jobs** no dashboard da Vercel
- Testar manualmente: `curl -X POST https://solucoesrkm.com/api/cron/freshdesk-sync -H "Authorization: Bearer SEU_CRON_SECRET"`

---

## 9. Rollback

Em caso de problema após deploy:

1. Vercel dashboard → **Deployments**
2. Selecionar deploy anterior
3. Clicar **Promote to Production**

Rollback é instantâneo — sem impacto no banco.

---

## 10. Integração de Pricing — `TRACKA_LANDING_API_KEY`

Esta seção documenta **como a landing obtém os planos/preços do Tracka**, o que a
API faz (o que lê e escreve), os tipos de acesso e todas as variáveis envolvidas.

### 10.1. O que a integração faz

A fonte de verdade dos planos é o **admin do Tracka** (app `controle-das-coisas`).
A landing **não** tem preços próprios: ela consome a API pública do Tracka e reflete
automaticamente o que o admin configurar (limites, preços, quais planos estão ativos).

```
Landing (solucoesrkm)                    App Tracka (controle-das-coisas)
  fetchPricing() em page.tsx  ──GET──▶   /api/public/plans
  header: x-api-key                       valida x-api-key → lê plan_config → responde
     (= TRACKA_LANDING_API_KEY)           (nunca escreve nada)
```

Se a chave estiver ausente/errada, o app responde **401** e a landing usa o
**fallback i18n** (`messages/pt.json` / `en.json`) — que pode ficar desatualizado.
Por isso a chave é **obrigatória** para o pricing refletir a fonte de verdade.

### 10.2. O que a API lê e escreve (tipos de acesso)

Todos os endpoints públicos são **somente leitura** (`GET`) e **não escrevem nada**.
A escrita acontece só no admin do Tracka, por um endpoint **separado e autenticado por sessão**.

| Endpoint (app Tracka) | Método | Auth | Lê | Escreve |
|---|---|---|---|---|
| `/api/public/plans` | GET | `x-api-key` | `plan_config` (planos) + `landing_api_key` (p/ validar) | — (nada) |
| `/api/public/landing-config` | GET | `x-api-key` | config da landing (hero/FAQ/toggles) + `plan_config` se `showPricing` | — (nada) |
| `/api/admin/api-keys` | PUT | Sessão + role `SUPERADMIN`/`ADMIN`/`EDITOR` | chaves atuais | **grava** `landing_api_key` (encriptada) em `SiteSettings` |

- **Leitura dos planos:** `getPlansConfig()` faz merge de `DEFAULT_PLAN_LIMITS` (código)
  com `SiteSettings.plan_config` (banco), via `unstable_cache` (TTL 60s, tag
  `plans-config`). Quando o admin salva, `revalidateTag('plans-config')` invalida o cache.
- **Validação da chave:** `validateLandingApiKey()` lê o header `x-api-key`, busca
  `SiteSettings.landing_api_key`, **decripta** (AES-256-GCM) e compara com timing-safe.
- **Gravação da chave:** o card *Integrações / API Keys* do admin chama `PUT /api/admin/api-keys`,
  que **encripta** a chave e faz `upsert` em `SiteSettings.landing_api_key`. É o **único**
  ponto de escrita — nenhum endpoint público escreve.

### 10.3. Variáveis envolvidas

**Landing (`solucoesrkm` — env do Vercel):**

| Variável | Papel |
|---|---|
| `TRACKA_LANDING_API_KEY` | **A chave.** Enviada no header `x-api-key` ao chamar `/api/public/plans`. **Server-only** (nunca prefixar com `NEXT_PUBLIC_`). Lida em `src/app/[locale]/page.tsx` (`fetchPricing`). |
| `NEXT_PUBLIC_APP_URL` | Base URL do app Tracka usada no fetch dos planos (default `https://tracka.solucoesrkm.com`). |
| `TRACKA_API_URL` | Mesma base do app (usada por outros pontos de integração). |

**App Tracka (`controle-das-coisas` — env do Vercel do app):**

| Variável / chave | Papel |
|---|---|
| `ENCRYPTION_KEY` | Hex de 64 chars (AES-256-GCM). Encripta/decripta a `landing_api_key`. **Obrigatória em produção** (o boot falha sem ela). |
| `SiteSettings.plan_config` | *(no banco, não env)* Config de planos = **fonte de verdade**, editada no admin. |
| `SiteSettings.landing_api_key` | *(no banco, não env)* A chave encriptada usada para validar os chamadores externos. |

> A `TRACKA_LANDING_API_KEY` (Vercel da landing) e a `SiteSettings.landing_api_key`
> (banco do app) precisam ter **o mesmo valor em texto puro**. O admin grava a versão
> encriptada; você cola o texto puro no Vercel.

### 10.4. Provisionamento (passo a passo)

1. **Admin do Tracka** — `tracka.solucoesrkm.com/pt/admin/settings` → card
   **Integrações / API Keys** → campo **🔑 Landing Page API Key** → **Gerar** →
   revele (👁️) e **copie** a chave → **Salvar** (o *Gerar* só preenche o input; quem
   grava no banco é o *Salvar*).
2. **Vercel da landing** (`solucoesrkm`) → **Settings → Environment Variables** →
   **Add New**:
   - **Key:** `TRACKA_LANDING_API_KEY`
   - **Value:** *(cole a MESMA chave da etapa 1)*
   - **Environments:** Production (e Preview, se usar)
3. **Redeploy** da landing (env nova só entra em vigor num novo deploy — o merge do
   PR já dispara).

### 10.5. Validação

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "x-api-key: SUA_CHAVE" \
  "https://tracka.solucoesrkm.com/api/public/plans?locale=pt"
```

- **200** → integração ativa; a landing reflete a fonte de verdade.
- **401** → chave do Vercel ≠ chave salva no admin, ou o *Salvar* do admin não persistiu.
