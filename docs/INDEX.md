# 📚 Índice de Documentação — solucoesrkm.com

Mapa de todos os arquivos de documentação do projeto.

---

## Raiz do Projeto

| Arquivo | Finalidade | Quando usar |
|---------|-----------|-------------|
| [README.md](../README.md) | Stack, estrutura, setup, env vars, integração com Tracka | **Primeiro contato** com o projeto |
| [CHANGELOG.md](../CHANGELOG.md) | Histórico de versões (Keep a Changelog + SemVer) | Ao **lançar versão** ou verificar mudanças |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guia completo para devs e **agentes de IA**: padrões, invariantes, quickstart, checklist | **Antes de qualquer modificação** |
| [CONCEPTS.md](../CONCEPTS.md) | Decisões técnicas: SiteSettings, histórico, revalidate, banco separado, herança runtime, formato legado | Ao entender **por que** algo foi implementado assim |
| [SECURITY.md](../SECURITY.md) | Security headers, JWT auth, controle de acesso por role, proteção de API keys, cron auth, auditoria | Ao **adicionar endpoints** ou auditar proteções |
| [VERCEL_GUIDE.md](../VERCEL_GUIDE.md) | Deploy passo a passo, env vars, seed de admin, cron job, troubleshooting | Ao **fazer deploy** ou debugar erros de produção |
| [.env.example](./../.env.example) | Todas as variáveis de ambiente necessárias | Ao configurar ambiente local ou Vercel |

---

## Pasta `docs/`

| Arquivo | Finalidade | Quando usar |
|---------|-----------|-------------|
| [Architecture.md](Architecture.md) | Diagramas Mermaid: infra, auth, fluxo de dados, SiteSettings, herança de planos, Freshdesk | Ao entender o sistema ou **projetar novas features** |
| [Database.md](Database.md) | Schema Prisma (User, Employee, SiteSettings), chaves de SiteSettings, CRUD, comparativo com Tracka | Ao **alterar schema** ou entender a persistência |
| [API.md](API.md) | Referência de todos os endpoints REST (auth, admin, cron), request/response bodies, códigos de erro | Ao **criar/modificar endpoints** ou integrar |
| [Roles.md](Roles.md) | Papéis (SUPERADMIN, ADMIN, EDITOR, VIEWER), matriz de permissões, fluxo de auth, como criar funcionários | Ao **verificar permissões** ou adicionar controle de acesso |
| [AdminGuide.md](AdminGuide.md) | Guia técnico: cada seção do painel admin, campos, estrutura JSON, como adicionar nova seção | Ao **modificar o admin** ou adicionar seção |
| [UserManual.md](UserManual.md) | Manual para administradores não-técnicos: como usar o painel, editar textos, configurar Freshdesk, sincronizar help | Para **treinar admins** ou orientar sobre features |
| [StyleGuide.md](StyleGuide.md) | Design system completo: tokens CSS, tipografia, animações, componentes, regras anti-regressão | Ao **criar ou modificar componentes** de UI |
| [INDEX.md](INDEX.md) | Este arquivo — mapa de toda a documentação | Ao procurar onde está algo |

---

## Arquivos de Config Relevantes

| Arquivo | Finalidade |
|---------|-----------|
| `src/types/landing.types.ts` | `PricingParams`, `PlanInheritance`, `LandingPageConfig`, `FAQItem`, `TestimonialItem` |
| `src/application/admin/site-settings.actions.ts` | CRUD central de toda config (getSiteSettings, updateSiteSettings, getSettingsHistory) |
| `src/constants/index.ts` | `HISTORY_KEYS`, `MAX_HISTORY_ENTRIES` — mapeamento key → historyKey |
| `src/config/defaults.ts` | Valores padrão de todas as configs (usados quando o banco não tem a chave) |
| `src/config/app.config.ts` | `TRACKA_APP_URL`, `LANDING_URL` — constantes de URL centralizadas |
| `src/domain/auth/auth.ts` | `getSession`, `getSystemRole`, `canEdit`, `canView` |
| `src/domain/help/help-topics.ts` | Registro central de todos os tópicos de help |
| `messages/pt.json` | Strings em Português (fonte primária) |
| `messages/en.json` | Strings em Inglês |

---

## Fluxo Recomendado de Leitura

```
1. README.md              → Stack e setup
2. CONTRIBUTING.md        → Padrões e quickstart para IA
3. docs/Architecture.md   → Como o sistema funciona (diagramas)
4. docs/Database.md       → Schema e persistência
5. docs/API.md            → Endpoints disponíveis
6. docs/Roles.md          → Permissões e controle de acesso
7. SECURITY.md            → Proteções implementadas
8. docs/AdminGuide.md     → Painel admin (visão técnica)
9. docs/UserManual.md     → Painel admin (visão do usuário)
10. docs/StyleGuide.md    → Design system e tokens CSS
11. CONCEPTS.md           → Decisões técnicas pontuais
    ... demais conforme necessidade
```

> **Regra**: ao adicionar feature nova, atualizar `CHANGELOG.md` + o arquivo de doc relevante.
