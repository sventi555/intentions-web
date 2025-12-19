import { collection, doc, QueryDocumentSnapshot } from 'firebase/firestore';
import {
  feedPostCollectionPath,
  Follow,
  followCollectionPath,
  followDocPath,
  FollowNotification,
  Intention,
  intentionCollectionPath,
  intentionDocPath,
  notificationCollectionPath,
  Post,
  postCollectionPath,
  User,
  userCollectionPath,
  userDocPath,
} from 'lib';
import { db } from '../firebase';

export type CollectionSort<T extends string> = {
  by: T;
  dir: 'asc' | 'desc';
};

const firestoreConverter = <T>() => ({
  toFirestore: (data: T) => data,
  fromFirestore: (snap: QueryDocumentSnapshot<T>) => snap.data(),
});

export const collections = {
  users: () =>
    collection(db, userCollectionPath()).withConverter(
      firestoreConverter<User>(),
    ),
  follows: (toUser: string) =>
    collection(db, followCollectionPath(toUser)).withConverter(
      firestoreConverter<Follow>(),
    ),
  intentions: () =>
    collection(db, intentionCollectionPath()).withConverter(
      firestoreConverter<Intention>(),
    ),
  posts: () =>
    collection(db, postCollectionPath()).withConverter(
      firestoreConverter<Post>(),
    ),
  feed: (userId: string) =>
    collection(db, feedPostCollectionPath(userId)).withConverter(
      firestoreConverter<Post>(),
    ),
  notifications: (userId: string) =>
    collection(db, notificationCollectionPath(userId)).withConverter(
      firestoreConverter<FollowNotification>(),
    ),
};

export const docs = {
  user: (userId: string) =>
    doc(db, userDocPath(userId)).withConverter(firestoreConverter<User>()),
  follow: (fromUserId: string, toUserId: string) =>
    doc(db, followDocPath(fromUserId, toUserId)).withConverter(
      firestoreConverter<Follow>(),
    ),
  intention: (intentionId: string) =>
    doc(db, intentionDocPath(intentionId)).withConverter(
      firestoreConverter<Intention>(),
    ),
};
