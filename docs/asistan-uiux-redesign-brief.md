# Asistan UI/UX Redesign Brief

Date: 21 May 2026
Project: kktc.asistan.online
Prepared by: Agent 1 - UI/UX Designer

## 1. Current Structure Audit

The project uses Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/Radix UI primitives, lucide-react icons, and existing auth/dashboard flows. The public site already has Turkish pages for product, solutions, pricing, resources, and about:

- `/` homepage
- `/urun`
- `/cozumler`
- `/cozumler/health`
- `/fiyatlandirma`
- `/kaynaklar`
- `/hakkimizda`
- `/auth/login`
- `/auth/sign-up`
- `/dashboard`

Weak points found:

- English routes requested by product stakeholders are missing: `/about`, `/features`, `/pricing`, `/contact`, `/login`, `/privacy`, `/terms`.
- Homepage explains the product, but needs a stronger FAQ block and clearer legal/trust pathways.
- Footer should include privacy, terms, and contact links.
- The visual language should continue using the Asistan mark as a system anchor: SVG logo mark, deep navy text, accessible teal for actions, bright teal and blue only for decorative gradients.
- Fake metrics, fake testimonials, and unverified customer logos must not be used.

## 2. Updated Page Structure

Homepage should follow this order:

1. Sticky glass navbar
2. Modern health-tech hero with product mockup
3. Static trust badge strip
4. Problem section
5. Micro product proof section
6. Feature bento grid
7. How Asistan works
8. Asistan Health dark section
9. Future sector vision
10. Early access discovery cards
11. Pricing / membership preview
12. FAQ
13. Final CTA
14. Footer with working legal/contact links

## 3. Missing Page Requirements

### `/about`

Purpose: English-friendly alias for `/hakkimizda`.
Implementation: Redirect or alias to current about page.
CTA: Early access and Health solution.

### `/features`

Purpose: English-friendly alias for `/urun`.
Implementation: Redirect or alias to product/features page.
CTA: Early access and Health solution.

### `/pricing`

Purpose: English-friendly alias for `/fiyatlandirma`.
Implementation: Redirect or alias to pricing page.
CTA: Demo request / early access.

### `/login`

Purpose: Short login route.
Implementation: Redirect to `/auth/login`.

### `/contact`

Purpose: Contact and demo request page.
Sections:
- Hero: "Kliniğiniz için Asistan'ı birlikte planlayalım."
- Contact cards: email, early access, dashboard access.
- Short contact form visual or professional placeholder.
- FAQ / response expectation.
CTA: `/auth/sign-up`, `mailto:merhaba@asistan.online`

### `/privacy`

Purpose: Public privacy policy placeholder for launch.
Sections:
- Privacy principles
- Data categories
- Access and role-based use
- Contact
CTA: contact email

### `/terms`

Purpose: Public terms placeholder for launch.
Sections:
- Scope
- Account responsibility
- Acceptable use
- Early access note
- Contact
CTA: contact email

## 4. Design System

Colors:

- Deep navy: `#06142A` for text and calm authority
- Brand dark: `#0D1117` for premium dark sections
- Accessible teal: `#0B7F6F` for primary actions and readable accents
- Bright teal: `#12C8AD` for glow, decorative gradients, and non-text accents
- Brand blue: `#185FA5` for secondary gradient and links
- Light background: `#F8FAFB`
- Body text: gray-600 / `#475569` family

Typography:

- Font: Manrope via `next/font/google`
- H1: `text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight`
- H2: `text-3xl md:text-4xl font-bold tracking-tight`
- H3: `text-lg md:text-xl font-bold`
- Body: `text-base md:text-lg leading-8 text-gray-600`
- Small: `text-sm leading-6 text-gray-500`

Spacing:

- Section: `py-20 md:py-28`
- Container: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
- Cards: `p-6`, feature hero cards `p-7 md:p-8`
- Grid gap: `gap-5 md:gap-6 lg:gap-8`

Components:

- Buttons: 48px high, `rounded-xl`, subtle shadow, hover lift `hover:-translate-y-0.5`
- Cards: `rounded-2xl` or `rounded-3xl`, `border-gray-100`, `shadow-sm`, hover `-translate-y-1`
- Dark sections: `#0D1117`, white text, teal/blue glow
- Header: 64px sticky glass with active page indication

## 5. Animation Rules

- Use CSS animations only. Do not add heavy dependencies.
- Animated gradient text allowed only for one H1 phrase.
- Continuous motion must respect `prefers-reduced-motion`.
- Button hover: `-translate-y-0.5`
- Card hover: `-translate-y-1` and soft shadow
- No bounce, no scroll hijacking, no fake count-up stats.

## 6. Broken Link and Route Fixes

Create or connect:

- `/about` -> `/hakkimizda`
- `/features` -> `/urun`
- `/pricing` -> `/fiyatlandirma`
- `/login` -> `/auth/login`
- `/contact` -> new contact page
- `/privacy` -> new privacy page
- `/terms` -> new terms page

Footer must include contact, privacy, and terms links.

## 7. Accessibility Requirements

- One H1 per page.
- Semantic `main`, `section`, `nav`, `footer`.
- All icon-only buttons need `aria-label`.
- Link buttons must lead to real routes.
- Dark sections must keep WCAG AA contrast.
- Mobile touch targets minimum 44px.
- Focus states must remain visible.

## 8. Acceptance Criteria

- Homepage clearly explains what Asistan is, who it is for, why it is trustworthy, how it works, and how to start.
- No major CTA is broken.
- Missing public routes exist or redirect intentionally.
- Navbar and footer work on mobile and desktop.
- Logo is lightweight and integrated into the visual system.
- No fake testimonials, fake logos, or fake metrics.
- Lint and build pass.
