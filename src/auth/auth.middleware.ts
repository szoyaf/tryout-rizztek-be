import { Hono } from "hono";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";

type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();

app.use(
  "/auth/*",
  jwt({
    secret:
      process.env.JWT_SECRET ||
      (() => {
        throw new Error("JWT_SECRET is not defined");
      })(),
  })
);
