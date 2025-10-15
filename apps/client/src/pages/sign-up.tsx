import { useState } from 'react';
import { Link, Redirect } from 'wouter';
import { useCreateUser } from '../hooks/users';
import { useAuthState } from '../state/auth';

export const SignUp: React.FC = () => {
  const { authUser } = useAuthState();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const createUser = useCreateUser();

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
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-sm border p-1"
        />
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
        <button
          onClick={() => createUser({ email, username, password })}
          className="rounded-sm bg-blue-200"
        >
          Sign up
        </button>
      </div>
      <div>
        Already a user? <Link href="/sign-in">Sign in</Link>
      </div>
    </div>
  );
};
