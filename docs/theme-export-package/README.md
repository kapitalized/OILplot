# Oilplot Theme Export Package

This folder is a portable package of the app's visual theme for reuse in another Next.js app.

## Included files

1. `globals.css` - CSS variables, base styles, and `oilplot-theme` heading behavior.
2. `tailwind.config.ts` - theme tokens (`oilplot.*`, semantic colors, fonts, shadows).
3. `root-layout-snippet.tsx` - font setup and `<body>` class setup.
4. `brand.ts` - reusable brand constants (colors, slogan, tagline).
5. `OilplotBrandMark.tsx` - logo mark component.
6. `RetroCtaButton.tsx` - retro CTA button component.
7. `CURSOR_IMPORT_INSTRUCTIONS.md` - exact instructions/prompt for using Cursor in target app.

## Quick use

1. Copy this entire folder into your target project (or keep it open side-by-side).
2. Follow `CURSOR_IMPORT_INSTRUCTIONS.md` in the target project.
3. Start by importing `globals.css`, `tailwind.config.ts`, then `root-layout-snippet.tsx`.

## Notes

1. `RetroCtaButton.tsx` uses `lucide-react` (`Zap` icon).
2. If your target app already has a theme, merge tokens carefully instead of replacing.
3. If your target app does not use `@/*` path alias, convert imports to relative paths.
