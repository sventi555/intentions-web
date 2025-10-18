import { collection, doc, QueryDocumentSnapshot } from 'firebase/firestore';
import { Follow, Intention, Notification, Post, User } from 'lib';
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
    collection(db, 'users').withConverter(firestoreConverter<User>()),
  follows: (toUser: string) =>
    collection(db, `follows/${toUser}/from`).withConverter(
      firestoreConverter<Follow>(),
    ),
  intentions: () =>
    collection(db, 'intentions').withConverter(firestoreConverter<Intention>()),
  posts: () =>
    collection(db, 'posts').withConverter(firestoreConverter<Post>()),
  feed: (userId: string) =>
    collection(db, `users/${userId}/feed`).withConverter(
      firestoreConverter<Post>(),
    ),
  notifications: (userId: string) =>
    collection(db, `users/${userId}/notifications`).withConverter(
      firestoreConverter<Notification>(),
    ),
};

export const docs = {
  user: (userId: string) =>
    doc(db, 'users', userId).withConverter(firestoreConverter<User>()),
  follow: (fromUserId: string, toUserId: string) =>
    doc(db, 'follows', `${toUserId}/from/${fromUserId}`).withConverter(
      firestoreConverter<Follow>(),
    ),
};
