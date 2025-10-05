import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  authenticateTelegramUser,
  type AuthControllerConfig,
} from '../../server/controllers/authController.js'

const readConfig = (): AuthControllerConfig | null => {
  const botToken = process.env.BOT_TOKEN ?? 'placeholder'
  const jwtSecret = process.env.JWT_SECRET ?? 'placeholder-secret'

  console.log('Environment variables check:', {
    hasBotToken: !!process.env.BOT_TOKEN,
    botTokenLength: botToken.length,
    hasJwtSecret: !!process.env.JWT_SECRET,
    jwtSecretLength: jwtSecret.length,
    allEnvVars: Object.keys(process.env).filter(key =>
      key.includes('TELEGRAM') || key.includes('BOT') || key.includes('JWT')
    )
  })

  const maxAgeRaw = process.env.TELEGRAM_AUTH_MAX_AGE_SECONDS
  const maxAuthAgeSeconds = maxAgeRaw ? Number.parseInt(maxAgeRaw, 10) : undefined

  // ВРЕМЕННОЕ РЕШЕНИЕ: используем заглушки, если переменные окружения не заданы
  if (!process.env.BOT_TOKEN || !process.env.JWT_SECRET) {
    console.warn('Using placeholder values for missing environment variables')
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
    } catch (error) {
      console.warn('Failed to parse raw body as JSON', error)
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

  console.log('Auth request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  })

  const config = readConfig()
  if (!config) {
    console.error('Server configuration error. Missing BOT_TOKEN or JWT_SECRET')
    return res.status(500).json({ ok: false, error: 'Server configuration error.' })
  }

  console.log('Config loaded successfully:', {
    hasBotToken: !!config.botToken,
    hasJwtSecret: !!config.jwtSecret,
    maxAuthAgeSeconds: config.maxAuthAgeSeconds
  })

  const initData = extractInitData(req)
  console.log('Extracted init data:', {
    hasInitData: !!initData,
    initDataType: typeof initData,
    initDataLength: initData ? (typeof initData === 'string' ? initData.length : 'N/A') : 'N/A'
  })

  const result = await authenticateTelegramUser(initData, config)
  console.log('Authentication result:', {
    status: result.status,
    ok: 'ok' in result.body ? result.body.ok : 'N/A'
  })

  return res.status(result.status).json(result.body)
}
