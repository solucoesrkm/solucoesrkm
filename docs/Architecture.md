# 🏗️ Arquitetura — solucoesrkm.com

Visão técnica completa da landing page corporativa da plataforma Tracka.

> **Público**: Desenvolvedores e agentes de IA.  
> **Quando consultar**: Ao projetar novas seções, entender o fluxo de dados ou fazer onboarding.

---

## 1. Infraestrutura

```mermaid
graph TB
    subgraph Cliente
        B["🌐 Browser"]
    end

    subgraph Vercel
        NX["Next.js 16<br/>(App Router + SSR)"]
        MW["Middleware<br/>(next-intl + locale)"]
        API["API Routes<br/>(/api/*)"]
        SA["Server Actions<br/>(mutations)"]
        CRON["Vercel Cron<br/>(freshdesk-sync)"]
    end

    subgraph Externos
        TU["🗄️ Turso<br/>(LibSQL — compartilhado)"]
        FD["🎧 Freshdesk<br/>(artigos de suporte)"]
        TR["🔗 Tracka API<br/>(planos + pricing)"]
    end

    B --> MW --> NX
    NX --> API
    NX --> SA
    API --> TU
    SA --> TU
    API --> FD
    CRON --> FD
    NX -->|"fetch pricing"| TR
```

---

## 2. Domínios e Locales

```
solucoesrkm.com/pt → Landing PT
solucoesrkm.com/en → Landing EN
solucoesrkm.com/pt/admin → Admin (Employee apenas)
localhost:3001/pt  → Desenvolvimento local
```

Middleware (`src/middleware.ts`) redireciona `/` para `/pt` e gerencia locale prefix via `next-intl`.

---

## 3. Fluxo de Dados — Landing Page

```mermaid
sequenceDiagram
    participant B as Browser
    participant P as page.tsx (SSR)
    participant L as Turso (local)
    participant T as Tracka API

    B->>P: GET /pt
    P->>L: getSiteSettings('landing_page_config')
    P->>T: GET /api/public/plans?locale=pt
    P->>L: getSiteSettings('pricing_visibility')
    L-->>P: config da landing
    T-->>P: planos + inheritance
    L-->>P: visibilidade de features
    P-->>B: HTML renderizado (SSR)
```

**Cache**: A chamada ao Tracka usa `next: { revalidate: 60 }` — os planos são atualizados a cada 60s sem redeploy.

---

## 4. Padrão SiteSettings

Toda configuração do site é armazenada em pares `key → JSON` na tabela `SiteSettings`:

```
SiteSettings
┌────────────────────────────┬──────────────────────────────────┐
│ key                        │ value (JSON)                     │
├────────────────────────────┼──────────────────────────────────┤
│ landing_page_config        │ { heroTitle, faq[], ... }        │
│ landing_page_config_pt     │ override PT                      │
│ landing_page_config_en     │ override EN                      │
│ landing_page_config_history│ [ { timestamp, changes[] } ]    │
│ freshdesk_config           │ { apiKey, domain, widgetId }     │
│ freshdesk_config_history   │ [ { timestamp, changes[] } ]    │
│ api_keys                   │ { googlePlacesApiKey }           │
│ api_keys_history           │ [ { timestamp, changes[] } ]    │
│ pricing_visibility         │ { free: [], plus: [], pro: [] }  │
└────────────────────────────┴──────────────────────────────────┘
```

### CRUD centralizado

```typescript
// src/application/admin/site-settings.actions.ts

getSiteSettings(key)        // leitura pública (sem auth)
updateSiteSettings(key, v)  // escrita protegida (Employee ADMIN/EDITOR)
getSettingsHistory(histKey)  // leitura do histórico
```

Diff automático: toda escrita calcula as mudanças e salva em `key_history`.

---

## 5. Autenticação Admin

```mermaid
sequenceDiagram
    participant A as Admin Browser
    participant L as /api/auth/login
    participant D as Turso (Employee)
    participant K as Cookie JWT

    A->>L: POST { email, password }
    L->>D: findUnique(emailHash)
    D-->>L: Employee row
    L->>L: bcrypt.compare(password, hash)
    L->>K: set cookie 'session' (HttpOnly, Secure)
    L-->>A: redirect /admin/settings

    Note over A,K: Em cada request ao /admin
    A->>+layout.tsx: GET /pt/admin/*
    layout.tsx->>K: getSession()
    K-->>layout.tsx: { userId, email, role }
    layout.tsx-->>-A: renderiza ou redirect /login
```

**JWT payload**: `{ userId, email, name, role, iat, exp }`  
**Validade**: 7 dias (renovado a cada login)

---

## 6. Herança de Planos (v0.7.3)

A landing **não calcula** a herança — ela apenas recebe e renderiza:

```
Tracka API /api/public/plans?locale=pt
  └── detectPlanInheritance() [calculado no Tracka]
       └── retorna { inheritsFrom, inheritsFromName, exclusiveFeatures }

PricingSection.tsx
  ├── plan.inheritance existe? → mostra separador "Tudo do Plus, mais:" + exclusiveFeatures
  └── plan.inheritance ausente/null? → mostra features[] completa (fallback)
```

**Retrocompatibilidade**: se a API não retornar `inheritance` (versão antiga do Tracka), o componente exibe lista completa sem erros.

---

## 7. Sync com Freshdesk

```mermaid
graph LR
    A["Admin clica<br>'Sincronizar'"] --> B["POST /api/admin/freshdesk-sync"]
    C["Vercel Cron<br>diário"] --> B
    B --> D["FreshdeskSyncService.sync()"]
    D --> E["Tópicos de help<br/>(banco local)"]
    D --> F["Freshdesk API<br/>(criar/atualizar artigos)"]
    F --> G["{ synced, skipped, errors }"]
```

**Autenticação do Cron**: header `Authorization: Bearer CRON_SECRET`

---

## 8. Hierarquia de Permissões

```
SUPERADMIN → tudo
ADMIN      → editar configs + help + freshdesk
EDITOR     → editar configs básicos (sem API keys)
VIEWER     → somente leitura do painel
```

Funções: `canEdit(role)`, `canView(role)` de `@/domain/auth/auth`.

---

## 9. Estrutura i18n

```
messages/
├── pt.json     # Português — fonte primária
└── en.json     # Inglês

Namespaces usados:
  landing.*     → textos da landing page
  admin.*       → textos do painel admin
  help.*        → central de ajuda
  common.*      → reutilizáveis (botões, erros, datas)
  legal.*       → termos, privacidade, cookies
```

**Regra crítica**: ao adicionar qualquer string nova, adicionar em **ambos** os arquivos antes de commitar.

---

## 10. Mapa de Referências

| Para entender... | Consulte |
|-----------------|----------|
| Setup e stack | [README.md](../README.md) |
| Padrões de código e AI quickstart | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Painel admin (seção por seção) | [docs/AdminGuide.md](AdminGuide.md) |
| Histórico de versões | [CHANGELOG.md](../CHANGELOG.md) |
| Variáveis de ambiente | [.env.example](../.env.example) |
