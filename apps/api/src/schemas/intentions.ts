import { z } from '@hono/zod-openapi';

export const createIntentionBody = z.object({ name: z.string().min(1) });
