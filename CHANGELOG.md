# Changelog — solucoesrkm.com

Histórico de versões da landing page corporativa.  
Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) | Versionamento: [SemVer](https://semver.org/spec/v2.0.0.html)

---

## [0.4.0] — 2026-05-01

### Added

- **Herança automática de planos** no `PricingSection.tsx`: quando o Tracka detecta que um plano superior cobre completamente um inferior, a landing exibe separador minimalista "Tudo do [Plano X], mais:" + lista apenas dos `exclusiveFeatures`. Retrocompatível: sem `inheritance`, exibe lista completa.
- **Tipo `PlanInheritance`** em `landing.types.ts`: `{ inheritsFrom, inheritsFromName, exclusiveFeatures[] }`.
- **Campo `inheritance?`** adicionado ao `PricingParams`.

### Changed

- `app/[locale]/page.tsx`: migrado de `/api/plan-config` para `GET /api/public/plans?locale=...` do Tracka — pricing e herança retornados prontos na resposta, sem reconstrução manual.
- `PricingSection.tsx`: prop `inheritanceLabel` passada via page.tsx (PT/EN inline, sem chave de tradução separada).

---

## [0.3.0] — 2026-05-01

### Added

- **Notificações e suporte** adicionados à lista de features dos cards de pricing (15 features no total).
- **Null guards** em `PricingSection.tsx` para evitar crash quando a API retorna campos opcionais ausentes.

---

## [0.2.0] — 2026-04-27

### Added

- **Landing page estilo Netflix** com animações, glassmorphism, hero dinâmico e seções de features.
- **Painel admin completo**: `SiteConfigForm`, `PricingVisibilityForm`, `FreshdeskConfigForm`, `ApiKeysForm`, `ChangeHistory`, `VersionHistory`.
- **SEO**: `sitemap.ts`, `robots.ts`, Open Graph, JSON-LD.
- **Central de ajuda pública** (`/help`) sincronizada com Freshdesk via cron.
- **i18n** com `next-intl`: PT/EN em todas as páginas.
- **Rotas legais**: `/terms`, `/privacy`, `/cookies`, `/legal`.
- **Autenticação admin** via JWT (cookie HttpOnly) — mesma infra do Tracka.

---

## [0.1.0] — 2026-04-22

### Added

- Inicialização do projeto com `create-next-app`.
- Estrutura base de rotas `[locale]`, layout raiz, `globals.css`.
- Configuração Tailwind CSS v4, Prisma + Turso, next-intl.
