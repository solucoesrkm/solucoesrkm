/**
 * @file admin/settings/page.tsx
 * @description Painel admin SaaS — configurações da landing page, Freshdesk e API keys.
 *
 * Acesso: employees only (via getSystemRole)
 * Seções: Landing Page, Freshdesk, API Keys, Planos (info-only)
 * Theme-responsive: supports dark/light/system via ThemeProvider
 */

import { getSession, getSystemRole, canEdit as checkCanEdit } from '@/lib/auth';
import { SiteConfigForm } from '@/components/admin/SiteConfigForm';
import { redirect } from 'next/navigation';
import { getLandingPageConfig } from '@/config/landing.config';
import { getFreshdeskConfig } from '@/config/freshdesk.config';
import { getSettingsHistory, getSiteSettings } from '@/actions/site-settings.actions';
import { FreshdeskConfigForm } from '@/components/admin/FreshdeskConfigForm';
import { ApiKeysForm } from '@/components/admin/ApiKeysForm';
import { PricingVisibilityForm, type PlansConfig } from '@/components/admin/PricingVisibilityForm';
import { CollapsibleSection } from '@/components/admin/CollapsibleSection';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Settings, Globe, Key, Headset, Shield, LayoutList, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { AdminTopBarClient } from '@/components/admin/AdminTopBarClient';
import { FreshdeskSyncButton } from '@/components/admin/FreshdeskSyncButton';

export default async function AdminSettingsPage() {
    // ── Auth: employee-only ──
    const session = await getSession();
    if (!session) {
        redirect('/admin/login?callbackUrl=/admin/settings');
    }

    const role = await getSystemRole(session.userId);
    if (!role) {
        redirect('/admin/login?callbackUrl=/admin/settings');
    }

    // ── Fetch current locale + configs ──
    const locale = await getLocale();
    const [config, freshdeskConfig, pricingVisibility, landingHistory, freshdeskHistory, apiKeysHistory, pricingVisibilityHistory] = await Promise.all([
        getLandingPageConfig(locale),
        getFreshdeskConfig(),
        getSiteSettings('pricing_visibility'),
        getSettingsHistory('landing_page_history'),
        getSettingsHistory('freshdesk_history'),
        getSettingsHistory('api_keys_history'),
        getSettingsHistory('pricing_visibility_history'),
    ]);

    const isCanEdit = checkCanEdit(role);
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

    // ── Fetch plan config from Tracka (server-side, avoids CORS) ──
    let plansConfig: PlansConfig | null = null;
    try {
        const res = await fetch(`${APP_URL}/api/plan-config`, {
            next: { revalidate: 0 },
        });
        if (res.ok) {
            plansConfig = await res.json();
        }
    } catch {
        // Tracka unavailable — form will show empty state
    }

    // ── Admin translations ──
    const ta = await getTranslations('admin');

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0e0e0e] dark:text-white transition-colors duration-300">
            {/* ─── Top Bar ─── */}
            <div className="border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#141414]/80 backdrop-blur-xl sticky top-0 z-50 transition-colors">
                <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Settings className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold tracking-wide leading-none text-gray-900 dark:text-white">{ta('topbar.title')}</h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{ta('topbar.subtitle')}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10" />
                        <Breadcrumb items={[
                            { label: ta('breadcrumb.settings') },
                        ]} />
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Language + Theme switchers (client component) */}
                        <AdminTopBarClient />

                        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-white/10 mx-1" />

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${role === 'SUPERADMIN' ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/20' :
                            role === 'ADMIN' ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20' :
                                role === 'EDITOR' ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/20' :
                                    'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/20'
                            }`}>
                            {role}
                        </span>
                        {!isCanEdit && (
                            <span className="text-[10px] text-yellow-500/70 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> {ta('topbar.readonly')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Page Header ─── */}
            <div className="max-w-[1800px] mx-auto px-6 pt-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-5 h-5 text-blue-400" />
                            <h2 className="text-2xl font-bold">{ta('settings.title')}</h2>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {ta('settings.description')}
                        </p>
                    </div>
                    {isCanEdit && (
                        <p className="text-xs text-emerald-500/60 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {ta('settings.editMode')}
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Content Sections ─── */}
            <div className="max-w-[1800px] mx-auto px-6 pb-12 space-y-8">
                {/* Landing Page Config */}
                <CollapsibleSection
                    title={ta('landing.title')}
                    subtitle={ta('landing.subtitle')}
                    icon={<Globe className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-teal-500 to-emerald-600"
                >
                    <SiteConfigForm initialData={config} canEdit={isCanEdit} history={landingHistory} appUrl={APP_URL} />
                </CollapsibleSection>

                {/* Pricing Visibility */}
                <CollapsibleSection
                    title={ta('visibility.title')}
                    subtitle={ta('visibility.subtitle')}
                    icon={<LayoutList className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-amber-500 to-orange-600"
                    defaultOpen={false}
                >
                    <PricingVisibilityForm plansConfig={plansConfig} canEdit={isCanEdit} initialVisibility={pricingVisibility} history={pricingVisibilityHistory} />
                </CollapsibleSection>

                {/* Plans & Pricing — Info only */}
                <CollapsibleSection
                    title={ta('plans.title')}
                    subtitle={ta('plans.subtitle')}
                    icon={<CreditCard className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
                    defaultOpen={false}
                >
                    <div className="space-y-4">
                        <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-500/[0.06] border border-amber-200 dark:border-amber-500/15 transition-colors">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                        {ta('plans.info')}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {ta('plans.infoDetail', { role: ta('plans.superAdmin') })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <a
                            href={`${APP_URL}/admin/settings`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-1 ring-violet-500/20 hover:bg-violet-500/20 text-sm font-medium transition-colors mt-2"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {ta('plans.openConfig')}
                        </a>
                    </div>
                </CollapsibleSection>

                {/* API Keys */}
                <CollapsibleSection
                    title={ta('apiKeys.title')}
                    subtitle={ta('apiKeys.subtitle')}
                    icon={<Key className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-blue-500 to-cyan-600"
                    defaultOpen={false}
                >
                    <ApiKeysForm canEdit={isCanEdit} history={apiKeysHistory} />
                </CollapsibleSection>

                {/* Freshdesk */}
                <CollapsibleSection
                    title={ta('freshdesk.title')}
                    subtitle={ta('freshdesk.subtitle')}
                    icon={<Headset className="w-4 h-4 text-white" />}
                    iconBg="bg-gradient-to-br from-indigo-500 to-purple-600"
                    defaultOpen={false}
                >
                    <FreshdeskConfigForm initialData={freshdeskConfig} canEdit={isCanEdit} history={freshdeskHistory} />
                </CollapsibleSection>

                {/* Freshdesk KB Sync — Corporativo */}
                {(role === 'SUPERADMIN' || role === 'ADMIN') && (
                    <CollapsibleSection
                        title={ta('freshdeskSync.title')}
                        subtitle={ta('freshdeskSync.subtitle')}
                        icon={<RefreshCw className="w-4 h-4 text-white" />}
                        iconBg="bg-gradient-to-br from-emerald-500 to-teal-600"
                        defaultOpen={false}
                    >
                        <FreshdeskSyncButton />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
