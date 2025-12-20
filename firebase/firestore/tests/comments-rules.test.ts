import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, setLogLevel } from 'firebase/firestore';
import { commentDocPath } from 'lib';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  addCommentWithoutRules,
  addFollowWithoutRules,
  addPostWithoutRules,
} from './utils';

setLogLevel('silent');

const USER_IDS = {
  authUser: 'authUser',
  otherUser: 'otherUser',
};

const testUsers = {
  [USER_IDS.authUser]: { username: 'booga' },
  [USER_IDS.otherUser]: { username: 'other-user' },
};

const STATUS = { accepted: 'accepted', pending: 'pending' };

describe('comment rules', () => {
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
    // ALLOWED
    describe('requester owns post', () => {
      let postId: string = '';
      let commentId: string = '';

      beforeEach(async () => {
        postId = await addPostWithoutRules(testEnv, USER_IDS.authUser);
        commentId = await addCommentWithoutRules(testEnv, postId);
      });

      it('should allow reading comment', async () => {
        const db = authContext.firestore();

        const commentDoc = doc(db, commentDocPath(postId, commentId));
        await assertSucceeds(getDoc(commentDoc));
      });
    });

    describe('requester follows post owner', () => {
      let postId: string;
      let commentId: string;

      beforeEach(async () => {
        postId = await addPostWithoutRules(testEnv, USER_IDS.otherUser);
        commentId = await addCommentWithoutRules(testEnv, postId);
        await addFollowWithoutRules(testEnv, {
          from: USER_IDS.authUser,
          to: USER_IDS.otherUser,
          status: STATUS.accepted,
        });
      });

      it('should allow reading comment', async () => {
        const db = authContext.firestore();

        const commentDoc = doc(db, commentDocPath(postId, commentId));
        await assertSucceeds(getDoc(commentDoc));
      });
    });

    // NOT ALLOWED
    describe('post owner is not auth user', () => {
      let postId: string;
      let commentId: string;

      beforeEach(async () => {
        postId = await addPostWithoutRules(testEnv, USER_IDS.otherUser);
        commentId = await addCommentWithoutRules(testEnv, postId);
      });

      it('should not allow reading comment without follow when authenticated', async () => {
        const db = authContext.firestore();

        const commentDoc = doc(db, commentDocPath(postId, commentId));
        await assertFails(getDoc(commentDoc));
      });

      it('should not allow reading comment without follow when unauthenticated', async () => {
        const db = unauthContext.firestore();

        const commentDoc = doc(db, commentDocPath(postId, commentId));
        await assertFails(getDoc(commentDoc));
      });
    });

    describe("owner follows me, but I don't follow them", () => {
      let postId: string;
      let commentId: string;

      beforeEach(async () => {
        postId = await addPostWithoutRules(testEnv, USER_IDS.otherUser);
        commentId = await addCommentWithoutRules(testEnv, postId);
        await addFollowWithoutRules(testEnv, {
          from: USER_IDS.otherUser,
          to: USER_IDS.authUser,
          status: STATUS.accepted,
        });
      });

      it('should not allow reading comment', async () => {
        const db = authContext.firestore();

        const commentDoc = doc(db, commentDocPath(postId, commentId));
        await assertFails(getDoc(commentDoc));
      });
    });
  });
});
