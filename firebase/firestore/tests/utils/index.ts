import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import {
  commentCollectionPath,
  feedPostCollectionPath,
  followDocPath,
  intentionCollectionPath,
  notificationCollectionPath,
  postCollectionPath,
} from 'lib';

export const addWithoutRules = async (
  testEnv: RulesTestEnvironment,
  collectionPath: string,
  data: any = {},
) => {
  let id = '';

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    const d = await addDoc(collection(db, collectionPath), data);
    id = d.id;
  });

  return id;
};

export const setWithoutRules = async (
  testEnv: RulesTestEnvironment,
  docPath: string,
  data: any,
) => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    const d = doc(db, docPath);
    await setDoc(d, data);
  });
};

export const addPostWithoutRules = async (
  testEnv: RulesTestEnvironment,
  userId: string,
) => addWithoutRules(testEnv, postCollectionPath(), { userId });

export const addFeedPostWithoutRules = async (
  testEnv: RulesTestEnvironment,
  userId: string,
) => addWithoutRules(testEnv, feedPostCollectionPath(userId), { userId });

export const addFollowWithoutRules = async (
  testEnv: RulesTestEnvironment,
  { from, to, status }: { from: string; to: string; status: string },
) => setWithoutRules(testEnv, followDocPath(from, to), { status });

export const addIntentionWithoutRules = async (
  testEnv: RulesTestEnvironment,
  userId: string,
) => addWithoutRules(testEnv, intentionCollectionPath(), { userId });

export const addNotificationWithoutRules = async (
  testEnv: RulesTestEnvironment,
  userId: string,
) => addWithoutRules(testEnv, notificationCollectionPath(userId));

export const addCommentWithoutRules = async (
  testEnv: RulesTestEnvironment,
  postId: string,
) => addWithoutRules(testEnv, commentCollectionPath(postId));
