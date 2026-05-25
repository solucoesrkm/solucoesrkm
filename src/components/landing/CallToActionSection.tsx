/**
 * @file CallToActionSection.tsx
 * @description Banner CTA final — convida usuário a criar conta.
 * Aponta para tracka.solucoesrkm.com/register.
 * Usa gradient indigo/purple alinhado com a marca.
 */

import { ChevronRight, Sparkles } from 'lucide-react';
import { TRACKA_APP_URL } from '@/config/app.config';

interface CallToActionSectionProps {
    title: string;
    subtitle: string;
    buttonText: string;
    badgeText?: string;
    locale?: string;
}

export function CallToActionSection({ title, subtitle, buttonText, badgeText, locale = 'pt' }: CallToActionSectionProps) {
    const appUrl = TRACKA_APP_URL;

    return (
        <section className="relative overflow-hidden w-full rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10" style={{
            background: 'var(--landing-cta-bg)',
            border: '1px solid var(--landing-cta-border)',
        }}>
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-72 h-72 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{
                background: 'var(--landing-orb-cta-indigo)',
            }} />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{
                background: 'var(--landing-orb-cta-purple)',
                animationDelay: '2s',
            }} />

            <div className="space-y-6 text-center md:text-left relative z-10">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-300 uppercase tracking-wider">{badgeText || 'Comece agora'}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{title}</h2>
                <p className="text-gray-300 text-lg max-w-lg">{subtitle}</p>
            </div>

            <a
                href={`${appUrl}/${locale}/register`}
                className="group relative z-10 flex items-center gap-3 text-white text-lg font-bold px-10 py-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30 hover:scale-105"
                style={{ background: 'var(--landing-gradient-cta)' }}
            >
                {buttonText}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </a>
        </section>
    );
}
