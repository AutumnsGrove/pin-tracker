# Merch Production Tracker

A Domino's Pizza Tracker-style app for tracking custom merch orders through every stage of production. Supports enamel pins, acrylic standees, and charms. Built with SvelteKit and styled with a mountain landscape aesthetic.

![Svelte](https://img.shields.io/badge/Svelte-5-orange?logo=svelte)
![SvelteKit](https://img.shields.io/badge/SvelteKit-2-red?logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)

## Features

- **Multi-product support** — track orders for enamel pins, acrylic standees, and charms, each with their own stage breakdowns
- **Horizontal step tracker** — Domino's-style progress bar with 5 stages per product type
- **Clickable stage checklists** — tap any stage to expand a detailed checklist showing what happens at each step
- **Phase sign-off workflow** — when all items in a phase are complete, both admin and client must sign off before advancing
- **Admin navigation** — admins can force-advance or reverse phases as needed
- **Order tab navigation** — switch between multiple orders with tab-style selectors
- **Role-based permissions** — admin (full control) and client (check items, sign off) roles
- **New order wizard** — guided 3-step flow for creating orders with product type selection
- **Mountain landscape background** — layered CSS/SVG mountain scene with animated fog, twinkling stars, and a golden hour sky gradient
- **Dark glass UI** — frosted glass panels with warm alpine color palette over the scenic backdrop

## Getting started

```bash
# clone the repo
git clone https://github.com/AutumnsGrove/pin-tracker.git
cd pin-tracker

# install dependencies
npm install

# start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack

- **Svelte 5** — component framework using runes (`$state`, `$derived`, `$props`)
- **SvelteKit 2** — app framework
- **TypeScript** — type safety
- **Vite 6** — build tool
- **CSS** — all styling is vanilla CSS (no Tailwind, no component library). The mountain scene is built with layered SVG paths and CSS gradients.
- **Lexend** — Google Font used for typography

## Product types

Each product type has its own stage definitions with unique checklists:

| Product Type | Stages |
|---|---|
| **Enamel Pins** | Order Received, Design Phase, In Production, Quality Check, Shipped |
| **Acrylic Standees** | Order Received, Design & Approval, In Production, Quality Check, Shipped |
| **Charms** | Order Received, Design & Approval, In Production, Quality Check, Shipped |

Stage definitions are stored in `src/lib/components/stages.ts` and can be customized per product type.

## Project structure

```
src/
├── app.css                          # global styles, color palette, animations
├── app.html                         # HTML shell with font imports
├── routes/
│   ├── +layout.svelte               # imports global CSS
│   └── +page.svelte                 # main page, order data, tab navigation, mountain scene
├── lib/
│   ├── stores/
│   │   ├── theme.ts                 # theme store (light/dark/mountain)
│   │   └── users.ts                 # user/role store, permissions
│   └── components/
│       ├── PinTracker.svelte        # horizontal tracker, checklists, sign-off, admin nav
│       ├── NewOrderWizard.svelte    # 3-step order creation wizard with product type picker
│       ├── stages.ts                # product type definitions, stage presets, checklist data
│       └── ThemeToggle.svelte       # theme cycle button
```

## How it was made

This project was built collaboratively with [Claude Code](https://claude.ai/claude-code). The design went through several iterations:

1. Started as a basic SvelteKit scaffold with a sidebar order list and vertical stage timeline
2. Evolved into a dark-mode glassmorphism UI with a full CSS mountain landscape background
3. Restructured to match the Domino's Pizza Tracker layout — horizontal step bar as the hero, tab-based order switching, single-order focus
4. Added interactive stage checklists with per-stage task breakdowns
5. Expanded from pin-only to multi-product merch tracking with phase sign-off workflow

## License

MIT
