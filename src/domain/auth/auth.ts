/**
 * @file auth.ts
 * @description Autenticação JWT para o painel admin SaaS.
 *
 * Regras:
 * - Apenas employees acessam o admin (sem cadastro público).
 * - Emails @solucoesrkm.com têm auto-provision como Employee(VIEWER).
 * - SUPERADMIN tem bypass total.
 * - Sessão via cookie `session` (JWT assinado com jose).
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { env } from '@/lib/env';
import type { SessionPayload, SystemRole } from '@/types';
import { USER_ROLES, EMPLOYEE_ROLES, EDITABLE_ROLES } from '@/constants';

// ─── Segredo JWT (validado pelo Zod em env.ts) ───────────────────
const key = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Domínio do cookie de sessão. Em produção, COOKIE_DOMAIN=solucoesrkm.com faz o
 * cookie ser compartilhado entre o painel (solucoesrkm.com) e o app
 * (tracka.solucoesrkm.com) — habilita SSO. Requer o MESMO JWT_SECRET nos dois.
 * Dev: indefinido → cookie host-only em localhost.
 */
const COOKIE_DOMAIN = env.COOKIE_DOMAIN || undefined;

// ─── Re-export de tipos (backward compatibility) ─────────────────
export type { SessionPayload, SystemRole } from '@/types';

// ─── Password ─────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12); // 12 rounds = bom equilíbrio segurança/performance
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// ─── JWT ──────────────────────────────────────────────────────────
export async function signToken(payload: SessionPayload, expiration = '1d'): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiration)
        .sign(key);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as SessionPayload;
    } catch {
        return null; // Token expirado ou inválido
    }
}

// ─── Session (Cookie) ─────────────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get('session')?.value;
    if (!token) return null;
    return verifyToken(token);
}

export async function setSession(payload: SessionPayload, remember = false): Promise<void> {
    const expiration = remember ? '30d' : '1d';
    const maxAge = remember ? 30 * 86400 : 86400;
    const token = await signToken(payload, expiration);

    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: COOKIE_DOMAIN,
        maxAge,
        path: '/',
    });
}

export async function clearSession(): Promise<void> {
    // Mesmo domain usado ao criar, senão o cookie compartilhado não é removido.
    (await cookies()).delete({ name: 'session', domain: COOKIE_DOMAIN, path: '/' });
}

// ─── System Role ──────────────────────────────────────────────────
/**
 * Retorna a role do employee no painel admin.
 *
 * Lógica:
 * 1. SUPERADMIN no User → bypass total
 * 2. Employee existente → retorna Employee.role
 * 3. Email @solucoesrkm.com → auto-cria Employee(VIEWER)
 * 4. Qualquer outro → null (sem acesso)
 */
export async function getSystemRole(userId: string): Promise<SystemRole | null> {
    if (!userId) return null;

    try {
        // 1. Check SUPERADMIN
        // Usa emailDomain (em claro) — o email em si é AES-256-GCM (cifrado), então
        // endsWith('@...') sobre user.email NÃO funcionaria. emailDomain é gravado
        // em texto plano pelo Tracka justamente para checagens não-sensíveis como esta.
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, emailDomain: true },
        });
        if (!user) return null;
        if (user.role === USER_ROLES.SUPERADMIN) return 'SUPERADMIN';

        // 2. Check existing Employee
        const employee = await prisma.employee.findUnique({
            where: { userId },
            select: { role: true },
        });
        if (employee) return employee.role as SystemRole;

        // 3. Auto-provision @solucoesrkm.com (via emailDomain, não via email cifrado)
        const adminDomain = process.env.ADMIN_EMAIL_DOMAIN || 'solucoesrkm.com';
        if (user.emailDomain === adminDomain) {
            // Marca User como EMPLOYEE se ainda não for
            if (user.role !== USER_ROLES.EMPLOYEE) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { role: USER_ROLES.EMPLOYEE },
                });
            }

            const newEmployee = await prisma.employee.create({
                data: { userId, role: EMPLOYEE_ROLES.VIEWER },
            });

            // Auto-provisioned employee
            return newEmployee.role as SystemRole;
        }

        // 4. Sem acesso
        return null;
    } catch (error) {
        console.error('[Auth] Error checking system role:', error);
        return null;
    }
}

/**
 * Verifica se o role tem permissão de edição.
 * SUPERADMIN, ADMIN e EDITOR podem editar configs.
 */
export function canEdit(role: SystemRole | null): boolean {
    if (!role) return false;
    return EDITABLE_ROLES.has(role);
}
