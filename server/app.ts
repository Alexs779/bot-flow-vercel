import express from "express"
import type { Request, Response, NextFunction } from "express"
import { createAuthRouter, type AuthRouterConfig } from "./routes/auth"

export type AppConfig = AuthRouterConfig

export const createApp = (config: AppConfig) => {
  const app = express()

  app.use(express.json())

  app.use("/api/auth", createAuthRouter(config))

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true })
  })

  app.use((req: Request, res: Response) => {
    res.status(404).json({ ok: false, error: `Route ${req.path} not found.` })
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error", error)
    res.status(500).json({ ok: false, error: "Internal server error." })
  })

  return app
}
