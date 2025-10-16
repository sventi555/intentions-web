import { useMutation } from '@tanstack/react-query';
import { signInWithEmailAndPassword } from 'firebase/auth/web-extension';
import { CreateUserBody, UpdateUserBody } from 'lib';
import { auth } from '../firebase';
import { useAuthState } from '../state/auth';

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
