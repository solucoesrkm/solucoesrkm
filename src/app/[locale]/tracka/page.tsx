import { getTranslations } from 'next-intl/server';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Footer } from '@/components/layout/Footer';
import { Play, Info, Search, Truck, Smartphone, Shield, Code, Users, Zap, ChevronDown, Check, Star } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'tracka' });
    return {
        title: `Tracka — ${t('hero.subtitle').substring(0, 60)}`,
        description: t('hero.subtitle'),
    };
}

export default async function TrackaPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('tracka');
    const tc = await getTranslations('corporate');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    const features = [
        { icon: Search, title: t('features.search.title'), desc: t('features.search.desc') },
        { icon: Truck, title: t('features.moving.title'), desc: t('features.moving.desc') },
        { icon: Smartphone, title: t('features.multi_device.title'), desc: t('features.multi_device.desc') },
        { icon: Shield, title: t('features.security.title'), desc: t('features.security.desc') },
    ];

    const tech = [
        { icon: Code, title: t('technology.tech.title'), desc: t('technology.tech.desc') },
        { icon: Users, title: t('technology.user_focus.title'), desc: t('technology.user_focus.desc') },
        { icon: Zap, title: t('technology.innovation.title'), desc: t('technology.innovation.desc') },
    ];

    const plans = [
        { ...JSON.parse(JSON.stringify({ name: t('pricing.free.name'), price: t('pricing.free.price'), desc: t('pricing.free.desc'), button: t('pricing.free.button') })), features: t('pricing.free.features').split(','), popular: false },
        { ...JSON.parse(JSON.stringify({ name: t('pricing.plus.name'), price: t('pricing.plus.price'), desc: t('pricing.plus.desc'), button: t('pricing.plus.button') })), features: t('pricing.plus.features').split(','), popular: true },
        { ...JSON.parse(JSON.stringify({ name: t('pricing.pro.name'), price: t('pricing.pro.price'), desc: t('pricing.pro.desc'), button: t('pricing.pro.button') })), features: t('pricing.pro.features').split(','), popular: false },
    ];

    const faqItems: { question: string; answer: string }[] = [];
    for (let i = 0; i < 4; i++) {
        faqItems.push({
            question: t(`faq.items.${i}.question`),
            answer: t(`faq.items.${i}.answer`),
        });
    }

    const footerLinks = [
        { label: tc('footer.links.faq'), href: '/faq' },
        { label: tc('footer.links.terms'), href: '/terms' },
        { label: tc('footer.links.privacy'), href: '/privacy' },
        { label: tc('footer.links.cookies'), href: '/cookies' },
        { label: tc('footer.links.legal'), href: '/legal' },
    ];

    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{
            background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d24 20%, #0a0a1a 40%, #080816 100%)',
        }}>
            <LandingHeader
                logoText="Tracka"
                navHome={tc('nav.home')}
                navFeatures={t('features.title')}
                navPricing={t('pricing.title')}
                navAbout={tc('brand')}
                loginText={tc('login')}
                locale={locale}
            />

            {/* Hero */}
            <section className="relative min-h-[80vh] flex items-center justify-start px-4 md:px-12 pt-20 pb-40" style={{ minHeight: 'max(75vh, 520px)' }}>
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-950/20 via-[#141414] to-[#141414]" />
                <div className="relative z-10 max-w-2xl space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <span className="text-purple-500 font-bold tracking-widest text-xs border border-purple-500 px-2 py-0.5 rounded-sm bg-black/40">{t('hero.badge_new')}</span>
                        <span className="text-gray-300 font-medium tracking-widest text-xs uppercase">{t('hero.badge_original')}</span>
                    </div>
                    <h1 className="text-7xl md:text-9xl font-extrabold leading-[1.1]" style={{
                        background: 'linear-gradient(to right, rgb(96, 165, 250), rgb(168, 85, 247))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>Tracka</h1>
                    <p className="text-lg md:text-2xl text-gray-200 max-w-xl leading-relaxed font-light">{t('hero.subtitle')}</p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <a href={`${appUrl}/${locale}/register`} className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-200 transition-colors transform hover:scale-105 duration-200">
                            <Play className="fill-black" size={24} />{t('hero.cta_primary')}
                        </a>
                        <a href="#features" className="flex items-center gap-3 bg-gray-600/60 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-600/80 transition-colors backdrop-blur-md">
                            <Info size={24} />{t('hero.cta_secondary')}
                        </a>
                    </div>
                </div>
            </section>

            <div className="relative z-20 -mt-32 px-4 md:px-12 pb-20 space-y-24 max-w-6xl mx-auto">
                {/* Features */}
                <section id="features">
                    <h2 className="text-2xl font-bold mb-8">{t('features.title')}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map(f => (
                            <div key={f.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors">
                                <f.icon className="w-8 h-8 text-purple-400 mb-3" />
                                <h3 className="font-bold mb-1">{f.title}</h3>
                                <p className="text-sm text-gray-400">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technology */}
                <section>
                    <h2 className="text-2xl font-bold mb-8">{t('technology.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {tech.map(t => (
                            <div key={t.title} className="rounded-xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-colors">
                                <t.icon className="w-8 h-8 text-blue-400 mb-3" />
                                <h3 className="font-bold mb-1">{t.title}</h3>
                                <p className="text-sm text-gray-400">{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing">
                    <h2 className="text-2xl font-bold mb-8 text-center">{t('pricing.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {plans.map(plan => (
                            <div key={plan.name} className={`rounded-2xl border p-6 space-y-4 transition-all ${plan.popular ? 'border-purple-500/50 bg-purple-500/5 shadow-xl shadow-purple-500/5 scale-105' : 'border-white/10 bg-white/[0.03]'}`}>
                                {plan.popular && (
                                    <div className="flex items-center gap-1 text-[10px] text-purple-300 font-bold">
                                        <Star className="w-3 h-3 fill-purple-400" />{t('pricing.plus.popular')}
                                    </div>
                                )}
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <p className="text-3xl font-extrabold">{plan.price}</p>
                                <p className="text-xs text-gray-500">{plan.desc}</p>
                                <ul className="space-y-2">
                                    {plan.features.map((f: string) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />{f}
                                        </li>
                                    ))}
                                </ul>
                                <a href={`${appUrl}/${locale}/register`} className={`block text-center py-2.5 rounded-lg font-semibold text-sm transition-colors ${plan.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-white/10 hover:bg-white/15 text-gray-300'}`}>
                                    {plan.button}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-2xl font-bold mb-8">{t('faq.title')}</h2>
                    <div className="space-y-3 max-w-2xl">
                        {faqItems.map(item => (
                            <details key={item.question} className="group rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors font-medium">
                                    {item.question}
                                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-6 pb-4 text-sm text-gray-400">{item.answer}</div>
                            </details>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center space-y-4 py-12">
                    <h2 className="text-3xl font-bold">{t('cta.title')}</h2>
                    <p className="text-gray-400 max-w-lg mx-auto">{t('cta.subtitle')}</p>
                    <a href={`${appUrl}/${locale}/register`} className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-3.5 rounded-lg font-bold text-lg transition-all hover:scale-105">
                        {t('cta.button')}
                    </a>
                </section>
            </div>

            <Footer
                contact={tc('footer.contact')}
                rights={tc('footer.rights', { year: new Date().getFullYear().toString() })}
                links={footerLinks}
            />
        </div>
    );
}
