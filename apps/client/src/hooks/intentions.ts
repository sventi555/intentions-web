import { useMutation } from '@tanstack/react-query';
import { CreateIntentionBody } from 'lib';

export const useCreateIntention = () => {
  const { mutateAsync: createIntention } = useMutation<
    unknown,
    Error,
    { body: CreateIntentionBody }
  >({
    mutationFn: async ({ body }) => {
      await fetch(`${import.meta.env.VITE_API_HOST}/intentions`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
    },
  });

  return createIntention;
};
