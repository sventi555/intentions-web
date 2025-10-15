import { useMutation } from '@tanstack/react-query';
import { CreatePostBody, UpdatePostBody } from 'lib';

export const useCreatePost = () => {
  const { mutateAsync: createPost } = useMutation<
    unknown,
    Error,
    { body: CreatePostBody }
  >({
    mutationFn: async ({ body }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/posts`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return createPost;
};

export const useUpdatePost = () => {
  const { mutateAsync: updatePost } = useMutation<
    unknown,
    Error,
    { id: string; body: UpdatePostBody }
  >({
    mutationFn: async ({ id, body }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/posts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return updatePost;
};

export const useDeletePost = () => {
  const { mutateAsync: deletePost } = useMutation<
    unknown,
    Error,
    { id: string }
  >({
    mutationFn: async ({ id }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/posts/${id}`, {
        method: 'DELETE',
      });
    },
  });

  return deletePost;
};
