import { useMutation, useQuery } from '@tanstack/react-query';
import { signInWithEmailAndPassword } from 'firebase/auth/web-extension';
import { getDoc, getDocs, query, where } from 'firebase/firestore';
import { CreateUserBody, UpdateUserBody } from 'lib';
import { collections, docs } from '../data/db';
import { auth } from '../firebase';
import { useAuthState } from '../state/auth';

export const useUser = (userId: string) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const user = await getDoc(docs.user(userId));

      const data = user.data();
      if (data == null) {
        throw new Error('user does not exist');
      }

      return { id: user.id, data };
    },
  });

  return { user, isLoading, isError };
};

export const useSearchUser = (username?: string) => {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    enabled: !!username,
    queryKey: ['user', { username }],
    queryFn: async () => {
      const userDocs = (
        await getDocs(
          query(collections.users(), where('username', '==', username)),
        )
      ).docs;

      if (userDocs.length === 0) {
        return null;
      }

      const user = { id: userDocs[0].id, data: userDocs[0].data() };

      return user;
    },
  });

  return { user, isLoading, isError };
};

export const useCreateUser = () => {
  const { mutateAsync: createUser } = useMutation<
    unknown,
    Error,
    { body: CreateUserBody }
  >({
    mutationFn: async ({ body }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/users`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (_, { body }) => {
      signInWithEmailAndPassword(auth, body.email, body.password);
    },
  });

  return createUser;
};

export const useUpdateUser = () => {
  const authUser = useAuthState().authUser;

  const { mutateAsync: updateUser } = useMutation<
    unknown,
    Error,
    { body: UpdateUserBody }
  >({
    mutationFn: async ({ body }) => {
      const token = await authUser?.getIdToken();

      await fetch(`${import.meta.env.VITE_API_HOST}/users`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ?? '',
        },
      });
    },
  });

  return updateUser;
};
