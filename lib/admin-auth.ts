import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE_SEC = 24 * 60 * 60; // 24 hours

function getSecret(): string {
  const secret = process.env.ADMIN_TOKEN;
  if (!secret) {
    throw new Error("ADMIN_TOKEN is not set");
  }
  return secret;
}

function sign(expiry: number): string {
  const secret = getSecret();
  const payload = String(expiry);
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function createSessionCookie(): { name: string; value: string; maxAge: number } {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC;
  return {
    name: COOKIE_NAME,
    value: sign(expiry),
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function verifySessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue?.trim()) return false;

  const secret = getSecret();
  const parts = cookieValue.trim().split(".");
  if (parts.length !== 2) return false;

  const [expiryStr, signature] = parts;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(expiryStr).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function getAdminSessionCookieName(): string {
  return COOKIE_NAME;
}
