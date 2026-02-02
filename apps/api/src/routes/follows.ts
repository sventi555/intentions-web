import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { HTTPException } from 'hono/http-exception';
import { type Follow, type FollowNotification } from 'lib';
import { bulkWriter, collections } from '../db';
import { authenticate } from '../middleware/auth';
import {
  followUserParams,
  removeFollowBody,
  removeFollowParams,
  respondToFollowBody,
  respondToFollowParams,
} from '../schemas/follows';
import {
  authHeaderSchema,
  errorSchema,
  unauthResponse,
} from '../schemas/shared';

const app = new OpenAPIHono();

const followUserRoute = createRoute({
  operationId: 'followUser',
  method: 'post',
  path: '/{userId}',
  request: {
    headers: authHeaderSchema,
    params: followUserParams,
  },
  middleware: [authenticate] as const,
  responses: {
    201: {
      description: 'Successfully requested to follow user',
      content: { 'application/json': { schema: z.null() } },
    },
    401: unauthResponse,
    404: {
      description: 'User does not exist',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(followUserRoute, async (c) => {
  const requesterId = c.var.uid;
  const recipientId = c.req.param('userId');

  // check for pre-existing follow
  const followToDoc = collections.followsTo(recipientId).doc(requesterId);
  const existingFollowData = (await followToDoc.get()).data();
  if (existingFollowData) {
    return c.json(null, 201);
  }

  // get recipient data
  const recipientDoc = collections.users().doc(recipientId);
  const recipientData = (await recipientDoc.get()).data();
  if (!recipientData) {
    return c.json({ message: 'user does not exist' }, 404);
  }

  // get requester info for embedding in follow
  const requesterData = (
    await collections.users().doc(requesterId).get()
  ).data();
  if (!requesterData) {
    throw new HTTPException(500);
  }
  const { username, image } = requesterData;

  const writeBatch = bulkWriter();

  // create follow
  const followData = {
    status: 'pending',
  } as const;

  const followToData: Follow = {
    ...followData,
    user: { username: recipientData.username },
  };
  const followFromData: Follow = {
    ...followData,
    user: { username: requesterData.username },
  };

  writeBatch.create(followToDoc, followToData);
  writeBatch.create(
    collections.followsFrom(requesterId).doc(recipientId),
    followFromData,
  );

  // send notification so recipient can respond to follow request
  const followNotification: FollowNotification = {
    userId: requesterId,
    user: {
      username,
      ...(image ? { image } : {}),
    },
    kind: 'request',
    status: 'pending',
    createdAt: Date.now(),
  };
  writeBatch.create(
    collections.notifications(recipientId).doc(crypto.randomUUID()),
    followNotification,
  );
  writeBatch.update(recipientDoc, { unreadNotifs: true });

  await writeBatch.close();

  return c.json(null, 201);
});

const respondToFollowRoute = createRoute({
  operationId: 'respondToFollow',
  method: 'post',
  path: '/respond/{userId}',
  request: {
    headers: authHeaderSchema,
    params: respondToFollowParams,
    body: { content: { 'application/json': { schema: respondToFollowBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully responded to user follow request',
      content: { 'application/json': { schema: z.null() } },
    },
    401: unauthResponse,
    404: {
      description: 'No follow request from user',
      content: { 'application/json': { schema: errorSchema } },
    },
    412: {
      description: 'Cannot decline accepted request',
      content: { 'application/json': { schema: errorSchema } },
    },
  },
});

app.openapi(respondToFollowRoute, async (c) => {
  const requesterId = c.var.uid;
  const fromUserId = c.req.param('userId');
  const { action } = c.req.valid('json');

  const followToDoc = collections.followsTo(requesterId).doc(fromUserId);
  const followData = (await followToDoc.get()).data();
  if (!followData) {
    return c.json({ message: 'no follow request from user' }, 404);
  }

  // bail out early if request has already been accepted
  if (followData.status === 'accepted') {
    if (action === 'decline') {
      return c.json(
        {
          message:
            "cannot decline a request that's already accepted - delete it instead",
        },
        412,
      );
    }

    return c.json(null, 200);
  }

  const writeBatch = bulkWriter();

  const requesterNotification = await getLatestRequestNotification({
    fromUserId,
    toUserId: requesterId,
  });

  if (action === 'accept') {
    writeBatch.update(followToDoc, { status: 'accepted' });
    writeBatch.update(collections.followsFrom(fromUserId).doc(requesterId), {
      status: 'accepted',
    });

    if (requesterNotification) {
      writeBatch.update(requesterNotification.ref, {
        status: 'accepted',
      });
    }

    const requesterData = (
      await collections.users().doc(requesterId).get()
    ).data();

    if (requesterData == null) {
      throw new HTTPException(500);
    }

    writeBatch.create(
      collections.notifications(fromUserId).doc(crypto.randomUUID()),
      {
        userId: requesterId,
        user: {
          username: requesterData.username,
          ...(requesterData.image ? { image: requesterData.image } : {}),
        },
        kind: 'response',
        status: 'accepted',
        createdAt: Date.now(),
      },
    );
    writeBatch.update(collections.users().doc(fromUserId), {
      unreadNotifs: true,
    });

    const followedPosts = await collections
      .posts()
      .where('userId', '==', requesterId)
      .get();

    followedPosts.forEach((post) => {
      const feedPostDoc = collections.feed(fromUserId).doc(post.id);
      writeBatch.create(feedPostDoc, post.data());
    });
  } else {
    writeBatch.delete(followToDoc);
    if (requesterNotification) {
      writeBatch.delete(requesterNotification.ref);
    }
  }

  await writeBatch.close();

  return c.json(null, 200);
});

const removeFollowRoute = createRoute({
  operationId: 'removeFollow',
  method: 'delete',
  path: '/{userId}',
  request: {
    headers: authHeaderSchema,
    params: removeFollowParams,
    body: { content: { 'application/json': { schema: removeFollowBody } } },
  },
  middleware: [authenticate] as const,
  responses: {
    200: {
      description: 'Successfully removed follow',
      content: { 'application/json': { schema: z.null() } },
    },
    400: {
      description: 'Cannot unfollow yourself',
      content: { 'application/json': { schema: errorSchema } },
    },
    401: unauthResponse,
  },
});

app.openapi(removeFollowRoute, async (c) => {
  const requesterId = c.var.uid;
  const userId = c.req.param('userId');
  const { direction } = c.req.valid('json');

  if (userId === requesterId) {
    return c.json(
      {
        message: 'cannot unfollow yourself',
      },
      400,
    );
  }

  const fromUserId = direction === 'from' ? userId : requesterId;
  const toUserId = direction === 'from' ? requesterId : userId;

  const followToDoc = collections.followsTo(toUserId).doc(fromUserId);
  const followData = (await followToDoc.get()).data();

  if (followData == null) {
    return c.json(null, 200);
  }

  const writeBatch = bulkWriter();

  writeBatch.delete(followToDoc);
  writeBatch.delete(collections.followsFrom(fromUserId).doc(toUserId));

  const followedPosts = await collections
    .feed(fromUserId)
    .where('userId', '==', toUserId)
    .get();

  followedPosts.forEach((post) => {
    writeBatch.delete(post.ref);
  });

  // if the follow is pending, remove the toUserId notification
  if (followData.status === 'pending') {
    const recipientNotification = await getLatestRequestNotification({
      fromUserId,
      toUserId,
    });
    if (recipientNotification != null) {
      writeBatch.delete(recipientNotification.ref);
    }
  }

  await writeBatch.close();

  return c.json(null, 200);
});

const getLatestRequestNotification = async ({
  fromUserId,
  toUserId,
}: {
  fromUserId: string;
  toUserId: string;
}) => {
  const notifications = await collections
    .notifications(toUserId)
    .where('userId', '==', fromUserId)
    .where('kind', '==', 'request')
    .orderBy('createdAt', 'desc')
    .get();
  const notification = notifications.empty ? null : notifications.docs[0];

  return notification;
};

export default app;
