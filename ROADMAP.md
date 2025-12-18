# Strata Editor Roadmap

## Known Limitations

### Font Size Scaling
Widget `estimatedHeight` values are calibrated for the default typography:
- **Font size**: `16px` (`--editor-font-size`)
- **Line height**: `1.6` (`--editor-line-height`)

Extreme deviations (e.g., 24px+ font) may cause minor scroll smoothness issues.

### Line Wrapping
Lines that wrap to multiple visual lines may cause minor scroll shifts when scrolling to the document top. This is a CM6 virtual rendering characteristic.

---

## Future Enhancements

### Performance
- [ ] Dynamic `estimatedHeight` scaling based on CSS font-size
- [ ] CSS variable `--image-canvas-height` for customizable image canvas size

### Layered Blocks Pattern
- [ ] Apply fixed-height canvas to math blocks (optional, low priority)
- [ ] User-configurable height via alt text: `![[photo.png|h:400]]`

---

## Completed (v2.2.0) - Fixed-Height Canvas

### The "Layered Blocks" Pattern
Introduced **fixed-height canvas containers** for images, guaranteeing 100% accurate height estimation. This eliminates all scroll jumping for image embeds.

**Key insight**: By enforcing a fixed container height, `estimatedHeight` always returns the exact rendered height. No caching or measurement needed!

```
┌─────────────────────────────────────┐
│  Fixed-height canvas (200px)        │
│  ┌─────────────────────────────┐    │
│  │     Image scales to fit     │    │
│  │     (object-fit: contain)   │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### Changes
- [x] `ImageEmbedWidget` now uses 200px fixed-height canvas
- [x] Removed height caching for images (no longer needed)
- [x] Images scale with `object-fit: contain` within canvas
- [x] Canvas has subtle background for visual framing

---


## Completed (v2.1.0) - Scroll Stability Overhaul

### Height Cache Infrastructure
- [x] Created `heightCache.ts` StateField for widget height caching
- [x] Widgets measure actual height after render and cache it
- [x] Added `view.requestMeasure()` to sync CM6's internal height map
- [x] Added `heightCache` to decorations.compute() dependencies

### Key Fixes for Scroll Jumping
- [x] **External margins → internal padding**: Block widgets with CSS margins confuse CM6's height map. Changed to padding:
  - Table: `margin: 4px 0` → `padding: 4px 0`
  - Math block: `margin: 8px 0` → merged into `padding: 16px 0`
- [x] **Removed inline vertical padding**: Inline elements with vertical padding change line height:
  - Highlight: `padding: 1px 2px` → `padding: 0 2px`
  - Inline code: `padding: 2px 4px` → `padding: 0 4px`
- [x] **Removed negative margins**: `marginTop: -2px` on callout header widget
- [x] **Calibrated estimates**: Table 40px/row, Math 80+20px (from measurements)

### Extension Migrations
- [x] `math.ts`: ViewPlugin → StateField + `EditorView.decorations.compute()`
- [x] `imageEmbed.ts`: ViewPlugin → StateField + `EditorView.decorations.compute()`
- [x] All block widgets now implement `coordsAt()`

### User Extension API
- [x] `cacheKey` option for automatic height caching
- [x] `coordsAt` option for scroll coordinate mapping
- [x] Height cache integration in `createExtension()`

---

## Completed (v2.0.3)
- [x] Initial `estimatedHeight` improvements
- [x] User extension API enhancements
