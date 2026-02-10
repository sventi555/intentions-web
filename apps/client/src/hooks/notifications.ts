import { useQueryClient } from '@tanstack/react-query';
import { orderBy, query } from 'firebase/firestore';

import { collections } from '@/data/db';
import { useInfiniteDocQuery } from './infinite-doc-query';

export const useNotifications = (userId: string) => {
  const { data: notifications, ...rest } = useInfiniteDocQuery({
    queryKey: ['notifications', userId],
    pageSize: 16,
    unpagedQuery: query(
      collections.notifications(userId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return { notifications, ...rest };
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['notifications', userId] });
};
