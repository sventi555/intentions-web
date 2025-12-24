export const userCollectionPath = () => '/users';
export const userDocPath = (userId: string) =>
  `${userCollectionPath()}/${userId}`;

export const followToCollectionPath = (to: string) => `/follows/${to}/from`;
export const followToDocPath = (from: string, to: string) =>
  `${followToCollectionPath(to)}/${from}`;

export const followFromCollectionPath = (from: string) => `/follows/${from}/to`;
export const followFromDocPath = (from: string, to: string) =>
  `${followFromCollectionPath(from)}/${to}`;

export const intentionCollectionPath = () => '/intentions';
export const intentionDocPath = (intentionId: string) =>
  `${intentionCollectionPath()}/${intentionId}`;

export const postCollectionPath = () => '/posts';
export const postDocPath = (postId: string) =>
  `${postCollectionPath()}/${postId}`;

export const feedPostCollectionPath = (userId: string) =>
  `/users/${userId}/feed`;
export const feedPostDocPath = (userId: string, postId: string) =>
  `${feedPostCollectionPath(userId)}/${postId}`;

export const notificationCollectionPath = (userId: string) =>
  `/users/${userId}/notifications`;
export const notificationDocPath = (userId: string, notificationId: string) =>
  `${notificationCollectionPath(userId)}/${notificationId}`;

export const commentCollectionPath = (postId: string) =>
  `/posts/${postId}/comments`;
export const commentDocPath = (postId: string, commentId: string) =>
  `${commentCollectionPath(postId)}/${commentId}`;
