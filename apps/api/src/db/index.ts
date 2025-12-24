import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import {
  commentCollectionPath,
  feedPostCollectionPath,
  followFromCollectionPath,
  followToCollectionPath,
  intentionCollectionPath,
  notificationCollectionPath,
  postCollectionPath,
  userCollectionPath,
  type Comment,
  type Follow,
  type FollowNotification,
  type Intention,
  type Post,
  type User,
} from 'lib';
import { db } from '../config';

const firestoreConverter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot<T>) => snap.data(),
});

export const collections = {
  users: () =>
    db
      .collection(userCollectionPath())
      .withConverter(firestoreConverter<User>()),
  followsTo: (toUser: string) =>
    db
      .collection(followToCollectionPath(toUser))
      .withConverter(firestoreConverter<Follow>()),
  followsFrom: (fromUser: string) =>
    db
      .collection(followFromCollectionPath(fromUser))
      .withConverter(firestoreConverter<Follow>()),
  intentions: () =>
    db
      .collection(intentionCollectionPath())
      .withConverter(firestoreConverter<Intention>()),
  posts: () =>
    db
      .collection(postCollectionPath())
      .withConverter(firestoreConverter<Post>()),
  feed: (userId: string) =>
    db
      .collection(feedPostCollectionPath(userId))
      .withConverter(firestoreConverter<Post>()),
  notifications: (userId: string) =>
    db
      .collection(notificationCollectionPath(userId))
      .withConverter(firestoreConverter<FollowNotification>()),
  comments: () =>
    db
      .collection(commentCollectionPath())
      .withConverter(firestoreConverter<Comment>()),
};

export const bulkWriter = () => db.bulkWriter();
