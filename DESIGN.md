---
name: Projaska
description: Storefront for technology and security equipment, seen through a camera viewfinder.
colors:
  letterbox: "#0a0a0a"
  hud: "#16191c"
  hud-line: "#2a2f33"
  osd: "#f2f4f5"
  osd-dim: "#9aa2a8"
  caution: "#ffb000"
  pj: "#1479bc"
  pj-hi: "#2690d6"
  pj-ink: "#5fb2e8"
  plate: "#e6e9eb"
  plate-ink: "#3f474c"
typography:
  display:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
    fontSize: "clamp(2.6rem, 6vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.02em"
  headline:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
    fontSize: "2.25rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.06em"
  title:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.06em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.08em"
  readout:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "tnum"
  readout-xs:
    fontFamily: "Share Tech Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "tnum"
rounded:
  none: "0px"
  dot: "9999px"
spacing:
  card-gap: "8px"
  card-gap-sm: "12px"
  card-pad: "12px"
  card-pad-sm: "16px"
  gutter: "16px"
  gutter-sm: "24px"
  gutter-lg: "40px"
  section: "40px"
  section-sm: "56px"
components:
  button-primary:
    backgroundColor: "{colors.pj}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.85rem 1.25rem"
  button-primary-hover:
    backgroundColor: "{colors.pj-hi}"
  button-ghost:
    textColor: "{colors.osd}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.85rem 1.25rem"
  input:
    backgroundColor: "{colors.hud}"
    textColor: "{colors.osd}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1rem"
  card:
    backgroundColor: "{colors.letterbox}"
    textColor: "{colors.osd}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-pad}"
  image-well:
    backgroundColor: "{colors.hud}"
    rounded: "{rounded.none}"
  image-plate:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.plate-ink}"
    rounded: "{rounded.none}"
  channel-item:
    textColor: "{colors.osd-dim}"
    typography: "{typography.readout}"
    padding: "6px 10px"
  channel-item-active:
    textColor: "{colors.osd}"
---

# Design System: Projaska

## Overview

**Creative North Star: "The Viewfinder"**

The storefront is the store seen through a camera viewfinder. Letterbox black fills the ground, and the merchandise sits inside corner brackets the way a subject sits inside a focus frame. Facts that a camera would overlay (SKU, stock, component count, price, the reference dollar rate) are shown as on-screen-display readouts in the corners, in a segmented mono face. Persuasion comes from shown data, not from soft heroes, icon category tiles or shadowed cards.

The world is always dark and is scoped by the `.store` wrapper. The admin area keeps its own light/dark system and does not inherit these tokens. Density is high and catalog-like: a two to five column grid of tight cards, thin hairline dividers, and no decorative fill. The only texture is a 45° zebra stripe, and it means one thing: out of stock (overexposed).

Motion behaves like a camera, not like an app. State changes are single-frame cuts. Brackets snap from one size and color to another with no color or height transitions, and the only animation is the REC dot, which blinks with stepped timing.

**Key Characteristics:**
- Closed corner brackets mean selection or focus, nothing else. Panels, buttons and resting inputs use 1px HUD Line hairlines instead. The only resting frames are the home viewfinder and the in-focus product image. A closed amber pair means locked (active or in the cart).
- OSD readouts in Share Tech Mono, uppercase with tabular figures. Product names and running prose stay in Geist.
- One action color, the logo blue. One caution color, amber, used only for named functional roles.
- Square corners everywhere. The only round shapes are status and REC dots.
- No shadows, no gradients, no fades.

## Colors

A near-black instrument palette with one blue for action and one amber for caution.

### Primary
- **Lens Blue** (pj): the Projaska logo blue and the only primary-action fill (add to cart, checkout, coordinate on WhatsApp, the plus side of the quantity stepper). White text on it.
- **Lens Blue Lit** (pj-hi): hover state of a primary action.
- **Lens Blue Ink** (pj-ink): the legible blue for text on black, such as the highlighted word in the hero headline. Never use the base blue as text on black.

### Secondary
- **Caution Amber** (caution): functional signal, never decoration. Its roles are fixed by the Caution Amber Rule below. It is also the selection background and the text caret.

### Neutral
- **Letterbox Black** (letterbox): page ground and card background.
- **HUD Gray** (hud): input fields and the empty image well. It is darker than the contract's #22272B on purpose, for more letterbox contrast.
- **HUD Line** (hud-line): hairline dividers, section rules, stepper and toggle outlines, and the resting brackets on cards.
- **OSD White** (osd): primary text and active brackets.
- **OSD Dim** (osd-dim): secondary text, labels and inactive readouts. It is set to #9aa2a8 so it holds at least 6:1 on letterbox black.
- **Plate** (plate) and **Plate Ink** (plate-ink): the lit image plate behind real product photos, and the readouts printed on it.

### Named Rules
**The Caution Amber Rule.** Amber marks only these: the zoom bar, low stock and made-to-order, locked (selected or in-cart) brackets, input focus brackets, error and caution messages, the required action on a PENDING order (its bordered WhatsApp panel and link; the status itself stays white), and the keyboard focus outline. Decorative amber is banned.

**The One Action Rule.** Lens Blue fills primary actions and nothing else. Secondary actions are ghost buttons with bracket hover.

**The Lit Plate Rule.** A product image sits on the light plate (with the photo multiplied into it) only when a photo exists, so supplier photos on white backgrounds merge into the plate. With no photo, the well stays HUD Gray with a dim lucide glyph at 40% opacity.

## Typography

**Display Font:** Share Tech Mono (with ui-monospace, monospace), loaded via next/font as `--font-share-tech-mono` in the store layout.
**Body Font:** Geist (with system sans), from the root layout.
**Label/Mono Font:** Share Tech Mono, the same face as display.

**Character:** A segmented camera OSD face does all the reading-out, and a neutral grotesque carries everything a person reads as a sentence or a name.

### Hierarchy
- **Display** (400, 2.6rem rising to 5.5rem at xl, line-height 0.95, 0.02em): the home viewfinder headline only, text-balanced.
- **Headline** (400, 2.25rem): page titles such as cart, login, orders and order code, set as OSD.
- **Title** (400, 1.5rem to 1.875rem): channel section heads, preceded by a dim `CHnn` index at 1rem to 1.125rem.
- **Body** (Geist 400, 1rem to 1.125rem, line-height 1.625, max 46ch in the hero): explanatory copy, in OSD Dim when it is secondary.
- **Body small** (Geist 400, 0.875rem, line-height 1.375): product and kit names on cards, clamped to two lines.
- **Label** (400, 0.75rem, 0.08em, uppercase): form labels and button text (buttons at 0.875rem, cards' compact buttons at 0.75rem).
- **Readout** (400, 0.75rem, 0.06em, uppercase, tabular): stock, counts, dates, channel items and footer.
- **Readout XS** (400, 11px): SKU, kit tag, offer tag, struck price and stock on cards. This is the floor. Do not go smaller.
- **Prices** are OSD: 1.125rem to 1.25rem on cards, 1.875rem on the featured kit and detail pages.

### Named Rules
**The Readout Rule.** If a camera would overlay it (SKU, stock, count, price, rate, date, channel), it is OSD: uppercase, tabular figures and tracked. If a person reads it as a sentence or a name, it is Geist in normal case. Inside an OSD list, product names drop back to `normal-case tracking-normal font-sans`.

## Layout

The content column is capped at 1440px, with gutters of 16px, then 24px from sm and 40px from lg. Vertical page padding is 24px, or 40px from sm. The home opens with a full-bleed viewfinder frame using large brackets, at least min(100svh - 9rem, 48rem) tall on lg. It has three bands: readouts across the top (REC and the reference rate), a 12-column split of headline and featured kit, and readouts across the bottom (counts, zoom bar, installation contact).

The catalog is a grid of 2 columns, rising to 3 at sm, 4 at md and 5 at lg, with 8px gaps (12px from sm). Sections are separated by 40px (56px from sm) and each one opens with a hairline-ruled channel head. A sticky channel bar sits under the navbar (top 64px, 48px tall), bleeds to the gutters, and is ruled top and bottom with HUD Line. Form and order pages narrow to a centered 42rem column.

## Elevation & Depth

The system is flat and has no shadows. Depth is tonal. Letterbox black is the ground, HUD Gray is a recessed well, and the light plate is the one lit surface, standing for the subject under the lens. Hierarchy comes from brackets and hairlines, never from lift.

### Named Rules
**The No-Lift Rule.** No `box-shadow`, no blur and no gradients used as fill. A state change moves the brackets, not the surface.

## Shapes

All corners are square (0px). The recurring silhouette is the corner bracket: four L-shaped marks painted as background-image gradients, so no extra DOM is needed. They come in three sizes: small (10 to 16px arms, 2px thick) on focusable links and cards, with in-cart cards locked at 26px by 3px, large (36px arms, 3px thick) on the home viewfinder, and focus (22px resting, closing to 16px when lit). Brackets inherit color from a single custom property, so they can be white, dim or amber. The only round shapes are the REC dot and the order-status dots. Hairlines are 1px HUD Line.

## Components

### Buttons
Instrument keys: mono, uppercase and square.
- **Shape:** square (0px). Buttons carry no resting brackets.
- **Primary:** Lens Blue fill, white text, label type at 0.875rem, padding 0.85rem by 1.25rem. On cards it runs full width at 0.75rem with 10px vertical padding.
- **Hover / Focus:** a hard cut to Lens Blue Lit. Keyboard focus is the amber outline (2px, offset 3px). Disabled is 40% opacity.
- **Ghost:** OSD White text, no fill, a 1px HUD Line border. White brackets (12px) appear on hover.

### Cards / Containers
- **Corner Style:** square.
- **Background:** Letterbox black. The image well is the plate (photo) or HUD Gray (no photo), square, with Readout XS SKU and tag in its top corners.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** none. Dim HUD Line brackets (10px) at rest turn OSD White (16px) on hover or focus-within, and amber (26px by 3px) when the item is in the cart.
- **Internal Padding:** 12px, or 16px from sm, with a 12px internal gap.
- **Sold out:** a zebra strip along the image bottom at 70% opacity, the photo grayscaled at 40%, and a "No disponible" hairline box in place of the button.

### Inputs / Fields
- **Style:** HUD Gray fill, OSD White text, a 1px OSD Dim bottom rule, and no brackets at rest. Placeholder is #8a9298. Labels use label type in OSD Dim above the field.
- **Focus:** amber brackets (16px) cut in. The caret is amber.
- **Error:** an amber 0.75rem message under the field, and form-level errors in an amber 1px bordered box with `role="alert"`.

### Navigation
- **Style:** OSD readout links. Nav and channel items show no brackets at rest. They bracket only on hover, focus or lock.
- **Cart:** an OSD link with a count, on desktop and mobile. It locks with amber brackets once the cart holds items.
- **Zoom bar:** a W–T tick scale in the navbar on non-home pages (lg+) and at the bottom of the home viewfinder. The amber tick marks depth: W is the catalog, T is the product or kit detail. It is aria-hidden.
- **Mobile:** a hamburger opens a stacked OSD list with HUD Line separators.

### Channel Bar (signature)
A sticky strip that treats each category as a TV channel. Its right end holds the catalog search (name, SKU or category, accent-insensitive; "/" focuses it, Esc clears). While a search is active the channel list hides, the counter reads the result count, and one results grid replaces the sections. A `CH nn/NN` counter on the left follows scroll through an IntersectionObserver. Category items are Readout links, and the active channel is locked with amber brackets. Section heads repeat the index as a dim `CHnn` before the title.

### Stock Readout
Stock shown as data. Normal stock is `Stock n` in OSD Dim. Three or fewer, or made-to-order, is amber (`Últimas n` / `Por encargo`). Zero is a small zebra swatch plus `Sin stock` in OSD Dim.

### Quantity Stepper
A square, hairline-outlined group. The minus key is dim and becomes a trash icon at quantity 1. The count is an OSD readout with `aria-live`. The plus key is a Lens Blue fill and disables at maximum stock.

### REC Readout
A white dot at the top left of the home viewfinder that blinks at 1.6s with `steps(1)`. The blink is disabled under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** frame selection, focus and the subject with corner brackets. Lock in-cart and active items with amber brackets.
- **Do** show stock, counts, SKU and prices as OSD readouts with tabular figures.
- **Do** put real photos on the light plate (#e6e9eb, multiply) and leave photo-less wells HUD Gray.
- **Do** change state with single-frame cuts. Brackets snap to their new size and color.
- **Do** scope every storefront rule under `.store`, and leave the admin's light/dark system alone.
- **Do** keep OSD Dim at #9aa2a8 or lighter for any secondary text on letterbox black.

### Don't:
- **Don't** use amber for decoration, emphasis or brand flavor. It is reserved for the listed caution and lock roles.
- **Don't** add color, height or opacity transitions, fades or easing. The only animation is the stepped REC blink and the loading spinner.
- **Don't** use shadows, rounded corners or boxed borders on cards. Brackets and hairlines carry the structure.
- **Don't** use the zebra stripe for anything other than out of stock.
- **Don't** show resting brackets on nav or channel items. Only cards bracket at rest.
- **Don't** set OSD readouts below 11px.
- **Don't** use the base Lens Blue as text on black. Use Lens Blue Ink.
