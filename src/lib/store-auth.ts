

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { STORE_COOKIE_NAME as COOKIE_NAME, storeJwtSecret } from "./store-jwt";
const EXPIRES_IN = "7d";

export type StoreSession = {
	id: string;
	name: string;
	email: string;
};

export async function createStoreSession(payload: StoreSession) {
	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime(EXPIRES_IN)
		.sign(storeJwtSecret());

	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7,
		path: "/",
	});
}

export async function getStoreSession(): Promise<StoreSession | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(COOKIE_NAME)?.value;
	if (!token) return null;

	try {
		const { payload } = await jwtVerify<StoreSession>(token, storeJwtSecret());
		return payload as StoreSession;
	} catch {
		return null;
	}
}

export async function deleteStoreSession() {
	const cookieStore = await cookies();
	cookieStore.delete(COOKIE_NAME);
}
