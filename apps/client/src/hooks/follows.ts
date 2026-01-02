import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoc } from 'firebase/firestore';
import { docs } from '../data/db';
import { useAuthState } from '../state/auth';

export const useFollow = (toUserId?: string) => {
  const authUser = useAuthState().authUser;

  const {
    data: follow,
    isLoading,
    isError,
  } = useQuery({
    enabled: toUserId != null,
    queryKey: ['follow', { toUserId }],
    queryFn: async () => {
      if (toUserId == null) {
        // should not be reached
        return;
      }

      if (authUser == null) {
        throw new Error('must be signed in to read follow');
      }

      const follow = await getDoc(docs.follow(authUser.uid, toUserId));

      const data = follow.data();

      if (data == null) {
        return null;
      }

      return data;
    },
  });

  return { follow, isLoading, isError };
};

export const useInvalidateFollow = () => {
  const queryClient = useQueryClient();

  return (toUserId: string) =>
    queryClient.refetchQueries({
      queryKey: ['follow', { toUserId }],
    });
};

export const useFollowUser = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: followUser } = useMutation<
    unknown,
    Error,
    { userId: string }
  >({
    mutationFn: async ({ userId }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/follows/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return followUser;
};
