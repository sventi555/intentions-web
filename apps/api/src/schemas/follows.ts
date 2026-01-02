import { z } from '@hono/zod-openapi';

export const followUserParams = z.object({ userId: z.string() });
export const followUserResponse = z.object({
  status: z.enum(['pending', 'accepted']),
});

export const respondToFollowParams = z.object({ userId: z.string() });
export const respondToFollowBody = z.object({
  action: z.enum(['accept', 'decline']),
});

export const removeFollowParams = z.object({ userId: z.string() });
export const removeFollowBody = z.object({
  direction: z.enum(['to', 'from']),
});
