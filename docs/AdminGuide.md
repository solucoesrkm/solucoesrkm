# 🛠️ Guia do Painel Administrativo — solucoesrkm.com

Referência completa de todas as seções do admin, como funcionam e como modificar.

> **Acesso**: `solucoesrkm.com/admin` — requer login com conta Employee (ADMIN ou EDITOR)

---

## Sumário

1. [Configurações do Site](#1-configurações-do-site)
2. [Visibilidade de Pricing](#2-visibilidade-de-pricing)
3. [Freshdesk](#3-freshdesk)
4. [API Keys](#4-api-keys)
5. [Central de Ajuda](#5-central-de-ajuda)
6. [Histórico de Alterações](#6-histórico-de-alterações)
7. [Como adicionar nova seção ao admin](#7-como-adicionar-nova-seção-ao-admin)

---

## 1. Configurações do Site

**Componente**: `src/components/admin/SiteConfigForm.tsx`  
**SiteSettings key**: `landing_page_config`  
**Permissão mínima**: EDITOR

### O que controla

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `heroTitle` | string | Título principal do hero |
| `heroSubtitle` | string | Subtítulo do hero |
| `heroImage` | string (URL) | Imagem de fundo do hero |
| `ctaPrimaryText` | string | Texto do botão CTA |
| `ctaPrimaryLink` | string | Link do botão CTA |
| `footerCtaTitle` | string | Título do CTA no rodapé |
| `footerCtaSubtitle` | string | Subtítulo do CTA no rodapé |
| `footerCtaButton` | string | Texto do botão no rodapé |
| `footerContact` | string | Texto de contato no rodapé |
| `featuresTitle` | string | Título da seção de features |
| `techTitle` | string | Título da seção de tecnologia |
| `showFeatures` | boolean | Exibir/ocultar seção de features |
| `showTechnology` | boolean | Exibir/ocultar seção de tecnologia |
| `showPricing` | boolean | Exibir/ocultar seção de pricing |
| `showTestimonials` | boolean | Exibir/ocultar seção de depoimentos |
| `showFaq` | boolean | Exibir/ocultar seção de FAQ |
| `testimonials[]` | array | Lista de depoimentos |
| `faq[]` | array | Lista de perguntas e respostas |
| `footerLinks[]` | array | Links do rodapé |

### Padrão de merge

A landing usa merge inteligente: campos vazios ou nulos do banco são substituídos pelos defaults hardcoded em `src/config/defaults.ts`. Isso garante que uma configuração incompleta nunca quebra a UI.

```typescript
// Sempre que lê a config:
const merged = { ...DEFAULT_LANDING_CONFIG, ...dbConfig };
// Campos vazios no banco → usa default
```

### Internacionalização do conteúdo

Para textos bilíngues (PT e EN), o admin pode salvar em keys separadas:
- `landing_page_config_pt` → conteúdo sobrescrito em PT
- `landing_page_config_en` → conteúdo sobrescrito em EN

A landing merge em cascata: `landing_page_config_[locale]` → `landing_page_config` → defaults.

---

## 2. Visibilidade de Pricing

**Componente**: `src/components/admin/PricingVisibilityForm.tsx`  
**SiteSettings key**: `pricing_visibility`  
**Permissão mínima**: EDITOR

### O que controla

Quais features são **exibidas** nos cards de pricing por plano. Não controla acesso — só visibilidade de marketing.

```typescript
// Estrutura da config
{
  free:       ['feature1', 'feature2', ...],
  trial:      ['feature1', ...],
  plus:       ['feature1', 'feature2', 'feature3', ...],
  pro:        ['feature1', ..., 'feature15'],
  enterprise: ['feature1', ..., 'feature15'],
}
```

### Relação com herança de planos

A visibilidade é aplicada **depois** da herança. Se o Pro herda do Plus:
- `exclusiveFeatures` = features que estão em `pro[]` mas não em `plus[]`
- Features listadas em `plus[]` já são implicitamente incluídas via herança

---

## 3. Freshdesk

**Componente**: `src/components/admin/FreshdeskConfigForm.tsx`  
**SiteSettings key**: `freshdesk_config`  
**Permissão mínima**: ADMIN

### O que controla

| Campo | Descrição |
|-------|-----------|
| `domain` | Subdomínio do Freshdesk (ex: `suporte.freshdesk.com`) |
| `apiKey` | API key do Freshdesk |
| `widgetId` | ID do widget de chat embarcado |
| `syncEnabled` | Habilitar/desabilitar sync automático |
| `categoryId` | Categoria onde os artigos são publicados |

### Botão de Sync Manual

`src/components/admin/FreshdeskSyncButton.tsx` — chama `POST /api/admin/freshdesk-sync` e exibe progresso em tempo real com polling de status.

**Retorno**: `{ synced: N, skipped: M, errors: [] }`

### Cron Automático

Configurado em `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/freshdesk-sync",
    "schedule": "0 6 * * *"
  }]
}
```

Executa diariamente às 06:00 UTC.

---

## 4. API Keys

**Componente**: `src/components/admin/ApiKeysForm.tsx`  
**SiteSettings key**: `api_keys`  
**Permissão mínima**: ADMIN

### O que controla

| Campo | Descrição |
|-------|-----------|
| `googlePlacesApiKey` | Para autocompletar endereços (se usado) |

### Segurança no histórico

Valores de API keys são mascarados no diff de histórico:
```
sk_live_abcd1234wxyz → sk_l…wxyz
```

---

## 5. Central de Ajuda

O sistema de help tem 3 páginas no admin:

### 5.1 Listagem (`/admin/help`)

Exibe todos os tópicos com:
- Status de override (se o conteúdo foi editado pelo admin)
- Status de sync com Freshdesk (sincronizado/desatualizado/não sincronizado)
- Links para editar e visualizar

### 5.2 Editor (`/admin/help-editor`)

**Componente base de persistência**: `src/components/admin/FreshdeskConfigForm.tsx` (contém editor de conteúdo)

- Editor WYSIWYG por tópico e locale (PT/EN)
- Salva override em `SiteSettings key = 'help_overrides'`
- Permite rollback para versão base (remove override)
- Diff visual entre versão base e override

### 5.3 Validação (`/admin/help-validation`)

Detecta inconsistências:
- Tópico em PT sem EN correspondente
- Override sem tradução PT ou EN
- Slugs referenciados mas não definidos em `help-topics.ts`

---

## 6. Histórico de Alterações

**Componente**: `src/components/admin/ChangeHistory.tsx`  
**Componente de versões**: `src/components/admin/VersionHistory.tsx`

Toda alteração feita via `updateSiteSettings()` gera automaticamente um diff salvo em `key_history`.

### Estrutura de entrada do histórico

```typescript
interface SettingsHistoryEntry {
  timestamp: string;         // ISO 8601
  userId: string;
  userName: string;
  changes: SettingsChange[]; // [{ section, field, oldValue, newValue }]
}
```

### Limites

- Máximo de `MAX_HISTORY_ENTRIES` entradas por key (definido em `src/constants/`)
- Entradas mais antigas são removidas automaticamente (FIFO)

### Comparação visual

`VersionHistory.tsx` permite comparar dois snapshots lado a lado, mostrando quais campos mudaram entre versões.

---

## 7. Como adicionar nova seção ao admin

### Passo a passo

**1. Definir o tipo**

```typescript
// src/types/landing.types.ts
export interface MinhaSecaoConfig {
  titulo: string;
  descricao: string;
  ativo: boolean;
}
```

**2. Adicionar o default**

```typescript
// src/config/defaults.ts
export const DEFAULT_MINHA_SECAO: MinhaSecaoConfig = {
  titulo: 'Título padrão',
  descricao: 'Descrição padrão',
  ativo: true,
};
```

**3. Criar o componente de formulário**

```typescript
// src/components/admin/MinhaSecaoForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateSiteSettings } from '@/application/admin/site-settings.actions';
import { toast } from 'sonner';

const schema = z.object({
  titulo: z.string().min(1),
  descricao: z.string(),
  ativo: z.boolean(),
});

export function MinhaSecaoForm({ initialData }: { initialData: MinhaSecaoConfig }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: initialData });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const result = await updateSiteSettings('minha_secao_config', data);
    if (result.error) toast.error(result.error);
    else toast.success(`Salvo! ${result.changesCount} alteração(ões).`);
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

**4. Registrar HISTORY_KEY (se precisar de histórico)**

```typescript
// src/constants/index.ts
export const HISTORY_KEYS: Record<string, string> = {
  ...EXISTING_KEYS,
  'minha_secao_config': 'minha_secao_config_history',
};
```

**5. Montar na página de settings**

```typescript
// src/app/[locale]/admin/settings/page.tsx
const minhaSecaoConfig = await getSiteSettings('minha_secao_config') ?? DEFAULT_MINHA_SECAO;

// No JSX:
<CollapsibleSection title="Minha Seção">
  <MinhaSecaoForm initialData={minhaSecaoConfig} />
  <ChangeHistory historyKey="minha_secao_config_history" />
</CollapsibleSection>
```

**6. Usar na landing**

```typescript
// src/app/[locale]/page.tsx
const minhaSecaoConfig = await getSiteSettings('minha_secao_config') ?? DEFAULT_MINHA_SECAO;

// Passar para o componente:
<MinhaSecaoSection config={minhaSecaoConfig} />
```

**7. Adicionar strings i18n**

```json
// messages/pt.json
"admin": {
  "minhaSecao": {
    "titulo": "Minha Seção",
    "tituloLabel": "Título",
    "descricaoLabel": "Descrição"
  }
}
// Repetir em messages/en.json
```

**8. Atualizar CHANGELOG.md**

---

## Convenções visuais dos formulários admin

- **Seções colapsáveis**: usar `<CollapsibleSection title="...">` para agrupar
- **Toast de feedback**: sempre `toast.success` / `toast.error` via Sonner
- **Loading state**: usar estado local `isSubmitting` do React Hook Form
- **Histórico**: sempre incluir `<ChangeHistory historyKey="...">` abaixo do form
- **Confirmações destrutivas**: modal de confirmação com texto a digitar (ex: "CONFIRMAR")
