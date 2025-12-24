import 'dotenv/config';

import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { FollowNotification, User } from 'lib';

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
  .then((user) =>
    Promise.all(
      user.docs.map((u) =>
        u.ref
          .collection('/notifications')
          .get()
          .then((notifs) =>
            Promise.all(
              notifs.docs.map((notif) => {
                const notifData = notif.data() as FollowNotification;
                const notifUser = db
                  .collection('/users')
                  .doc(notifData.userId)
                  .get();

                return notifUser.then((u) => {
                  const userData = u.data() as User;
                  if (userData.image) {
                    writeBatch.update(notif.ref, {
                      'user.image': userData.image,
                    });
                  }
                });
              }),
            ),
          ),
      ),
    ),
  );

await writeBatch.close();
