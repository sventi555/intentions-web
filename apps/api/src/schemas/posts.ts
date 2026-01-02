import { z } from '@hono/zod-openapi';

export const createPostBody = z
  .object({
    intentionId: z.string(),
    image: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(({ image, description }) => image || description, {
    error: 'Image or description must be provided.',
  });

export const updatePostParams = z.object({ id: z.string() });
export const updatePostBody = z.object({
  description: z.string().optional(),
});

export const deletePostParams = z.object({ id: z.string() });
