import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDocs, orderBy, query, where } from 'firebase/firestore';
import { collections } from '../data/db';

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
          query(
            collections.comments(),
            where('postId', '==', postId),
            orderBy('createdAt', 'desc'),
          ),
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
