import { describe, expect, it } from "vitest"
import {
  TELEGRAM_AUTH_MAX_AGE_SECONDS,
  TelegramAuthError,
  getTelegramInitData,
  type TelegramWebApp,
} from "./telegramAuth"

describe("getTelegramInitData", () => {
  const baseUser = {
    id: 123456,
    first_name: "Alex",
    last_name: "Smith",
    username: "alex",
    photo_url: "https://example.com/avatar.jpg",
  }

  const createWebApp = (
    overrides: Partial<NonNullable<TelegramWebApp["initDataUnsafe"]>> = {},
  ): TelegramWebApp => {
    const authDate = Math.floor(Date.now() / 1000)
    return {
      initData: "auth_date=1&hash=hash",
      initDataUnsafe: {
        auth_date: authDate,
        hash: "hash",
        user: baseUser,
        ...overrides,
      },
      ready: () => undefined,
      expand: () => undefined,
      openInvoice: () => undefined,
      showAlert: () => undefined,
      enableClosingConfirmation: () => undefined,
      setHeaderColor: () => undefined,
      setBackgroundColor: () => undefined,
    }
  }

  it("returns normalized Telegram data when payload is valid", () => {
    const now = Date.now()
    const webApp = createWebApp({ auth_date: Math.floor(now / 1000) })

    const result = getTelegramInitData(webApp, { now: () => now })

    expect(result.user).toEqual({
      id: baseUser.id,
      firstName: baseUser.first_name,
      lastName: baseUser.last_name,
      username: baseUser.username,
      avatarUrl: baseUser.photo_url,
    })
    expect(result.hash).toBe("hash")
  })

  it("throws when auth date is older than max age", () => {
    const now = Date.now()
    const expiredAuthDate = Math.floor((now - (TELEGRAM_AUTH_MAX_AGE_SECONDS + 10) * 1000) / 1000)
    const webApp = createWebApp({ auth_date: expiredAuthDate })

    expect(() => getTelegramInitData(webApp, { now: () => now })).toThrow(TelegramAuthError)
  })

  it("throws when user payload is missing", () => {
    const now = Date.now()
    const webApp = createWebApp()
    if (webApp.initDataUnsafe) {
      delete (webApp.initDataUnsafe as Record<string, unknown>).user
    }

    expect(() => getTelegramInitData(webApp, { now: () => now })).toThrow(
      "Telegram user information is missing.",
    )
  })
})
