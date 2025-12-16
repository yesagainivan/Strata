# Strata Editor Roadmap

## Known Limitations

### Font Size Scaling
Widget `estimatedHeight` values are calibrated for default font sizes (~16px). Extreme font size changes via theming may affect scroll smoothness.

**Potential fix**: Dynamic height calculation based on computed font size.

---

## Future Enhancements

### Performance
- [ ] Dynamic `estimatedHeight` scaling based on CSS font-size
- [ ] Height caching for widgets after first render
- [ ] Multi-line block math support (currently single-line only)

### User Extension API
- [ ] `Decoration.widget` position options (before/after)
- [ ] State sharing between extensions
- [ ] Toolbar integration hooks

### Accessibility
- [ ] Screen reader announcements for decorations
- [ ] Keyboard navigation for folded callouts

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
