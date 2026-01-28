import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Add usernameLower: string to each User
 */

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const writeBatch = db.bulkWriter();

await db
  .collection('users')
  .get()
  .then((users) =>
    users.docs.forEach((user) =>
      writeBatch.update(user.ref, {
        usernameLower: (user.data().username as string).toLowerCase(),
      }),
    ),
  );

await writeBatch.close();
