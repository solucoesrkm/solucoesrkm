/**
 * @file page.tsx — Landing Page Principal (/)
 * @description Página raiz com landing page do Tracka estilo Netflix.
 *
 * Usa componentes modulares e configuração do banco via getLandingPageConfig().
 * Pricing vem da API pública do Tracka ou de fallback local.
 * Todos os CTAs redirecionam para tracka.solucoesrkm.com.
 */

import { getLandingPageConfig } from '@/config/landing.config';
import { getTranslations, getLocale } from 'next-intl/server';
import { getSiteSettings } from '@/actions/site-settings.actions';
import { unstable_noStore as noStore } from 'next/cache';
import type { PricingVisibility } from '@/types';

// Landing Components (Netflix-style)
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { TechnologySection } from '@/components/landing/TechnologySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CallToActionSection } from '@/components/landing/CallToActionSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import type { PricingParams } from '@/config/landing.config';

// ─── SEO Metadata ─────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'tracka' });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solucoesrkm.com';

    const pageTitle = `Tracka — ${t('hero.subtitle')}`;
    const pageDescription = t('hero.subtitle');
    const ogImage = `${siteUrl}/hero-bg.png`;

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: locale === 'pt'
            ? 'inventário pessoal, organizar pertences, gestão de mudanças, catalogar itens, app de inventário, Tracka'
            : 'personal inventory, organize belongings, moving management, catalog items, inventory app, Tracka',
        alternates: {
            canonical: `${siteUrl}/${locale}`,
            languages: {
                'pt': `${siteUrl}/pt`,
                'en': `${siteUrl}/en`,
            },
        },
        openGraph: {
            type: 'website',
            siteName: 'Soluções RKM',
            locale: locale === 'pt' ? 'pt_BR' : 'en_US',
            title: pageTitle,
            description: pageDescription,
            url: `${siteUrl}/${locale}`,
            images: [{ url: ogImage, width: 1200, height: 630, alt: 'Tracka — Smart Inventory Management' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [ogImage],
        },
    };
}

// ─── Pricing Fetcher ──────────────────────────────────────────────

/**
 * Busca planos da API pública do Tracka.
 * Aplica filtro de visibilidade (pricing_visibility do admin).
 * Fallback: usa traduções i18n se a API falhar.
 *
 * A partir de v0.7.3 a API retorna `inheritance` automaticamente.
 */
async function fetchPricing(t: any, locale: string): Promise<PricingParams[]> {
    noStore(); // Sempre buscar dados frescos do banco
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';
    const visibility: PricingVisibility | null = await getSiteSettings('pricing_visibility');

    // Tenta buscar da API pública do Tracka (retorna inheritance pronto)
    let plans: PricingParams[] = [];
    try {
        const res = await fetch(`${APP_URL}/api/public/plans?locale=${locale}`, {
            cache: 'no-store',
        });
        if (res.ok) {
            const data = await res.json();
            // API retorna array de planos com campos padronizados
            const apiPlans: any[] = Array.isArray(data) ? data : (data.plans || []);

            plans = apiPlans
                .filter((p: any) => p.planType !== 'trial' || p.enabled !== false)
                .map((p: any) => {
                    const isTrial = p.planType === 'trial';

                    // Converter features[] string[] → PricingFeature[]
                    const features = (p.features || []).map((text: string, i: number) => ({
                        key: `feat_${i}`,
                        text,
                    }));

                    return {
                        name: p.name,
                        price: isTrial ? t('pricing.trial_price') : p.price,
                        description: isTrial ? t('pricing.trial_desc') : p.description,
                        features,
                        isPopular: p.isPopular || false,
                        isTrial,
                        buttonText: isTrial ? t('pricing.free.button') : (p.buttonText || ''),
                        buttonLink: p.buttonLink || `/${locale}/register`,
                        // Campo de herança automática (v0.7.3+)
                        inheritance: p.inheritance || undefined,
                    } as PricingParams;
                });
        }
    } catch {
        // Silently fall through to i18n fallback
    }

    // Fallback: i18n (se API falhar ou retornar vazio)
    if (plans.length === 0) {
        const freeExcluded = (() => {
            try { return t.has('pricing.free.excluded') ? t('pricing.free.excluded').split(',') : []; }
            catch { return []; }
        })();

        const toFeatures = (csv: string): { key: string; text: string }[] =>
            csv.split(',').map((text, i) => ({ key: `fallback_${i}`, text: text.trim() }));

        plans = [
            {
                name: t('pricing.free.name'),
                price: t('pricing.free.price'),
                description: t('pricing.free.desc'),
                features: toFeatures(t('pricing.free.features')),
                excludedFeatures: freeExcluded.map((text: string, i: number) => ({ key: `fallback_excl_${i}`, text: text.trim() })),
                isPopular: false,
                buttonText: t('pricing.free.button'),
                buttonLink: `/${locale}/register`,
            },
            {
                name: t('pricing.plus.name'),
                price: t('pricing.plus.price'),
                description: t('pricing.plus.desc'),
                features: toFeatures(t('pricing.plus.features')),
                isPopular: true,
                buttonText: t('pricing.plus.button'),
                buttonLink: `/${locale}/register?plan=plus`,
            },
            {
                name: t('pricing.pro.name'),
                price: t('pricing.pro.price'),
                description: t('pricing.pro.desc'),
                features: toFeatures(t('pricing.pro.features')),
                isPopular: false,
                buttonText: t('pricing.pro.button'),
                buttonLink: `/${locale}/register?plan=pro`,
            },
        ];
    }

    // Aplicar filtro de visibilidade (marketing)
    if (visibility) {
        plans = plans.filter(p =>
            !visibility.hiddenPlans.some(hp =>
                hp.toLowerCase() === p.name.toLowerCase()
            )
        );

        plans = plans.map(p => {
            const hiddenKeys =
                visibility.hiddenFeatures[p.name] ||
                visibility.hiddenFeatures[p.name.toLowerCase()] ||
                [];

            if (hiddenKeys.length === 0) return p;

            return {
                ...p,
                features: p.features.filter((f: any) => !hiddenKeys.includes(f.key)),
            };
        });
    }

    return plans;
}

// ─── Page Component ───────────────────────────────────────────────

export default async function TrackaLandingPage() {
    const locale = await getLocale();
    const [t, tc, config] = await Promise.all([
        getTranslations('tracka'),
        getTranslations('corporate'),
        getLandingPageConfig(locale),
    ]);

    const showFeatures = config.showFeatures !== false;
    const faqItems = config.faq?.length ? config.faq : t.raw('faq.items') || [];
    const pricingItems = await fetchPricing(t, locale);

    const footerLinks = config.footerLinks?.length ? config.footerLinks : [
        { label: tc('footer.links.faq'), href: '/faq' },
        { label: tc('footer.links.terms'), href: '/terms' },
        { label: tc('footer.links.privacy'), href: '/privacy' },
        { label: tc('footer.links.cookies'), href: '/cookies' },
        { label: tc('footer.links.legal'), href: '/legal' },
    ];

    // ─── JSON-LD Structured Data ──────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://solucoesrkm.com';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                name: 'Tracka',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                description: t('hero.subtitle'),
                url: appUrl,
                offers: pricingItems
                    .filter(p => p.price !== 'Grátis' && p.price !== 'Free')
                    .map(p => ({
                        '@type': 'Offer',
                        name: p.name,
                        priceCurrency: 'BRL',
                        price: p.price.replace(/[^\d,]/g, '').replace(',', '.'),
                        description: p.description,
                    })),
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.8',
                    ratingCount: '150',
                },
            },
            {
                '@type': 'Organization',
                name: 'Soluções RKM',
                url: siteUrl,
                logo: `${siteUrl}/logo.png`,
                contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'suporte@solucoesrkm.com',
                    contactType: 'customer service',
                },
            },
            ...(faqItems.length > 0 ? [{
                '@type': 'FAQPage',
                mainEntity: faqItems.map((item: { question: string; answer: string }) => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer,
                    },
                })),
            }] : []),
        ],
    };

    return (
        <div className="min-h-screen text-white overflow-x-hidden font-sans" style={{
            background: 'var(--landing-gradient-page)',
        }}>
            {/* ─── Structured Data (JSON-LD) ─── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* ─── Header ─── */}
            <LandingHeader
                logoText="Tracka"
                navHome={tc('nav.home')}
                navFeatures={t('features.title')}
                navPricing={t('pricing.title')}
                navAbout="Soluções RKM"
                loginText={tc('login')}
                locale={locale}
            />

            {/* ─── Hero ─── */}
            <HeroSection
                title="Tracka"
                subtitle={config.heroSubtitle || t('hero.subtitle')}
                image={(config.heroImage || '/hero-bg.png').replace('hero-bg.jpg', 'hero-bg.png')}
                badgeNew={t('hero.badge_new')}
                badgeOriginal={t('hero.badge_original')}
                ctaPrimary={config.ctaPrimaryText || t('hero.cta_primary')}
                ctaSecondary={t('hero.cta_secondary')}
                locale={locale}
            />

            {/* ─── Content Sections ─── */}
            <div className="relative z-20 -mt-32 pl-4 md:pl-12 pb-20 space-y-16">
                {/* Features */}
                {showFeatures && (
                    <FeaturesSection
                        title={config.featuresTitle || t('features.title')}
                        viewAllText={t('features.view_all')}
                        features={{
                            search: { title: t('features.search.title'), desc: t('features.search.desc') },
                            moving: { title: t('features.moving.title'), desc: t('features.moving.desc') },
                            multi_device: { title: t('features.multi_device.title'), desc: t('features.multi_device.desc') },
                            security: { title: t('features.security.title'), desc: t('features.security.desc') },
                        }}
                        dynamicFeatures={config.features}
                    />
                )}

                {/* Technology (conditional) */}
                {config.showTechnology !== false && (
                    <TechnologySection
                        title={config.techTitle || t('technology.title')}
                        viewAllText={t('features.view_all')}
                        features={{
                            tech: { title: t('technology.tech.title'), desc: t('technology.tech.desc') },
                            user_focus: { title: t('technology.user_focus.title'), desc: t('technology.user_focus.desc') },
                            innovation: { title: t('technology.innovation.title'), desc: t('technology.innovation.desc') },
                        }}
                    />
                )}

                {/* Testimonials (conditional) */}
                {config.showTestimonials && config.testimonials && config.testimonials.length > 0 && (
                    <TestimonialsSection items={config.testimonials} />
                )}

                {/* Pricing */}
                {config.showPricing !== false && pricingItems.length > 0 && (
                    <PricingSection
                        items={pricingItems}
                        locale={locale}
                        title={t('pricing.title')}
                        subtitle={t('pricing.subtitle')}
                        trialText={t('pricing.trial')}
                        includedLabel={t('pricing.included_label')}
                        popularLabel={t('pricing.plus.popular')}
                        featureTooltips={config.featureTooltips}
                        trialNoCardText={t('pricing.trial_no_card')}
                        inheritanceLabel={locale === 'en' ? 'Everything in {plan}, plus:' : 'Tudo do {plan}, mais:'}
                    />
                )}

                {/* CTA + FAQ + Footer */}
                <div className="mt-20">
                    <CallToActionSection
                        title={config.footerCtaTitle || t('cta.title')}
                        subtitle={config.footerCtaSubtitle || t('cta.subtitle')}
                        buttonText={config.footerCtaButton || t('cta.button')}
                        badgeText={t('cta.badge')}
                        locale={locale}
                    />

                    {config.showFaq !== false && faqItems.length > 0 && (
                        <FAQSection title={t('faq.title')} items={faqItems} />
                    )}

                    <LandingFooter
                        contactText={config.footerContact || tc('footer.contact')}
                        copyrightText={tc('footer.rights', { year: new Date().getFullYear() })}
                        links={footerLinks}
                    />
                </div>
            </div>
        </div>
    );
}
