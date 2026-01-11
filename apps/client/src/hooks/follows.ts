import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDoc, getDocs, query, where } from 'firebase/firestore';
import { collections, docs } from '../data/db';
import { useAuthState } from '../state/auth';

export const useFollowedUsers = () => {
  const authUser = useAuthState().authUser;

  const {
    data: followedUsers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['followedUsers'],
    queryFn: async () => {
      if (authUser == null) {
        throw new Error('must be signed in to get followed users');
      }

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
  const authUser = useAuthState().authUser;

  const {
    data: followers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['followers'],
    queryFn: async () => {
      if (authUser == null) {
        throw new Error('must be signed in to get followers');
      }

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
  const authUser = useAuthState().authUser;

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

      if (authUser == null) {
        throw new Error('must be signed in to read follow');
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
