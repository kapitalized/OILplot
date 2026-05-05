# Cursor Import Instructions (Target Next.js App)

Use these steps in the **target** Next.js project.

## 1) Install required packages

```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
```

## 2) Add/merge Tailwind and PostCSS

1. Copy `tailwind.config.ts` from this package to project root.
2. Ensure PostCSS config contains:

```js
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```

## 3) Add global theme styles

1. Copy `globals.css` to `app/globals.css`.
2. Ensure `app/layout.tsx` imports `./globals.css`.

## 4) Add font + body setup

1. Open `root-layout-snippet.tsx`.
2. Merge its font setup into your `app/layout.tsx`.
3. Ensure body class includes:
   - `spaceGrotesk.variable`
   - `archivoBlack.variable`
   - `font-sans`

## 5) Optional brand constants + components

1. Copy `brand.ts` to `lib/brand.ts`.
2. Copy `OilplotBrandMark.tsx` to `components/branding/OilplotBrandMark.tsx`.
3. Copy `RetroCtaButton.tsx` to `components/marketing/RetroCtaButton.tsx`.

## 6) Use theme classes in pages/layouts

Wrap theme sections with:

```tsx
<div className="oilplot-theme">...</div>
```

Use utility classes such as:

1. `bg-oilplot-pale`
2. `text-oilplot-ink`
3. `bg-oilplot-cream`
4. `shadow-retro` / `shadow-retro-sm`

## 7) Cursor prompt you can paste

```text
Please import the Oilplot theme package into this Next.js app.

Tasks:
1) Merge/replace Tailwind theme using docs/theme-export-package/tailwind.config.ts.
2) Merge app/global styles from docs/theme-export-package/globals.css into app/globals.css.
3) Update app/layout.tsx using docs/theme-export-package/root-layout-snippet.tsx:
   - Add Space_Grotesk as --font-sans
   - Add Archivo_Black as --font-display
   - Ensure body has "<font vars> font-sans"
4) Add optional brand files:
   - lib/brand.ts
   - components/branding/OilplotBrandMark.tsx
   - components/marketing/RetroCtaButton.tsx
5) Install missing deps (lucide-react, tailwind/postcss/autoprefixer if absent).
6) Keep existing app behavior unchanged; only theme integration changes.
7) Run lint and report any issues.
```
