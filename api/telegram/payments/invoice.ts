import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Method not allowed.' })
  }

  try {
    // Временная заглушка для платежей
    // В реальном приложении здесь должна быть интеграция с Telegram Payments API
    const { sessionToken, moveId } = req.body as { sessionToken?: string, moveId?: string }
    
    if (!sessionToken || !moveId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing required parameters: sessionToken, moveId' 
      })
    }

    // Временный ответ для тестирования
    return res.status(200).json({ 
      ok: true, 
      invoiceUrl: 'https://t.me/invoice/test' // Заглушка
    })
  } catch (error) {
    console.error('Payment invoice error:', error)
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to create payment invoice' 
    })
  }
}