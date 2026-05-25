/**
 * @file app.config.ts
 * @description Constantes centralizadas de URLs do ecossistema.
 *
 * REGRA: nunca hardcodar URLs de app em componentes.
 * Sempre importar daqui para facilitar troca de domínio.
 */

/** URL do app Tracka (tracka.solucoesrkm.com) — para links de login, register e API pública. */
export const TRACKA_APP_URL =
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://tracka.solucoesrkm.com';

/** URL desta landing page (solucoesrkm.com) — para SEO, robots.txt e sitemap. */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://solucoesrkm.com';
