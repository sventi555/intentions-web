import { routeTree } from '@/routeTree.gen';
import {
  RouterProvider as _RouterProvider,
  createRouter,
} from '@tanstack/react-router';
import { useEffect } from 'react';
import { AuthState, useAuthState } from './auth';

export interface RouterContext {
  isInvalidating: boolean;
  authState: AuthState;
}

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    authState: { authUser: null, loading: false },
    isInvalidating: false,
  },
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const RouterProvider: React.FC = () => {
  const authState = useAuthState();

  useEffect(() => {
    router.invalidate();
  }, [authState.authUser]);

  return <_RouterProvider router={router} context={{ authState }} />;
};
