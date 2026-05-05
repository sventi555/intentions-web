import { collections, docs } from '@/data/db';
import { useSignedInAuthState } from '@/state/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoc, getDocs, query, where } from 'firebase/firestore';

export const useFollowedUsers = () => {
  const { authUser } = useSignedInAuthState();

  const {
    data: followedUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['followedUsers'],
    queryFn: async () => {
      const followDocs = (
        await getDocs(
          query(
            collections.followsFrom(authUser.uid),
            where('status', '==', 'accepted'),
          ),
        )
      ).docs;

      return followDocs
        .filter((doc) => doc.id !== authUser.uid)
        .map((doc) => ({ id: doc.id, data: doc.data().user }));
    },
  });

  return { followedUsers, isLoading, isError };
};

export const useInvalidateFollowedUsers = () => {
  const queryClient = useQueryClient();

  return () => queryClient.refetchQueries({ queryKey: ['followedUsers'] });
};

export const useFollowers = () => {
  const { authUser } = useSignedInAuthState();

  const {
    data: followers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['followers'],
    queryFn: async () => {
      const followDocs = (
        await getDocs(
          query(
            collections.followsTo(authUser.uid),
            where('status', '==', 'accepted'),
          ),
        )
      ).docs;

      return followDocs
        .filter((doc) => doc.id !== authUser.uid)
        .map((doc) => ({ id: doc.id, data: doc.data().user }));
    },
  });

  return { followers, isLoading, isError };
};

export const useInvalidateFollowers = () => {
  const queryClient = useQueryClient();

  return () => queryClient.refetchQueries({ queryKey: ['followers'] });
};

export const useFollow = (toUserId?: string) => {
  const { authUser } = useSignedInAuthState();

  const {
    data: follow,
    isLoading,
    isError,
  } = useQuery({
    enabled: toUserId != null,
    queryKey: ['follow', { toUserId }],
    queryFn: async () => {
      if (toUserId == null) {
        // should not be reached
        return;
      }

      const follow = await getDoc(docs.follow(authUser.uid, toUserId));

      const data = follow.data();

      if (data == null) {
        return null;
      }

      return data;
    },
  });

  return { follow, isLoading, isError };
};

export const useInvalidateFollow = () => {
  const queryClient = useQueryClient();

  return (toUserId: string) =>
    queryClient.refetchQueries({
      queryKey: ['follow', { toUserId }],
    });
};
