# 💡 CONCEPTS — Decisões Técnicas

Registro das principais decisões de arquitetura e design da landing page `solucoesrkm.com`.  
Cada seção responde **por que** algo foi feito de determinada forma.

> **Quando consultar**: Ao entender o "por quê" de uma decisão. Para o "como", veja [`docs/Architecture.md`](docs/Architecture.md).

---

## 1. Por que SiteSettings em vez de tabelas dedicadas?

**Decisão**: todo conteúdo configurável é armazenado em `SiteSettings` como um key-value store (`key: string`, `value: JSON string`).

**Por que não colunas separadas?**

| Abordagem | Problema |
|-----------|----------|
| Colunas fixas (`heroTitle`, `heroSubtitle`, ...) | Cada nova configuração exigiria migration + deploy |
| Tabelas por seção (`HeroConfig`, `PricingConfig`, ...) | Schema explode com crescimento do admin |
| **Key-value (SiteSettings)** | ✅ Nova config = nova key. Zero migration. |

**Trade-off aceito**: sem tipagem estática no banco. Mitigado com Zod nos forms e TypeScript nos tipos.

---

## 2. Por que o histórico usa chaves derivadas `*_history`?

**Decisão**: ao gravar `landing_page_config`, o sistema salva automaticamente o diff em `landing_page_config_history`.

**Motivação**: auditoria sem tabela extra, sem FK, sem JOIN. Cada entry de histórico é JSON puro com `{ timestamp, user, changes[] }`.

**Tamanho máximo**: `MAX_HISTORY_ENTRIES` (definido em `src/constants/`) — mais antigas são descartadas (FIFO).

---

## 3. Por que `revalidate: 60` na chamada de planos do Tracka?

```typescript
const res = await fetch(`${TRACKA_API_URL}/api/public/plans?locale=${locale}`, {
    next: { revalidate: 60 },
});
```

**Por que não `revalidate: 0` (sempre fresco)?**
- O admin do Tracka raramente muda preços. Cache de 60s é aceitável.
- `revalidate: 0` causaria uma chamada à API do Tracka a cada page view.

**Por que não `Infinity` (estático)?**
- Quando o admin ativa o Enterprise, a landing precisaria refletir em minutos.

**Por que 60s?**
- Alinha com o cache da API `/api/plan-config` do próprio Tracka.
- Máximo 2 minutos de defasagem após mudança no admin.

---

## 4. Por que o banco Turso é local (sem compartilhar com Tracka)?

**Decisão**: a landing tem seu próprio banco Turso local para `SiteSettings` e `Employee`.

**Por que não compartilhar o banco do Tracka?**
- O banco do Tracka contém dados de usuários finais (PII), itens, histórico. A landing não precisa disso.
- Separação garante que um problema no banco da landing não afete o app e vice-versa.
- O Tracka gerencia suas próprias migrações — a landing não deve interferir.

**Como consomem o mesmo data?**
- A landing lê os **planos** via API pública `/api/public/plans` (autenticada com `TRACKA_LANDING_API_KEY`).
- Nada mais é compartilhado diretamente.

---

## 5. Por que não há migrações Prisma próprias?

**Decisão**: o schema da landing só tem 3 modelos simples (`User`, `Employee`, `SiteSettings`). Em vez de `prisma migrate`, usa-se `prisma db push`.

**Quando usar `prisma db push`?**

```bash
# Sincroniza o schema sem criar arquivo de migração
npx prisma db push
```

**Quando criar migration formal?**
- Se adicionar colunas que podem conter dados (risco de perda) → criar script manual em `scripts/`.

---

## 6. Por que herança de planos é calculada em runtime?

**Decisão**: `detectPlanInheritance()` roda a cada build de página, nunca persiste no banco.

**Por que não persistir no banco?**
- O admin do Tracka muda os limites de planos e isso deve refletir automaticamente.
- Persistir exigiria webhook ou polling para manter sincronizado.
- Em runtime com cache de 60s, a landing reflete mudanças em ≤ 1 minuto — aceitável.

**Custo computacional**: O algoritmo é O(n) onde n = número de planos (≤ 6). Negligível.

---

## 7. Por que o formato legado `{ pt, en }` existe em campos de pricing?

Campos como `plan.price` e `plan.description` podem vir como:
- **Formato atual**: `"R$ 9,90"` (string simples)
- **Formato legado**: `{ "pt": "R$ 9,90", "en": "$2.00" }` (objeto com locale)

O formato legado existia antes da landing consumir a API do Tracka com locale. A função `resolveText()` em `pricing.utils.ts` lida com ambos para retrocompatibilidade.

---

## 8. Por que `'unsafe-inline'` no CSP?

**Decisão**: O CSP inclui `'unsafe-inline'` em `script-src` e `style-src`.

**Motivo**: Next.js App Router injeta scripts inline para hidratação. Tailwind CSS injeta estilos inline.

**Mitigação**:
- `'unsafe-eval'` limita execução dinâmica
- `object-src 'none'` bloqueia plugins
- `base-uri 'self'` previne base tag hijacking
- `form-action 'self'` previne redirect de forms

---

## 9. Snapshot-based dirty checking (formulários admin)

**Problema**: Server Actions revalidam o cache e re-renderizam o Server Component pai. Isso faz o formulário "resetar" visualmente mesmo quando o usuário não salvou.

**Solução**: `useRef` captura o snapshot inicial dos dados. Após revalidação, comparação mostra se o formulário está "sujo" (tem edições não salvas).

```typescript
const initialSnapshot = useRef(JSON.stringify(initialData));
const isDirty = JSON.stringify(currentValues) !== initialSnapshot.current;
```

Documentado em detalhe no [KI — Tracka Project Overview](../docs/Architecture.md).

---

## 10. Por que o admin da landing não tem 2FA?

**Decisão**: o painel admin da landing não exige TOTP/2FA.

**Motivo**:
1. A landing não processa dados de usuários finais (PII).
2. O único dado sensível são as API keys, que são mascaradas no diff.
3. O acesso ao admin é restrito por rede corporativa (apenas `@solucoesrkm.com`).

**Se escalar**: implementar TOTP via `otpauth` (mesmo padrão do Tracka) quando houver equipe maior.
