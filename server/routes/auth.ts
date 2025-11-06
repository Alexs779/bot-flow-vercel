import type { Request, Response } from "express"
import { Router } from "express"
import {
  authenticateTelegramUser,
  type AuthControllerConfig,
} from "../controllers/authController"

export type AuthRouterConfig = AuthControllerConfig

export const createAuthRouter = (config: AuthRouterConfig) => {
  if (!config.botToken) {
    throw new Error("Telegram bot token is required.")
  }
  if (!config.jwtSecret) {
    throw new Error("JWT secret is required.")
  }

  const router = Router()

  router.post("/telegram", async (req: Request, res: Response) => {
    // Поддержка обоих способов передачи initData из официальной документации:
    // 1) Authorization: "tma <initDataRaw>"
    // 2) Тело запроса: { initData: "<initDataRaw>" }
    const authHeader = req.get("authorization") ?? ""
    let initData: unknown = req.body?.initData

    if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("tma ")) {
      initData = authHeader.slice(4).trim()
    }

    const result = await authenticateTelegramUser(initData, config)
    res.status(result.status).json(result.body)
  })

  return router
}
