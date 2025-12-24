import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const userIds = (await db.collection('/users').get()).docs.map((d) => d.id);

const writeBatch = db.bulkWriter();

await Promise.all(
  userIds.map((userId) =>
    db
      .collection(`/follows/${userId}/from`)
      .get()
      .then((follows) =>
        follows.docs.map((follow) =>
          writeBatch.set(
            db.collection(`/follows/${follow.id}/to`).doc(userId),
            follow.data(),
          ),
        ),
      ),
  ),
);

await writeBatch.close();
