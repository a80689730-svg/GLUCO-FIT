# Design Brief

## Direction

Health-First Wellness — A diabetes management platform with botanical green as primary, teal as trust accent, designed for calm professionalism and medical credibility.

## Tone

Clean, trustworthy, and approachable — wellness-focused rather than clinical, using a botanical green palette to signal health and growth while maintaining professional medical authority.

## Differentiation

Green-primary health system paired with readable typography hierarchy creates an app that feels like a trusted wellness partner, not a generic utility dashboard.

## Color Palette

| Token       | OKLCH           | Role                                    |
| ----------- | --------------- | --------------------------------------- |
| background  | 0.98 0.008 230  | Light cool off-white, accessibility     |
| foreground  | 0.18 0.015 230  | Deep cool text, AA+ contrast            |
| card        | 1.0 0.004 230   | Content cards, pure white with cool lue |
| primary     | 0.58 0.18 155   | Botanical health green, CTAs, wellness |
| accent      | 0.62 0.16 170   | Teal secondary, trust, calm highlights  |
| destructive | 0.55 0.22 25    | Alert red, destructive actions          |

## Typography

- Display: Space Grotesk — modern, approachable, tech-forward signals contemporary health care.
- Body: Figtree — friendly legible open apertures build trust in medical content.
- Mono: Geist Mono — technical detail for nutrient lists, appointment times, data displays.
- Scale: Hero `text-5xl md:text-7xl font-bold tracking-tight`, Section H2 `text-3xl md:text-5xl font-bold`, Labels `text-sm font-semibold tracking-widest uppercase`, Body `text-base md:text-lg`.

## Elevation & Depth

Subtle layered shadows (shadow-health, shadow-health-elevated) create clear surface hierarchy without clinical sterility. Card-based layout with soft borders (border: 1px, color: var(--border)).

## Structural Zones

| Zone    | Background         | Border                    | Notes                                             |
| ------- | ------------------ | ------------------------- | ------------------------------------------------- |
| Header  | card (1.0 0.004)   | border-b border-border    | Navigation bar, logo, user menu, solid presence  |
| Content | background (light) | —                         | Main content with alternating card sections      |
| Section | card with bg-card  | subtle 1px border-border  | Diet, Doctor, Subscription cards, elevated       |
| Footer  | secondary/muted    | border-t border-border    | Legal, support, light background contrast        |

## Spacing & Rhythm

Mobile-first density with spacious gaps (1.5–2rem between sections). Micro-spacing: 8px/12px/16px for component internals. Card padding 1.5rem on mobile, 2rem on desktop. Section margins scale 2rem → 3rem.

## Component Patterns

- Buttons: Primary (bg-primary, text-primary-foreground), Secondary (bg-secondary, border-primary), Outline (border-border, text-foreground). Rounded 8px (md radius). Hover state: slightly darker via opacity or tone shift.
- Cards: bg-card, border 1px border-border, rounded-md (8px), shadow-health. Minimal spacing inside (1.5rem padding).
- Badges: Health theme — green for active/success, red for alerts, teal for neutral info. Pill-shaped (rounded-full).
- Forms: Input bg-input (0.9 0.008 230), border-border, focus ring-primary. Accessible labels with text-sm font-semibold.
- Product Grid: 4 cols (xl), 3 cols (lg), 2 cols (sm), 1 col (mobile). Grid gap 1rem.
- Exercise Session: Card with YouTube thumbnail placeholder, title, booking button. Hover: scale 1.02, shadow elevation.
- Chat Bubbles: User msgs right-aligned with primary bg, assistant msgs left-aligned with card bg + border. Max-width xs, rounded asymmetrically (rounded-br-none for user, rounded-bl-none for assistant).

## Motion

- Entrance: Fade in + subtle slide (opacity 0 → 1, translateY -4px → 0 in 0.3s ease-out) on page load.
- Hover: Color shift (primary → slightly darker saturation), shadow elevation (shadow-health → shadow-health-elevated) on buttons and cards.
- Decorative: None — focus on functional clarity over animation. Smooth transitions via transition-smooth utility.

## Constraints

- No full-page gradients or decorative blur effects — maintain clarity for medical data.
- No rainbow palettes — 3 core colors only (primary green, accent teal, destructive red).
- No system fonts — always use Space Grotesk, Figtree, Geist Mono.
- Min WCAG AA+ contrast ratio on all text; foreground-on-background difference >= 0.7, foreground-on-primary >= 0.45 (verified in OKLCH space).

## Signature Detail

Botanical green as the primary color for health/growth signaling, paired with calm teal accents — creates a wellness-first identity that feels modern and trustworthy, distinct from generic healthcare UI clichés.

## New Feature Sections (Shopping, Exercise, AI Chat)

**Shopping**: Product grid layout (mobile-responsive: 1/2/3/4 cols) with category filters in sidebar. Product cards include image placeholder, name, price (bold primary green), and "Add to Cart" button. Cart sidebar (fixed right, mobile-bottom drawer) shows items with remove button (destructive red) and checkout CTA.

**Exercise**: Session cards arranged in grid, each with YouTube thumbnail placeholder (16:9 aspect), session title, trainer name, time slot. Booking button uses primary color. "My Bookings" section below shows booked sessions with cancel option (destructive).

**AI Chat**: Full-height container, white/card background. Chat history scrolls smooth. User messages: right-aligned, primary bg, white text. Assistant messages: left-aligned, card bg + subtle border, foreground text. Input bar fixed at bottom with send button (primary). No decorative elements — functional clarity only.

All three sections maintain existing card hierarchy, shadow depth (shadow-health/shadow-health-elevated), and botanical green/teal color scheme. Typography follows established scale (display for section headers, body for content). No new colors introduced.
