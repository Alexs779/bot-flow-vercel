import { createSessionToken } from "../services/jwtService.js"
import { findOrCreateUserByTelegramId } from "../services/userService.js"
import {
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS,
  TelegramAuthVerificationError,
  validateTelegramInitData,
} from "../services/telegramValidation.js"

export type AuthControllerConfig = {
  botToken: string
  jwtSecret: string
  maxAuthAgeSeconds?: number
  now?: () => number
}

export type AuthSuccessBody = {
  ok: true
  sessionToken: string
  user: {
    id: string
    telegramId: number
    firstName: string
    lastName?: string
    username?: string
    avatarUrl?: string
  }
}

export type AuthErrorBody = {
  ok: false
  error: string
}

export type AuthControllerResult = {
  status: number
  body: AuthSuccessBody | AuthErrorBody
}

export const authenticateTelegramUser = async (
  initData: unknown,
  config: AuthControllerConfig,
): Promise<AuthControllerResult> => {
  if (typeof initData !== "string" || initData.length === 0) {
    return { status: 400, body: { ok: false, error: "initData must be a non-empty string." } }
  }

  if (!config.botToken) {
    return { status: 500, body: { ok: false, error: "Telegram bot token is not configured." } }
  }

  if (!config.jwtSecret) {
    return { status: 500, body: { ok: false, error: "JWT secret is not configured." } }
  }

  const maxAgeSeconds = config.maxAuthAgeSeconds ?? TELEGRAM_INIT_DATA_MAX_AGE_SECONDS

  try {
    const validation = validateTelegramInitData(initData, config.botToken, {
      maxAgeSeconds,
      now: config.now,
    })

    const user = await findOrCreateUserByTelegramId({
      telegramId: validation.user.id,
      firstName: validation.user.first_name,
      lastName: validation.user.last_name,
      username: validation.user.username,
      avatarUrl: validation.user.photo_url,
    })

    const sessionToken = createSessionToken(user.id, user.telegramId, config.jwtSecret)

    return {
      status: 200,
      body: {
        ok: true,
        sessionToken,
        user: {
          id: user.id,
          telegramId: user.telegramId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      },
    }
  } catch (error) {
    if (error instanceof TelegramAuthVerificationError) {
      const statusCode = error.statusCode ?? 401
      return { status: statusCode, body: { ok: false, error: error.message } }
    }

    console.error("Unexpected Telegram auth error", error)
    return { status: 500, body: { ok: false, error: "Failed to authorize Telegram user." } }
  }
}
