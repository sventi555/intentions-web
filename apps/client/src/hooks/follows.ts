import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoc } from 'firebase/firestore';
import { RemoveFollowBody, RespondToFollowBody } from 'lib';
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

      const follow = await getDoc(docs.follow(authUser?.uid, toUserId));

      const data = follow.data();

      if (data == null) {
        return null;
      }

      return { id: follow.id, data };
    },
  });

  return { follow, isLoading, isError };
};

export const useInvalidateFollow = () => {
  const queryClient = useQueryClient();

  return (toUserId: string) =>
    queryClient.invalidateQueries({
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

export const useRespondToFollow = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: respondToFollow } = useMutation<
    unknown,
    Error,
    { userId: string; body: RespondToFollowBody }
  >({
    mutationFn: async ({ userId, body }) => {
      const token = await authUser?.getIdToken();

      await fetch(
        `${import.meta.env.VITE_API_HOST}/follows/respond/${userId}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ?? '',
          },
        },
      );
    },
  });

  return respondToFollow;
};

export const useRemoveFollow = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: removeFollow } = useMutation<
    unknown,
    Error,
    { userId: string; body: RemoveFollowBody }
  >({
    mutationFn: async ({ userId, body }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/follows/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return removeFollow;
};
