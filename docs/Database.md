# 🗄️ Database — solucoesrkm.com

Schema e padrões de banco de dados da landing page corporativa.

> **Banco**: Turso (LibSQL/SQLite) local, separado do banco do Tracka.  
> **ORM**: Prisma com driver adapter `@prisma/adapter-libsql`.  
> **Schema**: `prisma/schema.prisma`

---

## 1. Visão Geral

```mermaid
erDiagram
    User ||--o| Employee : "tem"
    SiteSettings {
        String id PK
        String key UK
        String value
        DateTime updatedAt
    }
    User {
        String id PK
        String email UK
        String name
        String passwordHash
        String role
        DateTime createdAt
        DateTime updatedAt
    }
    Employee {
        String id PK
        String userId UK FK
        String role
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## 2. Modelos

### `User`

Usuário do sistema. No contexto da landing, apenas funcionários com acesso ao admin.  
**Sem cadastro público** — criados via seed script ou manualmente.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `String` (CUID) | PK auto-gerada |
| `email` | `String` (unique) | Email do funcionário |
| `name` | `String?` | Nome de exibição |
| `passwordHash` | `String?` | Hash bcrypt da senha |
| `role` | `String` | `"SUPERADMIN"` \| `"EMPLOYEE"` (default `"VIEWER"`) |
| `createdAt` | `DateTime` | Auto |
| `updatedAt` | `DateTime` | Auto |

### `Employee`

Extensão de `User` com permissões de acesso ao painel admin.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `String` (CUID) | PK auto-gerada |
| `userId` | `String` (unique FK) | Referência ao `User` |
| `role` | `String` | `"ADMIN"` \| `"EDITOR"` \| `"VIEWER"` (default `"EDITOR"`) |
| `createdAt` | `DateTime` | Auto |
| `updatedAt` | `DateTime` | Auto |

**Cascade**: deletar o `User` deleta o `Employee` automaticamente (`onDelete: Cascade`).

### `SiteSettings`

Key-value store para **toda** configuração editável pelo admin.  
Zero migrações ao adicionar novas configurações — apenas nova `key`.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `String` (CUID) | PK auto-gerada |
| `key` | `String` (unique) | Identificador da config |
| `value` | `String` | JSON serializado |
| `updatedAt` | `DateTime` | Auto — útil para invalidar cache |

---

## 3. Chaves de SiteSettings

| Key | Tipo do `value` | Propósito |
|-----|----------------|-----------|
| `landing_page_config` | `LandingPageConfig` (JSON) | Textos, hero, CTA, features, FAQ, depoimentos, flags de visibilidade |
| `landing_page_config_pt` | `LandingPageConfig` (JSON) | Override em PT |
| `landing_page_config_en` | `LandingPageConfig` (JSON) | Override em EN |
| `landing_page_config_history` | `SettingsChange[]` (JSON) | Histórico de alterações |
| `freshdesk_config` | `FreshdeskConfig` (JSON) | API key, domain, widgetId, status de sync |
| `freshdesk_config_history` | `SettingsChange[]` (JSON) | Histórico Freshdesk |
| `api_keys` | `ApiKeys` (JSON) | Google Places e outras chaves externas |
| `api_keys_history` | `SettingsChange[]` (JSON) | Histórico API Keys |
| `pricing_visibility` | `Record<PlanType, string[]>` (JSON) | Features visíveis por plano |
| `help_overrides` | `Record<slug, {pt, en}>` (JSON) | Override de conteúdo de tópicos de help |

### Formato do histórico (`*_history`)

```typescript
interface SettingsChange {
    timestamp: string;       // ISO 8601
    user: string;            // email do editor
    changes: FieldChange[];
}

interface FieldChange {
    field: string;           // ex: 'heroTitle'
    oldValue: string;        // valor anterior (API keys mascaradas)
    newValue: string;        // valor novo (API keys mascaradas)
}
```

---

## 4. Operações com o Banco

### Leitura (Server Components)

```typescript
import { getSiteSettings } from '@/application/admin/site-settings.actions';

const config = await getSiteSettings('landing_page_config');
// Retorna: LandingPageConfig | null
```

### Escrita (Server Actions)

```typescript
import { updateSiteSettings } from '@/application/admin/site-settings.actions';

const result = await updateSiteSettings('landing_page_config', {
    heroTitle: 'Novo título',
    // ... outros campos
});
// Retorna: { success: boolean, changesCount: number, error?: string }
```

> ⚠️ **Regra**: nunca usar Prisma diretamente em componentes. Sempre via `getSiteSettings` / `updateSiteSettings`.

### Histórico

```typescript
const history = await getSettingsHistory('landing_page_config_history');
// Retorna: SettingsChange[] (max MAX_HISTORY_ENTRIES entradas)
```

---

## 5. Gerenciamento do Schema

### Sincronizar schema (sem migration)

```bash
npx prisma db push
```

### Visualizar banco

```bash
npx prisma studio
```

### Quando criar migration formal

A landing usa `prisma db push` por simplicidade. Crie script manual em `scripts/` apenas se:
- Adicionar coluna **com dados existentes** (risco de perda)
- Renomear coluna

```sql
-- scripts/migrations/001_add_column.sql
ALTER TABLE SiteSettings ADD COLUMN newField TEXT;
```

---

## 6. Diferença do Banco do Tracka

| | solucoesrkm.com | tracka.solucoesrkm.com |
|---|---|---|
| **Banco** | Turso local (landing) | Turso separado (app) |
| **Dados** | SiteSettings, Employee, User | Users, Items, Houses, Subscriptions, ... |
| **Schema gerenciado por** | `prisma db push` | `prisma migrate dev` |
| **Comunicação** | Via API pública REST | — |
| **PII** | Não (apenas emails de funcionários) | Sim (dados de usuários finais) |

> Os dois bancos são **completamente independentes**. A landing **não acessa** o banco do Tracka diretamente.
