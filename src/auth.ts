import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				username: { label: "Username" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password)
					return null;

				// Los usuarios dados de baja (deletedAt) no pueden ingresar
				const user = await prisma.user.findFirst({
					where: { username: credentials.username as string, deletedAt: null },
				});

				if (!user) return null;

				const isPasswordValid = await compare(
					credentials.password as string,
					user.password,
				);

				if (!isPasswordValid) return null;

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
