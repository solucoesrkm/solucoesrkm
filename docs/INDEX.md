# 📚 Índice de Documentação — solucoesrkm.com

Mapa de todos os arquivos de documentação do projeto.

---

## Raiz do Projeto

| Arquivo | Finalidade | Quando usar |
|---------|-----------|-------------|
| [README.md](../README.md) | Stack, estrutura, setup, env vars, integração com Tracka | **Primeiro contato** com o projeto |
| [CHANGELOG.md](../CHANGELOG.md) | Histórico de versões (Keep a Changelog + SemVer) | Ao **lançar versão** ou verificar mudanças |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Guia completo para devs e **agentes de IA**: padrões, invariantes, quickstart | **Antes de qualquer modificação** |
| [.env.example](./../.env.example) | Todas as variáveis de ambiente necessárias | Ao configurar ambiente local ou Vercel |

---

## Pasta `docs/`

| Arquivo | Finalidade | Quando usar |
|---------|-----------|-------------|
| [Architecture.md](Architecture.md) | Diagramas Mermaid: infra, auth, fluxo de dados, SiteSettings, herança de planos, Freshdesk | Ao entender o sistema ou **projetar novas features** |
| [AdminGuide.md](AdminGuide.md) | Cada seção do painel admin: campos, estrutura, permissões, passo a passo para adicionar novas seções | Ao **modificar o admin** ou adicionar seção |
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
| `src/domain/auth/auth.ts` | getSession, getSystemRole, canEdit, canView |
| `src/domain/help/help-topics.ts` | Registro central de todos os tópicos de help |
| `messages/pt.json` | Strings em Português (fonte primária) |
| `messages/en.json` | Strings em Inglês |

---

## Fluxo Recomendado de Leitura

```
1. README.md              → Stack e setup
2. CONTRIBUTING.md        → Padrões e quickstart para IA
3. docs/Architecture.md   → Como o sistema funciona (diagramas)
4. docs/AdminGuide.md     → O que cada seção do admin controla
5. docs/StyleGuide.md     → Design system e tokens CSS (ao criar UI)
   ... demais conforme necessidade
```

> **Regra**: ao adicionar feature nova, atualizar `CHANGELOG.md` + o arquivo de doc relevante.
