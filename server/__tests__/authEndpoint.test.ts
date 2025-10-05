import jwt from "jsonwebtoken"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"
import { createApp } from "../app"
import { resetUserStore } from "../services/userService"
import { buildSignedInitData } from "./helpers"

const BOT_TOKEN = "123456:ABC-DEF1234"
const JWT_SECRET = "test-session-secret"

beforeEach(() => {
  resetUserStore()
})

describe("POST /api/auth/telegram", () => {
  it("returns a session token and user info when init data is valid", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const initData = buildSignedInitData(BOT_TOKEN, {
      query_id: "query",
      user: JSON.stringify({ id: 99, first_name: "Jamie", username: "jamie" }),
      auth_date: String(nowSeconds),
      hash: "",
    })

    const app = createApp({ botToken: BOT_TOKEN, jwtSecret: JWT_SECRET, now: () => nowSeconds * 1000 })

    const response = await request(app).post("/api/auth/telegram").send({ initData })

    expect(response.status).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.user).toMatchObject({ telegramId: 99, username: "jamie" })
    expect(typeof response.body.sessionToken).toBe("string")

    const decoded = jwt.verify(response.body.sessionToken, JWT_SECRET) as jwt.JwtPayload
    expect(decoded.telegramId).toBe(99)
    expect(decoded.sub).toBe("telegram:99")
  })

  it("returns 401 when signature is invalid", async () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const validInitData = buildSignedInitData(BOT_TOKEN, {
      query_id: "query",
      user: JSON.stringify({ id: 99, first_name: "Jamie" }),
      auth_date: String(nowSeconds),
      hash: "",
    })
    const tamperedInitData = validInitData.replace("Jamie", "Eva")

    const app = createApp({ botToken: BOT_TOKEN, jwtSecret: JWT_SECRET, now: () => nowSeconds * 1000 })

    const response = await request(app).post("/api/auth/telegram").send({ initData: tamperedInitData })

    expect(response.status).toBe(401)
    expect(response.body.ok).toBe(false)
  })
})
