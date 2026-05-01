/**
 * @file FeaturesSection.tsx
 * @description Seção de funcionalidades com cards horizontais Netflix-style.
 *
 * Suporta features dinâmicas do admin (config.features) com fallback
 * para features hardcoded via i18n.
 */

import { Search, Box, Smartphone, Lock, Zap, Star } from 'lucide-react';
import { FeatureRow, FeatureCard } from './SharedLandingComponents';
import type { ReactNode } from 'react';
import type { FeatureItem } from '@/types';

// ─── Icon Mapping (para features dinâmicas do admin) ────────────────
const ICON_MAP: Record<string, ReactNode> = {
    search: <Search className="w-10 h-10 text-blue-400" />,
    box: <Box className="w-10 h-10 text-amber-600" />,
    smartphone: <Smartphone className="w-10 h-10 text-green-400" />,
    lock: <Lock className="w-10 h-10 text-red-500" />,
    star: <Star className="w-10 h-10 text-yellow-400" />,
};

function getIconForFeature(icon?: string): ReactNode {
    if (icon && ICON_MAP[icon.toLowerCase()]) return ICON_MAP[icon.toLowerCase()];
    return <Star className="w-10 h-10 text-indigo-400" />;
}

// ─── Props ──────────────────────────────────────────────────────────

interface FeaturesSectionProps {
    title: string;
    viewAllText: string;
    /** Features i18n hardcoded (sempre presentes) */
    features: {
        search: { title: string; desc: string };
        moving: { title: string; desc: string };
        multi_device: { title: string; desc: string };
        security: { title: string; desc: string };
    };
    /** Features dinâmicas do admin (config.features). Se presentes, têm prioridade. */
    dynamicFeatures?: FeatureItem[];
}

export function FeaturesSection({ title, viewAllText, features, dynamicFeatures }: FeaturesSectionProps) {
    // Se o admin configurou features dinâmicas, usa elas
    if (dynamicFeatures && dynamicFeatures.length > 0) {
        return (
            <FeatureRow id="features" title={title} viewAllText={viewAllText} icon={<Zap className="text-yellow-500" />}>
                {dynamicFeatures.map((f, idx) => (
                    <FeatureCard
                        key={idx}
                        title={f.title}
                        description={f.description}
                        icon={getIconForFeature(f.icon)}
                    />
                ))}
            </FeatureRow>
        );
    }

    // Fallback: features i18n hardcoded
    return (
        <FeatureRow id="features" title={title} viewAllText={viewAllText} icon={<Zap className="text-yellow-500" />}>
            <FeatureCard title={features.search.title} description={features.search.desc} icon={<Search className="w-10 h-10 text-blue-400" />} />
            <FeatureCard title={features.moving.title} description={features.moving.desc} icon={<Box className="w-10 h-10 text-amber-600" />} />
            <FeatureCard title={features.multi_device.title} description={features.multi_device.desc} icon={<Smartphone className="w-10 h-10 text-green-400" />} />
            <FeatureCard title={features.security.title} description={features.security.desc} icon={<Lock className="w-10 h-10 text-red-500" />} />
        </FeatureRow>
    );
}
