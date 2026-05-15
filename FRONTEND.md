# FRONTEND.md — LearnVault UI Patterns & Design System

> Reference this file for every UI component, page, or styling decision.
> Do not deviate from these patterns without updating this file first.

---

## 1. Design Philosophy

LearnVault uses a **retro paper-and-ink** aesthetic. It should feel like a well-worn field notebook — functional, tactile, and personal. Not a SaaS dashboard. Not a startup landing page.

**Three words to test every design decision against:** Focused. Legible. Honest.

---

## 2. Color Palette

All colors defined as CSS variables on `:root`.

```css
:root {
  --bg:      #F5F0E1;   /* warm parchment — page background */
  --paper:   #EDE8D5;   /* slightly darker cream — card/form surfaces */
  --ink:     #1C1A14;   /* near-black — primary text, borders, solid buttons */
  --faded:   #7A7360;   /* muted brown — labels, placeholders, secondary text */
  --accent:  #C8440A;   /* burnt orange — CTAs, highlights, danger states */
  --green:   #2D6A4F;   /* forest green — success, "correct", passed */
  --border:  #B8B09A;   /* warm grey — card borders, dividers */
  --stamp:   #8B2500;   /* deep red — failure, "wrong", failed outcome */
  --yellow:  #D4A017;   /* amber — warning, "okay" confidence, pending */
  --rule:    #C8C0A8;   /* light rule line — subtle dividers inside cards */
}
```

**Usage rules:**
- Never use pure `#000` or `#fff` — always use `--ink` and `--bg`
- `--accent` is for one primary action per screen only
- `--paper` for any surface that sits *on* the background
- Confidence states always use the fixed triplet: `--stamp` (weak) / `--yellow` (ok) / `--green` (strong)

---

## 3. Typography

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700;900&display=swap');

/* Tokens */
--font-mono:  'Courier Prime', 'Courier New', monospace;  /* body, UI, inputs */
--font-serif: 'Playfair Display', Georgia, serif;          /* headings, titles */
```

**Scale:**

| Role              | Font       | Size          | Weight | Notes                        |
|-------------------|------------|---------------|--------|------------------------------|
| App title         | serif      | 48–64px       | 900    | `clamp(36px, 8vw, 64px)`    |
| Section title     | serif      | 24–28px       | 700    |                              |
| Card title        | mono       | 13–15px       | 700    |                              |
| Body / answers    | mono       | 13px          | 400    | `line-height: 1.8`           |
| Labels / eyebrow  | mono       | 9–11px        | 400    | `letter-spacing: 2–3px`, ALL CAPS |
| Buttons           | mono       | 10–11px       | 400–600| `letter-spacing: 2px`, ALL CAPS |

---

## 4. Spacing System

Base unit: `4px`. Use multiples only.

```
4   — tight (badge padding, icon gaps)
8   — compact (between inline elements)
12  — default small gap (form rows, card padding vertical)
16  — default padding (card padding horizontal)
20  — section padding, form padding
24  — between cards
28  — between major sections
48  — page-level vertical separation
```

---

## 5. Component Patterns

### 5.1 Cards

All cards share the same base structure:

```css
.card {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 0;           /* NO border-radius — this is paper, not plastic */
}
```

> **Rule:** Zero `border-radius` on all card-level containers. Small radius (≤4px) is allowed only on inline badges and pills.

Card variants:
- **Flat card** — `border: 1px solid var(--border)` — default
- **Emphasis card** — `border: 2px solid var(--ink)` — score boxes, north-star blocks
- **Left-rule card** — `border-left: 3px solid var(--accent)` — callouts, problem statements

### 5.2 Buttons

Two types only. No ghost-outline variants, no icon-only buttons without labels in MVP.

```css
/* Default — outline */
.btn {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  padding: 8px 18px;
}
.btn:hover { background: var(--ink); color: var(--bg); }

/* Solid — primary CTA */
.btn-solid { background: var(--ink); color: var(--bg); }
.btn-solid:hover { background: var(--accent); border-color: var(--accent); color: #fff; }

/* Small modifier */
.btn-sm { padding: 5px 12px; font-size: 10px; }

/* Semantic modifiers */
.btn-wrong { border-color: var(--stamp); color: var(--stamp); }
.btn-wrong:hover { background: var(--stamp); color: #fff; }
.btn-right { border-color: var(--green); color: var(--green); }
.btn-right:hover { background: var(--green); color: #fff; }
```

### 5.3 Form Fields

All inputs/textareas share one class:

```css
.field {
  width: 100%;
  font-family: var(--font-mono);
  font-size: 13px;
  background: var(--paper);
  border: 1px solid var(--border);
  color: var(--ink);
  padding: 10px 12px;
  border-radius: 0;
  outline: none;
  resize: vertical;
}
.field:focus { border-color: var(--ink); }

.field-label {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--faded);
  margin-bottom: 5px;
  display: block;
}
```

Always pair every input with a `.field-label` above it. No placeholder-only labeling.

### 5.4 Navigation

Top-level navigation is a **horizontal tab bar** pinned below the masthead. Exactly 3 tabs in MVP.

```
[ Icon + Label ]  [ Icon + Label ]  [ Icon + Label ]
```

- Active tab: `background: var(--ink); color: var(--bg)`
- Inactive tab: transparent, `color: var(--faded)`
- Separator: `border-right: 1px solid var(--border)` between tabs
- No underline nav, no sidebar nav in MVP

### 5.5 Masthead

Fixed app header, shown on all screens. Always contains:
1. Eyebrow line (10px mono, `letter-spacing: 5px`, ALL CAPS, `color: var(--faded)`)
2. App title in serif, `color: var(--ink)` with accent color on the second word
3. Subtitle rule line (centered, flanked by `<hr>`-style lines)

```
────────────────────────────────
  PERSONAL KNOWLEDGE SYSTEM
         LearnVault
    MVP · Interview Edition
════════════════════════════════
```

### 5.6 Section Header

Every content section starts with:

```html
<div class="sec-head">
  <span class="sec-title">Section Name</span>   <!-- serif, 26px -->
  <span class="sec-count">N ITEMS</span>         <!-- mono, 11px, faded, letter-spacing -->
</div>
```

Below the title: a full-width `border-bottom: 2px solid var(--ink)`.

### 5.7 Tags & Pills

```css
/* Outline tag — domain labels */
.tag {
  font-size: 9px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--faded);
  border: 1px solid var(--border);
  padding: 2px 7px;
}

/* Filled pill — session chips, topic chips */
.pill {
  font-size: 10px;
  padding: 2px 9px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--faded);
}
```

### 5.8 Confidence Indicators

Used in Answer Bank and any rated item.

| Level  | Dot color       | Button tint          |
|--------|-----------------|----------------------|
| Weak   | `var(--stamp)`  | `#8B250022` bg       |
| Okay   | `var(--yellow)` | `#D4A01722` bg       |
| Strong | `var(--green)`  | `#2D6A4F22` bg       |

Dot size: `10×10px`, `border-radius: 50%`.

### 5.9 Progress Bar

```css
.progress-bar-wrap {
  height: 4px;
  background: var(--rule);
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--ink);
  transition: width .4s ease;
}
```

---

## 6. Layout

### Page wrapper
```css
.app {
  max-width: 860px;
  margin: 0 auto;
  padding: 0 16px 80px;
}
```

### Two-column form grid
```css
.form-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
@media (max-width: 540px) { .form-2col { grid-template-columns: 1fr; } }
```

### Card list
Always `flex-direction: column`, `gap: 12–14px`. No CSS Grid for card lists.

---

## 7. Motion & Texture

### Grain overlay
Applied globally via `body::before` pseudo-element using an inline SVG noise filter. Opacity: `0.5`. `pointer-events: none`. This is mandatory — it's what makes the interface feel like paper.

```css
body::before {
  content: '';
  position: fixed; inset: 0;
  pointer-events: none; z-index: 9999;
  background-image: url("data:image/svg+xml,...feTurbulence...");
  opacity: 0.5;
}
```

### Card flip (Flashcards only)
```css
.card-wrap { perspective: 1000px; }
.card-inner {
  transform-style: preserve-3d;
  transition: transform .5s cubic-bezier(.4,0,.2,1);
}
.card-inner.flipped { transform: rotateY(180deg); }
.card-face { backface-visibility: hidden; }
.card-face.back { transform: rotateY(180deg); }
```

### Button hover
CSS transition only: `transition: background .15s, color .15s`. No scale or shadow transforms on buttons.

### Collapsible cards (Answer Bank)
Toggle via state. No CSS animation — instant show/hide. The border-top divider appears with the body content.

---

## 8. Do / Don't

| ✅ Do                                           | ❌ Don't                                        |
|-------------------------------------------------|-------------------------------------------------|
| Use `border` for structure                      | Use `box-shadow` as borders                     |
| Use `var(--ink)` for all primary elements       | Use `#000` or hardcoded dark colors             |
| Keep forms inside a `.paper` background block   | Float forms in the open with no container       |
| Use ALL CAPS + letter-spacing for labels        | Use sentence-case labels                        |
| Show confidence with color dots                 | Use icons or emoji for confidence states        |
| Use `border-radius: 0` on cards                 | Round card corners                              |
| Collapse secondary content behind a toggle      | Show everything expanded at once                |
| One `.btn-solid` per view                       | Multiple solid CTAs competing for attention     |
