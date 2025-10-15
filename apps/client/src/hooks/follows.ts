import { useMutation } from '@tanstack/react-query';
import { RemoveFollowBody, RespondToFollowBody } from 'lib';

export const useFollowUser = () => {
  const { mutateAsync: followUser } = useMutation<
    unknown,
    Error,
    { userId: string }
  >({
    mutationFn: async ({ userId }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/follows/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return followUser;
};

export const useRespondToFollow = () => {
  const { mutateAsync: respondToFollow } = useMutation<
    unknown,
    Error,
    { userId: string; body: RespondToFollowBody }
  >({
    mutationFn: async ({ userId, body }) => {
      await fetch(
        `${import.meta.env.VITE_API_HOST}/follows/respond/${userId}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Content-Type': 'application/json' },
        },
      );
    },
  });

  return respondToFollow;
};

export const useRemoveFollow = () => {
  const { mutateAsync: removeFollow } = useMutation<
    unknown,
    Error,
    { userId: string; body: RemoveFollowBody }
  >({
    mutationFn: async ({ userId, body }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/follows/${userId}`, {
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return removeFollow;
};
