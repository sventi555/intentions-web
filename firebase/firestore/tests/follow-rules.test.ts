import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, setLogLevel } from 'firebase/firestore';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

setLogLevel('silent');

const USER_IDS = {
  authUser: 'authUser',
  privateUser: 'privateUser',
  otherPrivateUser: 'otherPrivateUser',
  publicUser: 'publicUser',
  otherPublicUser: 'otherPublicUser',
};

const testUsers = {
  [USER_IDS.authUser]: { username: 'booga', private: true },
  [USER_IDS.privateUser]: { username: 'private-user', private: true },
  [USER_IDS.otherPrivateUser]: {
    username: 'other-private-user',
    private: true,
  },
  [USER_IDS.publicUser]: { username: 'public-user', private: false },
  [USER_IDS.otherPublicUser]: {
    username: 'other-public-user',
    private: false,
  },
};

const STATUS = { accepted: 'accepted', pending: 'pending' };

const followDocPath = (fromId: string, toId: string) =>
  `follows/${toId}/from/${fromId}`;

const addFollowWithoutRules = async (
  testEnv: RulesTestEnvironment,
  { from, to, status }: { from: string; to: string; status: string },
) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    const followDoc = doc(db, followDocPath(from, to));
    await setDoc(followDoc, { status });
  });
};

describe('follow rules', () => {
  let testEnv: RulesTestEnvironment;

  let authContext: RulesTestContext;

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
    // ALLOWED
    describe.each([
      {
        from: USER_IDS.authUser,
        to: USER_IDS.privateUser,
        status: STATUS.pending,
      },
      {
        from: USER_IDS.authUser,
        to: USER_IDS.privateUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.privateUser,
        to: USER_IDS.authUser,
        status: STATUS.pending,
      },
      {
        from: USER_IDS.privateUser,
        to: USER_IDS.authUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.authUser,
        to: USER_IDS.publicUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.publicUser,
        to: USER_IDS.authUser,
        status: STATUS.pending,
      },
      {
        from: USER_IDS.publicUser,
        to: USER_IDS.authUser,
        status: STATUS.accepted,
      },
    ])('includes requester: follow %o', ({ from, to, status }) => {
      beforeEach(async () => {
        await addFollowWithoutRules(testEnv, { from, to, status });
      });

      it('should allow reading', async () => {
        const db = authContext.firestore();

        const followDoc = doc(db, followDocPath(from, to));
        await assertSucceeds(getDoc(followDoc));
      });
    });

    describe.each([
      {
        from: USER_IDS.publicUser,
        to: USER_IDS.privateUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.privateUser,
        to: USER_IDS.publicUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.publicUser,
        to: USER_IDS.otherPublicUser,
        status: STATUS.accepted,
      },
    ])(
      'includes someone public and is accepted: follow %o',
      ({ from, to, status }) => {
        beforeEach(async () => {
          await addFollowWithoutRules(testEnv, { from, to, status });
        });

        it('should allow reading', async () => {
          const db = authContext.firestore();

          const followDoc = doc(db, followDocPath(from, to));
          await assertSucceeds(getDoc(followDoc));
        });
      },
    );

    describe.each([
      {
        from: USER_IDS.privateUser,
        to: USER_IDS.otherPrivateUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.otherPrivateUser,
        to: USER_IDS.privateUser,
        status: STATUS.accepted,
      },
    ])(
      "includes someone I'm following and is accepted: follow %o",
      ({ from, to, status }) => {
        beforeEach(async () => {
          await addFollowWithoutRules(testEnv, { from, to, status });
          await addFollowWithoutRules(testEnv, {
            from: USER_IDS.authUser,
            to: USER_IDS.privateUser,
            status: STATUS.accepted,
          });
        });

        it('should allow reading', async () => {
          const db = authContext.firestore();

          const followDoc = doc(db, followDocPath(from, to));
          await assertSucceeds(getDoc(followDoc));
        });
      },
    );

    // NOT ALLOWED
    describe.each([
      {
        from: USER_IDS.privateUser,
        to: USER_IDS.otherPrivateUser,
        status: STATUS.accepted,
      },
      {
        from: USER_IDS.otherPrivateUser,
        to: USER_IDS.privateUser,
        status: STATUS.accepted,
      },
    ])(
      "includes someone that follows me, but I don't follow them, and is accepted: follow %o",
      ({ from, to, status }) => {
        beforeEach(async () => {
          await addFollowWithoutRules(testEnv, { from, to, status });
          await addFollowWithoutRules(testEnv, {
            from: USER_IDS.privateUser,
            to: USER_IDS.authUser,
            status: STATUS.accepted,
          });
        });

        it('should not allow reading', async () => {
          const db = authContext.firestore();

          const followDoc = doc(db, followDocPath(from, to));
          await assertFails(getDoc(followDoc));
        });
      },
    );

    describe.each([
      {
        from: USER_IDS.publicUser,
        to: USER_IDS.privateUser,
        status: STATUS.pending,
      },
      {
        from: USER_IDS.privateUser,
        to: USER_IDS.otherPrivateUser,
        status: STATUS.pending,
      },
    ])(
      'is pending and does not include requester: follow %o',
      ({ from, to, status }) => {
        beforeEach(async () => {
          await addFollowWithoutRules(testEnv, { from, to, status });
        });

        it('should not allow reading', async () => {
          const db = authContext.firestore();

          const followDoc = doc(db, followDocPath(from, to));
          await assertFails(getDoc(followDoc));
        });
      },
    );

    describe('includes only private non-friends', () => {
      const { from, to, status } = {
        from: USER_IDS.privateUser,
        to: USER_IDS.otherPrivateUser,
        status: STATUS.accepted,
      };

      beforeEach(async () => {
        await addFollowWithoutRules(testEnv, { from, to, status });
      });

      it('should not allow reading', async () => {
        const db = authContext.firestore();

        const followDoc = doc(db, followDocPath(from, to));
        await assertFails(getDoc(followDoc));
      });
    });
  });
});
