import { useQueryClient } from '@tanstack/react-query';
import { orderBy, query } from 'firebase/firestore';

import { collections } from '@/data/db';
import { useInfiniteDocQuery } from './infinite-doc-query';

export const useNotifications = (userId: string) => {
  const {
    data: notifications,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteDocQuery({
    queryKey: ['notifications', userId],
    pageSize: 16,
    unpagedQuery: query(
      collections.notifications(userId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return {
    notifications,
    isLoading,
    hasNextPage,
    isError,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['notifications', userId] });
};
