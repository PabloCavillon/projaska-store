---
version: 1
slug: "src-app-store"
primary_target: "src/app/(store)"
related_targets: []
---

# Storefront (src/app/(store))

Scope: the whole storefront: home (front section plus catalog), product, kit, cart, checkout, login/register, orders. Admin is out of scope. Visitor mode: Persuade on the home front section, Operate everywhere else (browse, cart, checkout). Code-led (no image generation).

Audience: installers and end customers in Argentina, about half and half. Action: add to cart from the first viewport. Proof: real kits with their components, real stock counts, ARS prices, and in-house advice and installation (contact via WhatsApp; the number is pending from the user, so the link renders only when `NEXT_PUBLIC_WHATSAPP` is set).

Unresolved: the WhatsApp number, and real product photography quality (the build must work with any uploaded photo or none).

## Direction contract

THESIS: The store seen through a camera viewfinder. Focus brackets frame what you pick, and the readouts live in the corners. It refuses the category default of a soft hero, icon category tiles and shadowed cards.

OWN-WORLD: Letterbox black #0A0A0A ground, HUD gray #22272B surfaces, OSD white ink, muted #8A9298. Caution amber #FFB000 is used only for the zoom bar, low stock and active brackets. Logo blue #1479BC is the primary action. A 45° zebra stripe is the only texture and marks out of stock. Display and readout type is Share Tech Mono (segmented OSD); body text is Geist. Corner brackets replace boxes and focus rings, and closed bracket pairs mark selected or in-cart items.

STORY: The visitor understands that Projaska sells complete setups and also advises and installs, believes it because the stock and components are shown as data, and adds a kit to the cart.

FIRST VIEWPORT: Full-bleed frame inside the safe-area corner brackets. Top left: the REC readout and a short headline. Right: the featured kit framed by focus brackets. Corners: model, price and stock readouts. Bottom right: "Agregar al carrito". Bottom center: the W–T zoom bar.

FORM: Viewfinder bracket HUD (dealt challenger, competitive verdict), chosen over my list where Ficha técnica was #3 and the assigned card. seed:ff0bc3db9865a3cf. Signature: the zoom bar maps depth (W = catalog, T = product detail), and the channel counter (CH 01/07) tracks the category as you scroll. Motion: bracket snap plus single-frame cuts, no fades.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
