"use server";

import { assertString } from "@/lib/validations/common";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { SerializedUser } from "@/types/user";
import { Prisma } from "@/generated/prisma/client";
import { CreateUserFormData, UserFormData, createUserSchema, userSchema } from "@/lib/validations/user";

function serialize(u: any): SerializedUser {
	return {
		...u,
		createdAt: u.createdAt.toISOString(),
		updatedAt: u.updatedAt.toISOString(),
		deletedAt: u.deletedAt?.toISOString(),
	};
}

const requireAdmin = () => requireRole("ADMIN");

export async function getUsers(): Promise<SerializedUser[]> {
	await requireAdmin();
	const users = await prisma.user.findMany({
		where: { deletedAt: null },
		orderBy: { createdAt: "desc" },
	});
	return users.map(serialize);
}

export async function getUser(id: string): Promise<SerializedUser | null> {
	id = assertString(id);
	await requireAdmin();
	const user = await prisma.user.findUnique({
		where: { id, deletedAt: null },
	});
	if (!user) return null;
	return serialize(user);
}

export async function createUser(data: CreateUserFormData) {
  await requireAdmin()
  data = createUserSchema.parse(data) as CreateUserFormData
  try {
    await prisma.user.create({
      data: {
        username: data.username,
        password: await hash(data.password, 12),
        role: data.role,
      },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("Ya existe un usuario con ese nombre de usuario")
    }
    throw e
  }
  revalidatePath("/users")
}

export async function updateUser(id: string, data: UserFormData) {
	id = assertString(id);
	await requireAdmin();
	data = userSchema.parse(data);
	const updateData: any = {
		username: data.username,
		role: data.role,
	};
	if (data.password) {
		updateData.password = await hash(data.password, 12);
	}
	try {
		await prisma.user.update({ where: { id }, data: updateData });
	} catch (e) {
		if (
			e instanceof Prisma.PrismaClientKnownRequestError &&
			e.code === "P2002"
		) {
			throw new Error("A user with this username already exists");
		}
		throw e;
	}
	revalidatePath("/users");
}

export async function deleteUser(id: string) {
	id = assertString(id);
	await requireAdmin();
	await prisma.user.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
	revalidatePath("/users");
}
