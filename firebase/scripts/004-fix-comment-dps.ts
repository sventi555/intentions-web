import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Comment, User } from 'lib';

/**
 * Set each comment's user.image to the user's current dp
 */

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const writeBatch = db.bulkWriter();

await db
  .collection('/comments')
  .get()
  .then((comments) =>
    Promise.all(
      comments.docs.map((comment) => {
        const commentData = comment.data() as Comment;
        const commentUser = db
          .collection('/users')
          .doc(commentData.userId)
          .get();

        return commentUser.then((u) => {
          const userData = u.data() as User;
          if (userData.image) {
            writeBatch.update(comment.ref, {
              'user.image': userData.image,
            });
          }
        });
      }),
    ),
  );

await writeBatch.close();
