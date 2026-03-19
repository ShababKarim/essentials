import { NextRequest, NextResponse } from "next/server";

import {
  createSessionCookie,
  getAdminSessionCookieName,
  verifySessionCookie,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token?: string };
    const token = body.token?.trim();
    const expected = process.env.ADMIN_TOKEN;

    if (!expected) {
      return NextResponse.json(
        { message: "Server misconfigured: ADMIN_TOKEN is not set." },
        { status: 500 }
      );
    }

    if (!token || token !== expected) {
      return NextResponse.json(
        { message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const { name, value, maxAge } = createSessionCookie();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const name = getAdminSessionCookieName();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(getAdminSessionCookieName())?.value;
  const valid = verifySessionCookie(cookieValue);
  return NextResponse.json({ authenticated: valid });
}
