/**
 * @file /api/auth/login/route.ts
 * @description API de login para employees.
 *
 * Valida email + senha, verifica se é employee, cria session JWT.
 * Sem cadastro público — user deve existir no banco.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signToken, setSession, type SessionPayload } from '@/lib/auth';
import { rateLimit } from '@/infrastructure/security/rate-limiter';
import { sha256, decrypt } from '@/infrastructure/crypto/crypto';

// 5 tentativas de login por minuto por IP (proteção contra brute force)
const loginLimiter = rateLimit({ maxRequests: 5, windowMs: 60_000, prefix: 'login' });

export async function POST(req: NextRequest) {
    const limited = loginLimiter(req);
    if (limited) return limited;
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
        }

        // ── Buscar user (por emailHash — contrato compartilhado com o Tracka) ──
        // email/name estão cifrados (AES-256-GCM) na tabela; a busca é pelo hash
        // determinístico do email, nunca pelo email em claro.
        const emailInput = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: { emailHash: sha256(emailInput) },
            select: { id: true, name: true, passwordHash: true, role: true },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // ── Verificar senha ──
        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // ── Criar session (com dados decifrados; email digitado é autoritativo) ──
        const decryptedName = decrypt(user.name) || null;
        const payload: SessionPayload = {
            userId: user.id,
            email: emailInput,
            name: decryptedName,
            role: user.role,
        };

        await setSession(payload);

        return NextResponse.json({ success: true, user: { id: user.id, email: emailInput, name: decryptedName } });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
    }
}
