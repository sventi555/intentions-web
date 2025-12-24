import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Move comments from /posts/:postId/comments/:commentId to /comments/:commentId with {postId} in data
 */

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const writeBatch = db.bulkWriter();

await db
  .collection('/posts')
  .get()
  .then((posts) =>
    Promise.all(
      posts.docs.map((post) =>
        db
          .collection(`/posts/${post.id}/comments`)
          .get()
          .then((comments) =>
            comments.forEach((comment) => {
              const newCommentDoc = db.collection('/comments').doc(comment.id);
              writeBatch.set(newCommentDoc, {
                ...comment.data(),
                postId: post.id,
              });
            }),
          ),
      ),
    ),
  );

await writeBatch.close();
