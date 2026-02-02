import { createMiddleware } from 'hono/factory';
import { auth } from '../firebase';

export const authenticate = createMiddleware<{ Variables: { uid: string } }>(
  async (c, next) => {
    try {
      const token = await auth.verifyIdToken(
        c.req.header('Authorization') ?? '',
      );
      c.set('uid', token.uid);

      await next();
    } catch {
      return c.json(null, 401);
    }
  },
);
