import { useMutation } from '@tanstack/react-query';
import { RemoveFollowBody, RespondToFollowBody } from 'lib';
import { useAuthState } from '../state/auth';

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
