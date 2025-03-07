import { Hono } from 'hono'
import tryout from './tryout/tryout.route'
import user from './user/user.route'
import question from './question/question.route'
import submission from './submission/submission.route'
import auth from './auth/auth.route'

const app = new Hono()

app.route('/auth', auth)
app.route('/auth/tryout', tryout)
app.route('/auth/user', user)
app.route('/auth/question', question)
app.route('/auth/submission', submission);

app.get("/", (c) => c.text("Hello World!"));

export default app
