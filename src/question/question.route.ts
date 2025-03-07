import { Hono } from "hono";
import * as questionService from "./question.service";

const route = new Hono();

route.get("/tryout/:tryoutId", async (c) => {
  try {
    const tryoutId = c.req.param("tryoutId");
    const questions = await questionService.getQuestionsByTryoutId(tryoutId);
    return c.json({ questions }, 200);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return c.json({ error: "Failed to fetch questions" }, 500);
  }
});

route.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const question = await questionService.getQuestionById(id);
    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }
    return c.json({ question }, 200);
  } catch (error) {
    console.error("Error fetching question:", error);
    return c.json({ error: "Failed to fetch question" }, 500);
  }
});

route.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const question = await questionService.createQuestion(body);
    return c.json({ question }, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Invalid question type") ||
        error.message.includes("Choices must be provided") ||
        error.message.includes("True/False questions")
      ) {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error("Error creating question:", error);
    return c.json({ error: "Failed to create question" }, 500);
  }
});

route.put("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const question = await questionService.updateQuestion(id, body);
    return c.json({ question }, 200);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return c.json({ error: error.message }, 404);
      }
      if (
        error.message.includes("Invalid question type") ||
        error.message.includes("Choices must be provided") ||
        error.message.includes("True/False questions")
      ) {
        return c.json({ error: error.message }, 400);
      }
    }
    console.error("Error updating question:", error);
    return c.json({ error: "Failed to update question" }, 500);
  }
});

export default route;