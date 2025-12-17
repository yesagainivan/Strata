# Strata Editor Roadmap

## Known Limitations

### Font Size Scaling
Widget `estimatedHeight` values are calibrated for the default typography:
- **Font size**: `16px` (`--editor-font-size`)
- **Line height**: `1.6` (`--editor-line-height`)

Extreme deviations (e.g., 24px+ font) may cause minor scroll smoothness issues.

### Image Loading
Images from external URLs reload when scrolling in/out of view. This is due to CM6's virtual rendering which destroys/recreates DOM elements. The browser's HTTP cache mitigates this, but a brief flicker may occur.

### Line Wrapping
Lines that wrap to multiple visual lines may cause minor scroll shifts when scrolling to the document top. This is a CM6 virtual rendering characteristic.

---

## Future Enhancements

### Performance
- [ ] Image caching to prevent reload flicker
- [ ] Dynamic `estimatedHeight` scaling based on CSS font-size

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
