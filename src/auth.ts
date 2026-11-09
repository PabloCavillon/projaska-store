import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { clearLoginFailures, clientIp, isLoginBlocked, recordLoginFailure } from "@/lib/login-rate-limit";

class LoginRateLimited extends CredentialsSignin {
	code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				username: { label: "Username" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, request) {
				const ip = clientIp(request.headers);
				if (await isLoginBlocked("admin", ip)) throw new LoginRateLimited();

				if (typeof credentials?.username !== "string" || typeof credentials?.password !== "string")
					return null;

				// Los usuarios dados de baja (deletedAt) no pueden ingresar
				const user = await prisma.user.findFirst({
					where: { username: credentials.username.trim(), deletedAt: null },
				});

				if (!user || !(await compare(credentials.password, user.password))) {
					await recordLoginFailure("admin", ip);
					return null;
				}
				await clearLoginFailures("admin", ip);

				return { id: user.id, name: user.username, role: user.role };
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = (user as any).role;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id as string;
			session.user.role = token.role as string;
			return session;
		},
	},
});
