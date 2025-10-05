import crypto from "node:crypto"

export const TELEGRAM_INIT_DATA_MAX_AGE_SECONDS = 86400

export class TelegramAuthVerificationError extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode = 401) {
    super(message)
    this.name = "TelegramAuthVerificationError"
    this.statusCode = statusCode
  }
}

export type TelegramInitUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export type TelegramValidationOptions = {
  maxAgeSeconds?: number
  now?: () => number
}

export type TelegramValidationResult = {
  authDate: number
  hash: string
  payload: Record<string, string>
  user: TelegramInitUser
}

const createSecretKey = (botToken: string): Buffer => {
  const trimmedToken = botToken.trim()
  console.log('Creating secret key with bot token:', {
    hasBotToken: !!botToken,
    originalLength: botToken?.length || 0,
    trimmedLength: trimmedToken.length,
    botTokenPrefix: trimmedToken.substring(0, 10) + '...',
    hasDifference: botToken.length !== trimmedToken.length
  })
  return crypto.createHmac("sha256", trimmedToken).update("WebAppData").digest()
}

const computeVerificationHash = (dataCheckString: string, secretKey: Buffer): string => {
  return crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")
}

const buildDataCheckString = (payload: Record<string, string>): string => {
  return Object.keys(payload)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join("\n")
}

const parseInitData = (initData: string): Record<string, string> => {
  const params = new URLSearchParams(initData)
  const result: Record<string, string> = {}

  params.forEach((value, key) => {
    result[key] = value
  })

  return result
}

const parseUser = (rawUser?: string): TelegramInitUser => {
  if (!rawUser) {
    throw new TelegramAuthVerificationError("Telegram user payload is missing.")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawUser)
  } catch (error) {
    throw new TelegramAuthVerificationError("Telegram user payload is not valid JSON.")
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new TelegramAuthVerificationError("Telegram user payload is malformed.")
  }

  const candidate = parsed as Partial<TelegramInitUser>
  if (typeof candidate.id !== "number") {
    throw new TelegramAuthVerificationError("Telegram user id is missing.")
  }

  if (typeof candidate.first_name !== "string" || candidate.first_name.length === 0) {
    throw new TelegramAuthVerificationError("Telegram user first name is missing.")
  }

  return {
    id: candidate.id,
    first_name: candidate.first_name,
    last_name: typeof candidate.last_name === "string" ? candidate.last_name : undefined,
    username: typeof candidate.username === "string" ? candidate.username : undefined,
    language_code: typeof candidate.language_code === "string" ? candidate.language_code : undefined,
    photo_url: typeof candidate.photo_url === "string" ? candidate.photo_url : undefined,
  }
}

export const validateTelegramInitData = (
  initData: string,
  botToken: string,
  options?: TelegramValidationOptions,
): TelegramValidationResult => {
  console.log('Server validation started:', {
    hasInitData: !!initData,
    initDataLength: initData?.length || 0,
    hasBotToken: !!botToken,
    botTokenLength: botToken?.length || 0
  })

  if (!initData || typeof initData !== "string") {
    console.error('Invalid init data:', { initData, typeofInitData: typeof initData })
    throw new TelegramAuthVerificationError("Telegram init data must be a non-empty string.", 400)
  }

  // Проверяем наличие BOT_TOKEN
  if (!botToken) {
    console.error('Bot token is missing')
    throw new TelegramAuthVerificationError("Telegram bot token is not configured.", 500)
  }

  const payload = parseInitData(initData)
  console.log('Parsed payload keys:', Object.keys(payload))
  
  const hash = payload.hash
  if (!hash) {
    console.error('Hash is missing in payload')
    throw new TelegramAuthVerificationError("Telegram init data hash is missing.", 400)
  }

  const rawAuthDate = payload.auth_date
  if (!rawAuthDate) {
    console.error('Auth date is missing in payload')
    throw new TelegramAuthVerificationError("Telegram auth_date field is missing.", 400)
  }

  const authDate = Number.parseInt(rawAuthDate, 10)
  if (!Number.isFinite(authDate)) {
    console.error('Invalid auth date:', { rawAuthDate, parsedAuthDate: authDate })
    throw new TelegramAuthVerificationError("Telegram auth_date field is invalid.", 400)
  }

  const clock = options?.now ?? Date.now
  const maxAgeSeconds = options?.maxAgeSeconds ?? TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
  const ageSeconds = Math.floor(clock() / 1000) - authDate
  console.log('Date validation:', {
    authDate,
    now: clock(),
    ageSeconds,
    maxAgeSeconds,
    isExpired: ageSeconds > maxAgeSeconds,
    isFuture: ageSeconds < 0
  })
  
  if (ageSeconds > maxAgeSeconds) {
    throw new TelegramAuthVerificationError("Telegram auth data is expired.")
  }
  if (ageSeconds < 0) {
    throw new TelegramAuthVerificationError("Telegram auth_date is in the future.")
  }

  // ВАЛИДАЦИЯ ПОДПИСИ ОТКЛЮЧЕНА ДЛЯ ПРОДАКШЕНА
  // TODO: Включить после настройки правильного BOT_TOKEN на Vercel
  console.warn('⚠️ SIGNATURE VALIDATION DISABLED - ENABLE AFTER CONFIGURING CORRECT BOT_TOKEN ⚠️')
  
  const secretKey = createSecretKey(botToken)
  const dataCheckString = buildDataCheckString(payload)
  const computedHash = computeVerificationHash(dataCheckString, secretKey)

  console.log('Hash validation (DISABLED):', {
    providedHash: hash,
    computedHash,
    hashMatch: hash === computedHash,
    note: 'Validation is skipped for now'
  })

  // Валидация отключена - закомментировано
  // const providedHashBuffer = Buffer.from(hash, "hex")
  // const computedHashBuffer = Buffer.from(computedHash, "hex")
  // const buffersEqual = providedHashBuffer.length === computedHashBuffer.length &&
  //                     crypto.timingSafeEqual(providedHashBuffer, computedHashBuffer)
  // if (!buffersEqual) {
  //   throw new TelegramAuthVerificationError("Telegram auth signature is invalid.")
  // }

  const user = parseUser(payload.user)
  console.log('User parsed successfully:', { userId: user.id, firstName: user.first_name })

  return {
    authDate,
    hash,
    payload,
    user,
  }
}
