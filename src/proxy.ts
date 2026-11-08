import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import NextAuth from "next-auth";
import { jwtVerify } from "jose";

const { auth } = NextAuth(authConfig);

const STORE_JWT_SECRET = new TextEncoder().encode(process.env.STORE_JWT_SECRET);
const STORE_COOKIE_NAME = "store-token";

// Admin role-based route permissions (paths under /admin)
const ROLE_ROUTES: Record<string, string[]> = {
	"/admin/products": ["ADMIN", "SELLER"],
	"/admin/customers": ["ADMIN", "SELLER"],
	"/admin/stock": ["ADMIN", "WAREHOUSE"],
	"/admin/users": ["ADMIN"],
	"/admin/orders": ["ADMIN", "SELLER", "WAREHOUSE"],
};

// Store routes that require a logged-in store customer
const STORE_PROTECTED_ROUTES = [
	"/orders",
	"/checkout",
];

const ADMIN_PREFIX = "/admin";
const ADMIN_LOGIN_PAGE = "/admin/login";
const STORE_LOGIN_PAGE = "/login";

async function verifyStoreToken(token: string): Promise<boolean> {
	try {
		await jwtVerify(token, STORE_JWT_SECRET);
		return true;
	} catch {
		return false;
	}
}

export default auth(async (req) => {
	const { pathname } = req.nextUrl;

	// ─── ADMIN ────────────────────────────────────────────────────────────────
	if (pathname.startsWith(ADMIN_PREFIX)) {
		const isLoggedIn = !!req.auth;
		const isLoginPage = pathname === ADMIN_LOGIN_PAGE;

		if (!isLoggedIn && !isLoginPage) {
			return NextResponse.redirect(new URL(ADMIN_LOGIN_PAGE, req.nextUrl.origin));
		}

		if (isLoggedIn && isLoginPage) {
			const role = (req.auth?.user as any)?.role ?? "SELLER";
			const defaultRoute = role === "WAREHOUSE" ? "/admin/stock" : "/admin/orders";
			return NextResponse.redirect(new URL(defaultRoute, req.nextUrl.origin));
		}

		if (isLoggedIn) {
			const role = (req.auth?.user as any)?.role;
			for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
				if (pathname.startsWith(route)) {
					if (!role || !allowedRoles.includes(role)) {
						return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
					}
				}
			}
		}

		return NextResponse.next();
	}

	// ─── STORE ────────────────────────────────────────────────────────────────
	const isStoreProtected = STORE_PROTECTED_ROUTES.some((route) =>
		pathname.startsWith(route),
	);

	if (isStoreProtected) {
		const token = req.cookies.get(STORE_COOKIE_NAME)?.value;
		const isAuthenticated = token ? await verifyStoreToken(token) : false;

		if (!isAuthenticated) {
			const redirectUrl = new URL(STORE_LOGIN_PAGE, req.nextUrl.origin);
			redirectUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(redirectUrl);
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)"],
};
