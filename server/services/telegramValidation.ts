import { validate, parse } from '@tma.js/init-data-node'

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

export const validateTelegramInitData = (
  initData: string,
  botToken: string,
  options?: TelegramValidationOptions,
): TelegramValidationResult => {
  console.log('Server validation started with official package:', {
    hasInitData: !!initData,
    initDataLength: initData?.length || 0,
    hasBotToken: !!botToken,
    botTokenLength: botToken?.length || 0
  })

  if (!initData || typeof initData !== "string") {
    console.error('Invalid init data:', { initData, typeofInitData: typeof initData })
    throw new TelegramAuthVerificationError("Telegram init data must be a non-empty string.", 400)
  }

  if (!botToken) {
    console.error('Bot token is missing')
    throw new TelegramAuthVerificationError("Telegram bot token is not configured.", 500)
  }

  try {
    // Используем официальный пакет для валидации
    console.log('Validating with official @telegram-apps/init-data-node package...')
    validate(initData, botToken, {
      expiresIn: options?.maxAgeSeconds ?? TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
    })
    console.log('✅ Validation successful with official package')

    // Парсим данные
    const parsed = parse(initData)
    console.log('Parsed init data:', {
      hasUser: !!parsed.user,
      hasAuthDate: !!parsed.authDate,
      hasHash: !!parsed.hash
    })

    if (!parsed.user) {
      throw new TelegramAuthVerificationError("Telegram user information is missing.")
    }

    if (!parsed.authDate) {
      throw new TelegramAuthVerificationError("Telegram auth_date field is missing.", 400)
    }

    if (!parsed.hash) {
      throw new TelegramAuthVerificationError("Telegram init data hash is missing.", 400)
    }

    const authDate = typeof parsed.authDate === 'number' 
      ? parsed.authDate 
      : new Date(parsed.authDate).getTime() / 1000

    // Преобразуем parsed данные в нужный формат
    const params = new URLSearchParams(initData)
    const payload: Record<string, string> = {}
    params.forEach((value, key) => {
      payload[key] = value
    })

    const user: TelegramInitUser = {
      id: parsed.user.id,
      first_name: parsed.user.firstName,
      last_name: parsed.user.lastName,
      username: parsed.user.username,
      language_code: parsed.user.languageCode,
      photo_url: parsed.user.photoUrl,
    }

    console.log('User parsed successfully:', { 
      userId: user.id, 
      firstName: user.first_name 
    })

    return {
      authDate,
      hash: parsed.hash,
      payload,
      user,
    }
  } catch (error) {
    console.error('Validation failed with official package:', error)
    
    if (error instanceof Error) {
      // Проверяем тип ошибки от официального пакета
      if (error.message.includes('expired')) {
        throw new TelegramAuthVerificationError("Telegram auth data is expired.")
      }
      if (error.message.includes('invalid') || error.message.includes('signature')) {
        throw new TelegramAuthVerificationError("Telegram auth signature is invalid.")
      }
      throw new TelegramAuthVerificationError(error.message)
    }
    
    throw new TelegramAuthVerificationError("Failed to validate Telegram init data.")
  }
}
