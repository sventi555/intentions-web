import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth/cordova';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
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
  token: string | null;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = (props) => {
  const { authUser, loading } = useAuthUser();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    authUser?.getIdToken().then((token) => setToken(token));
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ authUser, loading, token }}>
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
