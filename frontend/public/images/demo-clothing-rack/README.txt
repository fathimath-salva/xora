DEMO RACK GARMENT IMAGE PLACEHOLDERS

These individually named transparent SVGs are simplified garment illustrations for the
twelve demo products. They are intentionally placeholders, not real product photography.

Each product has three distinct view files:
  <product-id>-side.svg
  <product-id>-front.svg
  <product-id>-back.svg

Replace a placeholder with an actual transparent PNG, WebP, or SVG and update the
matching path in src/data/demoRackProducts.js. Side, front, and back images should be
separately photographed views on the same transparent canvas; do not copy the front
view into the other view slots.

Real products can be supplied by the existing product API with:
  rackImages: { side: string, front: string, back: string }

Optional per-colour photography can be supplied with:
  colourImages: { [colourName]: { front?: string, back?: string, side?: string } }

Transparent views should use a consistent aspect ratio and leave a little room around
the garment. The rack's dye reveal uses the front image alpha as its mask, so transparent
backgrounds are required for accurate recolouring.
