import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocs, orderBy, query } from 'firebase/firestore';

import { collections } from '@/data/db';

export const useNotifications = (userId: string) => {
  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const notificationDocs = (
        await getDocs(
          query(
            collections.notifications(userId),
            orderBy('createdAt', 'desc'),
          ),
        )
      ).docs;

      return notificationDocs.map((doc) => ({ id: doc.id, data: doc.data() }));
    },
  });

  return { notifications, isLoading, isError };
};

export const useInvalidateNotifications = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['notifications', userId] });
};
