// src/acl/README.txt
ACL включён:
- Сайдбар скрывает пункты без права чтения (см. layouts/AdminLayout.vue, метод can()).
- Роут-гарды в src/router/index.ts проверяют `to.meta.page` и `to.meta.requires` ('read'|'write'), редиректят на Dashboard.
- Текущий пользователь хранится в Pinia store src/stores/auth.ts (мок: выбирается первый пользователь или сохранённый в localStorage).
