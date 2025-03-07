import { Context, Next } from "hono";
import { jwt } from "hono/jwt";
import { prisma } from "../../prisma/prisma";

export const authMiddleware = jwt({
  secret:
    process.env.JWT_SECRET ||
    (() => {
      throw new Error("JWT_SECRET is not defined");
    })(),
});

export const blacklistCheckMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return next();
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : authHeader;

  const blacklistedToken = await prisma.blacklistedToken.findUnique({
    where: { token }
  });

  if (blacklistedToken) {
    return c.text("Unauthorized", 401);
  }

  return next();
};