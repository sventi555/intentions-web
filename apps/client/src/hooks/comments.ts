import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocs, orderBy, query } from 'firebase/firestore';
import { CreateCommentBody } from 'lib';
import { collections } from '../data/db';
import { useAuthState } from '../state/auth';

export const useComments = (postId: string) => {
  const {
    data: comments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const commentDocs = (
        await getDocs(
          query(collections.comments(postId), orderBy('createdAt', 'desc')),
        )
      ).docs;

      return commentDocs.map((doc) => ({ id: doc.id, data: doc.data() }));
    },
  });

  return { comments, isLoading, isError };
};

export const useInvalidateComments = () => {
  const queryClient = useQueryClient();

  return (postId: string) =>
    queryClient.refetchQueries({
      queryKey: ['comments', postId],
    });
};

export const useCreateComment = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: createComment } = useMutation<
    unknown,
    Error,
    { postId: string; body: CreateCommentBody }
  >({
    mutationFn: async ({ postId, body }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return createComment;
};

export const useDeleteComment = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: deleteComment } = useMutation<
    unknown,
    Error,
    { postId: string; commentId: string }
  >({
    mutationFn: async ({ postId, commentId }) => {
      const token = await authUser?.getIdToken();

      await fetch(
        `${import.meta.env.VITE_API_HOST}/posts/${postId}/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ?? '',
          },
        },
      );
    },
  });

  return deleteComment;
};
