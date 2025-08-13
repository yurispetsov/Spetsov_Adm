# Shop Admin (MVP)

Админка интернет-магазина на Vue 3 + Vite + TypeScript + Tailwind.
Готовый каркас: авторизация (скелет), роутинг, гварды, список товаров (серверная пагинация),
форма товара (черновик), API-клиент, ESLint, Prettier, Vitest, CI.

## Быстрый старт

```bash
npm i
npm run dev
```

Открыть: http://localhost:5173

### Важные переменные окружения
Создайте `.env` по примеру:
```
VITE_API_URL=http://localhost:5050
VITE_APP_NAME=Shop Admin
```

### Скрипты
- `npm run dev` — локальная разработка
- `npm run build` — сборка
- `npm run preview` — предпросмотр сборки
- `npm run typecheck` — проверка типов (vue-tsc)
- `npm run lint` — ESLint
- `npm run format` — Prettier
- `npm test` — Vitest

### Структура
См. директорию `src/`:
- `router/` — маршруты и guard'ы
- `stores/` — Pinia (auth/ui)
- `shared/api/` — axios-клиент
- `layout/` — AppLayout/Sidebar/Topbar
- `pages/` — auth/login, catalog/products & product form, orders, settings

### Примечания
- Auth реализован как скелет: ожидание эндпоинтов `/auth/login`, `/auth/me`, `/auth/logout`.
- Для списка товаров предполагается `/products` с параметрами `page`, `perPage`, `search`, `sort`.
- Обновите контракты под свой бэкенд в `shared/api/` и `pages/`.
