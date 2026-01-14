import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { FirebaseAuthError, UserRecord } from 'firebase-admin/auth';
import { HTTPException } from 'hono/http-exception';
import type { Follow } from 'lib';
import { auth } from '../config';
import { bulkWriter, collections } from '../db';
import { embeddedUserCopies } from '../db/denorm';
import { authenticate } from '../middleware/auth';
import { authHeaderSchema, errorSchema } from '../schemas/shared';
import { createUserBody, updateUserImageBody } from '../schemas/users';
import { uploadMedia } from '../storage';

const app = new OpenAPIHono();

const createUserRoute = createRoute({
  operationId: 'createUser',
  method: 'post',
  path: '/',
  request: {
    body: { content: { 'application/json': { schema: createUserBody } } },
  },
  responses: {
    201: {
      description: 'Successfully created user',
      content: { 'application/json': { schema: z.null({}) } },
    },
    400: {
      description: 'Invalid email or password',
      content: { 'application/json': { schema: errorSchema } },
    },
    409: {
      description: 'Email/username already taken',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(createUserRoute, async (c) => {
  const { username, email, password } = c.req.valid('json');

  const existingUsername =
    (await collections.users().where('username', '==', username).get()).size >
    0;
  if (existingUsername) {
    return c.json({ message: 'username already taken' }, 409);
  }

  let user: UserRecord;
  try {
    user = await auth.createUser({ email, password });
  } catch (err) {
    const authError = err as FirebaseAuthError;
    switch (authError.code) {
      case 'auth/email-already-exists':
        return c.json({ message: 'email already taken' }, 409);
      case 'auth/invalid-email':
        return c.json({ message: 'invalid email' }, 400);
      case 'auth/invalid-password':
        return c.json({ message: 'invalid password' }, 400);
      default:
        throw new HTTPException(500);
    }
  }

  const writeBatch = bulkWriter();

  const userDoc = collections.users().doc(user.uid);
  writeBatch.create(userDoc, { email, username });

  // follow self to simplify permission checks and feed mechanics
  const followToDoc = collections.followsTo(user.uid).doc(user.uid);
  const followFromDoc = collections.followsFrom(user.uid).doc(user.uid);
  const followData: Follow = { status: 'accepted', user: { username } };
  writeBatch.create(followToDoc, followData);
  writeBatch.create(followFromDoc, followData);

  await writeBatch.close();

  return c.json(null, 201);
});

const updateUserImageRoute = createRoute({
  operationId: 'updateUserImage',
  method: 'patch',
  path: '/image',
  request: {
    headers: authHeaderSchema,
    body: { content: { 'application/json': { schema: updateUserImageBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully updated user image',
      content: { 'application/json': { schema: z.null() } },
    },
  },
});

app.openapi(updateUserImageRoute, async (c) => {
  const { image } = c.req.valid('json');
  const requesterId = c.var.uid;

  const imageFileName = await uploadMedia(`dps/${requesterId}`, image, {
    size: 128,
    validTypes: ['image'],
  });

  const writeBatch = bulkWriter();

  const userDoc = collections.users().doc(requesterId);
  writeBatch.update(userDoc, { image: imageFileName });

  const updatedData = { 'user.image': imageFileName };

  const embeddedUserDocs = await embeddedUserCopies(requesterId);
  embeddedUserDocs.forEach((doc) => writeBatch.update(doc, updatedData));

  await writeBatch.close();

  return c.json(null, 200);
});

const clearNotifAlertRoute = createRoute({
  operationId: 'clearNotifAlert',
  method: 'delete',
  path: '/notif-alert',
  request: {
    headers: authHeaderSchema,
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully cleared notification alert',
      content: { 'application/json': { schema: z.null() } },
    },
  },
});

app.openapi(clearNotifAlertRoute, async (c) => {
  const requesterId = c.var.uid;

  await collections.users().doc(requesterId).update({ unreadNotifs: false });

  return c.json(null, 200);
});

export default app;
