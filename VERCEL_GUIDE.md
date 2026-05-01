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
| `DATABASE_AUTH_TOKEN` | ✅ | Token de autenticação Turso |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://tracka.solucoesrkm.com` |
| `NEXT_PUBLIC_LANDING_URL` | ✅ | `https://solucoesrkm.com` |
| `JWT_SECRET` | ✅ | Mínimo 32 chars — `openssl rand -base64 32` |
| `TRACKA_API_URL` | ✅ | `https://tracka.solucoesrkm.com` |
| `TRACKA_LANDING_API_KEY` | ✅ | Gerada no admin do Tracka → API Keys |
| `FRESHDESK_API_KEY` | ⚪ | Necessária para sync com Freshdesk |
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

1. Verificar se `TRACKA_API_URL` está correto
2. Verificar se `TRACKA_LANDING_API_KEY` foi gerada e está ativa no admin do Tracka
3. Testar manualmente: `curl https://tracka.solucoesrkm.com/api/public/plans -H "x-api-key: SEU_KEY"`

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
