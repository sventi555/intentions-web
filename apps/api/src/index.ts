import 'dotenv/config';

import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import comments from './routes/comments';
import follows from './routes/follows';
import intentions from './routes/intentions';
import posts from './routes/posts';
import users from './routes/users';

const app = new OpenAPIHono();

app.use('/*', cors());

app.route('/follows', follows);
app.route('/intentions', intentions);
app.route('/posts', posts);
app.route('/users', users);
app.route('/comments', comments);

app.doc('/schema', {
  openapi: '3.0.0',
  info: { version: '1.0.0', title: 'Intentions API' },
});

const port = process.env.PORT;

export default {
  fetch: app.fetch,
  port,
};
