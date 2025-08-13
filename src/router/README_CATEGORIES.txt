Измени маршрут категорий на новый компонент:
- Открой src/router/index.ts
- Найди строку с route name: 'categories'
- Замени component на: () => import('@/pages/catalog/CategoriesManagerPage.vue')
