# 🎨 Style Guide — solucoesrkm.com

Design system completo da landing page corporativa.  
**Fonte da verdade**: `src/app/globals.css` — todas as decisões visuais partem das CSS custom properties definidas nesse arquivo.

> **Quando consultar**: Ao criar novos componentes, seções ou ajustar UI.  
> **Regra principal**: Nunca hardcode cores ou valores — sempre referenciar via CSS variables.

---

## Sumário

1. [Filosofia de Design](#1-filosofia-de-design)
2. [Fonte Tipográfica](#2-fonte-tipográfica)
3. [Paleta de Cores — Brand](#3-paleta-de-cores--brand)
4. [Paleta de Cores — Superfícies](#4-paleta-de-cores--superfícies)
5. [Glassmorphism](#5-glassmorphism)
6. [Cores de Texto](#6-cores-de-texto)
7. [Borders e Sombras](#7-borders-e-sombras)
8. [Espaçamento](#8-espaçamento)
9. [Border Radius](#9-border-radius)
10. [Gradientes — Landing Page](#10-gradientes--landing-page)
11. [Tokens de Seção](#11-tokens-de-seção)
12. [Animações](#12-animações)
13. [Classes Utilitárias Globais](#13-classes-utilitárias-globais)
14. [Componentes UI Base](#14-componentes-ui-base)
15. [Componentes de Landing](#15-componentes-de-landing)
16. [Padrões de Seção](#16-padrões-de-seção)
17. [Tipografia — Hierarquia](#17-tipografia--hierarquia)
18. [Responsividade](#18-responsividade)
19. [Regras Anti-Regressão](#19-regras-anti-regressão)

---

## 1. Filosofia de Design

O site usa uma estética **dark premium** inspirada em plataformas Netflix-style:

- **Dark-first**: fundo sempre escuro `#0a0a1a`
- **Glassmorphism**: superfícies translúcidas com `backdrop-filter: blur`
- **Orbs decorativos**: gradientes radiais flutuantes como elementos de profundidade
- **Gradientes sutis**: título, logo e CTAs usam gradients índigo→violeta→rosa
- **Micro-animações**: hover, float, pulse-glow, fade-in — nunca estáticas
- **Grid decorativo**: padrão de linhas `opacity-[0.03]` no hero
- **Sem modo claro funcional**: a landing é exclusivamente dark. O toggle `.light` em `globals.css` afeta apenas outras páginas do sistema.

---

## 2. Fonte Tipográfica

**Inter** (Google Fonts) — única família tipográfica do projeto.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

--font-inter: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

body { font-family: var(--font-inter); }
```

| Peso | Uso |
|------|-----|
| 300 (Light) | Subtítulos longos, textos explicativos |
| 400 (Regular) | Corpo de texto, parágrafos |
| 500 (Medium) | Labels, nav links |
| 600 (SemiBold) | Botões secundários, badges |
| 700 (Bold) | Títulos de seção |
| 800 (ExtraBold) | Destaques principais |
| 900 (Black) | Logo, headline do hero |

---

## 3. Paleta de Cores — Brand

```css
--color-brand-primary:        #7c3aed;   /* Violeta principal */
--color-brand-primary-hover:  #6d28d9;   /* Hover state */
--color-brand-primary-light:  #a855f7;   /* Versão clara */
--color-brand-gradient:       linear-gradient(135deg, #7c3aed, #6d28d9);
--color-brand-gradient-wide:  linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6d28d9 100%);
```

### Semântica de cores de status

```css
--color-success:  #10b981;   /* Verde — confirmações, check marks */
--color-error:    #ef4444;   /* Vermelho — erros, exclusão */
--color-warning:  #f59e0b;   /* Âmbar — avisos, trial badge */
--color-info:     #3b82f6;   /* Azul — informações */
```

---

## 4. Paleta de Cores — Superfícies

```css
--color-bg-primary:    #0a0a1a;  /* Fundo base (quase preto com tom azul) */
--color-bg-secondary:  #0d0d24;  /* Fundo alternativo levemente mais claro */
--color-bg-elevated:   #080816;  /* Superfície "abaixo" do fundo */
--color-bg-gradient:   linear-gradient(180deg, #0a0a1a 0%, #0d0d24 20%, #0a0a1a 40%, #080816 100%);
```

> ⚠️ **Não usar `#000000` ou `#ffffff` puros** — sempre usar as variáveis para manter a coesão.

---

## 5. Glassmorphism

Dois níveis de glass disponíveis como `@utility`:

```css
/* Sutil — card normal */
.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Forte — botões secundários, modais */
.glass-strong {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
```

**Via CSS variables** (para uso em `style={{ }}`):

```
--color-glass:              rgba(255, 255, 255, 0.03)
--color-glass-strong:       rgba(255, 255, 255, 0.06)
--color-glass-border:       rgba(255, 255, 255, 0.08)
--color-glass-border-strong: rgba(255, 255, 255, 0.12)
```

---

## 6. Cores de Texto

```css
--color-text-primary:    #ffffff;   /* Título, destaque */
--color-text-secondary:  #d1d5db;   /* Corpo de texto padrão */
--color-text-muted:      #9ca3af;   /* Labels, placeholders */
--color-text-faint:      #6b7280;   /* Texto desativado */
```

```
--landing-badge-text:    #c4b5fd;   /* Badges de label (violeta claro) */
```

---

## 7. Borders e Sombras

```css
--color-border:        rgba(255, 255, 255, 0.1);
--color-border-muted:  rgba(255, 255, 255, 0.05);

--shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.4);
--shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 20px rgba(124, 58, 237, 0.15);    /* Glow violeta */
```

---

## 8. Espaçamento

```css
--space-xs:  0.25rem  (4px)
--space-sm:  0.5rem   (8px)
--space-md:  1rem     (16px)
--space-lg:  1.5rem   (24px)
--space-xl:  2rem     (32px)
--space-2xl: 3rem     (48px)
```

> Na prática, o projeto usa Tailwind para espaçamento na maioria dos componentes. As variáveis `--space-*` estão disponíveis para CSS `style={{ padding: 'var(--space-md)' }}`.

---

## 9. Border Radius

```css
--radius-sm:   0.375rem  (6px)   /* Inputs, badges menores */
--radius-md:   0.5rem    (8px)   /* Botões padrão, campos */
--radius-lg:   0.75rem   (12px)  /* Cards pequenos */
--radius-xl:   1rem      (16px)  /* Cards médios */
--radius-2xl:  1.5rem    (24px)  /* Cards feature, seções */
--radius-full: 9999px            /* Pílulas, badges */
```

---

## 10. Gradientes — Landing Page

### Texto e título

```css
--landing-gradient-title: linear-gradient(135deg, rgb(129,140,248) 0%, rgb(168,85,247) 50%, rgb(236,72,153) 100%);
/* Uso: h1 do hero — índigo → violeta → rosa */

--landing-gradient-text: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
/* Uso: subtítulos em gradient */

--landing-gradient-logo: linear-gradient(135deg, rgb(129,140,248), rgb(168,85,247));
/* Uso: logo no header */
```

**Classes utilitárias prontas:**

```html
<h1 class="landing-title-gradient">Tracka</h1>   <!-- índigo→violeta→rosa -->
<span class="landing-text-gradient">texto</span>  <!-- branco→índigo claro -->
<span class="landing-logo-gradient">S</span>       <!-- índigo→violeta -->
```

### CTA e botões primários

```css
--landing-gradient-cta: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
```

```html
<button style={{ background: 'var(--landing-gradient-cta)' }}>Começar grátis</button>
```

### Popular badge (Mais Popular)

```css
--landing-gradient-popular: linear-gradient(135deg, #f59e0b, #f97316);
/* Âmbar → laranja */
```

### Trial badge e overlay

```css
--landing-gradient-trial:  linear-gradient(135deg, #f59e0b, #d97706);  /* Badge âmbar */
--landing-trial-overlay:   linear-gradient(135deg, rgba(245,158,11,0.15), transparent);  /* Overlay translúcido do card */
```

**Uso correto:**
```tsx
// Badge do plano Trial
style={{ background: 'var(--landing-gradient-trial)' }}

// Overlay translúcido (border glow do card)
style={{ background: 'var(--landing-trial-overlay)' }}
```

### Fundo da página

```css
--landing-gradient-page: linear-gradient(180deg, #0a0a1a 0%, #0d0d24 20%, #0a0a1a 40%, #080816 100%);
```

---

## 11. Tokens de Seção

### Header

```css
--landing-header-bg: rgba(10, 10, 20, 0.6);  /* Com backdrop-filter: blur(20px) */
```

### Cards de feature e pricing

```css
--landing-card-bg:           linear-gradient(135deg, rgba(20,20,40,0.8), rgba(15,15,30,0.9));
--landing-card-bg-active:    linear-gradient(135deg, rgba(30,30,60,0.9), rgba(20,20,50,0.95));
--landing-card-border:       rgba(255, 255, 255, 0.06);
--landing-card-border-active: rgba(99, 102, 241, 0.4);  /* Indigo — plano popular */
--landing-card-hover-glow:   linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15));
```

### Orbs decorativos (hero)

```css
--landing-orb-indigo:  radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%);
--landing-orb-purple:  radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%);
```

### Icon box (feature row title)

```css
--landing-icon-box-bg:     linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
--landing-icon-box-border:  rgba(99, 102, 241, 0.3);
```

### FAQ

```css
--landing-faq-bg:     rgba(20, 20, 30, 0.6);
--landing-faq-border: rgba(255, 255, 255, 0.05);
```

### CTA section (rodapé da landing)

```css
--landing-cta-bg:     linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(88,28,135,0.2) 50%, rgba(15,15,30,0.9) 100%);
--landing-cta-border: rgba(99, 102, 241, 0.2);
```

### Divisor de seção

```css
--landing-divider: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
```

---

## 12. Animações

### Keyframes disponíveis

| Keyframe | Efeito | Uso típico |
|----------|--------|-----------|
| `fadeIn` | opacity 0→1 + translateY(20px→0) | Conteúdo ao entrar na viewport |
| `scaleIn` | opacity 0→1 + scale(0.95→1) | Imagens, cards ao aparecer |
| `gradientShift` | background-position 0%→100%→0% | Gradientes animados de fundo |
| `float` | translateY(0→-20px→0) + scale(1→1.05→1) | Orbs decorativos |
| `pulse-glow` | opacity 0.4→0.7 + scale(1→1.1) | Segundo orb, efeitos de luz |
| `shimmer` | background-position -200%→200% | Skeleton loaders |

### Classes utilitárias Tailwind

```html
class="animate-fade-in"      <!-- fadeIn 0.8s ease-out forwards -->
class="animate-scale-in"     <!-- scaleIn 0.6s ease-out forwards -->
class="animate-gradient"     <!-- gradientShift 8s ease infinite, size 200x200 -->
class="animate-float"        <!-- float 6s ease-in-out infinite -->
class="animate-pulse-glow"   <!-- pulse-glow 4s ease-in-out infinite -->
class="animate-shimmer"      <!-- shimmer 3s linear infinite -->
```

### Padrão de delay

```html
<!-- Delay via style para escalonamento -->
<div class="animate-float" style={{ animationDelay: '2s' }} />
```

---

## 13. Classes Utilitárias Globais

```css
.landing-text-gradient   /* texto branco→índigo claro */
.landing-title-gradient  /* texto índigo→violeta→rosa */
.landing-logo-gradient   /* texto índigo→violeta */
.glass                   /* glassmorphism sutil */
.glass-strong            /* glassmorphism forte */
.prose                   /* Container de conteúdo legal/help */
```

### `.prose` — Páginas de conteúdo

Para `/terms`, `/privacy`, `/cookies`, `/help/[slug]`:

```html
<div class="prose">
  <h1>...</h1>
  <h2>...</h2>
  <p>...</p>
</div>
```

```
max-width: 700px | margin: 0 auto
h1: 2rem, 800, mb-4
h2: 1.4rem, 700, mt-8, borda inferior
h3: 1.1rem, 600, mt-6
p: 0.9rem, line-height 1.7, color #d1d5db
blockquote: border-left violeta, bg violeta/5
```

---

## 14. Componentes UI Base

Localizados em `src/components/ui/`.

### `Button`

```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">Começar</Button>
<Button variant="secondary" size="lg">Ver planos</Button>
<Button variant="outline" size="sm">Cancelar</Button>
<Button variant="ghost">Ignorar</Button>
<Button variant="destructive">Excluir</Button>
<Button loading>Salvando...</Button>
<Button href="https://..." target="_blank">Link externo</Button>
```

| Variant | Uso |
|---------|-----|
| `primary` | CTA principal, submit de form |
| `secondary` | Ação secundária |
| `outline` | Alternativa sem fundo |
| `ghost` | Ação contextual sem destaque |
| `destructive` | Ações irreversíveis (delete, cancelar plano) |

| Size | Uso |
|------|-----|
| `sm` | Ações inline, tabelas |
| `md` | Padrão — formulários, modais |
| `lg` | CTAs da landing page |
| `icon` | Botões de ícone quadrado |

### `Card`

```tsx
import { Card } from '@/components/ui/Card';
<Card className="p-6">conteúdo</Card>
```

### `Input` e `Textarea`

```tsx
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
```

---

## 15. Componentes de Landing

### `FeatureCard` — Cards de feature

```tsx
import { FeatureCard } from '@/components/landing/SharedLandingComponents';

<FeatureCard
  title="Busca inteligente"
  description="Encontre qualquer item em segundos"
  icon={<Search className="w-10 h-10 text-blue-400" />}
  wide={false} // true = card mais largo (50% da row)
/>
```

**Visual:**
- Background: `--landing-card-bg`
- Border: `--landing-card-border`
- Hover: gradient border `--landing-card-hover-glow` + glow do ícone
- Descrição: oculta no desktop, aparece no hover (`lg:max-h-0 → group-hover:max-h-[300px]`)
- Mobile: descrição sempre visível

### `FeatureRow` — Seção com scroll horizontal

```tsx
import { FeatureRow } from '@/components/landing/SharedLandingComponents';

<FeatureRow id="features" title="Funcionalidades" viewAllText="Ver tudo" icon={<Zap />}>
  <FeatureCard ... />
  <FeatureCard ... />
</FeatureRow>
```

**Visual:**
- `overflow-x-auto` + `snap-x mandatory`
- `scroll-mt-24` para navegação por anchor
- "Ver tudo" aparece no hover da row com animação de slide

### `HeroSection`

```tsx
<HeroSection
  title="Tracka"         // título principal
  subtitle="..."
  image="/hero-bg.jpg"  // via config do admin
  badgeNew="NOVO"
  badgeOriginal="Inventário inteligente"
  ctaPrimary="Começar grátis"
  ctaSecondary="Ver features"
  locale="pt"
/>
```

**Estrutura visual:**
```
Background image (via config) → Floating orbs (animate-float/pulse-glow)
  → Gradient overlay preto/translúcido
    → Conteúdo (animate-fade-in)
      → Badge pill (glass, indigo)
      → h1 (landing-title-gradient, text-7xl→9xl)
      → Subtitle (text-2xl, font-light)
      → CTAs (gradient CTA + glass-strong)
Grid pattern decorativo (opacity-[0.03])
```

**Badge pill:**
```html
<span class="text-xs font-bold tracking-widest border border-indigo-500/50 px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 backdrop-blur-sm">
  NOVO
</span>
```

### `LandingHeader`

```
fixed top-0 z-50
background: --landing-header-bg (rgba com blur 20px)
border-bottom: --landing-card-border
```

**NavLink**: hover → texto branco + underline indigo slide-in (`w-0 → w-full`)

**CTA "Login"**:
```html
<a class="text-white px-5 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-105"
   style={{ background: 'var(--landing-gradient-cta)' }}>
```

### `PricingSection`

**Card padrão** (plano regular):
```
background: --landing-card-bg
border: --landing-card-border
border-radius: --radius-2xl
```

**Card popular** (`isPopular: true`):
```
background: --landing-card-bg-active
border: --landing-card-border-active  (indigo 40%)
transform: scale(1.02) em desktop
```

**Badge "Mais Popular"**:
```
background: --landing-gradient-popular  (âmbar→laranja)
text: white, font-bold, uppercase
position: absolute, top -12px, centered
```

**Check icon por plano:**
```
Plano padrão: bg-emerald-500/15, text-emerald-400
Plano popular: bg-indigo-500/20, text-indigo-400
Trial: bg-amber-500/20, text-amber-400
```

**Herança de planos:**
```tsx
{plan.inheritance ? (
  <>
    <div>{inheritanceLabel?.replace('{plan}', plan.inheritance.inheritsFromName)}</div>
    <div style={{ background: '--landing-divider' }} />
    {plan.inheritance.exclusiveFeatures.map(f => <li>✓ {f}</li>)}
  </>
) : (
  plan.features.map(f => <li>{f}</li>)
)}
```

---

## 16. Padrões de Seção

### Estrutura de página padrão

```tsx
<main style={{ background: 'var(--landing-gradient-page)' }}>
  <LandingHeader />
  <HeroSection />
  <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-20 py-20">
    <FeaturesSection />
    <PricingSection />
    <TestimonialsSection />
    <FAQSection />
  </div>
  <CallToActionSection />
  <LandingFooter />
</main>
```

### Divisor de seção

```html
<div class="h-px" style={{ background: 'var(--landing-divider)' }} />
```

### Seção com fundo alternativo

```html
<section class="py-20" style={{ background: 'var(--landing-testimonial-bg)' }}>
```

---

## 17. Tipografia — Hierarquia

| Elemento | Tamanho | Peso | Cor |
|----------|---------|------|-----|
| Hero H1 | `text-7xl` / `text-9xl` md | 900 (extrabold) | `landing-title-gradient` |
| Section title (h2) | `text-2xl` / `text-3xl` md | 700 | `#e5e7eb` |
| Card title (h3) | `text-lg` / `text-xl` md | 700 | `#ffffff` |
| Subtítulo hero | `text-lg` / `text-2xl` md | 300 (light) | `#d1d5db` |
| Corpo / features | `text-sm` / `text-base` | 400 | `#9ca3af` → `#d1d5db` hover |
| Badge / label | `text-xs` / `text-sm` | 600-700 | `#c4b5fd` |
| Nav links | `text-sm` | 500 | `#9ca3af` → `#ffffff` hover |
| Price main | `text-4xl` / `text-5xl` | 800 | `#ffffff` |
| Price sub | `text-sm` | 400 | `#6b7280` |

---

## 18. Responsividade

```
Mobile first — breakpoints Tailwind padrão:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px
  2xl: 1536px
```

**Padrões recorrentes:**

```html
<!-- Padding de seção -->
<div class="px-4 md:px-8 lg:px-12">

<!-- Max-width de conteúdo -->
<div class="max-w-7xl mx-auto">

<!-- Hero height -->
<section style="min-height: max(80vh, 560px)">

<!-- Feature cards scroll -->
<div class="flex gap-5 overflow-x-auto pb-8 snap-x mandatory">
  <!-- Card: w-[85vw] sm:w-[45%] md:w-[30%] lg:w-[23%] -->

<!-- Texto responsivo -->
<p class="text-lg md:text-2xl">

<!-- Hero H1 -->
<h1 class="text-7xl md:text-9xl">
```

---

## 19. Regras Anti-Regressão

### ❌ NÃO fazer

```tsx
// ❌ Cor hardcoded
<div style={{ background: '#7c3aed' }}>

// ❌ Classe Tailwind de cor fora do sistema
<div className="bg-purple-600">

// ❌ next/link sem locale (404)
import Link from 'next/link';

// ❌ rgba sem variável quando variável existe
style={{ background: 'rgba(255,255,255,0.03)' }}

// ❌ URL hardcoded do app Tracka
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tracka.solucoesrkm.com';

// ❌ Fonte não-Inter
fontFamily: 'Arial'
```

### ✅ Sempre usar

```tsx
// ✅ CSS variable
<div style={{ background: 'var(--color-brand-primary)' }}>

// ✅ Classe utilitária ou token da landing
<div style={{ background: 'var(--landing-card-bg)' }}>

// ✅ Link com locale
import { Link } from '@/i18n/navigation';

// ✅ Glass via classe
<div className="glass-strong">

// ✅ Gradiente via variável
<h1 className="landing-title-gradient">

// ✅ URL centralizada
import { TRACKA_APP_URL } from '@/config/app.config';
```

### Checklist ao criar nova seção

```
[ ] Usa CSS variables do globals.css — sem hardcode
[ ] Trial usa --landing-gradient-trial (badge) e --landing-trial-overlay (card border)
[ ] Animação via classes utilitárias (@utility animate-*)
[ ] Card usa --landing-card-bg + --landing-card-border
[ ] Hover state definido (transform, glow, color change)
[ ] Responsivo: mobile-first com breakpoints md/lg
[ ] Links via @/i18n/navigation
[ ] URLs do app via TRACKA_APP_URL de @/config/app.config
[ ] Strings em messages/pt.json e messages/en.json
[ ] Sem texto hardcoded em PT ou EN no componente
```
