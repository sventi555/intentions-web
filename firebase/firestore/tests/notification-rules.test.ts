import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { notificationDocPath } from 'lib';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const USER_IDS = {
  authUser: 'authUser',
  otherUser: 'otherUser',
};

const testUsers = {
  [USER_IDS.authUser]: { username: 'auth-user' },
  [USER_IDS.otherUser]: { username: 'other-user' },
};

const addNotificationWithoutRules = async (
  testEnv: RulesTestEnvironment,
  notification: { userId: string },
) => {
  let notificationId: string = '';

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    const notificationDoc = await addDoc(
      collection(db, `users/${notification.userId}/notifications`),
      notification,
    );
    notificationId = notificationDoc.id;
  });

  return notificationId;
};

describe('feed rules', () => {
  let testEnv: RulesTestEnvironment;

  let authContext: RulesTestContext;
  let unauthContext: RulesTestContext;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'intentions-test',
      firestore: {
        rules: fs.readFileSync(
          path.join(__dirname, '../firestore.rules'),
          'utf8',
        ),
        host: '127.0.0.1',
        port: 8080,
      },
    });

    authContext = testEnv.authenticatedContext(USER_IDS.authUser);
    unauthContext = testEnv.unauthenticatedContext();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      for (const userId in testUsers) {
        const userDoc = doc(db, 'users', userId);
        await setDoc(userDoc, testUsers[userId]);
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('read', () => {
    describe('when the requester owns the notification', () => {
      let notificationId: string = '';

      beforeEach(async () => {
        notificationId = await addNotificationWithoutRules(testEnv, {
          userId: USER_IDS.authUser,
        });
      });

      it('should allow reading', async () => {
        const db = authContext.firestore();

        const notificationDoc = doc(
          db,
          notificationDocPath(USER_IDS.authUser, notificationId),
        );
        await assertSucceeds(getDoc(notificationDoc));
      });
    });

    describe('when requester is not the owner', () => {
      let notificationId: string = '';
      const notificationUser = USER_IDS.otherUser;

      beforeEach(async () => {
        notificationId = await addNotificationWithoutRules(testEnv, {
          userId: notificationUser,
        });
      });

      it('should not allow reading as unauthenticated', async () => {
        const db = unauthContext.firestore();

        const notificationDoc = doc(
          db,
          notificationDocPath(notificationUser, notificationId),
        );
        await assertFails(getDoc(notificationDoc));
      });

      it('should not allow reading as non-owner user', async () => {
        const db = authContext.firestore();

        const notificationDoc = doc(
          db,
          notificationDocPath(notificationUser, notificationId),
        );
        await assertFails(getDoc(notificationDoc));
      });
    });
  });
});
