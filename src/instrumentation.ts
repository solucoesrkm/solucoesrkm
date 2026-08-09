/**
 * @file instrumentation.ts
 * @description Hook de boot do Next.js. Loga o fingerprint da ENCRYPTION_KEY
 * ativa para permitir conferir, pelos logs, se a landing e o Tracka usam
 * EXATAMENTE a mesma chave (é obrigatório — os dois compartilham a tabela User).
 *
 * Fingerprints iguais ⇒ chaves iguais. Diferentes ⇒ divergência (login/leitura
 * de dados cifrados entre os apps quebra). NÃO revela a chave.
 */

export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { getKeyFingerprint } = await import('@/infrastructure/crypto/crypto');
            console.info(`[CryptoHealth] Boot — key fingerprint: ${getKeyFingerprint()}`);
        } catch (err) {
            console.error('[CryptoHealth] Boot — falha ao computar fingerprint:', err);
        }
    }
}
