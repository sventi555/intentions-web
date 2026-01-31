import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type Post } from 'lib';
import { bulkWriter, collections } from '../db';
import { postDocCopies } from '../db/denorm';
import { storage } from '../firebase';
import { authenticate } from '../middleware/auth';
import {
  createPostBody,
  deletePostParams,
  updatePostBody,
  updatePostParams,
} from '../schemas/posts';
import { authHeaderSchema, errorSchema } from '../schemas/shared';
import { uploadMedia } from '../storage';
import { getImageDimensions } from '../utils/image';

const app = new OpenAPIHono();

const createPostRoute = createRoute({
  operationId: 'createPost',
  method: 'post',
  path: '/',
  request: {
    headers: authHeaderSchema,
    body: { content: { 'application/json': { schema: createPostBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    201: {
      description: 'Successfully created post',
      content: { 'application/json': { schema: z.null() } },
    },
    404: {
      description: 'Intention does not exist',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(createPostRoute, async (c) => {
  const requesterId = c.var.uid;
  const data = c.req.valid('json');

  // need to get the intention and the user object to embed within the post data
  const intentionDoc = collections.intentions().doc(data.intentionId);
  const intentionData = (await intentionDoc.get()).data();
  if (!intentionData || intentionData.userId !== requesterId) {
    return c.json({ message: 'intention does not exist' }, 404);
  }

  const user = await collections.users().doc(requesterId).get();
  const userData = user.data();
  if (!userData) {
    throw new HTTPException(500);
  }

  let image: Post['image'] = undefined;
  if (data.image) {
    image = {
      src: await uploadMedia(`posts/${requesterId}`, data.image, {
        size: 640,
      }),
      ...(await getImageDimensions(data.image)),
    };
  }

  const postData: Post = {
    userId: requesterId,
    user: {
      username: userData.username,
      ...(userData.image ? { image: userData.image } : {}),
    },
    intentionId: data.intentionId,
    intention: { name: intentionData.name },
    createdAt: Date.now(),
    ...(data.description ? { description: data.description } : {}),
    ...(image ? { image } : {}),
  };

  const writeBatch = bulkWriter();

  const postId = crypto.randomUUID();
  const postDocs = await postDocCopies(postId, requesterId);
  postDocs.forEach((doc) => writeBatch.create(doc, postData));

  writeBatch.update(intentionDoc, {
    updatedAt: Date.now(),
    postCount: intentionData.postCount + 1,
  });

  await writeBatch.close();

  return c.json(null, 201);
});

const updatePostRoute = createRoute({
  operationId: 'updatePost',
  method: 'patch',
  path: '/{id}',
  request: {
    headers: authHeaderSchema,
    params: updatePostParams,
    body: { content: { 'application/json': { schema: updatePostBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully updated post',
      content: { 'application/json': { schema: z.null() } },
    },
    404: {
      description: 'Post does not exist',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(updatePostRoute, async (c) => {
  const requesterId = c.var.uid;
  const postId = c.req.param('id');
  const updatedData = c.req.valid('json');

  const postData = (await collections.posts().doc(postId).get()).data();
  if (!postData || postData.userId !== requesterId) {
    return c.json({ message: 'post does not exist' }, 404);
  }

  const writeBatch = bulkWriter();

  const postDocs = await postDocCopies(postId, requesterId);
  postDocs.forEach((doc) => writeBatch.update(doc, updatedData));

  await writeBatch.close();

  return c.json(null, 200);
});

const deletePostRoute = createRoute({
  operationId: 'deletePost',
  method: 'delete',
  path: '/{id}',
  request: {
    headers: authHeaderSchema,
    params: deletePostParams,
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully deleted post',
      content: { 'application/json': { schema: z.null() } },
    },
  },
});

app.openapi(deletePostRoute, async (c) => {
  const requesterId = c.var.uid;
  const postId = c.req.param('id');

  const postData = (await collections.posts().doc(postId).get()).data();
  if (!postData || postData.userId !== requesterId) {
    return c.json(null, 200);
  }

  const writeBatch = bulkWriter();

  const postDocs = await postDocCopies(postId, requesterId);
  postDocs.forEach((doc) => writeBatch.delete(doc));

  const intentionDoc = collections.intentions().doc(postData.intentionId);
  const intentionData = (await intentionDoc.get()).data();
  if (intentionData) {
    writeBatch.update(intentionDoc, { postCount: intentionData.postCount - 1 });
  }

  const comments = await collections
    .comments()
    .where('postId', '==', postId)
    .get();
  comments.forEach((comment) => writeBatch.delete(comment.ref));

  await writeBatch.close();

  if (postData.image) {
    await storage.bucket().file(postData.image.src).delete();
  }

  return c.json(null, 200);
});

export default app;
