import { describe, expect, it } from "vitest"
import { buildSignedInitData } from "./helpers"
import {
  TELEGRAM_INIT_DATA_MAX_AGE_SECONDS,
  TelegramAuthVerificationError,
  validateTelegramInitData,
} from "../services/telegramValidation"

const BOT_TOKEN = "123456:ABC-DEF1234"
const signInitData = (payload: Record<string, string>) => buildSignedInitData(BOT_TOKEN, payload)

describe("validateTelegramInitData", () => {
  it("validates init data and returns user payload", () => {
    const now = Math.floor(Date.now() / 1000)
    const initData = signInitData({
      query_id: "query",
      user: JSON.stringify({ id: 42, first_name: "Alex" }),
      auth_date: String(now),
      hash: "",
    })

    const result = validateTelegramInitData(initData, BOT_TOKEN, { now: () => now * 1000 })

    expect(result.user).toEqual({ id: 42, first_name: "Alex" })
  })

  it("rejects payload when hash does not match", () => {
    const now = Math.floor(Date.now() / 1000)
    const initData = signInitData({
      query_id: "query",
      user: JSON.stringify({ id: 42, first_name: "Alex" }),
      auth_date: String(now),
      hash: "",
    })

    const tampered = initData.replace("Alex", "Eve")

    expect(() => validateTelegramInitData(tampered, BOT_TOKEN, { now: () => now * 1000 })).toThrow(
      TelegramAuthVerificationError,
    )
  })

  it("rejects payload when auth_date is expired", () => {
    const now = Math.floor(Date.now() / 1000)
    const past = now - (TELEGRAM_INIT_DATA_MAX_AGE_SECONDS + 60)
    const initData = signInitData({
      query_id: "query",
      user: JSON.stringify({ id: 42, first_name: "Alex" }),
      auth_date: String(past),
      hash: "",
    })

    expect(() => validateTelegramInitData(initData, BOT_TOKEN, { now: () => now * 1000 })).toThrow(
      "Telegram auth data is expired.",
    )
  })
})
