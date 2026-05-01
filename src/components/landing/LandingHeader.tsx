/**
 * @file LandingHeader.tsx
 * @description Header da landing page com logo, navegação e login CTA.
 *
 * Fixo no topo com glassmorphism. Inclui LanguageSwitcher.
 * Login aponta para tracka.solucoesrkm.com.
 * O link "Início" faz scroll para o topo da página atual.
 */

'use client';

import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ReactNode } from 'react';

interface LandingHeaderProps {
    logoText: string;
    navHome: string;
    navFeatures: string;
    navPricing: string;
    navAbout: string;
    loginText: string;
    locale?: string;
}

export function LandingHeader({ logoText, navHome, navFeatures, navPricing, navAbout, loginText, locale = 'pt' }: LandingHeaderProps) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    return (
        <header className="fixed top-0 w-full z-50 px-4 py-3 md:px-12 transition-all duration-300" style={{
            background: 'var(--landing-header-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--landing-card-border)',
        }}>
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="font-bold text-2xl tracking-tighter cursor-pointer hover:scale-105 transition-transform landing-logo-gradient">
                        {logoText}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400" aria-label="Main navigation">
                        <ScrollTopLink>{navHome}</ScrollTopLink>
                        <NavLink href="/#features">{navFeatures}</NavLink>
                        <NavLink href="/#pricing">{navPricing}</NavLink>
                        <NavLink href="/about">{navAbout}</NavLink>
                    </nav>
                </div>

                {/* Auth + Language */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <a
                        href={`${appUrl}/${locale}/login`}
                        className="text-white px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105"
                        style={{ background: 'var(--landing-gradient-cta)' }}
                    >
                        {loginText}
                    </a>
                </div>
            </div>
        </header>
    );
}

/** Link que faz scroll suave para o topo da página atual */
function ScrollTopLink({ children }: { children: ReactNode }) {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-white transition-colors duration-200 relative group cursor-pointer bg-transparent border-none p-0 text-inherit font-inherit text-sm"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
        </button>
    );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="hover:text-white transition-colors duration-200 relative group">
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
        </Link>
    );
}
