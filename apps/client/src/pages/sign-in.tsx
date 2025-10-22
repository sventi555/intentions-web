import { signInWithEmailAndPassword } from 'firebase/auth';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, Redirect } from 'wouter';
import { Input } from '../components/input';
import { Submit } from '../components/submit';
import { auth } from '../firebase';
import { useAuthState } from '../state/auth';

type Inputs = {
  email: string;
  password: string;
};

export const SignIn: React.FC = () => {
  const { authUser } = useAuthState();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) =>
    signInWithEmailAndPassword(auth, data.email, data.password);

  if (authUser) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <div className="flex flex-col items-center">
        <div className="text-3xl">Intentions</div>
        <div>act intentionally</div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-w-64 flex-col gap-1"
      >
        <Input
          placeholder="email"
          formRegister={register('email', { required: true })}
          errorMessage={errors.email && 'email is required'}
        />
        <Input
          type="password"
          placeholder="password"
          formRegister={register('password', { required: true })}
          errorMessage={errors.password && 'password is required'}
        />
        <Submit label="Sign in" />
      </form>
      <div>
        New user?{' '}
        <Link href="/sign-up" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};
