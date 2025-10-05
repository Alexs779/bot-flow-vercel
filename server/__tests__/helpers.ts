import crypto from "node:crypto"

export const buildSignedInitData = (botToken: string, payload: Record<string, string>) => {
  const params = new URLSearchParams()
  Object.entries(payload).forEach(([key, value]) => {
    params.append(key, value)
  })

  const withoutHash = Object.fromEntries(params.entries()) as Record<string, string>
  delete withoutHash.hash

  const dataCheckString = Object.keys(withoutHash)
    .sort()
    .map((key) => `${key}=${withoutHash[key]}`)
    .join("\n")

  const secretKey = crypto.createHmac("sha256", botToken).update("WebAppData").digest()
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

  params.set("hash", hash)

  return params.toString()
}
