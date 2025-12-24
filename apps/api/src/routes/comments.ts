import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createCommentBody, type Comment } from 'lib';
import { collections } from '../db';
import { authenticate } from '../middleware/auth';

const app = new Hono();

app.post(
  '/',
  authenticate,
  zValidator('json', createCommentBody),
  async (c) => {
    const requesterId = c.var.uid;
    const data = c.req.valid('json');

    // bail if post does not exist
    const postData = (await collections.posts().doc(data.postId).get()).data();
    if (!postData) {
      throw new HTTPException(404, { message: 'post does not exist' });
    }

    // bail if requester does not own or follow post
    const postOwner = postData.userId;
    if (postOwner !== requesterId) {
      const followDoc = collections.followsTo(postData.userId).doc(requesterId);
      const followData = (await followDoc.get()).data();

      if (followData == null || followData.status !== 'accepted') {
        throw new HTTPException(404, { message: 'post does not exist' });
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

    return c.body(null, 201);
  },
);

app.delete('/:id', authenticate, async (c) => {
  const requesterId = c.var.uid;
  const commentId = c.req.param('id');

  const commentDoc = collections.comments().doc(commentId);
  const commentData = (await commentDoc.get()).data();
  if (!commentData || commentData.userId !== requesterId) {
    return c.body(null, 204);
  }

  await commentDoc.delete();

  return c.body(null, 204);
});

export default app;
