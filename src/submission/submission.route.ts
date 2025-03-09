import { Hono } from "hono";
import * as submissionService from "./submission.service";

const route = new Hono();

route.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const submission = await submissionService.createSubmission(body);
    return c.json({ submission }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to create submission" }, 500);
  }
});

route.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const submission = await submissionService.getSubmissionById(id);

    if (!submission) {
      return c.json({ error: "Submission not found" }, 404);
    }

    return c.json({ submission }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch submission" }, 500);
  }
});

route.get("/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const submissions = await submissionService.getSubmissionsByUserId(userId);
    return c.json({ submissions }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch submissions" }, 500);
  }
});

route.get("/tryout/:tryoutId", async (c) => {
  try {
    const tryoutId = c.req.param("tryoutId");
    const submissions = await submissionService.getSubmissionsByTryoutId(
      tryoutId
    );
    return c.json({ submissions }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch submissions" }, 500);
  }
});

route.get("/tryout/user/:tryoutId/:userId", async (c) => {
  try {
    const tryoutId = c.req.param("tryoutId");
    const userId = c.req.param("userId");
    const submission =
      await submissionService.getSubmissionsByTryoutIdAndUserId(
        tryoutId,
        userId
      );
    return c.json({ submission }, 200);
  } catch (error) {
    return c.json({ error: "Failed to fetch submission" }, 500);
  }
});

route.put("/:id/submit", async (c) => {
  try {
    const id = c.req.param("id");
    const { answers } = await c.req.json();

    if (!answers || !Array.isArray(answers)) {
      return c.json({ error: "Answers must be provided as an array" }, 400);
    }

    const submission = await submissionService.submitAnswers(id, answers);
    return c.json({ submission }, 200);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to submit answers" }, 500);
  }
});

route.put("/finalize/:id/submit", async (c) => {
  try {
    const id = c.req.param("id");
    const submission = await submissionService.finalizeSubmission(id);

    return c.json({ submission }, 200);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Failed to finalize answers" }, 500);
  }
});

export default route;
