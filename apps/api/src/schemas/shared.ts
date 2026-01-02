import { z } from '@hono/zod-openapi';

export const authHeaderSchema = z.object({ authorization: z.string() });

export const errorSchema = z.object({ message: z.string() });
