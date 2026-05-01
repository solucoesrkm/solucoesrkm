/**
 * @file PricingSection.tsx
 * @description Seção de planos e preços com design premium.
 *
 * Exibe planos vindos da API pública do Tracka ou de defaults.
 * Botões de compra redirecionam para tracka.solucoesrkm.com/register.
 * Em EN, detecta a moeda local do visitante e converte BRL→moeda local
 * com câmbio ao vivo via AwesomeAPI.
 */

'use client';

import { useState, useEffect } from 'react';
import { Check, X, Crown, Sparkles, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PricingParams, PricingFeature } from '@/types';
import { detectCurrency, fetchExchangeRate, convertFromBRL, getCacheKey, type CurrencyInfo } from '@/lib/currency-utils';

/* ─── Feature Tooltip Defaults (fallback when DB is empty) ─── */

const DEFAULT_TOOLTIPS: Record<string, { pt: string; en: string }> = {
    items:                 { pt: 'Quantidade máxima de itens que você pode cadastrar', en: 'Maximum number of items you can register' },
    visionAi:              { pt: 'Identificação inteligente de itens por foto usando IA', en: 'Smart item identification by photo using AI' },
    houses:                { pt: 'Número de residências/locais que você pode gerenciar', en: 'Number of homes/locations you can manage' },
    roomsPerHouse:         { pt: 'Cômodos disponíveis em cada residência', en: 'Rooms available in each home' },
    furniturePerRoom:      { pt: 'Móveis que podem ser cadastrados por cômodo', en: 'Furniture items per room' },
    photosPerItem:         { pt: 'Fotos que podem ser anexadas a cada item', en: 'Photos that can be attached to each item' },
    collaboratorsPerHouse: { pt: 'Pessoas que podem acessar sua residência', en: 'People who can access your home' },
    history:               { pt: 'Registro de todas as movimentações dos seus itens', en: 'Log of all movements of your items' },
    ranking:               { pt: 'Veja quais itens são mais usados e movimentados', en: 'See which items are most used and moved' },
    importExcel:           { pt: 'Importe itens em massa via planilha Excel', en: 'Bulk import items via Excel spreadsheet' },
    exportData:            { pt: 'Exporte seus dados para backup ou análise', en: 'Export your data for backup or analysis' },
    consolidation:         { pt: 'Organize e mova itens entre cômodos e casas', en: 'Organize and move items between rooms and homes' },
    aiAssistant:           { pt: 'Assistente inteligente que ajuda a organizar e encontrar itens', en: 'Smart assistant that helps organize and find items' },
    notifications:         { pt: 'Tipo de notificações disponíveis no seu plano', en: 'Type of notifications available in your plan' },
    support:               { pt: 'Nível de suporte técnico incluído no seu plano', en: 'Level of technical support included in your plan' },
};

/** Tooltip lookup: DB value (admin) → hardcoded default → null */
function getTooltip(key: string, locale: string, dbTooltips?: Record<string, string>): string | null {
    // 1. DB tooltip from admin (highest priority)
    if (dbTooltips?.[key]) return dbTooltips[key];
    // 2. Hardcoded default by locale
    const def = DEFAULT_TOOLTIPS[key];
    if (def) return locale === 'en' ? def.en : def.pt;
    return null;
}

interface PricingSectionProps {
    items: PricingParams[];
    locale?: string;
    title?: string;
    subtitle?: string;
    trialText?: string;
    includedLabel?: string;
    popularLabel?: string;
    featureTooltips?: Record<string, string>;
    trialNoCardText?: string;
    /** Texto do separador de herança. Ex: 'Tudo do {plan}, mais:' */
    inheritanceLabel?: string;
}

export function PricingSection({
    items, locale = 'pt', title, subtitle, trialText,
    includedLabel, popularLabel, featureTooltips, trialNoCardText,
    inheritanceLabel,
}: PricingSectionProps) {
    const [mounted, setMounted] = useState(false);
    const [currency, setCurrency] = useState<CurrencyInfo>({ code: 'USD', symbol: '$', name: 'US Dollar' });
    const [exchangeRate, setExchangeRate] = useState<number>(5.70);
    const [rateLoaded, setRateLoaded] = useState(false);

    const BRL_PRICES: Record<string, number> = { plus: 9.90, pro: 19.90 };

    const toLocal = (brl: number) => convertFromBRL(brl, exchangeRate);

    // Mark as mounted (client-only) and detect currency
    useEffect(() => {
        setMounted(true);

        if (locale !== 'en') return;

        const detected = detectCurrency();
        setCurrency(detected);

        // Load cached rate
        const cacheKey = getCacheKey(detected.code);
        const cached = localStorage.getItem(cacheKey);
        if (cached) setExchangeRate(parseFloat(cached));

        // Fetch live rate
        fetchExchangeRate(detected.code)
            .then(rate => {
                if (rate) {
                    setExchangeRate(rate);
                    localStorage.setItem(cacheKey, rate.toString());
                }
            })
            .finally(() => setRateLoaded(true));
    }, [locale]);

    if (!items || items.length === 0) return null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    const getPlanKey = (name: string) => {
        const lower = name.toLowerCase();
        if (lower === 'plus') return 'plus';
        if (lower === 'pro') return 'pro';
        return null;
    };

    /** Render a single feature row (included or excluded) */
    const renderFeature = (feature: PricingFeature, idx: number, isPopular: boolean, excluded: boolean, isTrial: boolean = false) => {
        const tooltip = getTooltip(feature.key, locale, featureTooltips);
        const checkColor = isTrial ? 'bg-amber-500/20' : (isPopular ? 'bg-indigo-500/20' : 'bg-emerald-500/15');
        const checkIcon = isTrial ? 'text-amber-400' : (isPopular ? 'text-indigo-400' : 'text-emerald-400');
        return (
            <div key={excluded ? `excl-${idx}` : idx} className="flex items-start gap-3">
                {excluded ? (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 bg-red-500/10">
                        <X className="w-3.5 h-3.5 text-red-400/60" />
                    </div>
                ) : (
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${checkColor}`}>
                        <Check className={`w-3.5 h-3.5 ${checkIcon}`} />
                    </div>
                )}
                {tooltip ? (
                    <span className={`text-sm relative group cursor-help inline-flex items-center gap-1 ${excluded ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                        {feature.text}
                        <Info className={`w-3 h-3 group-hover:text-indigo-400 transition-colors shrink-0 ${excluded ? 'text-gray-700' : 'text-gray-600'}`} style={excluded ? { textDecoration: 'none' } : undefined} />
                        <span className="absolute bottom-full left-0 mb-2 w-60 p-2.5 rounded-lg text-xs text-gray-200 leading-relaxed invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none" style={{
                            background: 'rgba(15, 15, 30, 0.95)',
                            border: '1px solid var(--color-glass-border-strong)',
                            backdropFilter: 'blur(8px)',
                            textDecoration: 'none',
                        }}>
                            {tooltip}
                        </span>
                    </span>
                ) : (
                    <span className={`text-sm ${excluded ? 'text-gray-600 line-through' : 'text-gray-300'}`}>{feature.text}</span>
                )}
            </div>
        );
    };

    // Dynamic grid columns based on number of plans
    const gridCols = items.length >= 4 ? 'lg:grid-cols-4 md:grid-cols-2' : 'md:grid-cols-3';

    return (
        <section id="pricing" className="py-24 text-white">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-6 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 landing-text-gradient">{title || 'Planos e Preços'}</h2>
                    {subtitle && <p className="text-gray-400 text-lg">{subtitle}</p>}
                </div>

                {/* Trial badge */}
                {trialText && (
                    <div className="flex justify-center mb-14">
                        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium" style={{
                                background: 'var(--landing-card-hover-glow)',
                                border: '1px solid var(--landing-icon-box-border)',
                                color: 'var(--landing-badge-text)',
                            }}>
                            <Sparkles className="w-4 h-4" />
                            {trialText}
                        </span>
                    </div>
                )}

                {/* Cards grid */}
                <div className={`grid ${gridCols} gap-6 max-w-7xl mx-auto`}>
                    {items.map((plan, index) => {
                        const planKey = getPlanKey(plan.name);
                        const brlPrice = planKey ? BRL_PRICES[planKey] : null;
                        const showConverted = mounted && locale === 'en' && brlPrice;
                        const isTrial = plan.isTrial || false;

                        // Card styling
                        const cardBg = isTrial
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.03))'
                            : plan.isPopular
                                ? 'var(--landing-card-bg-active)'
                                : 'var(--landing-card-bg)';
                        const cardBorder = isTrial
                            ? '1px solid rgba(245, 158, 11, 0.3)'
                            : plan.isPopular
                                ? '1px solid var(--landing-card-border-active)'
                                : '1px solid var(--color-glass-border)';
                        const hoverShadow = isTrial
                            ? 'hover:shadow-2xl hover:shadow-amber-500/15'
                            : plan.isPopular
                                ? 'hover:shadow-2xl hover:shadow-indigo-500/20'
                                : 'hover:shadow-xl hover:shadow-white/5';

                        return (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 ${hoverShadow}`}
                                style={{ background: cardBg, border: cardBorder }}
                            >
                                {/* Trial badge */}
                                {isTrial && (
                                    <>
                                        <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{
                                            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), transparent)',
                                            filter: 'blur(1px)',
                                            zIndex: 0,
                                        }} />
                                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 z-10">
                                            <span className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg"
                                                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                                                <Clock className="w-3.5 h-3.5" />
                                                14 {locale === 'en' ? 'DAYS' : 'DIAS'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* Popular badge */}
                                {plan.isPopular && !isTrial && (
                                    <>
                                        <div className="absolute -inset-px rounded-2xl pointer-events-none" style={{
                                            background: 'var(--landing-card-hover-glow)',
                                            filter: 'blur(1px)',
                                            zIndex: 0,
                                        }} />
                                        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-3 z-10">
                                            <span className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-lg" style={{
                                                background: 'var(--landing-gradient-popular)',
                                            }}>
                                                <Crown className="w-3.5 h-3.5" />
                                                {popularLabel || 'Popular'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                {/* Plan name + price */}
                                <div className="mb-6 relative z-10">
                                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                                    <div className="flex items-baseline gap-1 flex-wrap">
                                        {showConverted ? (
                                            <>
                                                <span className={`text-4xl font-bold ${plan.isPopular ? 'landing-text-gradient' : ''}`}>~{currency.symbol}{toLocal(brlPrice)}</span>
                                                <span className="text-gray-500">/mo</span>
                                                <span className="text-xs text-gray-600 ml-1">
                                                    (R$ {brlPrice.toFixed(2).replace('.', ',')})
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className={`text-4xl font-bold ${isTrial ? '' : ''} ${plan.isPopular ? 'landing-text-gradient' : ''}`}
                                                    style={isTrial ? { background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : undefined}
                                                >{plan.price}</span>
                                                {!isTrial && plan.price !== 'Grátis' && plan.price !== 'Free' && !plan.price.includes('/') && <span className="text-gray-500">/mês</span>}
                                            </>
                                        )}
                                    </div>
                                    {/* No credit card badge for trial */}
                                    {isTrial && trialNoCardText && (
                                        <div className="mt-2">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                                                style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                💳 {trialNoCardText}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* CTA button */}
                                <div className="relative z-10 mb-8">
                                    <Button
                                        variant={plan.isPopular ? 'primary' : 'secondary'}
                                        className={`w-full ${plan.isPopular ? '' : 'border-white/10 hover:bg-white/5'}`}
                                        style={plan.isPopular ? {
                                            background: 'var(--landing-gradient-popular)',
                                        } : {}}
                                        href={`${appUrl}${plan.buttonLink}`}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </div>

                                {/* Divider */}
                                <div className="relative z-10 border-t border-white/10 pt-6 mb-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                        {includedLabel || "What's included"}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="flex-1 space-y-3 relative z-10">
                                    {/* Separador de herança minimalista */}
                                    {!isTrial && plan.inheritance?.inheritsFrom && (
                                        <div className="pb-1">
                                            <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                                                {(inheritanceLabel || (locale === 'en' ? 'Everything in {plan}, plus:' : 'Tudo do {plan}, mais:'))
                                                    .replace('{plan}', plan.inheritance.inheritsFromName || '')}
                                            </p>
                                            <div className="mt-1.5 border-t border-white/10" />
                                        </div>
                                    )}

                                    {/* Features: exclusive se herda, lista completa caso contrário */}
                                    {(!isTrial && plan.inheritance?.inheritsFrom
                                        ? plan.inheritance.exclusiveFeatures.map((f, idx) => {
                                            const tooltip = f.tooltip || getTooltip(f.label, locale, featureTooltips);
                                            const checkColor = plan.isPopular ? 'bg-indigo-500/20' : 'bg-emerald-500/15';
                                            const checkIcon = plan.isPopular ? 'text-indigo-400' : 'text-emerald-400';
                                            return (
                                                <div key={idx} className="flex items-start gap-3">
                                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5 ${checkColor}`}>
                                                        <Check className={`w-3.5 h-3.5 ${checkIcon}`} />
                                                    </div>
                                                    {tooltip ? (
                                                        <span className="text-sm relative group cursor-help inline-flex items-center gap-1 text-gray-300">
                                                            {f.label}
                                                            <Info className="w-3 h-3 text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                                                            <span className="absolute bottom-full left-0 mb-2 w-60 p-2.5 rounded-lg text-xs text-gray-200 leading-relaxed invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 pointer-events-none" style={{
                                                                background: 'rgba(15, 15, 30, 0.95)',
                                                                border: '1px solid var(--color-glass-border-strong)',
                                                                backdropFilter: 'blur(8px)',
                                                            }}>
                                                                {tooltip}
                                                            </span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-300">{f.label}</span>
                                                    )}
                                                </div>
                                            );
                                        })
                                        : plan.features.map((feature, idx) => renderFeature(feature, idx, plan.isPopular, !!feature.excluded, isTrial))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Currency disclaimer (EN only) */}
                {mounted && locale === 'en' && (
                    <div className="mt-10 max-w-3xl mx-auto">
                        <div className="flex items-start gap-3 p-4 rounded-xl" style={{
                            background: 'var(--landing-disclaimer-bg)',
                            border: '1px solid var(--landing-disclaimer-border)',
                        }}>
                            <span className="text-lg shrink-0 mt-0.5">💱</span>
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-amber-400">
                                    Reference rate: 1 {currency.code} ≈ {exchangeRate.toFixed(2)} BRL
                                    {rateLoaded && (
                                        <span className="ml-1 font-normal text-amber-500/70">(live)</span>
                                    )}
                                </p>
                                <p className="text-xs text-amber-500/60 leading-relaxed">
                                    Prices shown in {currency.code} are approximate, based on a reference rate of 1 {currency.code} ≈ {exchangeRate.toFixed(2)} BRL.
                                    The final amount will be automatically calculated in {currency.code} at the current exchange rate at the time of payment.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
