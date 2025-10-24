import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import {
  DocumentData,
  DocumentSnapshot,
  getDocs,
  limit,
  Query,
  query,
  startAfter,
} from 'firebase/firestore';

export const useInfiniteDocQuery = <T extends DocumentData>({
  queryKey,
  pageSize,
  unpagedQuery,
}: {
  queryKey: QueryKey;
  pageSize: number;
  unpagedQuery: Query<T, T>;
}) => {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery<{ id: string; data: T; ref: DocumentSnapshot }[]>({
    queryKey,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage[lastPage.length - 1]?.ref;
    },
    queryFn: async ({ pageParam: lastDoc }) => {
      const docs = (
        await getDocs(
          query(
            unpagedQuery,
            ...(lastDoc ? [startAfter(lastDoc)] : []),
            limit(pageSize),
          ),
        )
      ).docs;

      return docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
        ref: doc,
      }));
    },
  });

  return {
    data: data?.pages.flat(),
    isLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  };
};
