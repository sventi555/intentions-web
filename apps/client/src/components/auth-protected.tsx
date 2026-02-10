import { PropsWithChildren } from 'react';
import { Redirect } from 'wouter';

import { useAuthState } from '@/state/auth';

export const AuthProtected: React.FC<PropsWithChildren> = (props) => {
  const { authUser, loading } = useAuthState();

  if (loading) {
    return null;
  }

  if (authUser == null) {
    return <Redirect to="~/sign-in" />;
  }

  return props.children;
};
