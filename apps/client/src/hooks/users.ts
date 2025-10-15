import { useMutation } from '@tanstack/react-query';
import { signInWithEmailAndPassword } from 'firebase/auth/web-extension';
import { CreateUserBody } from 'lib';
import { auth } from '../firebase';

export const useCreateUser = () => {
  const { mutateAsync: createUser } = useMutation<
    unknown,
    Error,
    { email: string; username: string; password: string }
  >({
    mutationFn: async ({ email, username, password }) => {
      const body: CreateUserBody = {
        email,
        username,
        password,
        isPrivate: true,
      };

      await fetch(`${import.meta.env.VITE_API_HOST}/users`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: (_, { email, password }) => {
      signInWithEmailAndPassword(auth, email, password);
    },
  });

  return createUser;
};
