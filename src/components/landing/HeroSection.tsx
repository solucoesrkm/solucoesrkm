/**
 * @file HeroSection.tsx
 * @description Hero da landing com animated gradient mesh, título Tracka e CTAs.
 *
 * Uses CSS-only animated gradient background (no external image dependency).
 * CTAs apontam para o app Tracka (register/features).
 */

import { Sparkles, ArrowRight } from 'lucide-react';
import { TRACKA_APP_URL } from '@/config/app.config';

interface HeroSectionProps {
    title: string;
    subtitle: string;
    image: string;
    badgeNew: string;
    badgeOriginal: string;
    ctaPrimary: string;
    ctaSecondary: string;
    locale?: string;
}

export function HeroSection({ title, subtitle, image, badgeNew, badgeOriginal, ctaPrimary, ctaSecondary, locale = 'pt' }: HeroSectionProps) {
    const appUrl = TRACKA_APP_URL;

    return (
        <section className="relative w-full flex items-center justify-start px-4 md:px-12 pt-24 pb-48 md:min-h-[90vh]" style={{ minHeight: 'max(80vh, 560px)' }}>
            {/* Animated Gradient Mesh Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* Background Image — uses image prop from config */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700 animate-scale-in"
                    style={{ backgroundImage: `url('${image}')` }}
                />

                {/* Floating orbs overlay */}
                <div
                    className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full animate-float opacity-20"
                    style={{ background: 'var(--landing-orb-indigo)' }}
                />
                <div
                    className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full animate-pulse-glow opacity-15"
                    style={{
                        background: 'var(--landing-orb-purple)',
                        animationDelay: '2s',
                    }}
                />

                {/* Gradient overlays for legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl space-y-7 animate-fade-in">
                {/* Badge */}
                <div className="flex items-center gap-3">
                    <span className="text-xs md:text-sm font-bold tracking-widest border border-indigo-500/50 px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 backdrop-blur-sm">
                        {badgeNew}
                    </span>
                    <span className="text-gray-400 font-medium tracking-widest text-xs md:text-sm uppercase">
                        {badgeOriginal}
                    </span>
                </div>

                {/* Title */}
                <div className="flex flex-col items-start space-y-5">
                    <h1 className="text-7xl md:text-9xl font-extrabold leading-[1.05] landing-title-gradient">
                        {title.startsWith('S') ? (
                            <span className="inline-flex items-baseline">
                                <img
                                    src="/s-logo.png"
                                    alt="S"
                                    className="inline-block h-[0.85em] w-auto -mb-[0.02em] mr-[-0.02em]"
                                    style={{ verticalAlign: 'baseline' }}
                                />
                                {title.slice(1)}
                            </span>
                        ) : title}
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-300 max-w-xl leading-relaxed font-light" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
                        {subtitle}
                    </p>
                </div>

                {/* CTAs → App Tracka */}
                <div className="flex flex-wrap gap-4 pt-3">
                    <a
                        href={`${appUrl}/${locale}/register`}
                        className="group flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25"
                        style={{ background: 'var(--landing-gradient-cta)' }}
                    >
                        <Sparkles className="w-5 h-5" />
                        {ctaPrimary}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="#features" className="flex items-center gap-3 glass-strong text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300">
                        {ctaSecondary}
                    </a>
                </div>
            </div>

            {/* Decorative grid pattern */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--landing-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--landing-grid-line) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />
        </section>
    );
}
