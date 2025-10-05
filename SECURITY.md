# Безопасность Telegram Mini App

## 🔐 Валидация данных авторизации

Приложение использует официальный метод валидации данных Telegram согласно [документации Telegram](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).

### Процесс валидации

1. **Создание секретного ключа**
   ```typescript
   secret_key = HMAC_SHA256(<bot_token>, "WebAppData")
   ```

2. **Построение data-check-string**
   - Все поля из `initData` (кроме `hash`) сортируются по алфавиту
   - Формируются пары `key=<value>`
   - Объединяются через символ новой строки `\n`
   
   Пример:
   ```
   auth_date=1234567890
   query_id=AAHdF6IQAAAAAN0XohDhrOrc
   user={"id":123456789,"first_name":"John"}
   ```

3. **Вычисление хеша**
   ```typescript
   computed_hash = HMAC_SHA256(data_check_string, secret_key)
   ```

4. **Сравнение хешей**
   - Используется `crypto.timingSafeEqual()` для защиты от timing attacks
   - Если хеши не совпадают - данные подделаны

5. **Проверка времени**
   - `auth_date` не должна быть старше 24 часов
   - `auth_date` не должна быть в будущем

### Реализация

#### Серверная валидация

Файл: [`server/services/telegramValidation.ts`](server/services/telegramValidation.ts)

```typescript
export const validateTelegramInitData = (
  initData: string,
  botToken: string,
  options?: TelegramValidationOptions,
): TelegramValidationResult => {
  // 1. Парсинг initData
  const payload = parseInitData(initData)
  
  // 2. Проверка наличия hash и auth_date
  const hash = payload.hash
  const authDate = Number.parseInt(payload.auth_date, 10)
  
  // 3. Проверка времени
  const ageSeconds = Math.floor(Date.now() / 1000) - authDate
  if (ageSeconds > maxAgeSeconds) {
    throw new TelegramAuthVerificationError("Telegram auth data is expired.")
  }
  
  // 4. Создание секретного ключа
  const secretKey = createSecretKey(botToken)
  
  // 5. Построение data-check-string
  const dataCheckString = buildDataCheckString(payload)
  
  // 6. Вычисление хеша
  const computedHash = computeVerificationHash(dataCheckString, secretKey)
  
  // 7. Сравнение хешей (защита от timing attacks)
  const providedHashBuffer = Buffer.from(hash, "hex")
  const computedHashBuffer = Buffer.from(computedHash, "hex")
  const buffersEqual = providedHashBuffer.length === computedHashBuffer.length &&
                      crypto.timingSafeEqual(providedHashBuffer, computedHashBuffer)
  
  if (!buffersEqual) {
    throw new TelegramAuthVerificationError("Telegram auth signature is invalid.")
  }
  
  return { authDate, hash, payload, user }
}
```

#### Клиентская валидация

Файл: [`src/utils/telegramAuth.ts`](src/utils/telegramAuth.ts)

Клиент выполняет базовую валидацию:
- Проверка наличия `initData`
- Проверка структуры данных
- Проверка возраста данных (не старше 24 часов)

**Важно:** Криптографическая валидация подписи выполняется только на сервере, так как `BOT_TOKEN` не должен быть доступен клиенту.

## 🔑 Переменные окружения

### Обязательные переменные

```env
# Токен бота от @BotFather
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# Секретный ключ для JWT токенов
JWT_SECRET=your-super-secret-jwt-key-here
```

### Опциональные переменные

```env
# Максимальный возраст данных авторизации (по умолчанию 86400 = 24 часа)
TELEGRAM_AUTH_MAX_AGE_SECONDS=86400
```

## 🛡️ Меры безопасности

### 1. Защита BOT_TOKEN

- ❌ **Никогда** не коммитьте `.env` или `.env.local` в репозиторий
- ✅ Используйте `.env.example` для документирования переменных
- ✅ Добавьте `.env*` в `.gitignore`
- ✅ На Vercel настройте переменные окружения в настройках проекта

### 2. Защита от Timing Attacks

Используется `crypto.timingSafeEqual()` для сравнения хешей:

```typescript
const buffersEqual = providedHashBuffer.length === computedHashBuffer.length &&
                    crypto.timingSafeEqual(providedHashBuffer, computedHashBuffer)
```

Это предотвращает атаки, основанные на измерении времени выполнения операции сравнения.

### 3. Защита от Replay Attacks

Проверка `auth_date` предотвращает повторное использование старых данных авторизации:

```typescript
const ageSeconds = Math.floor(Date.now() / 1000) - authDate
if (ageSeconds > maxAgeSeconds) {
  throw new TelegramAuthVerificationError("Telegram auth data is expired.")
}
```

### 4. Защита от подделки данных

HMAC-SHA-256 подпись гарантирует, что данные не были изменены после создания Telegram:

```typescript
if (!buffersEqual) {
  throw new TelegramAuthVerificationError("Telegram auth signature is invalid.")
}
```

## 🧪 Тестирование безопасности

### Тесты валидации

Файл: [`server/__tests__/telegramValidation.test.ts`](server/__tests__/telegramValidation.test.ts)

```typescript
// Тест 1: Валидные данные проходят проверку
it("validates init data and returns user payload", () => {
  const initData = signInitData({ /* valid data */ })
  const result = validateTelegramInitData(initData, BOT_TOKEN)
  expect(result.user).toEqual({ id: 42, first_name: "Alex" })
})

// Тест 2: Подделанные данные отклоняются
it("rejects payload when hash does not match", () => {
  const initData = signInitData({ /* valid data */ })
  const tampered = initData.replace("Alex", "Eve")
  expect(() => validateTelegramInitData(tampered, BOT_TOKEN)).toThrow()
})

// Тест 3: Устаревшие данные отклоняются
it("rejects payload when auth_date is expired", () => {
  const past = now - (MAX_AGE_SECONDS + 60)
  const initData = signInitData({ auth_date: String(past) })
  expect(() => validateTelegramInitData(initData, BOT_TOKEN)).toThrow()
})
```

### Хелпер для тестов

Файл: [`server/__tests__/helpers.ts`](server/__tests__/helpers.ts)

Функция `buildSignedInitData` создает корректно подписанные данные для тестирования:

```typescript
export const buildSignedInitData = (botToken: string, payload: Record<string, string>) => {
  // 1. Построение data-check-string
  const dataCheckString = Object.keys(payload)
    .filter(key => key !== 'hash')
    .sort()
    .map(key => `${key}=${payload[key]}`)
    .join("\n")
  
  // 2. Создание секретного ключа
  const secretKey = crypto.createHmac("sha256", botToken).update("WebAppData").digest()
  
  // 3. Вычисление хеша
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")
  
  return new URLSearchParams({ ...payload, hash }).toString()
}
```

## 📋 Чеклист безопасности

- [x] HMAC-SHA-256 валидация включена
- [x] Используется `crypto.timingSafeEqual()` для сравнения хешей
- [x] Проверка `auth_date` на устаревание
- [x] Проверка `auth_date` на будущее время
- [x] `BOT_TOKEN` хранится только на сервере
- [x] Переменные окружения документированы в `.env.example`
- [x] Тесты покрывают все сценарии валидации
- [x] Отладочные логи удалены из production кода

## 🚨 Что делать при компрометации

Если `BOT_TOKEN` или `JWT_SECRET` были скомпрометированы:

1. **Немедленно** сгенерируйте новый токен через @BotFather
2. Обновите `BOT_TOKEN` в переменных окружения
3. Сгенерируйте новый `JWT_SECRET`
4. Все активные сессии пользователей станут недействительными
5. Пользователям потребуется повторная авторизация

## 📚 Дополнительные ресурсы

- [Telegram Bot API - Validating data received via the Mini App](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
- [HMAC-SHA-256 на Wikipedia](https://en.wikipedia.org/wiki/HMAC)
- [Timing Attack на Wikipedia](https://en.wikipedia.org/wiki/Timing_attack)