import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoc, getDocs, query, where } from 'firebase/firestore';

import { collections, docs } from '@/data/db';

export const useUser = (userId: string | undefined) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (userId == null) {
        // should not be reached
        return;
      }

      const user = await getDoc(docs.user(userId));

      const data = user.data();
      if (data == null) {
        throw new Error('user does not exist');
      }

      return data;
    },
  });

  return { user, isLoading, isError };
};

export const useInvalidateUser = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['user', userId] });
};

export const useSearchUser = (username?: string) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    enabled: !!username,
    queryKey: ['user', { username }],
    queryFn: async () => {
      const userDocs = (
        await getDocs(
          query(collections.users(), where('username', '==', username)),
        )
      ).docs;

      if (userDocs.length === 0) {
        return null;
      }

      const user = { id: userDocs[0].id, data: userDocs[0].data() };

      return user;
    },
  });

  return { user, isLoading, isError };
};
