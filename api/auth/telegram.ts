import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  authenticateTelegramUser,
  type AuthControllerConfig,
} from '../../server/controllers/authController.js'

const readConfig = (): AuthControllerConfig | null => {
  const botToken = process.env.BOT_TOKEN ?? ''
  const jwtSecret = process.env.JWT_SECRET ?? ''

  const maxAgeRaw = process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS
  const maxAuthAgeSeconds = maxAgeRaw ? Number.parseInt(maxAgeRaw, 10) : undefined

  if (!botToken || !jwtSecret) {
    console.error('Missing required environment variables: BOT_TOKEN or JWT_SECRET')
    return null
  }

  return {
    botToken,
    jwtSecret,
    maxAuthAgeSeconds,
  }
}

const extractInitData = (req: VercelRequest): unknown => {
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body) as Record<string, unknown>
      return parsed.initData
    } catch {
      return null
    }
  }

  if (typeof req.body === 'object' && req.body !== null) {
    const body = req.body as { initData?: unknown }
    return body.initData
  }

  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  const config = readConfig()
  if (!config) {
    return res.status(500).json({ ok: false, error: 'Server configuration error.' })
  }

  const initData = extractInitData(req)
  const result = await authenticateTelegramUser(initData, config)

  return res.status(result.status).json(result.body)
}
