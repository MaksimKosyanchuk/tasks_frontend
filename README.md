# Tasks Management Frontend

Frontend частина застосунку для керування задачами.

Застосунок реалізований як **React SPA** з використанням **TypeScript** та взаємодіє з NestJS backend через REST API і Socket.IO.

## Стек

* React
* TypeScript
* Vite
* React Router
* Socket.IO Client
* Docker

---

# Архітектура

Frontend є окремим SPA-клієнтом:

```text
┌──────────────────────┐
│    React Frontend    │
│                      │
│  React Router        │
│  API Client          │
│  Socket.IO Client    │
└──────────┬───────────┘
           │
           │ REST API
           │ WebSocket
           ▼
┌──────────────────────┐
│    NestJS Backend    │
└──────────┬───────────┘
           │
           ▼
      PostgreSQL
```

Frontend відповідає за:

* користувацький інтерфейс;
* навігацію;
* аутентифікацію;
* відображення Workspaces;
* відображення Projects;
* роботу із задачами;
* фільтрацію задач;
* cursor-based pagination;
* real-time оновлення;
* обробку помилок API.

---

# Структура проєкту

```text
frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   └── main.tsx
│
├── public/
│
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# Основний функціонал

Frontend реалізує основні сценарії застосунку:

* реєстрація;
* авторизація;
* робота з Workspace;
* створення та управління Projects;
* управління Project Members;
* створення задач;
* редагування задач;
* видалення задач;
* зміна статусу;
* зміна priority;
* призначення assignee;
* перегляд історії зміни статусів.

---

# Аутентифікація

Frontend використовує JWT access token для авторизованих API-запитів.

Access token передається у заголовку:

```text
Authorization: Bearer <access_token>
```

Refresh token зберігається backend у HTTP-only cookie.

Frontend не має прямого доступу до refresh token через JavaScript.

При необхідності frontend використовує endpoint:

```text
POST /auth/refresh
```

для отримання нового access token.

---

# Tasks

Frontend підтримує:

* створення задач;
* редагування задач;
* видалення задач;
* зміну статусу;
* зміну priority;
* призначення assignee;
* перегляд історії;
* фільтрацію;
* pagination.

## Фільтрація

Фільтри передаються на backend:

```text
status
priority
assignee
```

Фільтрація виконується сервером, а не тільки над уже завантаженою сторінкою.

Це дозволяє коректно працювати з фільтрами разом із cursor pagination.

Наприклад:

```text
GET /workspaces/:workspaceId/projects/:projectId/tasks
    ?status=IN_PROGRESS
    &priority=HIGH
    &assignee=<userId>
```

---

# Pagination

Для завантаження задач використовується cursor-based pagination.

Приклад:

```text
GET /tasks?limit=20
```

Backend повертає cursor для наступної сторінки.

Frontend використовує його для наступного запиту:

```text
GET /tasks?limit=20&cursor=<cursor>
```

Це дозволяє не завантажувати всі задачі одночасно.

---

# Real-time

Для real-time оновлень використовується Socket.IO Client.

Frontend отримує повідомлення від backend при:

* створенні задачі;
* оновленні задачі;
* видаленні задачі;
* створенні запису історії статусу.

Завдяки цьому зміни можуть автоматично відображатися у клієнта без перезавантаження сторінки.

---

# Environment Variables

Для локального запуску необхідно створити `.env` на основі `.env.example`.

```env
VITE_API_URL=http://localhost:3001
```

`VITE_API_URL` визначає адресу NestJS backend.

Файл `.env` не повинен додаватися до Git.

---

# Запуск через Docker

Frontend має власний `docker-compose.yml`.

Він запускає тільки frontend:

```text
Frontend
   │
   │ REST API / WebSocket
   ▼
Backend
```

Backend і PostgreSQL запускаються окремо з backend repository.

Для запуску frontend необхідні:

* Docker;
* Docker Compose.

Node.js локально встановлювати не потрібно.

У директорії frontend виконати:

```bash
docker compose up --build
```

Frontend буде доступний за адресою:

```text
http://localhost:5173
```

Для зупинки:

```bash
docker compose down
```

> Frontend і backend є окремими Git-репозиторіями та мають окремі Docker Compose конфігурації.

---

# Локальний запуск без Docker

Необхідний Node.js.

Встановити залежності:

```bash
npm install
```

Створити `.env`:

```bash
cp .env.example .env
```

Вказати адресу backend:

```env
VITE_API_URL=http://localhost:3001
```

Запустити development server:

```bash
npm run dev
```

Frontend буде доступний за адресою:

```text
http://localhost:5173
```

---

# Production Build

Створити production build:

```bash
npm run build
```

Для локального перегляду production build:

```bash
npm run preview
```

---

# Backend Connection

Для повноцінної роботи застосунку backend має бути запущений окремо.

Наприклад:

```text
Backend:
http://localhost:3001

Frontend:
http://localhost:5173
```

Backend repository містить власний `docker-compose.yml`, який запускає:

```text
NestJS
PostgreSQL
```

Frontend repository містить власний `docker-compose.yml`, який запускає:

```text
React Frontend
```

Таким чином, кожен репозиторій можна запускати та розгортати незалежно.

---

# Обробка помилок

Frontend обробляє основні HTTP помилки API:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

Для авторизованих запитів використовується access token.

У випадку його завершення frontend може виконати refresh token flow та повторити запит.

---

# Що можна покращити

Основна frontend функціональність тестового завдання реалізована.

За наявності додаткового часу можна було б:

* додати більше unit та E2E тестів;
* покращити loading та skeleton states;
* додати error boundaries;
* реалізувати optimistic updates;
* додати debounce для пошуку;
* покращити UX фільтрів та pagination;
* покращити WebSocket reconnect handling;
* додати drag-and-drop для задач;
* винести повторювані UI елементи у reusable components;
* додати більш детальну систему notifications.ff