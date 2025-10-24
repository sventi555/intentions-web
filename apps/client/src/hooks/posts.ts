import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderBy, query, where } from 'firebase/firestore';
import { CreatePostBody, UpdatePostBody } from 'lib';
import { collections } from '../data/db';
import { useAuthState } from '../state/auth';
import { useInfiniteDocQuery } from './infinite-doc-query';

const PAGE_SIZE = 8;

export const useUserPosts = (userId: string) => {
  const {
    data: posts,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteDocQuery({
    queryKey: ['posts', userId],
    pageSize: PAGE_SIZE,
    unpagedQuery: query(
      collections.posts(),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return {
    posts,
    isLoading,
    hasNextPage,
    isError,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export const useInvalidateUserPosts = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['posts', userId] });
};

export const useFeedPosts = (userId: string) => {
  const {
    data: posts,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteDocQuery({
    queryKey: ['feed', userId],
    pageSize: PAGE_SIZE,
    unpagedQuery: query(collections.feed(userId), orderBy('createdAt', 'desc')),
  });

  return {
    posts,
    isLoading,
    hasNextPage,
    isError,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export const useInvalidateFeedPosts = () => {
  const queryClient = useQueryClient();

  return (userId: string) =>
    queryClient.refetchQueries({ queryKey: ['feed', userId] });
};

export const useIntentionPosts = (userId: string, intentionId: string) => {
  const {
    data: posts,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = useInfiniteDocQuery({
    queryKey: ['posts', userId, { intentionId }],
    pageSize: PAGE_SIZE,
    unpagedQuery: query(
      collections.posts(),
      where('userId', '==', userId),
      where('intentionId', '==', intentionId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return {
    posts,
    isLoading,
    hasNextPage,
    isError,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export const useInvalidateIntentionPosts = () => {
  const queryClient = useQueryClient();
  const authUser = useAuthState().authUser;

  if (authUser == null) {
    throw new Error('');
  }

  return (userId: string, intentionId: string) =>
    queryClient.refetchQueries({
      queryKey: ['posts', userId, { intentionId }],
    });
};

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
