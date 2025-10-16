import { useMutation, useQuery } from '@tanstack/react-query';
import { getDocs, orderBy, query, where } from 'firebase/firestore';
import { CreateIntentionBody } from 'lib';
import { collections, CollectionSort } from '../data/db';
import { useAuthState } from '../state/auth';

type IntentionsSort = CollectionSort<
  'createdAt' | 'updatedAt' | 'postCount' | 'name'
>;

export const useIntentions = (
  userId: string,
  sort: IntentionsSort = { by: 'updatedAt', dir: 'desc' },
) => {
  const {
    data: intentions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['intentions', userId],
    queryFn: async () => {
      const intentionDocs = (
        await getDocs(
          query(
            collections.intentions(),
            where('userId', '==', userId),
            orderBy(sort.by, sort.dir),
          ),
        )
      ).docs;

      return intentionDocs.map((doc) => ({ id: doc.id, data: doc.data() }));
    },
  });

  return { intentions, isLoading, isError };
};

export const useCreateIntention = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: createIntention } = useMutation<
    unknown,
    Error,
    { body: CreateIntentionBody }
  >({
    mutationFn: async ({ body }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/intentions`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return createIntention;
};
