import { prisma } from "../../prisma/prisma";
import { User } from "@prisma/client";
import { hash, verify } from "argon2";
import { sign } from "hono/jwt";

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await verify(user.password, password);

  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = signJwt(user);

  return token;
};

export const register = async (data: User) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (user) {
    throw new Error("Email already exists");
  }

  const userName = await prisma.user.findUnique({
    where: {
      username: data.username,
    },
  });

  if (userName) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await hash(data.password);

  return await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      username: data.username,
    },
  });
};

export const logout = async (token: string) => {
  try {
    const tokenValue = token.startsWith("Bearer ") ? token.substring(7) : token;

    await prisma.blacklistedToken.create({
      data: {
        token: tokenValue,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return { success: true, message: "Successfully logged out" };
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error("Failed to logout");
  }
};

const signJwt = (user: User) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET
  );
};
