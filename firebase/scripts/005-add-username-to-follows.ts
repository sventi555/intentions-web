import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import type { User } from 'lib';

/**
 * Add user: {username: <username>} to all follow documents
 */

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const writeBatch = db.bulkWriter();

const updateFollow = (follow: QueryDocumentSnapshot) => {
  const followUser = db.collection('/users').doc(follow.id).get();

  return followUser.then((u) => {
    const userData = u.data() as User;
    writeBatch.update(follow.ref, {
      'user.username': userData.username,
    });
  });
};

await db
  .collection('/users')
  .get()
  .then((users) =>
    Promise.all([
      ...users.docs.map((user) =>
        db
          .collection(`/follows/${user.id}/from`)
          .get()
          .then((follows) =>
            Promise.all(follows.docs.map((follow) => updateFollow(follow))),
          ),
      ),
      ...users.docs.map((user) =>
        db
          .collection(`/follows/${user.id}/to`)
          .get()
          .then((follows) =>
            Promise.all(follows.docs.map((follow) => updateFollow(follow))),
          ),
      ),
    ]),
  );

await writeBatch.close();
