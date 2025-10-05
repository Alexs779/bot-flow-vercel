import type { StringValue } from "ms"
import jwt, { type Secret, type SignOptions } from "jsonwebtoken"

export type JwtPayload = {
  sub: string
  telegramId: number
}

export const createSessionToken = (
  userId: string,
  telegramId: number,
  secret: string,
  expiresIn: StringValue | number = "7d",
): string => {
  if (!secret) {
    throw new Error("JWT secret is not configured.")
  }

  const payload: JwtPayload = {
    sub: userId,
    telegramId,
  }

  const options: SignOptions = { expiresIn }

  return jwt.sign(payload, secret as Secret, options)
}
