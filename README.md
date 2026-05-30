# 🌐 LIFE WEB

Личный командный центр — веб-интерфейс к данным твоего Telegram-бота.
iOS 18 Glass дизайн, 4 вкладки: Сегодня / Здоровье / Проекты / Дневник.

Дизайн и архитектура зафиксированы в Obsidian:
`PROJECTS/LIFE_WEB/00-Архитектура.md` и `01-Дизайн-система.md`.

---

## 🚀 Быстрый запуск (с моковыми данными, без БД)

Приложение работает сразу — данные берутся из `src/data/mock.ts`.

```bash
npm install
npm run dev
```

Открой http://localhost:3000

Тема переключается **автоматически** по системной (светлая днём / тёмная ночью).
Чтобы проверить тёмную — переключи тему ОС или DevTools → Rendering → Emulate prefers-color-scheme: dark.

---

## 🗄️ Подключение настоящей БД (Postgres)

Когда захочешь живые данные вместо моковых:

### 1. Подними Postgres
На сервере (89.126.221.198) или локально:

```bash
# Docker — самый простой путь
docker run --name life-db -e POSTGRES_USER=life \
  -e POSTGRES_PASSWORD=ВЫБЕРИ_ПАРОЛЬ -e POSTGRES_DB=life \
  -p 5432:5432 -d postgres:16
```

### 2. Настрой .env
```bash
cp .env.example .env
# впиши свой DATABASE_URL
```

### 3. Создай таблицы и наполни
```bash
npm run db:push     # создаёт таблицы из schema.prisma
npm run db:seed     # наполняет тестовыми данными
```

### 4. Переключи страницы с моков на БД
Сейчас страницы импортируют из `@/data/mock`. Чтобы перейти на БД:
- создай `src/lib/queries.ts` с функциями через `prisma` (клиент уже готов в `src/lib/prisma.ts`)
- замени импорты в `src/app/*/page.tsx`
- сделай страницы серверными компонентами (убери `"use client"` там где нет интерактива, вынеси интерактив в отдельные клиентские компоненты)

Структура БД полностью готова в `prisma/schema.prisma` — 12 таблиц с префиксом `lf_`.

---

## 📂 Структура

```
src/
  app/
    layout.tsx        — root layout, фон, контейнер
    globals.css       — дизайн-система (токены тем, стекло, анимации)
    page.tsx          — вкладка «Сегодня» (план дня, задачи, проекты)
    health/page.tsx   — вкладка «Здоровье» (графики)
    projects/page.tsx — вкладка «Проекты» (цели, дедлайны)
    diary/page.tsx    — вкладка «Дневник» (лента)
  components/
    Background.tsx    — blur-пятна фона
    TabBar.tsx        — навигация между вкладками
    ui.tsx            — Greeting, GlassCard, PageTitle
  lib/
    prisma.ts         — Prisma клиент
    ui.ts             — иконки и цвета категорий
  data/
    mock.ts           — моковые данные (заменить на БД)
prisma/
  schema.prisma       — схема БД (12 таблиц)
  seed.mjs            — наполнение тестовыми данными
```

---

## 📱 PWA

`public/manifest.json` готов. Добавь иконки `icon-192.png` и `icon-512.png` в `public/`,
и приложение можно будет установить на телефон как нативное.

---

## ⏭️ Что дальше (из плана в Obsidian)

1. ✅ Скелет Next.js + дизайн + 4 вкладки (этот код)
2. ⬜ Подключить Postgres, заменить моки на queries
3. ⬜ NextAuth (один юзер)
4. ⬜ Перевести бота на запись в БД + regenerate_md
5. ⬜ Backfill исторических .md → Postgres
6. ⬜ Чат с Claude по данным
7. ⬜ Деплой: Docker + Nginx + Cloudflare на diary.dukonos.com
