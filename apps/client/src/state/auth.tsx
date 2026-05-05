import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, PropsWithChildren, useContext, useState } from 'react';

const useAuthUser = () => {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);

  onAuthStateChanged(auth, async (user) => {
    setAuthUser(user);
    setLoading(false);
  });

  return { authUser, loading };
};

export interface AuthState {
  authUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = (props) => {
  const { authUser, loading } = useAuthUser();

  return (
    <AuthContext.Provider value={{ authUser, loading }}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuthState = () => {
  const authState = useContext(AuthContext);

  if (authState == null) {
    throw new Error('No auth provider');
  }

  return authState;
};

interface SignedInAuthState extends AuthState {
  authUser: User;
}

const isSignedIn = (authState: AuthState): authState is SignedInAuthState => {
  return authState.authUser != null;
};

export const useSignedInAuthState = () => {
  const authState = useAuthState();

  if (!isSignedIn(authState)) {
    throw new Error('Not signed in');
  }

  return authState;
};
