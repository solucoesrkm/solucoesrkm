# Contributing — solucoesrkm.com

> **Para agentes de IA e desenvolvedores.**  
> Este documento contém tudo que uma IA precisa para entender, modificar e replicar este projeto com fidelidade total — sem lacunas ou ambiguidade.

---

## Sumário

1. [Identidade do Projeto](#1-identidade-do-projeto)
2. [Tech Stack](#2-tech-stack)
3. [Estrutura de Arquivos](#3-estrutura-de-arquivos)
4. [Setup Local](#4-setup-local)
5. [Arquitetura Mental](#5-arquitetura-mental)
6. [SiteSettings — Padrão Central](#6-sitesettings--padrão-central)
7. [Autenticação Admin](#7-autenticação-admin)
8. [Integração com o Tracka](#8-integração-com-o-tracka)
9. [i18n — Regras](#9-i18n--regras)
10. [Rotas e Páginas](#10-rotas-e-páginas)
11. [Painel Admin — Formulários](#11-painel-admin--formulários)
12. [Freshdesk — Sync de Artigos](#12-freshdesk--sync-de-artigos)
13. [Convenções de Código](#13-convenções-de-código)
14. [Commits e Branches](#14-commits-e-branches)
15. [Checklist pré-PR](#15-checklist-pré-pr)
16. [Quickstart para Agentes de IA](#16-quickstart-para-agentes-de-ia)

---

## 1. Identidade do Projeto

**solucoesrkm.com** é o site corporativo da plataforma Tracka.

- **Público**: Landing page de marketing com pricing, features, FAQ, ajuda, termos
- **Restrito**: Painel admin para edição de conteúdo em tempo real (sem redeploy)
- **Relação com Tracka**: compartilha o mesmo banco Turso e consome a API pública do app

> App principal: [`tracka.solucoesrkm.com`](https://tracka.solucoesrkm.com) — projeto separado em `Controle das Coisas/`

---

## 2. Tech Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router) | 16.x |
| Linguagem | TypeScript (strict) | 5.x |
| Estilo | Tailwind CSS | 4.x |
| Banco | Turso (LibSQL) via Prisma ORM | 7.x |
| Auth | JWT (jose) em cookie HttpOnly | 6.x |
| i18n | next-intl | 4.x |
| Forms | React Hook Form + Zod | latest |
| Notificações UI | Sonner | latest |
| Deploy | Vercel | — |

---

## 3. Estrutura de Arquivos

```
solucoesrkm/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx              # Landing principal (SSR — busca planos do Tracka)
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx        # Guard: redireciona não-autenticados
│   │   │   │   ├── login/            # Página de login do admin
│   │   │   │   ├── settings/page.tsx # Painel de configurações
│   │   │   │   ├── help/             # Lista de tópicos de help
│   │   │   │   ├── help-editor/      # Editor de conteúdo do help
│   │   │   │   └── help-validation/  # Validação de consistência do help
│   │   │   ├── help/                 # Central de ajuda pública
│   │   │   ├── about/                # Sobre a empresa
│   │   │   ├── faq/                  # FAQ público
│   │   │   ├── tracka/               # Página do produto
│   │   │   ├── legal/                # Wrapper para termos e privacidade
│   │   │   ├── terms/                # Termos de uso
│   │   │   ├── privacy/              # Política de privacidade
│   │   │   └── cookies/              # Política de cookies
│   │   └── api/
│   │       ├── auth/                 # login, logout
│   │       ├── admin/
│   │       │   ├── api-keys/         # CRUD de API keys
│   │       │   ├── freshdesk-sync/   # Sync manual/cron com Freshdesk
│   │       │   ├── help-topics/      # Override de conteúdo de tópicos
│   │       │   ├── help-validation/  # Validação de consistency
│   │       │   ├── translate-config/ # Config de tradução
│   │       │   └── translate-fields/ # Tradução de campos
│   │       ├── cron/                 # Jobs agendados (Vercel Cron)
│   │       └── health/               # Health check
│   │
│   ├── application/
│   │   ├── admin/
│   │   │   └── site-settings.actions.ts  # ← CRUD central de toda config
│   │   ├── freshdesk/                    # Lógica de sync com Freshdesk
│   │   └── help/                         # Lógica de tópicos de help
│   │
│   ├── components/
│   │   ├── landing/                  # Seções da landing page
│   │   ├── admin/                    # Formulários do painel admin
│   │   ├── help/                     # Componentes da central de ajuda
│   │   ├── layout/                   # Header, Footer, layouts
│   │   └── ui/                       # Botões, inputs, cards base
│   │
│   ├── domain/
│   │   ├── auth/                     # Tipos e lógica de auth
│   │   └── help/                     # Definição dos tópicos de help
│   │
│   ├── types/
│   │   ├── landing.types.ts          # PricingParams, PlanInheritance, LandingPageConfig
│   │   └── index.ts                  # Tipos compartilhados (SettingsChange, ActionResult)
│   │
│   ├── constants/                    # HISTORY_KEYS, MAX_HISTORY_ENTRIES
│   ├── config/
│   │   ├── app.config.ts             # TRACKA_APP_URL, LANDING_URL — sempre importar daqui
│   │   └── defaults.ts               # Valores padrão de todas as SiteSettings keys
│   ├── infrastructure/               # Prisma, logger
│   └── lib/
│       ├── auth.ts                   # Re-export de @/domain/auth/auth
│       └── prisma.ts                 # Prisma client singleton
│
├── messages/
│   ├── pt.json                       # Português (fonte primária)
│   └── en.json                       # Inglês
│
├── prisma/
│   └── schema.prisma                 # Schema compartilhado com Tracka
│
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md                   # (este arquivo)
└── .env.example
```

---

## 4. Setup Local

```bash
npm install
cp .env.example .env
# preencher valores no .env
npm run dev
```

Acesse: `http://localhost:3000/pt`  
Admin: `http://localhost:3000/pt/admin/login`

---

## 5. Arquitetura Mental

### Fluxo de dados da Landing Page

```
[page.tsx - SSR]
  │
  ├── getSiteSettings('landing_page_config')   ← banco local (Turso)
  ├── GET /api/public/plans?locale={locale}    ← API Tracka (planos + herança)
  ├── getSiteSettings('pricing_visibility')    ← banco local (visibilidade)
  │
  └── renderiza seções:
        HeroSection, FeaturesSection, PricingSection,
        TestimonialsSection, FAQSection, CallToActionSection
```

### Padrão chave-valor (SiteSettings)

Toda configuração do site é armazenada em `SiteSettings` (modelo Prisma):

```
key                      → value (JSON serializado)
─────────────────────────────────────────────────
landing_page_config      → { heroTitle, heroSubtitle, faq[], testimonials[], ... }
landing_page_config_pt   → override PT do conteúdo
landing_page_config_en   → override EN do conteúdo
freshdesk_config         → { apiKey, domain, widgetId, ... }
api_keys                 → { googlePlacesApiKey, ... }
pricing_visibility       → { [planType]: string[] } — features visíveis por plano
help_overrides           → { [slug]: { pt: string, en: string } }
```

### Histórico automático

Toda chamada a `updateSiteSettings(key, value)` registra automaticamente um diff no histórico:

```
key: 'landing_page_config'   →  historyKey: 'landing_page_config_history'
key: 'freshdesk_config'      →  historyKey: 'freshdesk_config_history'
```

O histórico mantém no máximo `MAX_HISTORY_ENTRIES` (definido em `src/constants/`) entradas — FIFO.

---

## 6. SiteSettings — Padrão Central

**Arquivo raiz**: `src/application/admin/site-settings.actions.ts`

```typescript
// Leitura (pública — landing page, sem auth)
const config = await getSiteSettings('landing_page_config');

// Escrita (protegida — Employee ADMIN/EDITOR)
const result = await updateSiteSettings('landing_page_config', { ...newValues });

// Histórico
const history = await getSettingsHistory('landing_page_config_history');
```

**Regras:**
- `getSiteSettings` → sem auth, para Server Components públicos
- `updateSiteSettings` → verifica `getSystemRole()` + `canEdit()` internamente
- Diff automático por key: `computeLandingDiff`, `computeFreshdeskDiff`, `computeApiKeysDiff`
- API keys são mascaradas no diff (`sk_live_abcd…xyz`)

> ⚠️ **Nunca chame Prisma diretamente em componentes ou páginas** — use sempre `getSiteSettings` / `updateSiteSettings`.

---

## 7. Autenticação Admin

### Credenciais

O admin usa as mesmas credenciais do Tracka (tabela `Employee` no banco compartilhado).

### Fluxo

```
POST /api/auth/login
  → valida credenciais → Employee no Turso
  → cria JWT (jose) → cookie HttpOnly 'session'
  → redirect /admin/settings
```

### Guard

`src/app/[locale]/admin/layout.tsx` verifica a sessão em todo request:

```typescript
const session = await getSession();
if (!session) redirect(`/${locale}/admin/login`);
```

### Funções de auth

Importar de `@/lib/auth` (re-exporta de `@/domain/auth/auth`):

```typescript
import { getSession, getSystemRole, canEdit, canView } from '@/lib/auth';

const session = await getSession();      // → { userId, email, name, role } | null
const role = await getSystemRole(userId); // → 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER'
canEdit(role)  // → boolean (ADMIN, EDITOR, SUPERADMIN)
canView(role)  // → boolean (qualquer Employee)
```

---

## 8. Integração com o Tracka

### Buscar planos (pricing + herança)

```typescript
// Em page.tsx (SSR)
const trackaUrl = process.env.TRACKA_API_URL;
const apiKey = process.env.TRACKA_LANDING_API_KEY;

const res = await fetch(`${trackaUrl}/api/public/plans?locale=${locale}`, {
  headers: { 'x-api-key': apiKey },
  next: { revalidate: 60 },  // cache 60s
});
const { plans } = await res.json();
```

### Estrutura de retorno

```typescript
interface PricingParams {
  name: string;
  price: string;
  description: string;
  features: string[];          // já traduzidos no locale solicitado
  isPopular: boolean;
  buttonText: string;
  buttonLink: string;
  planType: string;
  inheritance?: PlanInheritance | null;
}

interface PlanInheritance {
  inheritsFrom: string;         // 'plus'
  inheritsFromName: string;     // 'Plus'
  exclusiveFeatures: string[];  // features que só este plano tem
}
```

### Herança de planos na UI

```tsx
// PricingSection.tsx
{plan.inheritance ? (
  <>
    <span>Tudo do {plan.inheritance.inheritsFromName}, mais:</span>
    <hr />
    {plan.inheritance.exclusiveFeatures.map(f => <li>{f}</li>)}
  </>
) : (
  plan.features.map(f => <li>{f}</li>)
)}
```

**Fallback seguro**: se `inheritance` for `null` ou ausente → lista completa de `features`.

---

## 9. i18n — Regras

- Locales suportados: `pt` (padrão), `en`
- Arquivos em `messages/pt.json` e `messages/en.json`
- **Nunca** hardcodar strings em português ou inglês dentro de componentes

```typescript
// Client Component
const t = useTranslations('landing');

// Server Component / Route Handler
const t = await getTranslations('landing');
```

**Regra de links:**

```typescript
// ✅ Correto — preserva locale prefix
import { Link } from '@/i18n/navigation';

// ❌ Errado — 404 nas rotas /pt/...
import Link from 'next/link';
```

**Regra de i18n em novos tópicos de help:**  
Todo tópico adicionado em `src/domain/help/help-topics.ts` precisa ter entrada em **ambos** `messages/help/pt.json` e `messages/help/en.json`.

---

## 10. Rotas e Páginas

### Públicas

| Rota | Página | Auth |
|------|--------|------|
| `/pt` | Landing principal | Não |
| `/pt/tracka` | Produto Tracka | Não |
| `/pt/about` | Sobre | Não |
| `/pt/faq` | FAQ | Não |
| `/pt/help` | Central de ajuda | Não |
| `/pt/help/[slug]` | Artigo de help | Não |
| `/pt/terms` | Termos de uso | Não |
| `/pt/privacy` | Privacidade | Não |
| `/pt/cookies` | Cookies | Não |
| `/api/health` | Health check | Não |

### Admin (requer Employee)

| Rota | Página |
|------|--------|
| `/pt/admin/login` | Login |
| `/pt/admin/settings` | Configurações completas |
| `/pt/admin/help` | Listagem de tópicos de help |
| `/pt/admin/help-editor` | Editor de artigos |
| `/pt/admin/help-validation` | Validação de consistência |

---

## 11. Painel Admin — Formulários

Todos os formulários do admin estão em `src/components/admin/`. Cada um:
1. Lê a config atual com `getSiteSettings(key)` no Server Component pai
2. Renderiza o formulário com React Hook Form + Zod
3. Chama `updateSiteSettings(key, novoValor)` no submit
4. Exibe toast de sucesso/erro via Sonner

| Componente | SiteSettings key | O que controla |
|-----------|-----------------|----------------|
| `SiteConfigForm` | `landing_page_config` | Hero, CTA, depoimentos, FAQ, links, bandeiras de visibilidade |
| `PricingVisibilityForm` | `pricing_visibility` | Quais features aparecem nos cards de cada plano |
| `FreshdeskConfigForm` | `freshdesk_config` | API key, domínio, widget, sync de artigos |
| `ApiKeysForm` | `api_keys` | Google Places e outras chaves externas |
| `ChangeHistory` | `*_history` | Leitura do histórico de alterações (read-only) |
| `VersionHistory` | — | Comparação entre versões do histórico |

---

## 12. Freshdesk — Sync de Artigos

O sistema mantém os artigos de help sincronizados com o Freshdesk.

### Fluxo

```
[admin clica "Sincronizar"] ou [Vercel Cron diário]
  → POST /api/admin/freshdesk-sync
  → FreshdeskSyncService.sync()
  → busca tópicos de help habilitados
  → cria/atualiza artigos na API Freshdesk
  → retorna { synced, skipped, errors }
```

### Configuração necessária

```env
FRESHDESK_API_KEY=seu-api-key-do-freshdesk
```

`freshdesk_config` no banco deve ter `domain` e `widgetId`.

### Cron

`/api/cron/freshdesk-sync` — chamado pela Vercel Cron.  
Autenticado via header `CRON_SECRET`.

---

## 13. Convenções de Código

### TypeScript

- `strict: true` em `tsconfig.json` — sem `any` sem justificativa
- Preferir `interface` para shapes de objetos, `type` para uniões/utilitários
- Todas as respostas de API devem ser tipadas

### Componentes

- **Server Components por padrão** — só adicionar `'use client'` quando necessário (estado, eventos, browser APIs)
- **Sem Prisma em componentes** — usar `getSiteSettings()` ou Server Components com `await`
- **Sem `style={{}}` inline** — exceto CSS custom properties (`--var`)
- Usar `cn()` de `@/lib/utils` para merge de classes

### Formulários

```typescript
// Padrão obrigatório para formulários admin
const schema = z.object({ field: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });

const onSubmit = async (data: z.infer<typeof schema>) => {
  const result = await updateSiteSettings('minha_key', data);
  if (result.error) toast.error(result.error);
  else toast.success(`Salvo! ${result.changesCount} campo(s) alterado(s).`);
};
```

### Nomeação

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Página | `page.tsx` | `app/[locale]/about/page.tsx` |
| Componente | PascalCase | `HeroSection.tsx` |
| Hook | camelCase + `use` | `useFormState.ts` |
| Service | kebab-case | `freshdesk-sync.service.ts` |
| Action | kebab-case | `site-settings.actions.ts` |

---

## 14. Commits e Branches

### Conventional Commits (em português)

```
feat(landing): adiciona seção de depoimentos animados
fix(admin): corrige validação de URL no SiteConfigForm
docs(readme): atualiza variáveis de ambiente
refactor(auth): centraliza guard em admin/layout.tsx
chore(deps): atualiza next para 16.2.0
```

**Tipos**: `feat` `fix` `docs` `refactor` `test` `chore` `perf` `style`

### Branches

```
feat/pricing-inheritance
fix/freshdesk-sync-timeout
docs/contributing-guide
```

---

## 15. Checklist pré-PR

```
[ ] TypeScript sem erros (npx tsc --noEmit)
[ ] Lint sem warnings (npm run lint)
[ ] Build passando (npm run build)
[ ] Strings novas em messages/pt.json E messages/en.json
[ ] Novos tópicos de help em PT E EN
[ ] getSiteSettings/updateSiteSettings — sem Prisma direto em componentes
[ ] Links usando @/i18n/navigation, não next/link
[ ] URLs do app via TRACKA_APP_URL de @/config/app.config (não hardcoded)
[ ] Cores via CSS variables — sem hex/rgba hardcoded em componentes
[ ] CHANGELOG.md atualizado
[ ] Security headers em next.config.ts já configurados — não remover nem enfraquecer
```

---

## 16. Quickstart para Agentes de IA

> Leia esta seção primeiro se você é um agente de IA.

### ⚠️ Ambiente Windows — Regras Críticas

Este projeto roda em **Windows**. O sandbox `run_command` **não suporta Windows**:

```
error: failed to set up sandbox: sandboxing is not supported on Windows
```

| Tarefa | ❌ NÃO use `run_command` | ✅ Use |
|--------|--------------------------|--------|
| Ler arquivo | `Get-Content`, `cat` | `view_file` |
| Listar diretório | `ls`, `dir` | `list_dir` |
| Criar arquivo | `echo`, `Out-File` | `write_to_file` |
| Git | `git add/commit/push` | GitKraken MCP tools |
| Buscar texto | `grep`, `Select-String` | `grep_search` (em arquivo/dir específico) |

### Antes de escrever qualquer código

1. Ler `README.md` — entender stack e integração com Tracka
2. Verificar `src/types/landing.types.ts` — tipos de PricingParams, PlanInheritance
3. Verificar `src/application/admin/site-settings.actions.ts` — padrão de CRUD
4. Checar `messages/pt.json` e `messages/en.json` — namespaces existentes

### Invariantes que NUNCA devem quebrar

| Regra | Consequência se quebrada |
|-------|--------------------------|
| Usar `getSiteSettings` para ler config | Leitura inconsistente ou crash |
| Usar `updateSiteSettings` para escrever | Histórico não registrado |
| Links via `@/i18n/navigation` | 404 por falta de locale prefix |
| Strings em `messages/*.json` | UI quebrada ou texto hardcoded |
| Sem Prisma direto em componentes | Lógica de auth/diff bypassada |
| URLs via `@/config/app.config` | Triplicação de hardcode; difícil de trocar domínio |
| Cores via CSS variables (globals.css) | Design system diverge; bugs visuais silenciosos |
| Não remover security headers do next.config.ts | Exposição a XSS, clickjacking, MIME sniffing |

### Trade-off conhecido (B2)

> `BRL_PRICES` em `PricingSection.tsx` tem preços hardcoded `{ plus: 9.90, pro: 19.90 }` para conversão de moeda na UI em EN.  
> **Risco**: se o admin alterar os preços no Tracka, a conversão estimada fica imprecisa.  
> **Decisão consciente**: parsear `plan.price` ("R$ 9,90") tem risco de localização; o drift é improvável e o impacto é apenas visual (texto de preço convertido).  
> **Se os preços mudarem**: atualizar o objeto `BRL_PRICES` no arquivo.  

### Adicionando nova seção na landing

```
1. Criar componente em src/components/landing/NovaSectionSection.tsx
2. Adicionar prop tipada em src/types/landing.types.ts (se necessário)
3. Adicionar key em SiteSettings — getSiteSettings('nova_section_config')
4. Adicionar form no admin em src/components/admin/NovaSectionForm.tsx
5. Registrar HISTORY_KEYS em src/constants/ se precisar de histórico
6. Adicionar strings em messages/pt.json e messages/en.json
7. Montar em page.tsx e settings/page.tsx
8. Atualizar CHANGELOG.md
```

### Adicionando novo campo ao admin

```
1. Adicionar campo no schema Zod do form correspondente
2. Atualizar o tipo em src/types/landing.types.ts (se necessário)
3. Adicionar label/placeholder em messages/pt.json e messages/en.json
4. O diff e histórico são automáticos — não é necessário código extra
```
