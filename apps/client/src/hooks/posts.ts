import { useQueryClient } from '@tanstack/react-query';
import { orderBy, query, where } from 'firebase/firestore';

import { collections } from '@/data/db';
import { useInfiniteDocQuery } from '@/hooks/infinite-doc-query';
import { useAuthState } from '@/state/auth';

const PAGE_SIZE = 8;

export const useUserPosts = (userId: string) => {
  const { data: posts, ...rest } = useInfiniteDocQuery({
    queryKey: ['posts', userId],
    pageSize: PAGE_SIZE,
    unpagedQuery: query(
      collections.posts(),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return { posts, ...rest };
};

export const useInvalidateUserPosts = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['posts', userId] });
};

export const useFeedPosts = (userId: string) => {
  const { data: posts, ...rest } = useInfiniteDocQuery({
    queryKey: ['feed', userId],
    pageSize: PAGE_SIZE,
    unpagedQuery: query(collections.feed(userId), orderBy('createdAt', 'desc')),
  });

  return { posts, ...rest };
};

export const useInvalidateFeedPosts = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['feed', userId] });
};

export const useIntentionPosts = (userId: string, intentionId: string) => {
  const { data: posts, ...rest } = useInfiniteDocQuery({
    queryKey: ['posts', userId, { intentionId }],
    pageSize: PAGE_SIZE,
    unpagedQuery: query(
      collections.posts(),
      where('userId', '==', userId),
      where('intentionId', '==', intentionId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return { posts, ...rest };
};

export const useInvalidateIntentionPosts = () => {
  const queryClient = useQueryClient();
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('');
  }

  return (userId: string, intentionId: string) =>
    queryClient.refetchQueries({
      queryKey: ['posts', userId, { intentionId }],
    });
};
