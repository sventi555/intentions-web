import { useQueryClient } from '@tanstack/react-query';
import { orderBy, query, where } from 'firebase/firestore';

import { collections } from '@/data/db';
import { useInfiniteDocQuery } from './infinite-doc-query';

export const useComments = (postId: string) => {
  const { data: comments, ...rest } = useInfiniteDocQuery({
    queryKey: ['comments', postId],
    pageSize: 16,
    unpagedQuery: query(
      collections.comments(),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
    ),
  });

  return { comments, ...rest };
};

export const useInvalidateComments = () => {
  const queryClient = useQueryClient();

  return (postId: string) =>
    queryClient.refetchQueries({
      queryKey: ['comments', postId],
    });
};
