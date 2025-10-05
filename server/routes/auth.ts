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
    const result = await authenticateTelegramUser(req.body?.initData, config)
    res.status(result.status).json(result.body)
  })

  return router
}
