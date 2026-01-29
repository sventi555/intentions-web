import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore, QuerySnapshot } from 'firebase-admin/firestore';
import { getDownloadURL, getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

/**
 * Convert Post image field to {src: string, width: number, height: number}
 */

export const splitDataUrl = (dataUrl: string) => {
  const commaIndex = dataUrl.indexOf(',');

  return [dataUrl.substring(0, commaIndex), dataUrl.substring(commaIndex + 1)];
};

export const getImageDimensions = async (buffer: ArrayBuffer) => {
  const metadata = await sharp(buffer).metadata();

  return { width: metadata.width, height: metadata.height };
};

const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = getFirestore(app);

const writeBatch = db.bulkWriter();

const updatePosts = async (posts: QuerySnapshot) => {
  return Promise.all(
    posts.docs.map(async (post) => {
      const image = post.data().image;

      if (image == null) {
        return;
      }

      const fileRef = getStorage()
        .bucket(process.env.FIREBASE_STORAGE_BUCKET)
        .file(image);
      const downloadURL = await getDownloadURL(fileRef);
      const imageBuffer = await fetch(downloadURL).then((res) =>
        res.arrayBuffer(),
      );
      const dimensions = await getImageDimensions(imageBuffer);

      writeBatch.update(post.ref, { image: { src: image, ...dimensions } });
    }),
  );
};

await db
  .collection('posts')
  .get()
  .then((posts) => updatePosts(posts));

await db
  .collection('users')
  .get()
  .then((users) =>
    Promise.all(
      users.docs.map((user) =>
        user.ref
          .collection('feed')
          .get()
          .then((posts) => updatePosts(posts)),
      ),
    ),
  );

await writeBatch.close();
