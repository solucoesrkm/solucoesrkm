# 🌐 solucoesrkm.com — Landing Page & Admin

Site corporativo da plataforma **Tracka** — inventário doméstico inteligente.  
Gerencia a landing page pública, painel administrativo de conteúdo e sincronização de dados com o app principal.

---

## Visão Geral

| Domínio | Propósito |
|---------|-----------|
| `solucoesrkm.com` | Landing page pública (marketing, pricing, ajuda, legal) |
| `solucoesrkm.com/admin` | Painel administrativo de conteúdo (protegido por JWT) |

> O app principal (`tracka.solucoesrkm.com`) é um projeto separado em [`/Controle das Coisas`](../Controle%20das%20Coisas).  
> Ambos compartilham o **mesmo banco Turso (LibSQL)** via Prisma.

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router + SSR) |
| Linguagem | TypeScript (strict) |
| Estilo | Tailwind CSS v4 |
| Banco | Turso (LibSQL) via Prisma ORM |
| Auth | JWT (jose) em cookie HttpOnly |
| i18n | next-intl (locales: `pt`, `en`) |
| Forms | React Hook Form + Zod |
| Notificações | Sonner |
| Deploy | Vercel |

---

## Estrutura do Projeto

```
solucoesrkm/
├── src/
│   ├── app/
│   │   ├── [locale]/                  # Páginas públicas i18n
│   │   │   ├── page.tsx               # Landing page principal (hero, features, pricing, FAQ)
│   │   │   ├── about/                 # Sobre a empresa
│   │   │   ├── faq/                   # Perguntas frequentes
│   │   │   ├── help/                  # Central de ajuda pública
│   │   │   ├── legal/                 # Termos e privacidade
│   │   │   ├── tracka/                # Página dedicada ao produto Tracka
│   │   │   └── admin/                 # Painel de administração de conteúdo
│   │   └── api/
│   │       ├── auth/                  # Login/logout do admin
│   │       ├── admin/                 # Endpoints privados do admin
│   │       ├── cron/                  # Jobs agendados (Vercel Cron)
│   │       └── health/                # Health check
│   │
│   ├── components/
│   │   ├── landing/                   # Seções da landing page
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   ├── PricingSection.tsx     # Suporte à herança de planos (v0.7.3)
│   │   │   ├── FAQSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── CallToActionSection.tsx
│   │   │   ├── LandingHeader.tsx
│   │   │   └── LandingFooter.tsx
│   │   ├── admin/                     # Formulários do painel admin
│   │   │   ├── SiteConfigForm.tsx     # Hero, FAQ, depoimentos, links
│   │   │   ├── PricingVisibilityForm.tsx # Visibilidade de features nos cards
│   │   │   ├── FreshdeskConfigForm.tsx
│   │   │   ├── ApiKeysForm.tsx
│   │   │   ├── ChangeHistory.tsx
│   │   │   └── VersionHistory.tsx
│   │   └── ui/                        # Componentes base reutilizáveis
│   │
│   ├── types/
│   │   └── landing.types.ts           # PricingParams, PlanInheritance, LandingPageConfig
│   │
│   └── lib/
│       ├── auth.ts                    # getSession, verifySystemAccess
│       └── prisma.ts                  # Prisma client (compartilhado com Tracka)
│
├── messages/
│   ├── pt.json                        # Strings em Português (padrão)
│   └── en.json                        # Strings em Inglês
│
└── prisma/
    └── schema.prisma                  # Schema compartilhado (mesma estrutura do Tracka)
```

---

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencher os valores no .env

# 3. Gerar o Prisma client
npx prisma generate

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000/pt](http://localhost:3000/pt)

---

## Variáveis de Ambiente

```env
# ──── Banco de Dados (Turso — compartilhado com Tracka) ────
DATABASE_URL="libsql://seu-db.turso.io"
DATABASE_AUTH_TOKEN="seu-token-turso"

# ──── App ────
NEXT_PUBLIC_APP_URL="https://solucoesrkm.com"
JWT_SECRET="gerar-com-openssl-rand-base64-32"

# ──── Integração Tracka (API pública) ────
# Usada para buscar planos e pricing do app principal
TRACKA_API_URL="https://tracka.solucoesrkm.com"
TRACKA_LANDING_API_KEY="sua-api-key"

# ──── Freshdesk (Opcional) ────
FRESHDESK_API_KEY=

# ──── Vercel Cron (para sync automático) ────
CRON_SECRET=
```

> ⚠️ **Nunca** faça commit do `.env` com valores reais.

---

## Integração com o Tracka

A landing page **não recria dados de planos** — ela consome diretamente a API do app:

```
GET https://tracka.solucoesrkm.com/api/public/plans?locale=pt
Authorization: x-api-key: TRACKA_LANDING_API_KEY
```

**Resposta inclui:**
- `features[]` — lista traduzida no locale solicitado
- `inheritance` — `{ inheritsFrom, inheritsFromName, exclusiveFeatures[] }` quando detectado

Isso garante que qualquer mudança feita pelo admin no Tracka (features, preços, herança de planos) reflita automaticamente na landing, **sem redeploy**.

### Herança Automática de Planos (v0.7.3)

Quando um plano superior cobre completamente um inferior, `PricingSection.tsx` exibe automaticamente:

```
┌────────────────────────────┐
│  Tudo do Plus, mais:       │  ← herança detectada
│  ─────────────────────     │
│  ✓ Feature exclusiva 1     │  ← exclusiveFeatures apenas
│  ✓ Feature exclusiva 2     │
└────────────────────────────┘
```

Sem herança → lista completa (comportamento padrão, retrocompatível).

---

## Painel Administrativo

Acesso: `/admin` (requer autenticação como Employee do sistema)

| Seção | O que controla |
|-------|---------------|
| **Configurações do Site** | Hero, CTA, depoimentos, FAQ, links do rodapé |
| **Visibilidade de Pricing** | Quais features aparecem nos cards de cada plano |
| **Freshdesk** | Configuração do widget de suporte e sync de artigos |
| **API Keys** | Chaves de integrações externas |
| **Histórico** | Log de todas as alterações com rollback |

---

## Rotas Públicas

| Rota | Descrição |
|------|-----------|
| `/pt` ou `/en` | Landing page principal |
| `/pt/tracka` | Página dedicada ao produto |
| `/pt/about` | Sobre a empresa |
| `/pt/faq` | Perguntas frequentes |
| `/pt/help` | Central de ajuda pública |
| `/pt/legal` | Termos de uso e privacidade |
| `/api/health` | Health check |

---

## i18n

Localidades suportadas: **`pt`** (padrão) e **`en`**.

```
messages/
├── pt.json   # Português — fonte primária
└── en.json   # Inglês
```

**Regra:** toda string visível ao usuário deve ter entrada em ambos os arquivos.  
Usar `useTranslations()` em Client Components, `getTranslations()` em Server Components.

---

## Convenções de Código

- **Server Components por padrão** — `'use client'` apenas quando necessário (state, eventos)
- **Sem Prisma em componentes** — usar Server Components ou Route Handlers
- **Links sempre com `Link` de `@/i18n/navigation`** — nunca `next/link` (sem locale prefix)
- **Formulários**: React Hook Form + Zod para validação
- **Commits**: Conventional Commits em português

```
feat(pricing): adiciona suporte à herança de planos
fix(admin): corrige rollback no histórico de versões
docs(readme): atualiza documentação de setup
```

---

## Deploy

```bash
# Build de produção
npm run build

# Deploy via Vercel CLI
npx vercel --prod
```

> Guia completo: [`VERCEL_GUIDE.md`](VERCEL_GUIDE.md) — env vars, seed de admin, cron, troubleshooting.

---

## Documentação

| Arquivo | Finalidade |
|---------|-----------|
| [docs/INDEX.md](docs/INDEX.md) | **Mapa completo** de toda a documentação |
| [docs/Architecture.md](docs/Architecture.md) | Diagramas de infra, auth, SiteSettings, planos |
| [docs/Database.md](docs/Database.md) | Schema Prisma, chaves de SiteSettings |
| [docs/API.md](docs/API.md) | Referência de todos os endpoints REST |
| [docs/Roles.md](docs/Roles.md) | Papéis e permissões do admin |
| [docs/AdminGuide.md](docs/AdminGuide.md) | Guia técnico do painel admin |
| [docs/UserManual.md](docs/UserManual.md) | Manual para admins não-técnicos |
| [docs/StyleGuide.md](docs/StyleGuide.md) | Design system, tokens CSS |
| [SECURITY.md](SECURITY.md) | Headers HTTP, JWT, proteções |
| [CONCEPTS.md](CONCEPTS.md) | Decisões técnicas e seus motivos |
| [VERCEL_GUIDE.md](VERCEL_GUIDE.md) | Deploy na Vercel |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia para devs e agentes de IA |

---

## Relação com o Projeto Tracka

```
solucoesrkm.com          tracka.solucoesrkm.com
(este repo)              (Controle das Coisas/)
     │                           │
     └──── Turso DB ─────────────┘  ← banco SEPARADO (não compartilhado)
     │                           │
     └──── /api/public/plans ────┘  ← pricing sync via API REST
```

Alterações de planos/features feitas no admin do **Tracka** refletem automaticamente neste site via cache de 60s.
