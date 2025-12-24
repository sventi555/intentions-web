import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Add /follows/{fromUserId}/to/{toUserId} for every /follows/{toUserId}/from/{fromUserId}
 */

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const writeBatch = db.bulkWriter();

await db
  .collection('/users')
  .get()
  .then((users) =>
    Promise.all(
      users.docs.map((user) =>
        db
          .collection(`/follows/${user.id}/from`)
          .get()
          .then((follows) =>
            follows.forEach((follow) =>
              writeBatch.set(
                db.collection(`/follows/${follow.id}/to`).doc(user.id),
                follow.data(),
              ),
            ),
          ),
      ),
    ),
  );

await writeBatch.close();
