/**
 * @file admin/login/page.tsx
 * @description Página de login para employees acessarem o admin SaaS.
 *
 * Design replicado do Tracka login — light theme, card branco/claro,
 * título com gradiente azul→roxo, botão teal (#287D8B).
 * Inclui: Lembrar de mim, Esqueci minha senha, Criar cadastro (employees).
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const callbackUrl = searchParams.get('callbackUrl') || '/admin/settings';

    // Detect locale from the URL path (e.g. /en/admin/login → 'en')
    const locale = pathname?.split('/')?.[1] || 'pt';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load remembered credentials on mount
    useEffect(() => {
        setMounted(true);
        const storedEmail = localStorage.getItem('admin_rememberedEmail');
        if (storedEmail) {
            setEmail(storedEmail);
            setRememberMe(true);
        }
        const storedPassword = localStorage.getItem('admin_rememberedPassword');
        if (storedPassword) {
            setPassword(storedPassword);
        }
    }, []);

    if (!mounted) return null; // Avoid hydration mismatch

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (rememberMe) {
                    localStorage.setItem('admin_rememberedEmail', email);
                    localStorage.setItem('admin_rememberedPassword', password);
                } else {
                    localStorage.removeItem('admin_rememberedEmail');
                    localStorage.removeItem('admin_rememberedPassword');
                }

                router.push(callbackUrl);
                router.refresh();
            } else {
                setError(data.error || 'Credenciais inválidas.');
            }
        } catch {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        fontSize: '0.875rem',
        color: '#0f172a',
        background: '#ffffff',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = '#287D8B';
        e.target.style.boxShadow = '0 0 0 3px rgba(40, 125, 139, 0.1)';
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = '#e2e8f0';
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: '#f1f5f9',
        }}>
            {/* Card */}
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2.5rem 2rem 0',
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(168, 85, 247))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0',
                        lineHeight: '1.2',
                        textAlign: 'center',
                    }}>
                        Soluções RKM
                    </h1>
                    <p style={{
                        color: '#64748b',
                        marginTop: '0.25rem',
                        fontSize: '1rem',
                        lineHeight: '1.2',
                        textAlign: 'center',
                    }}>
                        Painel Administrativo
                    </p>

                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#0f172a',
                        marginTop: '2.5rem',
                    }}>
                        Entrar
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        color: '#287D8B',
                        fontSize: '0.875rem',
                        marginTop: '0.25rem',
                    }}>
                        Acesso restrito a employees
                    </p>
                </div>

                {/* Form */}
                <div style={{ padding: '1.5rem 2rem 2rem' }}>
                    <form onSubmit={handleSubmit} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}>
                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@solucoesrkm.com"
                                required
                                autoComplete="username"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                suppressHydrationWarning
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 500, color: '#0f172a' }}>Senha</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="********"
                                    required
                                    autoComplete="current-password"
                                    style={{ ...inputStyle, paddingRight: '3rem' }}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    suppressHydrationWarning
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        color: '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#287D8B')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me + Forgot password */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                style={{ width: '1rem', height: '1rem', accentColor: '#287D8B' }}
                            />
                            <label htmlFor="rememberMe" style={{ fontSize: '0.9rem', color: '#374151' }}>
                                Lembrar de mim
                            </label>

                            <a
                                href={`${APP_URL}/${locale}/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                                style={{
                                    fontSize: '0.9rem',
                                    color: '#287D8B',
                                    marginLeft: 'auto',
                                    textDecoration: 'none',
                                }}
                                onMouseEnter={e => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
                                onMouseLeave={e => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
                            >
                                Esqueci minha senha
                            </a>
                        </div>

                        {/* Error */}
                        {error && (
                            <p style={{
                                color: '#ef4444',
                                fontSize: '0.9rem',
                                padding: '0.75rem',
                                background: '#fef2f2',
                                borderRadius: '0.5rem',
                                border: '1px solid #fecaca',
                            }}>
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.75rem',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                background: '#287D8B',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: 'background 0.2s, opacity 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                            onMouseEnter={e => {
                                if (!loading) (e.target as HTMLButtonElement).style.background = '#1e6873';
                            }}
                            onMouseLeave={e => {
                                (e.target as HTMLButtonElement).style.background = '#287D8B';
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>

                        {/* Register section */}
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#64748b' }}>
                                Ainda não possui conta?
                            </p>
                            <a
                                href={`${APP_URL}/${locale}/register`}
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    border: '2px solid #287D8B',
                                    background: 'transparent',
                                    color: '#287D8B',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box',
                                }}
                                onMouseEnter={e => {
                                    const el = e.target as HTMLAnchorElement;
                                    el.style.background = '#287D8B';
                                    el.style.color = '#ffffff';
                                }}
                                onMouseLeave={e => {
                                    const el = e.target as HTMLAnchorElement;
                                    el.style.background = 'transparent';
                                    el.style.color = '#287D8B';
                                }}
                            >
                                Criar Cadastro Agora
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
