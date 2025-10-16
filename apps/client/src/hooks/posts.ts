import { useMutation } from '@tanstack/react-query';
import { CreatePostBody, UpdatePostBody } from 'lib';
import { useAuthState } from '../state/auth';

export const useCreatePost = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: createPost } = useMutation<
    unknown,
    Error,
    { body: CreatePostBody }
  >({
    mutationFn: async ({ body }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/posts`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return createPost;
};

export const useUpdatePost = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: updatePost } = useMutation<
    unknown,
    Error,
    { id: string; body: UpdatePostBody }
  >({
    mutationFn: async ({ id, body }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return updatePost;
};

export const useDeletePost = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: deletePost } = useMutation<
    unknown,
    Error,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: token ?? '',
        },
      });
    },
  });

  return deletePost;
};
