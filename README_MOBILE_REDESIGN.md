# NoBeef Fantasy League — Mobile Redesign Pass

## What changed

**Design system**
- Retired the Stripe-branded navy (#0a2540) + indigo (#635bff) identity — that
  exact combo is Stripe's own marketing palette, so the app read as generic
  fintech rather than a CrossFit competition.
- New palette: charcoal base (#121316), competition-red brand accent (#e8462f),
  amber for leader/gold moments (#f2b134). Implemented by overriding Tailwind's
  built-in `indigo` scale in `tailwind.config.js` — every existing
  `text-indigo-400`, `border-indigo-500/20`, etc. across all 9 components now
  renders the new brand color automatically, with zero risk of missed spots.
- Added `Roboto Condensed` as a `font-display` utility for headings — the
  stamped, athletic look big scores and titles want, instead of using Inter
  (a general UI face) for everything.
- Added a `.scoreboard-num` utility (tabular-nums, mono, bold) so every score,
  price, and countdown digit in the app shares one consistent numeral style.
- Replaced `.glass-card`/`.glass-panel`'s `backdrop-filter: blur()` gradient
  treatment with a flat surface + thin border. Blur is expensive to repaint
  on mobile scroll across dozens of cards; a flat card reads just as premium
  for a fraction of the GPU cost.

**Mobile-specific fixes**
- `PricingTab.jsx`: the men's/women's athlete tables only had a horizontal-
  scrolling `<table>`. Added a proper stacked single-column mobile view
  (`sm:hidden`) alongside the desktop table.
- `AdminTab.jsx`: same fix for the 60-row batch scoring table — mobile gets
  one card per athlete with a 44px-tall input instead of a cramped table.
- `DashboardTab.jsx`: same fix for the "Active Power Card Assignments" table.
- Header/bottom nav, countdown timer, and lock screen re-themed to match.

## What I didn't change
The bottom tab bar + "More" sheet pattern in `Header.jsx` was already a solid
mobile nav pattern (5 destinations, sheet for the rest) — I left the
structure alone and only re-themed its colors/type.

## Not included
I don't have `firebase.js` or `data/seedData.js`, so I couldn't run this
project end-to-end to screenshot it — swap these files into your existing
project (same paths) and it should compile as-is; all edits were scoped to
className strings, two hex-only CSS files, and additive mobile-view blocks,
verified with a JSX parser before export.
