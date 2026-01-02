import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import type { FirebaseAuthError, UserRecord } from 'firebase-admin/auth';
import { HTTPException } from 'hono/http-exception';
import { auth } from '../config';
import { bulkWriter, collections } from '../db';
import { userPostDocCopies } from '../db/denorm';
import { authenticate } from '../middleware/auth';
import { authHeaderSchema, errorSchema } from '../schemas/shared';
import { createUserBody, updateUserBody } from '../schemas/users';
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
  writeBatch.create(followToDoc, { status: 'accepted' });
  writeBatch.create(followFromDoc, { status: 'accepted' });

  await writeBatch.close();

  return c.json(null, 201);
});

const updateUserRoute = createRoute({
  operationId: 'updateUser',
  method: 'patch',
  path: '/',
  request: {
    headers: authHeaderSchema,
    body: { content: { 'application/json': { schema: updateUserBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully updated user',
      content: { 'application/json': { schema: z.null() } },
    },
  },
});

app.openapi(updateUserRoute, async (c) => {
  const { image } = c.req.valid('json');
  const requesterId = c.var.uid;

  let imageFileName: string | undefined = undefined;
  if (image) {
    imageFileName = await uploadMedia(`dps/${requesterId}`, image, {
      size: 128,
      validTypes: ['image'],
    });
  }

  const writeBatch = bulkWriter();

  const userDoc = collections.users().doc(requesterId);
  writeBatch.update(userDoc, {
    ...(imageFileName ? { image: imageFileName } : {}),
  });

  const updatedData = {
    ...(imageFileName ? { 'user.image': imageFileName } : {}),
  };

  const postDocs = await userPostDocCopies(requesterId);
  postDocs.forEach((doc) => writeBatch.update(doc, updatedData));

  const followers = (await collections.followsTo(requesterId).get()).docs;
  const following = (await collections.followsFrom(requesterId).get()).docs;

  await Promise.all(
    [...followers, ...following].map((follower) =>
      collections
        .notifications(follower.id)
        .where('userId', '==', requesterId)
        .get()
        .then((followerNotifications) =>
          followerNotifications.forEach((notification) => {
            writeBatch.update(notification.ref, updatedData);
          }),
        ),
    ),
  );

  const comments = await collections
    .comments()
    .where('userId', '==', requesterId)
    .get();
  comments.forEach((doc) => writeBatch.update(doc.ref, updatedData));

  await writeBatch.close();

  return c.json(null, 200);
});

export default app;
