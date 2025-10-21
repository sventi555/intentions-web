import { signInWithEmailAndPassword } from 'firebase/auth/web-extension';
import { useState } from 'react';
import { Link, Redirect } from 'wouter';
import { Button } from '../components/button';
import { auth } from '../firebase';
import { useAuthState } from '../state/auth';

export const SignIn: React.FC = () => {
  const { authUser } = useAuthState();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (authUser) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <div className="text-3xl">Intentions</div>
        <div>act intentionally</div>
      </div>
      <div className="flex flex-col gap-1">
        <input
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-sm border p-1"
        />
        <input
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-sm border p-1"
        />
        <Button
          type="primary"
          onClick={() => signInWithEmailAndPassword(auth, email, password)}
        >
          Sign in
        </Button>
      </div>
      <div>
        New user? <Link href="/sign-up">Sign up</Link>
      </div>
    </div>
  );
};
