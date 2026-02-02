import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type Comment } from 'lib';
import { collections } from '../db';
import { authenticate } from '../middleware/auth';
import { createCommentBody, deleteCommentParams } from '../schemas/comments';
import {
  authHeaderSchema,
  errorSchema,
  unauthResponse,
} from '../schemas/shared';

const app = new OpenAPIHono();

const createCommentRoute = createRoute({
  operationId: 'createComment',
  method: 'post',
  path: '/',
  request: {
    headers: authHeaderSchema,
    body: { content: { 'application/json': { schema: createCommentBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    201: {
      description: 'Successfully created comment',
      content: { 'application/json': { schema: z.null() } },
    },
    401: unauthResponse,
    404: {
      description: 'Post does not exist',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(createCommentRoute, async (c) => {
  const requesterId = c.var.uid;
  const data = c.req.valid('json');

  // bail if post does not exist
  const postData = (await collections.posts().doc(data.postId).get()).data();
  if (!postData) {
    return c.json({ message: 'post does not exist' }, 404);
  }

  // bail if requester does not own or follow post
  const postOwner = postData.userId;
  if (postOwner !== requesterId) {
    const followDoc = collections.followsTo(postData.userId).doc(requesterId);
    const followData = (await followDoc.get()).data();

    if (followData == null || followData.status !== 'accepted') {
      return c.json({ message: 'post does not exist' }, 404);
    }
  }

  const userData = (await collections.users().doc(requesterId).get()).data();
  if (!userData) {
    throw new HTTPException(500);
  }

  const commentData: Comment = {
    postId: data.postId,
    userId: requesterId,
    user: {
      username: userData.username,
      ...(userData.image ? { image: userData.image } : {}),
    },
    body: data.body,
    createdAt: Date.now(),
  };
  await collections.comments().add(commentData);

  return c.json(null, 201);
});

const deleteCommentRoute = createRoute({
  operationId: 'deleteComment',
  method: 'delete',
  path: '/{id}',
  request: {
    headers: authHeaderSchema,
    params: deleteCommentParams,
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully deleted comment',
      content: { 'application/json': { schema: z.null() } },
    },
    401: unauthResponse,
  },
});

app.openapi(deleteCommentRoute, async (c) => {
  const requesterId = c.var.uid;
  const commentId = c.req.param('id');

  const commentDoc = collections.comments().doc(commentId);
  const commentData = (await commentDoc.get()).data();
  if (!commentData || commentData.userId !== requesterId) {
    return c.json(null, 200);
  }

  await commentDoc.delete();

  return c.json(null, 200);
});

export default app;
