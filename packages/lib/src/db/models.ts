export interface User {
  email: string;
  username: string;
  image?: string;
}

export type FollowStatus = 'pending' | 'accepted';

export interface Follow {
  status: FollowStatus;
}

export interface Intention {
  userId: string;
  user: Pick<User, 'username'>;
  name: string;
  createdAt: number;
  updatedAt: number;
  postCount: number;
}

export interface Post {
  userId: string;
  user: Pick<User, 'username' | 'image'>;
  intentionId: string;
  intention: Pick<Intention, 'name'>;
  createdAt: number;
  description?: string;
  image?: string;
}

export interface FollowNotification {
  userId: string;
  user: Pick<User, 'username' | 'image'>;
  kind: 'request' | 'response';
  // will always be 'success' when `kind` is response since rejections don't generate a notification
  status: FollowStatus;
  createdAt: number;
}
