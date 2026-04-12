import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt } from "jose";
import { hkdf } from "@panva/hkdf";

const COOKIE_NAME = "authjs.session-token";
const SECURE_COOKIE_NAME = "__Secure-authjs.session-token";

async function getDerivedKey(secret: string, salt: string): Promise<Uint8Array> {
  return hkdf(
    "sha256",
    secret,
    salt,
    `Auth.js Generated Encryption Key (${salt})`,
    64
  );
}

async function getSession(req: NextRequest): Promise<{ role?: string } | null> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) return null;

  const token =
    req.cookies.get(SECURE_COOKIE_NAME)?.value ??
    req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const key = await getDerivedKey(secret, COOKIE_NAME);
    const { payload } = await jwtDecrypt(token, key, {
      contentEncryptionAlgorithms: ["A256CBC-HS512", "A256GCM"],
    });
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession(req);
  const isLoggedIn = !!session;
  const role = session?.role;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/registro");
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isCheckout = pathname.startsWith("/checkout");

  if (isAuthPage && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.nextUrl));
    if (role === "ARTISAN") return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/dashboard", req.nextUrl)
    );
  }

  if (isDashboard && role !== "ARTISAN" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isAdmin && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isCheckout && !isLoggedIn) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/checkout", req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
