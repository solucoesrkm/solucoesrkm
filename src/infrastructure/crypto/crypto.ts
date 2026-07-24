/**
 * Criptografia AES-256-GCM para campos sensíveis.
 *
 * ⚠️  CONTRATO COMPARTILHADO COM O TRACKA (tracka.solucoesrkm.com).
 *     Os dois apps usam a MESMA tabela `User` e a MESMA ENCRYPTION_KEY.
 *     Este módulo DEVE gerar exatamente o mesmo formato de valor cifrado
 *     ("enc:<iv_hex>:<authTag_hex>:<ciphertext_hex>") e o mesmo emailHash
 *     (sha256) que o Tracka — senão login/leitura entre os apps quebra.
 *     Se alterar aqui, alinhe o crypto.ts do Tracka na mesma hora.
 *
 * Usa Node.js crypto nativo — sem dependências externas.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:';

/**
 * SHA-256 hash determinístico.
 * Usado para: emailHash (busca/login), tokens de verificação (comparação).
 * Não reversível — apenas para busca/comparação. NÃO usa ENCRYPTION_KEY.
 */
export function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

/**
 * Verifica se um valor já está criptografado.
 */
export function isEncrypted(value: string): boolean {
    return value.startsWith(PREFIX);
}

/**
 * Chave de desenvolvimento estável usada quando ENCRYPTION_KEY não está configurada.
 * ⚠️  Pública (hardcoded) e NÃO deve ser usada em produção. Em produção,
 *     ENCRYPTION_KEY é obrigatória e sua ausência lança Error.
 */
const DEV_FALLBACK_KEY = '0'.repeat(64); // 32 bytes de zero — seguro para dev, inútil em prod

/**
 * Retorna a chave de criptografia (32 bytes).
 * - Produção: exige ENCRYPTION_KEY (hex de 64 chars) — lança Error se ausente/ inválida.
 * - Dev/Test: usa DEV_FALLBACK_KEY se ENCRYPTION_KEY não estiver definida.
 */
function getKey(): Buffer {
    const hex = process.env.ENCRYPTION_KEY;

    if (!hex) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                '[Crypto] ENCRYPTION_KEY não configurada em produção. ' +
                'Defina a MESMA chave hex de 64 caracteres usada no Tracka.'
            );
        }
        console.warn('[Crypto] ENCRYPTION_KEY não configurada. Usando chave de desenvolvimento (não segura para produção).');
        return Buffer.from(DEV_FALLBACK_KEY, 'hex');
    }

    if (hex.length !== 64) {
        const msg = '[Crypto] ENCRYPTION_KEY deve ter 64 caracteres hex (32 bytes).';
        if (process.env.NODE_ENV === 'production') {
            throw new Error(msg);
        }
        console.warn(msg + ' Usando chave de desenvolvimento.');
        return Buffer.from(DEV_FALLBACK_KEY, 'hex');
    }

    return Buffer.from(hex, 'hex');
}

/**
 * Criptografa um valor de texto plano.
 * Retorna o valor original se já estiver criptografado (ou vazio/nulo).
 */
export function encrypt(plaintext: string | null | undefined): string | null {
    if (!plaintext) return plaintext as null;
    if (isEncrypted(plaintext)) return plaintext; // já criptografado

    const key = getKey();
    const iv = randomBytes(12); // 96 bits para GCM
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Descriptografa um valor cifrado.
 * - Texto plano (sem prefixo "enc:") → devolve como está.
 * - Cifrado que não decifra com a chave atual → devolve '' (ilegível), NÃO derruba a página.
 */
export function decrypt(ciphertext: string | null | undefined): string | null {
    if (!ciphertext) return ciphertext as null;
    if (!isEncrypted(ciphertext)) return ciphertext; // texto plano

    try {
        // getKey() DENTRO do try: uma ENCRYPTION_KEY ausente/errada não deve
        // derrubar páginas inteiras na leitura.
        const key = getKey();

        const parts = ciphertext.slice(PREFIX.length).split(':');
        if (parts.length !== 3) return ''; // formato inválido → ilegível

        const [ivHex, authTagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        const decipher = createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        // Cifrado que não decifra com a chave atual (ex.: chave divergente do Tracka).
        // Devolve vazio para não exibir "enc:..." na UI; o dado bruto continua no banco.
        console.error('[Crypto] Falha ao descriptografar:', error);
        return '';
    }
}
