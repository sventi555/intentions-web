import { z } from '@hono/zod-openapi';

export const createUserBody = z.object({
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

export const updateUserBody = z.object({
  image: z.string().optional(),
});
