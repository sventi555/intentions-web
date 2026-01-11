import { collection, doc, QueryDocumentSnapshot } from 'firebase/firestore';
import {
  Comment,
  commentCollectionPath,
  feedPostCollectionPath,
  Follow,
  followFromCollectionPath,
  FollowNotification,
  followToCollectionPath,
  followToDocPath,
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
  followsTo: (toUser: string) =>
    collection(db, followToCollectionPath(toUser)).withConverter(
      firestoreConverter<Follow>(),
    ),
  followsFrom: (fromUser: string) =>
    collection(db, followFromCollectionPath(fromUser)).withConverter(
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
  comments: () =>
    collection(db, commentCollectionPath()).withConverter(
      firestoreConverter<Comment>(),
    ),
};

export const docs = {
  user: (userId: string) =>
    doc(db, userDocPath(userId)).withConverter(firestoreConverter<User>()),
  follow: (fromUserId: string, toUserId: string) =>
    doc(db, followToDocPath(fromUserId, toUserId)).withConverter(
      firestoreConverter<Follow>(),
    ),
  intention: (intentionId: string) =>
    doc(db, intentionDocPath(intentionId)).withConverter(
      firestoreConverter<Intention>(),
    ),
};
