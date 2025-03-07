import { jwt } from "hono/jwt";

export const authMiddleware = jwt({
  secret:
    process.env.JWT_SECRET ||
    (() => {
      throw new Error("JWT_SECRET is not defined");
    })(),
});