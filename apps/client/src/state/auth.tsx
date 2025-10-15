import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth/cordova';
import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { auth } from '../firebase';

const useAuthUser = () => {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<User | null>(null);

  onAuthStateChanged(auth, (user) => {
    setAuthUser(user);
    setLoading(false);
  });

  return { authUser, loading };
};

interface AuthState {
  authUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = (props) => {
  const authUser = useAuthUser();

  return (
    <AuthContext.Provider value={authUser}>
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
