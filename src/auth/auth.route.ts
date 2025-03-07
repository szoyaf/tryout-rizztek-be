import { Hono } from "hono";
import { login, logout, register } from "./auth.service";

const route = new Hono();

route.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const token = await login(body.email, body.password);
    return c.json({ token }, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("User not found") ||
        error.message.includes("Invalid password")
      ) {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error("Error logging in:", error);
    return c.json({ error: "Failed to login" }, 500);
  }
});

route.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const user = await register(body);
    return c.json({ user }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("User already exists")) {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error("Error registering user:", error);
    return c.json({ error: "Failed to register user" }, 500);
  }
});

route.post("/logout", async (c) => {
  try {
    const token = c.req.header("Authorization");
    if (!token) {
      return c.json({ error: "Authorization header is missing" }, 400);
    }
    const result = await logout(token);
    return c.json(result, 200);
  } catch (error) {
    console.error("Error logging out:", error);
    return c.json({ error: "Failed to logout" }, 500);
  }
});

export default route;