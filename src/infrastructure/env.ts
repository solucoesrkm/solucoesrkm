/**
 * @file env.ts
 * @description Validação de variáveis de ambiente com Zod.
 *
 * Importar este módulo garante que todas as env vars obrigatórias
 * existam e tenham o formato correto. Erros são claros e acionáveis.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const url = env.DATABASE_URL;
 */

import { z } from 'zod';

// ─── Schema ───────────────────────────────────────────────────────

const envSchema = z.object({
    // Database
    DATABASE_URL: z
        .string({ message: 'DATABASE_URL é obrigatório. Defina no .env' })
        .min(1, 'DATABASE_URL não pode ser vazio'),
    TURSO_AUTH_TOKEN: z.string().optional(),

    // Freshdesk (optional)
    FRESHDESK_DOMAIN: z.string().optional(),

    // Auth
    JWT_SECRET: z
        .string({ message: 'JWT_SECRET é obrigatório. Gere com: openssl rand -hex 32' })
        .min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres'),

    // Criptografia de PII — DEVE ser a MESMA chave do Tracka (tabela User compartilhada).
    // Opcional no schema para não travar dev/test; crypto.ts faz fail-fast em produção.
    ENCRYPTION_KEY: z
        .string()
        .length(64, 'ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes) — a MESMA do Tracka')
        .optional(),

    // Domínio do cookie de sessão. Em prod = solucoesrkm.com (SSO com tracka.solucoesrkm.com).
    // Dev: deixe indefinido (cookie host-only em localhost).
    COOKIE_DOMAIN: z.string().optional(),

    // URLs
    NEXT_PUBLIC_APP_URL: z
        .string()
        .url('NEXT_PUBLIC_APP_URL deve ser uma URL válida')
        .default('https://tracka.solucoesrkm.com'),
    NEXT_PUBLIC_SITE_URL: z
        .string()
        .url('NEXT_PUBLIC_SITE_URL deve ser uma URL válida')
        .default('https://solucoesrkm.com'),

    // Node
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
});

// ─── Validação ────────────────────────────────────────────────────

function validateEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        const formatted = Object.entries(errors)
            .map(([key, msgs]) => `  ❌ ${key}: ${msgs?.join(', ')}`)
            .join('\n');

        console.error(
            '\n╔══════════════════════════════════════════════════╗\n' +
            '║  ⚠️  Variáveis de ambiente inválidas            ║\n' +
            '╚══════════════════════════════════════════════════╝\n\n' +
            formatted + '\n\n' +
            '💡 Copie .env.example para .env e preencha os valores.\n'
        );
        throw new Error('[Env] Variáveis de ambiente inválidas. Veja os erros acima.');
    }

    return parsed.data;
}

// ─── Export ───────────────────────────────────────────────────────

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
