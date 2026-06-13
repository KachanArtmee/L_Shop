# Проверка выполнения ЛР14 и ЛР15-16

## ЛР14 Docs

- Все API-точки визуально задокументированы: `server/src/docs/openapi.ts`, `/api-docs`.
- Backend utility-функции описаны JSDoc: `server/src/utils/file-db.ts`, `server/src/utils/recommendations.ts`.
- Типизация backend расширена: `server/src/models/product.model.ts`, `server/src/models/user.model.ts`.
- Frontend компоненты стандартизированы через `client/src/components/AppButton.tsx`.
- Frontend utility-функции описаны JSDoc: `client/src/utils/product.ts`.
- Приходящие API-данные типизированы: `client/src/types.ts`, `client/src/api.ts`.

## ЛР15-16 Финал Шопа

- Локализация на 2 языка сделана: `client/src/i18n.ts`.
- Сессионная плашка выбора страны/языка сделана: `client/src/components/LocaleBanner.tsx`.
- Выбор языка хранится в session cookie: `server/src/controllers/locale.controller.ts`.
- Рекомендации по скрытым тегам сделаны: `server/src/utils/recommendations.ts`.
- Лайк товара обновляет профиль рекомендаций: `POST /product/:productId/like`.
- Рекомендации встраиваются в каталог, а не полностью сортируют его.
- Роль администратора добавлена: `UserRole`, `requireRole`.
- Страница создания/редактирования товаров сделана: `client/src/pages/AdminProducts.tsx`.
- Создание и редактирование товаров работает через API: `POST /product`, `PUT /product/:productId`.
- Отзывы и оценки сделаны: `POST /product/:productId/reviews`.
- Средняя оценка и комментарии выводятся в карточке товара.
- Комментарии доступны только зарегистрированным пользователям.
- Дата комментария сохраняется и отображается.
- API покрыто Supertest: `server/tests/api.test.ts`.
- Независимые функции покрыты Jest: `server/src/utils/recommendations.test.ts`, `client/src/utils/product.test.ts`.

## Дополнительные пункты

- Третий язык не добавлялся, это было звездочное задание.
- Менеджер как роль поддержан в middleware и доступе к admin API, но отдельная страница назначения менеджеров владельцем не добавлялась, это было звездочное задание.
- E2E на Cypress/Playwright не добавлялись, это было звездочное задание.
