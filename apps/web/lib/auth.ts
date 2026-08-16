import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const encoder = new TextEncoder();
const getSecret = () => encoder.encode(process.env.JWT_SECRET || "dev-secret-change-me");
const TOKEN_TTL = "30d";
export const AUTH_COOKIE = "pm_token";

export interface JwtPayload {
  sub: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return { sub: payload.sub as string, role: payload.role as "BUYER" | "SELLER" | "ADMIN" };
  } catch {
    return null;
  }
}

export async function getAuth(req: NextRequest): Promise<JwtPayload | null> {
  const bearer = req.headers.get("authorization");
  const bearerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : null;
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value;
  const token = bearerToken || cookieToken;
  if (!token) return null;
  return verifyToken(token);
}
