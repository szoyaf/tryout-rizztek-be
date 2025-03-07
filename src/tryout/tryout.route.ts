import { Hono } from "hono";
import * as tryoutService from "./tryout.service";

const route = new Hono();

route.get("/", async (c) => {
  try {
    const tryouts = await tryoutService.getTryouts();
    return c.json({ tryouts }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch tryouts" }, 500);
  }
});

route.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const tryout = await tryoutService.getTryoutById(id);
    if (!tryout) return c.json({ error: "Tryout not found" }, 404);
    return c.json({ tryout }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch tryout" }, 500);
  }
});

route.get("/title/:title", async (c) => {
  const title = c.req.param("title");
  try {
    const tryouts = await tryoutService.getTryoutsByTitle(title);
    return c.json({ tryouts }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch tryouts by title" }, 500);
  }
});

route.get("/category/:category", async (c) => {
  const category = c.req.param("category");
  try {
    const tryouts = await tryoutService.getTryoutsByCategory(category);
    return c.json({ tryouts }, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Invalid category")) {
        return c.json({ error: error.message }, 400);
      }
    }
    return c.json({ error: "Failed to fetch tryouts by category" }, 500);
  }
});

route.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const tryout = await tryoutService.createTryout(body);
    return c.json({ tryout }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to create tryout" }, 500);
  }
});

route.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const tryout = await tryoutService.updateTryout(id, body);
    return c.json({ tryout }, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return c.json({ error: error.message }, 404);
      }
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to update tryout" }, 500);
  }
});

route.delete("/", (c) => c.text("DELETE /"));

export default route;
