import bcrypt from "bcrypt"
import jwt, { type Secret, type SignOptions } from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d"

export interface JWTPayload {
  adminId: number
  email: string | null
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  if (!JWT_SECRET || JWT_SECRET === "change-me") {
    throw new Error("JWT_SECRET environment variable must be set for token generation")
  }

  const secret: Secret = JWT_SECRET
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  }

  return jwt.sign(payload, secret, options)
}

export function verifyToken(token: string): JWTPayload {
  if (!JWT_SECRET || JWT_SECRET === "change-me") {
    throw new Error("JWT_SECRET environment variable must be set for token verification")
  }

  const secret: Secret = JWT_SECRET

  return jwt.verify(token, secret) as JWTPayload
}

export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization) return null

  const parts = authorization.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null
  }

  return parts[1]
}
