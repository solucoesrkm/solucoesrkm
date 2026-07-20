# AGENTS.md — solucoesrkm.com (Landing + Admin)

> **Fonte única de verdade para agentes de IA.** Lido nativamente pelo OpenClaw e por
> ferramentas compatíveis com o padrão `AGENTS.md`. Não repete a documentação — orienta e
> aponta. Em caso de conflito, este arquivo tem precedência sobre regras específicas de
> ferramenta (`.agents/workflows/`, etc.).

---

## 1. O que é este projeto

Landing page pública **+ painel administrativo** da plataforma **Tracka**.

| Domínio | Propósito |
|---|---|
| `solucoesrkm.com` | Landing pública (marketing, pricing, ajuda, legal) |
| `solucoesrkm.com/admin` | Painel admin de conteúdo (protegido por JWT) |

> O **app principal** (`tracka.solucoesrkm.com`) é o repositório separado
> **`controle-das-coisas`**. Ambos **compartilham o mesmo banco Turso (LibSQL)** via Prisma —
> mudanças de schema precisam ser coordenadas entre os dois repos.

---

## 2. Antes de qualquer coisa: se situe

**Sempre comece por [`docs/INDEX.md`](docs/INDEX.md)** e por [`CONTRIBUTING.md`](CONTRIBUTING.md)
(tem quickstart e invariantes para agentes).

| Preciso de… | Fonte primária |
|---|---|
| Padrões da landing (tokens, tipos, SEO, i18n) | [`.agents/workflows/landing-page-standards.md`](.agents/workflows/landing-page-standards.md) |
| Arquitetura | [`docs/Architecture.md`](docs/Architecture.md), [`CONCEPTS.md`](CONCEPTS.md) |
| Design system / UI | [`docs/StyleGuide.md`](docs/StyleGuide.md) |
| Banco de dados | [`docs/Database.md`](docs/Database.md), `prisma/schema.prisma` |
| API / endpoints | [`docs/API.md`](docs/API.md) |
| Painel admin | [`docs/AdminGuide.md`](docs/AdminGuide.md) |
| Permissões / roles | [`docs/Roles.md`](docs/Roles.md) |
| Segurança / auth | [`SECURITY.md`](SECURITY.md) |
| Deploy | [`VERCEL_GUIDE.md`](VERCEL_GUIDE.md) |

---

## 3. Ambiente & modelo de sincronização (LEIA)

Este repositório é trabalhado por **mais de uma ferramenta**:

- **Ferramentas Windows-nativas** (Windsurf, Cursor, Gemini) editam em `C:\Projetos\solucoesrkm`.
- **OpenClaw** roda em **WSL/Linux**, isolado do Windows, num **clone Git próprio**
  (ex.: `~/projetos/solucoesrkm`).

### 🔑 Regra de ouro: o Git é a única fonte de verdade

1. **Commite antes de trocar de ferramenta** — trabalho não commitado é invisível às outras.
2. **`git pull` ao começar** a sessão.
3. **`git push`** ao terminar um bloco coerente.
4. Uma feature = uma branch (ver §5). Nunca trabalhe direto na `main`.

### Execução por ferramenta

No **OpenClaw (WSL/Linux)** o shell funciona normalmente (`bash`, `git`, `node`, `npm`,
`find`, `grep`…). Regras de "não usar shell" de ferramentas Windows **não se aplicam aqui**.

---

## 4. Stack & como rodar

- **Next.js 16** (App Router + SSR) · **TypeScript strict** · **Tailwind CSS v4**
- **Turso (LibSQL)** via **Prisma** (mesmo banco do Tracka) · **Auth** JWT (jose) em cookie HttpOnly
- **i18n** next-intl (`pt`, `en`) · **Forms** React Hook Form + Zod · **Freshdesk** (suporte) · Deploy **Vercel**

```bash
npm install     # postinstall roda prisma generate
npm run dev
npm run build
```

Env vars em [`.env.example`](.env.example).

---

## 5. Convenções de commit & branch

**Conventional Commits**, descrição no imperativo em português:

```
feat(pricing): adiciona toggle mensal/anual na seção de planos
fix(seo): corrige hreflang na página de ajuda
docs(admin): atualiza guia do editor de conteúdo
```

- **Types:** `feat` `fix` `docs` `refactor` `test` `chore` `perf` `style`
- **Branch:** `feat/nome`, `fix/nome`, `docs/nome` · **Merge:** squash na `main` · tags `vX.Y.Z`

---

## 6. Regras críticas da landing (memorizar)

1. **Design tokens:** todo estilo usa CSS custom properties `--landing-*` em `src/app/globals.css`.
   **NUNCA** hex/rgba inline em `style={{}}` — sempre um token. Ver `landing-page-standards.md`.
2. **Tipos:** importe sempre de `@/types` (barrel), nunca de `@/config/landing.config`.
3. **i18n:** toda string visível vem de `t()`/`tc()`; atualize `messages/pt.json` E `messages/en.json`.
   Nunca hardcode texto PT/EN.
4. **Seções condicionais:** via `config.showX !== false`.
5. **SEO:** manter `robots.ts`, `sitemap.ts`, `generateMetadata()`, JSON-LD e hierarquia de headings
   (1×h1 + N×h2). Checklist em `landing-page-standards.md`.
6. **Banco compartilhado:** schema em `prisma/schema.prisma` é coordenado com o `controle-das-coisas`.

---

## 7. Portão de qualidade (antes de "pronto")

```bash
npx tsc --noEmit     # zero erros de tipo
npm run build        # build deve passar
```

Verifique: `pt.json` e `en.json` atualizados · SEO intacto · sem hex inline · roles/admin protegidos.

---

## 8. Segurança — regra inegociável

- **NUNCA** commite segredos. `.env*` fora do Git (o `.gitignore` já cobre — mantenha assim).
- Segredo que tocou o Git é segredo **queimado** → rotacione a chave.
- Auth em toda rota admin; API keys protegidas (ver `SECURITY.md`).
