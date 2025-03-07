import { Hono } from "hono";
import { prisma } from "../../prisma/prisma";

const route = new Hono();

route.get("/", async (c) => {
  const users = await prisma.user.findMany();
  return c.json({ users }, 200);
});

route.get("/:id", async (c) => {
  const id = c.req.param("id");

  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user }, 200);
});

export default route;
