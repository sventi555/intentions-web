import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import {
  removeFollowBody,
  respondToFollowBody,
  type Follow,
  type FollowNotification,
  type FollowUserResponse,
} from 'lib';
import { bulkWriter, collections } from '../db';
import { authenticate } from '../middleware/auth';

const app = new Hono();

app.post('/:userId', authenticate, async (c) => {
  const requesterId = c.var.uid;
  const followedUserId = c.req.param('userId');

  // check for pre-existing follow
  const followToDoc = collections.followsTo(followedUserId).doc(requesterId);
  const followToDocResource = await followToDoc.get();
  if (followToDocResource.exists) {
    return;
  }

  // get recipient data
  const recipient = await collections.users().doc(followedUserId).get();
  const recipientData = recipient.data();
  if (!recipientData) {
    throw new HTTPException(404, { message: 'user does not exist' });
  }

  // get requester info for embedding in follow
  const requester = (await collections.users().doc(requesterId).get()).data();
  if (!requester) {
    throw new HTTPException(500);
  }
  const { username, image } = requester;

  const writeBatch = bulkWriter();

  // create follow
  const followData: Follow = {
    status: 'pending',
  };
  writeBatch.create(followToDoc, followData);
  writeBatch.create(
    collections.followsFrom(requesterId).doc(followedUserId),
    followData,
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
    collections.notifications(followedUserId).doc(crypto.randomUUID()),
    followNotification,
  );

  await writeBatch.close();

  return c.json<FollowUserResponse>({ status: followData.status }, 201);
});

app.post(
  '/respond/:userId',
  authenticate,
  zValidator('json', respondToFollowBody),
  async (c) => {
    const requesterId = c.var.uid;
    const fromUserId = c.req.param('userId');
    const { action } = c.req.valid('json');

    const followToDoc = collections.followsTo(requesterId).doc(fromUserId);
    const followData = (await followToDoc.get()).data();
    if (!followData) {
      throw new HTTPException(404, {
        message: 'no follow request from user',
      });
    }

    // bail out early if request has already been accepted
    if (followData.status === 'accepted') {
      if (action === 'decline') {
        throw new HTTPException(412, {
          message:
            "cannot decline a request that's already accepted - delete it instead",
        });
      }

      return c.body(null, 200);
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
      if (requesterData != null) {
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
      }

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

    return c.body(null, 200);
  },
);

app.delete(
  '/:userId',
  authenticate,
  zValidator('json', removeFollowBody),
  async (c) => {
    const requesterId = c.var.uid;
    const userId = c.req.param('userId');
    const { direction } = c.req.valid('json');

    if (userId === requesterId) {
      throw new HTTPException(400, {
        message: 'cannot unfollow yourself',
      });
    }

    const fromUserId = direction === 'from' ? userId : requesterId;
    const toUserId = direction === 'from' ? requesterId : userId;

    const followToDoc = collections.followsTo(toUserId).doc(fromUserId);
    const followData = (await followToDoc.get()).data();

    if (followData == null) {
      return c.body(null, 204);
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

    return c.body(null, 204);
  },
);

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
