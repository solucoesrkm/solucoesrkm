#!/usr/bin/env node
/**
 * @file scripts/check-env.mjs
 * @description Preflight de variáveis de ambiente — roda ANTES do `next build`.
 *
 * Por quê: a validação Zod em `src/infrastructure/env.ts` roda durante o build
 * (ao coletar dados das páginas) e, quando falta uma env, o erro do Next é
 * críptico ("Failed to collect page data for ..."). Este script antecipa a
 * verificação e imprime um checklist claro e acionável no topo do log de build,
 * falhando cedo quando algo obrigatório estiver ausente.
 *
 * Onde roda: `prebuild` (npm) → executado no CI (envs dummy) e no Vercel (envs reais).
 * Ambientes sem `.env` (Vercel/CI) usam as envs já injetadas no processo.
 *
 * Escapatória: defina SKIP_ENV_CHECK=1 para pular (não recomendado).
 */

// ─── Definição das variáveis ──────────────────────────────────────────────────
// level: 'required'  → ausência FALHA o build
//        'recommended'→ ausência apenas AVISA (feature deixa de funcionar)
//        'defaulted'  → tem default no schema; ausência é OK (informativo)
const VARS = [
    { key: 'DATABASE_URL',           level: 'required',    hint: 'libsql://... (Turso da landing)' },
    { key: 'JWT_SECRET',             level: 'required',    hint: '≥16 chars — node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"' },
    { key: 'TURSO_AUTH_TOKEN',       level: 'recommended', hint: 'token do Turso — sem ele a conexão libsql falha em runtime' },
    { key: 'TRACKA_LANDING_API_KEY', level: 'recommended', hint: 'x-api-key p/ /api/public/plans do Tracka — sem ela o pricing cai no fallback i18n' },
    { key: 'NEXT_PUBLIC_APP_URL',    level: 'defaulted',   hint: 'default: https://tracka.solucoesrkm.com' },
    { key: 'NEXT_PUBLIC_SITE_URL',   level: 'defaulted',   hint: 'default: https://solucoesrkm.com' },
];

// ─── Cores (degradam para texto puro se não for TTY / NO_COLOR) ───────────────
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = (s) => c('2', s);
const bold = (s) => c('1', s);
const green = (s) => c('32', s);
const yellow = (s) => c('33', s);
const red = (s) => c('31', s);

if (process.env.SKIP_ENV_CHECK === '1') {
    console.log(yellow('⏭️  [check-env] SKIP_ENV_CHECK=1 — validação de env pulada.'));
    process.exit(0);
}

const present = (k) => {
    const v = process.env[k];
    return typeof v === 'string' && v.trim().length > 0;
};

const missingRequired = [];
const missingRecommended = [];

console.log(bold('\n🔎 Preflight de variáveis de ambiente\n'));

for (const { key, level, hint } of VARS) {
    const ok = present(key);
    if (ok) {
        console.log(`  ${green('✅')} ${key} ${dim('· ok')}`);
        continue;
    }
    if (level === 'required') {
        missingRequired.push({ key, hint });
        console.log(`  ${red('❌')} ${bold(key)} ${red('(obrigatória, ausente)')} ${dim('· ' + hint)}`);
    } else if (level === 'recommended') {
        missingRecommended.push({ key, hint });
        console.log(`  ${yellow('⚠️ ')} ${key} ${yellow('(recomendada, ausente)')} ${dim('· ' + hint)}`);
    } else {
        console.log(`  ${dim('•')}  ${key} ${dim('(usando default) · ' + hint)}`);
    }
}

console.log('');

if (missingRecommended.length) {
    console.log(yellow(`⚠️  ${missingRecommended.length} recomendada(s) ausente(s) — build segue, mas features podem não funcionar.`));
}

if (missingRequired.length) {
    console.log(red(bold(`\n❌ Build abortado: ${missingRequired.length} variável(is) OBRIGATÓRIA(s) ausente(s):`)));
    for (const { key, hint } of missingRequired) {
        console.log(red(`   • ${key}`) + dim(` — ${hint}`));
    }
    console.log(dim('\n   Onde definir: Vercel → Settings → Environment Variables (prod/preview),'));
    console.log(dim('   ou copie .env.example para .env no ambiente local.\n'));
    process.exit(1);
}

console.log(green(bold('✅ Env OK — seguindo para o build.\n')));
process.exit(0);
