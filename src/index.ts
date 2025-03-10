import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import tryout from "./tryout/tryout.route";
import user from "./user/user.route";
import question from "./question/question.route";
import submission from "./submission/submission.route";
import auth from "./auth/auth.route";
import {
  authMiddleware,
  blacklistCheckMiddleware,
} from "./auth/auth.middleware";
import { cors } from "hono/cors";

type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>();

app.use(
  cors({
    origin: "https://tryout-rizztek-zoys.vercel.app/",
    credentials: true,
  })
);

app.route("/", auth);

app.use("/api/*", blacklistCheckMiddleware);
app.use("/api/*", authMiddleware);

app.route("/api/tryout", tryout);
app.route("/api/user", user);
app.route("/api/question", question);
app.route("/api/submission", submission);

export default app;
