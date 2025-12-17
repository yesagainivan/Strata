# Strata Editor Roadmap

## Known Limitations

### Font Size Scaling
Widget `estimatedHeight` values are calibrated for the default typography:
- **Font size**: `16px` (`--editor-font-size`)
- **Line height**: `1.6` (`--editor-line-height`)

Extreme deviations (e.g., 24px+ font) may cause minor scroll smoothness issues.

**Potential fix**: Dynamic height calculation based on computed font size.

---

## Future Enhancements

### Performance
- [ ] Dynamic `estimatedHeight` scaling based on CSS font-size
- [ ] Multi-line block math support (currently single-line only)

### User Extension API
- [ ] `coordsAt` option for custom widgets
- [ ] `cacheKey` option for automatic height caching
- [ ] `Decoration.widget` position options (before/after)
- [ ] State sharing between extensions
- [ ] Toolbar integration hooks

### Accessibility
- [ ] Screen reader announcements for decorations
- [ ] Keyboard navigation for folded callouts

---

## Completed (v2.1.0)

### Height Estimation System Overhaul
- [x] Created `heightCache.ts` StateField infrastructure for widget height caching
- [x] Migrated `math.ts` from ViewPlugin to StateField pattern
- [x] Migrated `imageEmbed.ts` from ViewPlugin to StateField pattern
- [x] Added `coordsAt()` implementation to all block widgets
- [x] Widgets now measure actual height after render and cache it
- [x] Subsequent scrolls use cached heights for accurate scroll calculations
- [x] Added serialization API (`serializeHeightCache`/`restoreHeightCache`) for app persistence

### Math Widget Improvements
- [x] Content-based height estimation (line count + complexity detection)
- [x] Block math with fractions/sums gets additional height estimate

### Image Widget Improvements
- [x] Height cached after image load using `naturalHeight`
- [x] Error states cached at 30px

### Table Widget Improvements
- [x] Height measurement after render
- [x] `coordsAt` for better scroll coordinate mapping

---

## Completed (v2.0.3)

- [x] Improved `estimatedHeight` for math widgets (40px → 100px)
- [x] Improved `estimatedHeight` for image widgets (150px → 300px)
- [x] Removed duplicate `collectCodeRanges` function
- [x] Optimized tree iteration (single pass for code ranges)
- [x] Added `destroyEditor` cleanup helper
- [x] Enhanced user extension API with:
  - `estimatedHeight` option
  - `isBlock` for block decorations
  - `lineClass` for line styling
  - `onMount`/`onDestroy` lifecycle hooks

