# Pin Production Tracker

A Domino's Pizza Tracker-style app for tracking custom enamel pin orders through every stage of production. Built with SvelteKit and styled with a mountain landscape aesthetic.

![SvelteKit](https://img.shields.io/badge/SvelteKit-4-orange?logo=svelte)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

## Features

- **Horizontal step tracker** — Domino's-style progress bar with 5 stages: Order Received, Design Phase, In Production, Quality Check, and Shipped
- **Clickable stage checklists** — tap any stage to expand a detailed checklist showing what happens at each step
- **Order tab navigation** — switch between multiple orders with tab-style selectors
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

- **SvelteKit** — app framework
- **TypeScript** — type safety
- **Vite** — build tool
- **CSS** — all styling is vanilla CSS (no Tailwind, no component library). The mountain scene is built with layered SVG paths and CSS gradients.
- **Lexend** — Google Font used for typography

## How it was made

This project was built collaboratively with [Claude Code](https://claude.ai/claude-code). The design went through several iterations:

1. Started as a basic SvelteKit scaffold with a sidebar order list and vertical stage timeline
2. Evolved into a dark-mode glassmorphism UI with a full CSS mountain landscape background
3. Restructured to match the Domino's Pizza Tracker layout — horizontal step bar as the hero, tab-based order switching, single-order focus
4. Added interactive stage checklists with per-stage task breakdowns

## Project structure

```
src/
├── app.css                          # global styles, color palette, animations
├── app.html                         # HTML shell with font imports
├── routes/
│   ├── +layout.svelte               # imports global CSS
│   └── +page.svelte                 # main page, order data, tab navigation, mountain scene
└── lib/components/
    ├── PinTracker.svelte            # horizontal tracker, checklists, status banner, activity feed
    ├── OrderSummary.svelte          # order summary grid (currently unused after layout refactor)
    ├── NewOrderButton.svelte        # new order button component
    └── stages.ts                    # stage definitions and checklist data
```

## License

MIT
