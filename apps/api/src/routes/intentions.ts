import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { collections } from '../db';
import { authenticate } from '../middleware/auth';
import { createIntentionBody } from '../schemas/intentions';
import { authHeaderSchema, errorSchema } from '../schemas/shared';

const app = new OpenAPIHono();

const createIntentionRoute = createRoute({
  operationId: 'createIntention',
  method: 'post',
  path: '/',
  request: {
    headers: authHeaderSchema,
    body: { content: { 'application/json': { schema: createIntentionBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    201: {
      description: 'Successfully created intention',
      content: { 'application/json': { schema: z.null() } },
    },
    409: {
      description: 'Intention already exists',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(createIntentionRoute, async (c) => {
  const requesterId = c.var.uid;
  const { name } = c.req.valid('json');

  const existingIntention =
    (
      await collections
        .intentions()
        .where('userId', '==', requesterId)
        .where('name', '==', name)
        .get()
    ).size > 0;

  if (existingIntention) {
    return c.json({ message: 'intention with same name already exists' }, 409);
  }

  const user = await collections.users().doc(requesterId).get();
  const userData = user.data();
  if (!userData) {
    throw new HTTPException(500);
  }

  const now = Date.now();
  await collections.intentions().add({
    userId: requesterId,
    user: { username: userData.username },
    name,
    createdAt: now,
    updatedAt: now,
    postCount: 0,
  });

  return c.json(null, 201);
});

export default app;
