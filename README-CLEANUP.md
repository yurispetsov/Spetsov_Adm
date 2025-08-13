
# Catalog Cleanup Kit

This kit helps you make the Catalog section fully empty and find duplicate pages/routes.

## What's included
- Multiple **stub pages** (empty `<div></div>`) placed at common paths:
  - `src/pages/catalog/CatalogPage.vue`
  - `src/pages/catalog/CategoriesPage.vue`
  - `src/pages/catalog/index.vue`
  - `src/pages/CatalogPage.vue`
  - `src/pages/CategoriesPage.vue`
- A PowerShell helper `scripts/find-catalog-entries.ps1` that searches:
  - routes that point to catalog pages
  - any page files matching *Catalog* or *Categories*

## How to use
1) Unzip into your project root (C:\site).
2) Restart Vite (`npm run dev`).
3) Open the **Catalog** route in the app — it should be completely empty.

> If it is not empty: your router likely references a different file. Run the helper script below.

## Find router references & duplicates (PowerShell)
Open PowerShell in the project root and run:
```powershell
.\scripts\find-catalog-entries.ps1
```

This will print:
- matches in `src/router` that reference `catalog` route/component
- a list of all page files whose names include `Catalog` or `Categories`

Then:
- Edit `src/router/index.ts` (or your router file) and ensure the `catalog` route points to **one** of the stub pages above, e.g.:
```ts
{ path: '/catalog', component: () => import('@/pages/catalog/CategoriesPage.vue') }
```
- Delete or rename any unused duplicate pages.
