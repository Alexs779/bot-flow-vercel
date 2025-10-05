# 🚀 Быстрый деплой на Vercel через Git

## Подготовка проекта

### 1. Инициализация Git репозитория (если еще не сделано)

```bash
# Инициализировать Git
git init

# Добавить все файлы
git add .

# Создать первый коммит
git commit -m "Initial commit: Telegram Mini App with auth"
```

### 2. Создание репозитория на GitHub

1. Перейдите на [github.com](https://github.com)
2. Нажмите "New repository"
3. Введите название (например, `tap-to-dance`)
4. **НЕ** добавляйте README, .gitignore или лицензию (они уже есть)
5. Нажмите "Create repository"

### 3. Подключение к GitHub

```bash
# Добавить remote репозиторий (замените YOUR_USERNAME и YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Отправить код на GitHub
git branch -M main
git push -u origin main
```

## Деплой на Vercel

### Вариант 1: Через веб-интерфейс (Рекомендуется)

1. **Перейдите на [vercel.com](https://vercel.com)**

2. **Войдите через GitHub**
   - Нажмите "Sign Up" или "Log In"
   - Выберите "Continue with GitHub"

3. **Импортируйте проект**
   - Нажмите "Add New..." → "Project"
   - Выберите ваш репозиторий из списка
   - Нажмите "Import"

4. **Настройте проект**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **Добавьте переменные окружения**
   
   В разделе "Environment Variables" добавьте:
   
   ```
   BOT_TOKEN = ваш_токен_от_BotFather
   JWT_SECRET = ваш_секретный_ключ_для_jwt
   TELEGRAM_AUTH_MAX_AGE_SECONDS = 86400
   ```
   
   **Важно:** Выберите "Production, Preview, and Development" для всех переменных

6. **Деплой**
   - Нажмите "Deploy"
   - Дождитесь завершения (обычно 1-2 минуты)
   - Получите URL вашего приложения

### Вариант 2: Через Vercel CLI

```bash
# Установить Vercel CLI глобально
npm install -g vercel

# Войти в аккаунт
vercel login

# Деплой проекта
vercel

# Следуйте инструкциям:
# - Set up and deploy? Yes
# - Which scope? Выберите ваш аккаунт
# - Link to existing project? No
# - What's your project's name? tap-to-dance
# - In which directory is your code located? ./
# - Want to override the settings? No

# Добавить переменные окружения
vercel env add BOT_TOKEN
# Введите значение токена

vercel env add JWT_SECRET
# Введите значение секрета

# Деплой в production
vercel --prod
```

## Автоматический деплой при каждом push

После первого деплоя Vercel автоматически настроит:

✅ **Автодеплой при push в main** - каждый коммит в main ветку автоматически деплоится в production

✅ **Preview деплой для PR** - каждый Pull Request получает свой preview URL

### Как это работает:

```bash
# 1. Внесите изменения в код
# 2. Закоммитьте изменения
git add .
git commit -m "feat: добавил новую функцию"

# 3. Отправьте на GitHub
git push origin main

# 4. Vercel автоматически задеплоит изменения!
# Вы получите уведомление в GitHub и на email
```

## Проверка деплоя

### 1. Проверьте статус деплоя

- Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
- Найдите ваш проект
- Проверьте статус последнего деплоя

### 2. Проверьте логи

Если что-то пошло не так:

```bash
# Через CLI
vercel logs

# Или в веб-интерфейсе:
# Dashboard → Ваш проект → Deployments → Выберите деплой → View Function Logs
```

### 3. Проверьте переменные окружения

```bash
# Через CLI
vercel env ls

# Или в веб-интерфейсе:
# Dashboard → Ваш проект → Settings → Environment Variables
```

## Быстрые команды для ежедневной работы

```bash
# Проверить статус Git
git status

# Добавить все изменения
git add .

# Создать коммит
git commit -m "описание изменений"

# Отправить на GitHub (автоматический деплой)
git push

# Посмотреть логи последнего деплоя
vercel logs --follow
```

## Работа с ветками

### Создание feature ветки

```bash
# Создать новую ветку
git checkout -b feature/new-feature

# Внести изменения и закоммитить
git add .
git commit -m "feat: новая фича"

# Отправить ветку на GitHub
git push origin feature/new-feature

# Vercel автоматически создаст preview деплой!
```

### Создание Pull Request

1. Перейдите на GitHub
2. Нажмите "Compare & pull request"
3. Опишите изменения
4. Нажмите "Create pull request"
5. Vercel добавит комментарий с preview URL
6. После проверки нажмите "Merge pull request"
7. Изменения автоматически задеплоятся в production

## Откат к предыдущей версии

### Через веб-интерфейс

1. Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
2. Выберите проект
3. Перейдите в "Deployments"
4. Найдите рабочую версию
5. Нажмите "..." → "Promote to Production"

### Через Git

```bash
# Посмотреть историю коммитов
git log --oneline

# Откатиться к конкретному коммиту
git revert <commit-hash>

# Отправить на GitHub
git push

# Vercel автоматически задеплоит откат
```

## Настройка домена

### Добавление custom домена

1. Откройте проект в Vercel Dashboard
2. Перейдите в Settings → Domains
3. Добавьте ваш домен
4. Следуйте инструкциям по настройке DNS

```
Vercel предоставляет бесплатный SSL сертификат для всех доменов!
```

## Мониторинг и аналитика

### Vercel Analytics (бесплатно)

1. Откройте проект в Dashboard
2. Перейдите в Analytics
3. Включите Web Analytics

### Логирование ошибок

Все ошибки автоматически логируются в:
- Dashboard → Ваш проект → Deployments → Function Logs

## Troubleshooting

### Проблема: Деплой падает с ошибкой

```bash
# 1. Проверьте логи
vercel logs

# 2. Проверьте переменные окружения
vercel env ls

# 3. Попробуйте локальный билд
npm run build

# 4. Если локально работает, проверьте настройки проекта в Vercel
```

### Проблема: Переменные окружения не работают

1. Убедитесь, что переменные добавлены для всех окружений (Production, Preview, Development)
2. После добавления переменных сделайте redeploy:
   ```bash
   vercel --prod
   ```

### Проблема: API не работает

1. Проверьте, что файлы в папке `api/` имеют правильную структуру
2. Проверьте логи функций в Dashboard
3. Убедитесь, что `vercel.json` настроен правильно

## Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [GitHub Actions для Vercel](https://vercel.com/docs/deployments/git/vercel-for-github)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

## Чеклист перед деплоем

- [ ] Все изменения закоммичены
- [ ] Код протестирован локально
- [ ] Переменные окружения настроены в Vercel
- [ ] `.env.local` НЕ закоммичен (проверьте `.gitignore`)
- [ ] `BOT_TOKEN` и `JWT_SECRET` добавлены в Vercel
- [ ] Build проходит успешно локально (`npm run build`)
- [ ] Тесты проходят (`npm run test`)

## Быстрый старт (TL;DR)

```bash
# 1. Инициализация
git init
git add .
git commit -m "Initial commit"

# 2. Создайте репозиторий на GitHub

# 3. Подключение к GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 4. Деплой на Vercel
vercel login
vercel
# Добавьте переменные окружения в веб-интерфейсе
vercel --prod

# 5. Готово! Каждый push теперь автоматически деплоится