# 🔌 API Reference — solucoesrkm.com

Referência de todos os endpoints REST da landing page corporativa.

> **Base URL (produção)**: `https://solucoesrkm.com`  
> **Autenticação**: Cookie `session` (JWT) para rotas admin | `CRON_SECRET` para cron | Nenhuma para rotas públicas

---

## Sumário

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| `GET` | `/api/health` | Nenhuma | Health check |
| `POST` | `/api/auth/login` | Nenhuma | Login do admin |
| `POST` | `/api/auth/logout` | Session | Logout |
| `POST` | `/api/admin/freshdesk-sync` | Session (EDITOR+) | Sync manual com Freshdesk |
| `GET/POST` | `/api/admin/help-topics` | Session (EDITOR+) | Gestão de tópicos de help |
| `POST` | `/api/admin/help-validation` | Session (VIEWER+) | Validação de consistência do help |
| `POST` | `/api/admin/translate-config` | Session (ADMIN+) | Config de tradução |
| `POST` | `/api/admin/translate-fields` | Session (EDITOR+) | Tradução de campos |
| `GET/POST` | `/api/admin/api-keys` | Session (ADMIN+) | Gestão de API keys |
| `POST` | `/api/cron/freshdesk-sync` | `CRON_SECRET` | Sync automático diário |

---

## Rotas Públicas

### `GET /api/health`

Health check do sistema.

**Response `200`:**
```json
{
    "status": "ok",
    "timestamp": "2026-05-01T20:00:00.000Z"
}
```

---

## Autenticação

### `POST /api/auth/login`

Autentica um funcionário e cria sessão JWT.

**Request body:**
```json
{
    "email": "admin@solucoesrkm.com",
    "password": "SuaSenha123!"
}
```

**Response `200` (sucesso):**
- Seta cookie `session` (HttpOnly, SameSite=Lax)
- Retorna redirect para `/admin/settings`

**Response `401`:**
```json
{ "error": "Credenciais inválidas" }
```

**Response `403`:**
```json
{ "error": "Acesso restrito a funcionários" }
```

---

### `POST /api/auth/logout`

Encerra a sessão atual.

**Auth**: Session cookie (qualquer Employee)

**Response**: Limpa cookie + redirect para `/admin/login`

---

## Admin — Freshdesk

### `POST /api/admin/freshdesk-sync`

Dispara sincronização manual dos artigos de help com o Freshdesk.

**Auth**: Session + `EDITOR` ou superior

**Request body:**
```json
{
    "locale": "pt"   // opcional, default 'pt'
}
```

**Response `200`:**
```json
{
    "synced": 12,
    "skipped": 3,
    "errors": 0,
    "message": "Sincronização concluída: 12 artigos atualizados"
}
```

**Response `400`:**
```json
{ "error": "Freshdesk não configurado. Configure em Admin → Suporte." }
```

---

## Admin — Help Topics

### `GET /api/admin/help-topics`

Lista todos os tópicos de help com status de sync.

**Auth**: Session + `VIEWER` ou superior

**Response `200`:**
```json
[
    {
        "slug": "como-catalogar-item",
        "title": "Como catalogar um item",
        "status": "synced",        // "synced" | "pending" | "error" | "draft"
        "lastSyncedAt": "2026-05-01T03:30:00.000Z"
    }
]
```

---

### `POST /api/admin/help-topics`

Cria ou atualiza override de conteúdo de um tópico.

**Auth**: Session + `EDITOR` ou superior

**Request body:**
```json
{
    "slug": "como-catalogar-item",
    "pt": "Conteúdo em português...",
    "en": "Content in English..."
}
```

**Response `200`:**
```json
{ "success": true, "slug": "como-catalogar-item" }
```

---

## Admin — Help Validation

### `POST /api/admin/help-validation`

Valida consistência dos tópicos de help (PT e EN presentes, sem slugs orphans).

**Auth**: Session + `VIEWER` ou superior

**Response `200`:**
```json
{
    "valid": true,
    "issues": [],
    "stats": {
        "total": 15,
        "missingPt": 0,
        "missingEn": 0,
        "orphaned": 0
    }
}
```

---

## Admin — Tradução

### `POST /api/admin/translate-config`

Configura as credenciais de tradução automática.

**Auth**: Session + `ADMIN` ou superior

**Request body:**
```json
{
    "provider": "google",            // "google" | "deepl"
    "apiKey": "AIza...",
    "enabled": true
}
```

---

### `POST /api/admin/translate-fields`

Traduz campos de texto usando o provider configurado.

**Auth**: Session + `EDITOR` ou superior

**Request body:**
```json
{
    "fields": {
        "heroTitle": "Inventário Inteligente",
        "heroSubtitle": "Organize tudo que você possui"
    },
    "targetLocale": "en"
}
```

**Response `200`:**
```json
{
    "translated": {
        "heroTitle": "Intelligent Inventory",
        "heroSubtitle": "Organize everything you own"
    }
}
```

---

## Admin — API Keys

### `GET /api/admin/api-keys`

Retorna as API keys configuradas (mascaradas).

**Auth**: Session + `ADMIN` ou superior

**Response `200`:**
```json
{
    "googlePlacesApiKey": "AIza****...****Xyz",
    "trackaLandingApiKey": "sk_****...****abc"
}
```

---

### `POST /api/admin/api-keys`

Atualiza uma ou mais API keys.

**Auth**: Session + `ADMIN` ou superior

**Request body:**
```json
{
    "googlePlacesApiKey": "AIzaNova...",
    "trackaLandingApiKey": null     // null = não alterar
}
```

**Response `200`:**
```json
{
    "success": true,
    "changesCount": 1
}
```

---

## Cron

### `POST /api/cron/freshdesk-sync`

Endpoint chamado pela Vercel Cron diariamente às **03:30 UTC**.

**Auth**: Header `Authorization: Bearer {CRON_SECRET}`

**Response `200`:**
```json
{
    "synced": 12,
    "skipped": 3,
    "errors": 0
}
```

**Response `401`:**
```json
{ "error": "Unauthorized" }
```

---

## Códigos de Erro Comuns

| Código | Significado |
|--------|-------------|
| `400` | Body inválido ou config ausente |
| `401` | Sem autenticação (session ausente) |
| `403` | Role insuficiente |
| `500` | Erro interno (ver logs da Vercel) |

---

## Notas de Segurança

- **API Keys** nunca são retornadas em plaintext nas responses — sempre mascaradas (`****`)
- **Session cookie**: HttpOnly, Secure, SameSite=Lax — não acessível via JavaScript
- **CRON_SECRET**: obrigatório em produção — sem ele o cron retorna `401`
- **Rate limiting**: não implementado na landing (endpoints admin requerem sessão ativa — proteção suficiente para escala atual)
