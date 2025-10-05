# Telegram Mini App - Tap to Dance

Telegram Mini App с авторизацией через Telegram WebApp API и Express backend.

## 🔐 Безопасность и Авторизация

Приложение использует официальный метод валидации данных Telegram согласно [документации](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app):

1. **HMAC-SHA-256 подпись** - все данные от клиента проверяются криптографической подписью
2. **Проверка времени** - данные авторизации действительны только 24 часа
3. **Защита от подделки** - невозможно подделать данные без знания BOT_TOKEN

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните необходимые переменные:

```env
# Получите токен от @BotFather в Telegram
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Сгенерируйте случайную строку для JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Опционально: настройте максимальный возраст данных авторизации
TELEGRAM_AUTH_MAX_AGE_SECONDS=86400
```

**Важно:** Никогда не коммитьте `.env.local` в репозиторий!

### 3. Запуск в режиме разработки

```bash
# Запустить клиент (Vite dev server)
npm run dev

# В другом терминале запустить API сервер
npm run server:dev
```

Клиент будет доступен на `http://localhost:5173`
API сервер на `http://localhost:3000`

### 4. Тестирование

```bash
# Запустить все тесты
npm run test

# Запустить тесты в watch режиме
npm run test:watch
```

## 📦 Деплой на Vercel

**Полная инструкция:** См. [`DEPLOYMENT.md`](DEPLOYMENT.md) для подробного руководства по деплою через Git

### Быстрый старт:

```bash
# 1. Создайте репозиторий на GitHub и подключите его
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 2. Перейдите на vercel.com и импортируйте проект
# 3. Добавьте переменные окружения:
#    - BOT_TOKEN (от @BotFather)
#    - JWT_SECRET (случайная строка)
# 4. Нажмите Deploy

# Готово! Каждый push в main автоматически деплоится
```

Подробнее см. [`DEPLOYMENT.md`](DEPLOYMENT.md)

## 🏗️ Структура проекта

```
├── src/                    # Клиентский код (React + TypeScript)
│   ├── components/         # React компоненты
│   ├── pages/             # Страницы приложения
│   ├── utils/             # Утилиты, включая telegramAuth.ts
│   └── assets/            # Статические ресурсы
├── server/                # Backend код (Express + TypeScript)
│   ├── controllers/       # Контроллеры (authController.ts)
│   ├── services/          # Бизнес-логика (telegramValidation.ts)
│   ├── routes/            # API маршруты
│   └── __tests__/         # Тесты для backend
├── api/                   # Vercel serverless functions
│   └── auth/
│       └── telegram.ts    # Endpoint авторизации
└── public/                # Статические файлы
```

## 🔧 Доступные команды

- `npm run dev` - запустить Vite dev server
- `npm run server:dev` - запустить Express API с hot reload
- `npm run build` - собрать production build
- `npm run preview` - предпросмотр production build
- `npm run test` - запустить тесты
- `npm run test:watch` - запустить тесты в watch режиме

## 📚 Технологии

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Express, Node.js, TypeScript
- **Авторизация:** Telegram WebApp API, JWT
- **Тестирование:** Vitest
- **Деплой:** Vercel

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
