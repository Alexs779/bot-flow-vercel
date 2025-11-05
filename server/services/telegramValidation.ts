import { createHmac } from 'crypto'

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

/**
 * Validates Telegram WebApp init data according to official documentation
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
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

  if (!botToken) {
    console.error('Bot token is missing')
    throw new TelegramAuthVerificationError("Telegram bot token is not configured.", 500)
  }

  try {
    // Parse init data as URL-encoded parameters
    const params = new URLSearchParams(initData)
    const payload: Record<string, string> = {}

    // Extract hash and remove it from data for signature calculation
    const receivedHash = params.get('hash')
    params.delete('hash')

    if (!receivedHash) {
      throw new TelegramAuthVerificationError("Telegram init data hash is missing.", 400)
    }

    // Create data string for signature verification (sorted by key)
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    console.log('Data check string created for signature verification')

    // Calculate expected hash using HMAC-SHA256
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
    const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    console.log('Hash calculated:', { receivedHash, expectedHash })

    // Verify signature
    if (receivedHash !== expectedHash) {
      console.error('Hash mismatch:', { received: receivedHash, expected: expectedHash })
      throw new TelegramAuthVerificationError("Telegram auth signature is invalid.")
    }

    console.log('✅ Signature verification successful')

    // Check auth_date (must be within allowed time window)
    const authDateStr = params.get('auth_date')
    if (!authDateStr) {
      throw new TelegramAuthVerificationError("Telegram auth_date field is missing.", 400)
    }

    const authDate = parseInt(authDateStr, 10)
    if (isNaN(authDate)) {
      throw new TelegramAuthVerificationError("Telegram auth_date is invalid.", 400)
    }

    const now = options?.now?.() ?? Date.now()
    const maxAgeSeconds = options?.maxAgeSeconds ?? TELEGRAM_INIT_DATA_MAX_AGE_SECONDS
    const ageSeconds = Math.floor(now / 1000) - authDate

    console.log('Auth date validation:', { authDate, ageSeconds, maxAgeSeconds })

    if (ageSeconds > maxAgeSeconds) {
      throw new TelegramAuthVerificationError("Telegram auth data is expired.")
    }

    if (ageSeconds < 0) {
      throw new TelegramAuthVerificationError("Telegram auth date is in the future.")
    }

    // Parse user data
    const userStr = params.get('user')
    if (!userStr) {
      throw new TelegramAuthVerificationError("Telegram user information is missing.")
    }

    let userData: any
    try {
      userData = JSON.parse(userStr)
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError)
      throw new TelegramAuthVerificationError("Telegram user data is malformed.", 400)
    }

    if (!userData.id || typeof userData.id !== 'number') {
      throw new TelegramAuthVerificationError("Telegram user ID is missing or invalid.")
    }

    // Rebuild payload with all parameters
    params.forEach((value, key) => {
      payload[key] = value
    })

    const user: TelegramInitUser = {
      id: userData.id,
      first_name: userData.first_name || '',
      last_name: userData.last_name,
      username: userData.username,
      language_code: userData.language_code,
      photo_url: userData.photo_url,
    }

    console.log('User parsed successfully:', {
      userId: user.id,
      firstName: user.first_name
    })

    return {
      authDate,
      hash: receivedHash,
      payload,
      user,
    }
  } catch (error) {
    console.error('Validation failed:', error)

    if (error instanceof TelegramAuthVerificationError) {
      throw error
    }

    if (error instanceof Error) {
      throw new TelegramAuthVerificationError(`Validation error: ${error.message}`)
    }

    throw new TelegramAuthVerificationError("Failed to validate Telegram init data.")
  }
}
