# PaletteProof

**In-browser WCAG contrast & palette checker.** Pick foreground and background colors, see live contrast ratios and AA/AAA pass/fail for normal text, large text, and UI components.

**Live:** https://shaikbasha1437.github.io/paletteproof/

## Privacy

All math runs **only in your browser**. Colors never leave this tab — no uploads, no accounts, no analytics.

## Features

- Color pickers + hex inputs (kept in sync)
- Live contrast ratio with WCAG 2.x relative luminance (sRGB linearization)
- Pass/fail badges for:
  - WCAG AA normal text (≥ 4.5:1)
  - WCAG AA large text (≥ 3:1)
  - WCAG AAA normal text (≥ 7:1)
  - WCAG AAA large text (≥ 4.5:1)
  - UI / non-text contrast (≥ 3:1)
- Swap colors
- Live preview (heading, body, sample UI)
- Quick presets (including black on white = 21:1)
- Works offline after first visit (PWA)

## How to use

1. Open the live page (or open `index.html` locally).
2. Choose foreground and background with the pickers or type hex values.
3. Read the ratio and badges; tweak until you hit the level you need.
4. Use **Swap** or a preset to try common pairs quickly.

## License

MIT
